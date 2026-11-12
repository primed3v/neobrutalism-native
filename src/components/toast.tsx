import * as React from "react"
import {
  Animated,
  PanResponder,
  Pressable,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native"
import {
  CircleAlertIcon,
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  XIcon,
} from "../icons"
import { NATIVE_DRIVER } from "../lib/overlay"
import { webStyle } from "../lib/utils"
import { Portal } from "../lib/portal"
import { Text, TextStyleProvider } from "../lib/text"
import { useSafeInsets, useTheme } from "../theme/ThemeProvider"
import { Button } from "./button"
import { Spinner } from "./spinner"

export type ToastType = "default" | "success" | "error" | "warning" | "info" | "loading"

export type ToastOptions = {
  id?: string
  title?: React.ReactNode
  description?: React.ReactNode
  type?: ToastType
  /** ms. `Infinity` keeps it until dismissed. Default 5000 (loading: Infinity). */
  duration?: number
  action?: { label: string; onPress: () => void }
  onDismiss?: () => void
}

export type ToastData = ToastOptions & { id: string; createdAt: number }

// ---------- store (works outside React, like sonner / Base UI toast manager) ----------

type Listener = (toasts: ToastData[]) => void
let toasts: ToastData[] = []
const listeners = new Set<Listener>()
let counter = 0

function emit() {
  for (const l of listeners) l(toasts)
}

function add(input: ToastOptions): string {
  const id = input.id ?? `toast-${++counter}`
  const existing = toasts.findIndex((t) => t.id === id)
  const data: ToastData = { type: "default", ...input, id, createdAt: Date.now() }
  if (existing >= 0) toasts = toasts.map((t, i) => (i === existing ? { ...t, ...data } : t))
  else toasts = [...toasts, data]
  emit()
  return id
}

function dismiss(id?: string) {
  const removed = id ? toasts.filter((t) => t.id === id) : toasts
  toasts = id ? toasts.filter((t) => t.id !== id) : []
  removed.forEach((t) => t.onDismiss?.())
  emit()
}

type ToastInput = string | ToastOptions

function normalize(input: ToastInput, extra?: Omit<ToastOptions, "title">): ToastOptions {
  return typeof input === "string" ? { title: input, ...extra } : { ...input, ...extra }
}

/**
 * Show a toast from anywhere: `toast("Saved")`, `toast.success({...})`.
 * Requires a `<Toaster />` mounted once near the app root.
 */
export const toast = Object.assign(
  (input: ToastInput, opts?: Omit<ToastOptions, "title">) => add(normalize(input, opts)),
  {
    success: (input: ToastInput, opts?: Omit<ToastOptions, "title">) =>
      add({ ...normalize(input, opts), type: "success" }),
    error: (input: ToastInput, opts?: Omit<ToastOptions, "title">) =>
      add({ ...normalize(input, opts), type: "error" }),
    warning: (input: ToastInput, opts?: Omit<ToastOptions, "title">) =>
      add({ ...normalize(input, opts), type: "warning" }),
    info: (input: ToastInput, opts?: Omit<ToastOptions, "title">) =>
      add({ ...normalize(input, opts), type: "info" }),
    loading: (input: ToastInput, opts?: Omit<ToastOptions, "title">) =>
      add({ ...normalize(input, opts), type: "loading" }),
    /** Updates an existing toast (by id). */
    update: (id: string, opts: ToastOptions) => add({ ...opts, id }),
    /** Shows loading, then success/error depending on the promise. */
    promise: <T,>(
      promise: Promise<T>,
      msgs: { loading: ToastInput; success: ToastInput | ((v: T) => ToastInput); error: ToastInput | ((e: unknown) => ToastInput) },
    ) => {
      const id = add({ ...normalize(msgs.loading), type: "loading" })
      promise.then(
        (v) => add({ ...normalize(typeof msgs.success === "function" ? msgs.success(v) : msgs.success), id, type: "success" }),
        (e) => add({ ...normalize(typeof msgs.error === "function" ? msgs.error(e) : msgs.error), id, type: "error" }),
      )
      return promise
    },
    dismiss,
  },
)

export function useToast() {
  const [list, setList] = React.useState(toasts)
  React.useEffect(() => {
    listeners.add(setList)
    setList(toasts)
    return () => {
      listeners.delete(setList)
    }
  }, [])
  return { toasts: list, toast, dismiss }
}

// ---------- UI ----------

export type ToasterPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right"

export type ToasterProps = {
  position?: ToasterPosition
  /** Max toasts visible at once. Default 3. */
  visibleToasts?: number
  duration?: number
  style?: StyleProp<ViewStyle>
}

/** Mount once (inside NeoProvider) to display toasts. */
export function Toaster({ position = "bottom-right", visibleToasts = 3, duration = 5000, style }: ToasterProps) {
  const { toasts: list } = useToast()
  const insets = useSafeInsets()
  const top = position.startsWith("top")
  const shown = list.slice(-visibleToasts)
  const align: ViewStyle["alignItems"] = position.endsWith("left")
    ? "flex-start"
    : position.endsWith("right")
      ? "flex-end"
      : "center"
  if (!shown.length) return null
  return (
    <Portal>
      <View
        pointerEvents="box-none"
        style={[
          { position: "absolute", left: 0, right: 0, paddingHorizontal: 16, alignItems: align },
          top ? { top: insets.top + 16 } : { bottom: insets.bottom + 16 },
        ]}
      >
      <View
        pointerEvents="box-none"
        accessibilityLiveRegion="polite"
        style={[
          { width: "100%", maxWidth: 384, gap: 8, flexDirection: top ? "column-reverse" : "column" },
          style,
        ]}
      >
        {shown.map((t) => (
          <ToastView key={t.id} data={t} defaultDuration={duration} fromTop={top} />
        ))}
      </View>
      </View>
    </Portal>
  )
}

export function ToastIcon({ type }: { type: ToastType | undefined }) {
  switch (type) {
    case "success":
      return <CircleCheckIcon size={16} />
    case "error":
      return <CircleAlertIcon size={16} />
    case "warning":
      return <TriangleAlertIcon size={16} />
    case "info":
      return <InfoIcon size={16} />
    case "loading":
      return <Spinner size={16} />
    default:
      return null
  }
}

function ToastView({ data, defaultDuration, fromTop }: { data: ToastData; defaultDuration: number; fromTop: boolean }) {
  const theme = useTheme()
  const enter = React.useRef(new Animated.Value(0)).current
  const drag = React.useRef(new Animated.Value(0)).current
  const duration = data.duration ?? (data.type === "loading" ? Infinity : defaultDuration)

  React.useEffect(() => {
    Animated.timing(enter, { toValue: 1, duration: 250, useNativeDriver: NATIVE_DRIVER }).start()
  }, [enter])

  React.useEffect(() => {
    if (!Number.isFinite(duration)) return
    const t = setTimeout(() => dismiss(data.id), duration)
    return () => clearTimeout(t)
  }, [duration, data.id, data.createdAt])

  const pan = React.useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_e, g) => Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy),
        onPanResponderMove: (_e, g) => drag.setValue(g.dx),
        onPanResponderRelease: (_e, g) => {
          if (Math.abs(g.dx) > 80 || Math.abs(g.vx) > 0.6) {
            Animated.timing(drag, {
              toValue: g.dx > 0 ? 500 : -500,
              duration: 150,
              useNativeDriver: NATIVE_DRIVER,
            }).start(() => dismiss(data.id))
          } else {
            Animated.spring(drag, { toValue: 0, useNativeDriver: NATIVE_DRIVER }).start()
          }
        },
      }),
    [drag, data.id],
  )

  return (
    <Animated.View
      {...pan.panHandlers}
      accessibilityRole="alert"
      style={{
        width: "100%",
        opacity: enter,
        transform: [
          { translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [fromTop ? -16 : 16, 0] }) },
          { translateX: drag },
        ],
        borderRadius: theme.radius,
        borderWidth: theme.borderWidth,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.background,
        ...webStyle({ userSelect: "none" }),
      }}
    >
      <TextStyleProvider value={{ color: theme.colors.foreground, fontSize: 14, lineHeight: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 12 }}>
          <ToastIcon type={data.type} />
          <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
            {data.title ? (
              typeof data.title === "string" ? <Text weight="heading" size="sm">{data.title}</Text> : data.title
            ) : null}
            {data.description ? (
              typeof data.description === "string" ? <Text size="sm">{data.description}</Text> : data.description
            ) : null}
          </View>
          {data.action ? (
            <Button
              size="xs"
              variant="neutral"
              onPress={() => {
                data.action?.onPress()
                dismiss(data.id)
              }}
            >
              {data.action.label}
            </Button>
          ) : null}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close"
            hitSlop={8}
            onPress={() => dismiss(data.id)}
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          >
            <XIcon size={16} />
          </Pressable>
        </View>
      </TextStyleProvider>
    </Animated.View>
  )
}
