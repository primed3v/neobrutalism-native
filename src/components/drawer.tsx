import * as React from "react"
import {
  Animated,
  PanResponder,
  View,
  useWindowDimensions,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from "react-native"
import { Backdrop, NATIVE_DRIVER, OverlayRoot, usePresence } from "../lib/overlay"
import { renderText, Text, TextStyleProvider, type TextProps } from "../lib/text"
import { Trigger, type TriggerProps } from "../lib/trigger"
import { composeHandlers, useControllableState, webStyle, type ViewRef } from "../lib/utils"
import { useSafeInsets, useTheme } from "../theme/ThemeProvider"

export type DrawerDirection = "bottom" | "top" | "left" | "right"

type DrawerCtx = {
  open: boolean
  setOpen: (open: boolean) => void
  direction: DrawerDirection
  dismissible: boolean
}

const DrawerContext = React.createContext<DrawerCtx | null>(null)

export function useDrawer() {
  const ctx = React.useContext(DrawerContext)
  if (!ctx) throw new Error("Drawer components must be used within <Drawer>")
  return ctx
}

export type DrawerProps = {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Edge the drawer slides from. Default "bottom". */
  direction?: DrawerDirection
  /** Allow closing by swipe / backdrop. Default true. */
  dismissible?: boolean
  children?: React.ReactNode
}

export function Drawer({
  open,
  defaultOpen = false,
  onOpenChange,
  direction = "bottom",
  dismissible = true,
  children,
}: DrawerProps) {
  const [isOpen, setOpen] = useControllableState({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  })
  return (
    <DrawerContext.Provider value={{ open: isOpen, setOpen, direction, dismissible }}>
      {children}
    </DrawerContext.Provider>
  )
}

export const DrawerTrigger = React.forwardRef<ViewRef, TriggerProps>(function DrawerTrigger(
  { onPress, ...props },
  ref,
) {
  const { setOpen } = useDrawer()
  return <Trigger ref={ref} onPress={composeHandlers(onPress, () => setOpen(true))} {...props} />
})

export const DrawerClose = React.forwardRef<ViewRef, TriggerProps>(function DrawerClose(
  { onPress, ...props },
  ref,
) {
  const { setOpen } = useDrawer()
  return <Trigger ref={ref} onPress={composeHandlers(onPress, () => setOpen(false))} {...props} />
})

/** The grab bar. Rendered automatically by DrawerContent (`showHandle`). */
export function DrawerSwipeHandle({ style }: { style?: StyleProp<ViewStyle> }) {
  const theme = useTheme()
  const { direction } = useDrawer()
  const horizontal = direction === "left" || direction === "right"
  return (
    <View
      style={[
        horizontal
          ? { width: 16, alignSelf: "stretch", alignItems: "center", justifyContent: "center" }
          : { height: 16, width: "100%", alignItems: "center", justifyContent: direction === "bottom" ? "flex-end" : "flex-start" },
        style,
      ]}
    >
      <View
        style={{
          width: horizontal ? 8 : 100,
          height: horizontal ? 100 : 8,
          borderRadius: 9999,
          backgroundColor: theme.colors.foreground,
        }}
      />
    </View>
  )
}

export type DrawerContentProps = ViewProps & { showHandle?: boolean }

export function DrawerContent({ style, children, showHandle = true, ...props }: DrawerContentProps) {
  const theme = useTheme()
  const insets = useSafeInsets()
  const { open, setOpen, direction, dismissible } = useDrawer()
  const { width, height } = useWindowDimensions()
  const { mounted, progress } = usePresence(open, 450)
  const drag = React.useRef(new Animated.Value(0)).current
  const [size, setSize] = React.useState(direction === "bottom" || direction === "top" ? height : width)
  const horizontal = direction === "left" || direction === "right"
  // +1 when moving toward the closing edge increases the offset
  const sign = direction === "bottom" || direction === "right" ? 1 : -1

  React.useEffect(() => {
    if (!mounted) drag.setValue(0)
  }, [mounted, drag])

  const sizeRef = React.useRef(size)
  sizeRef.current = size

  const pan = React.useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_e, g) => {
          if (!dismissible) return false
          const main = horizontal ? g.dx : g.dy
          const cross = horizontal ? g.dy : g.dx
          return Math.abs(main) > 6 && Math.abs(main) > Math.abs(cross) && main * sign > 0
        },
        onPanResponderMove: (_e, g) => {
          const main = (horizontal ? g.dx : g.dy) * sign
          drag.setValue(Math.max(0, main))
        },
        onPanResponderRelease: (_e, g) => {
          const main = (horizontal ? g.dx : g.dy) * sign
          const velocity = (horizontal ? g.vx : g.vy) * sign
          if (main > sizeRef.current * 0.3 || velocity > 0.5) {
            setOpen(false)
          } else {
            Animated.spring(drag, { toValue: 0, useNativeDriver: NATIVE_DRIVER, bounciness: 0 }).start()
          }
        },
        onPanResponderTerminate: () => {
          Animated.spring(drag, { toValue: 0, useNativeDriver: NATIVE_DRIVER, bounciness: 0 }).start()
        },
      }),
    [dismissible, horizontal, sign, drag, setOpen],
  )

  const bw = theme.borderWidth
  const r = theme.radius
  const edge: ViewStyle =
    direction === "bottom"
      ? { bottom: 0, left: 0, right: 0, maxHeight: height * 0.9, borderTopWidth: bw, borderTopLeftRadius: r, borderTopRightRadius: r, paddingBottom: insets.bottom }
      : direction === "top"
        ? { top: 0, left: 0, right: 0, maxHeight: height * 0.9, borderBottomWidth: bw, borderBottomLeftRadius: r, borderBottomRightRadius: r, paddingTop: insets.top }
        : direction === "left"
          ? { top: 0, bottom: 0, left: 0, width: Math.min(width * 0.8, 384), borderRightWidth: bw, borderTopRightRadius: r, borderBottomRightRadius: r, flexDirection: "row", paddingTop: insets.top, paddingBottom: insets.bottom }
          : { top: 0, bottom: 0, right: 0, width: Math.min(width * 0.8, 384), borderLeftWidth: bw, borderTopLeftRadius: r, borderBottomLeftRadius: r, flexDirection: "row", paddingTop: insets.top, paddingBottom: insets.bottom }

  const enter = progress.interpolate({ inputRange: [0, 1], outputRange: [(size + 2) * sign, 0] })
  const offset = Animated.add(enter, Animated.multiply(drag, sign))

  const handle = showHandle ? <DrawerSwipeHandle /> : null
  const handleLast = direction === "top" || direction === "left"

  return (
    <OverlayRoot open={mounted} onClose={() => dismissible && setOpen(false)}>
      <Backdrop
        progress={progress}
        color={theme.colors.overlay}
        onPress={dismissible ? () => setOpen(false) : undefined}
      />
      <Animated.View
        accessibilityViewIsModal
        {...pan.panHandlers}
        onLayout={(e) =>
          setSize(horizontal ? e.nativeEvent.layout.width : e.nativeEvent.layout.height)
        }
        style={[
          {
            position: "absolute",
            backgroundColor: theme.colors.background,
            borderColor: theme.colors.border,
            transform: horizontal ? [{ translateX: offset }] : [{ translateY: offset }],
          },
          edge,
          webStyle({ userSelect: "none" }),
          style,
        ]}
        {...props}
      >
        {!handleLast && handle}
        <View style={{ flexShrink: 1, flexGrow: horizontal ? 1 : 0 }}>
          <TextStyleProvider value={{ color: theme.colors.foreground, fontSize: 16, lineHeight: 24 }}>
            {children}
          </TextStyleProvider>
        </View>
        {handleLast && handle}
      </Animated.View>
    </OverlayRoot>
  )
}

export function DrawerHeader({ style, children, ...props }: ViewProps) {
  return (
    <View style={[{ gap: 6, padding: 16 }, style]} {...props}>
      <TextStyleProvider value={{ textAlign: "center" }}>{renderText(children)}</TextStyleProvider>
    </View>
  )
}

export function DrawerFooter({ style, ...props }: ViewProps) {
  return <View style={[{ marginTop: "auto", gap: 12, padding: 16 }, style]} {...props} />
}

export function DrawerTitle({ style, ...props }: TextProps) {
  return (
    <Text
      weight="heading"
      accessibilityRole="header"
      style={[{ fontSize: 18, lineHeight: 20, letterSpacing: -0.45 }, style]}
      {...props}
    />
  )
}

export function DrawerDescription({ style, ...props }: TextProps) {
  return <Text size="sm" style={style} {...props} />
}
