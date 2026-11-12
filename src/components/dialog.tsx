import * as React from "react"
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from "react-native"
import { XIcon } from "../icons"
import { Backdrop, OverlayRoot, usePresence } from "../lib/overlay"
import { useSurface } from "../lib/surface"
import { renderText, Text, TextStyleProvider, type TextProps } from "../lib/text"
import { Trigger, type TriggerProps } from "../lib/trigger"
import { composeHandlers, useControllableState, type ViewRef } from "../lib/utils"
import { useTheme } from "../theme/ThemeProvider"

export type DialogContextValue = {
  open: boolean
  setOpen: (open: boolean) => void
}

export const DialogContext = React.createContext<DialogContextValue | null>(null)

export function useDialog() {
  const ctx = React.useContext(DialogContext)
  if (!ctx) throw new Error("Dialog components must be used within <Dialog>")
  return ctx
}

export type DialogProps = {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  children?: React.ReactNode
}

export function Dialog({ open, defaultOpen = false, onOpenChange, children }: DialogProps) {
  const [isOpen, setOpen] = useControllableState({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  })
  return (
    <DialogContext.Provider value={{ open: isOpen, setOpen }}>{children}</DialogContext.Provider>
  )
}

export const DialogTrigger = React.forwardRef<ViewRef, TriggerProps>(function DialogTrigger(
  { onPress, ...props },
  ref,
) {
  const { setOpen } = useDialog()
  return <Trigger ref={ref} onPress={composeHandlers(onPress, () => setOpen(true))} {...props} />
})

export const DialogClose = React.forwardRef<ViewRef, TriggerProps>(function DialogClose(
  { onPress, ...props },
  ref,
) {
  const { setOpen } = useDialog()
  return <Trigger ref={ref} onPress={composeHandlers(onPress, () => setOpen(false))} {...props} />
})

/** Centered modal panel shared by Dialog, AlertDialog and CommandDialog. */
export function ModalPanel({
  open,
  onDismiss,
  dismissable = true,
  style,
  maxWidth = 512,
  shadow = true,
  children,
  accessibilityRole = "none",
}: {
  open: boolean
  onDismiss: () => void
  dismissable?: boolean
  style?: StyleProp<ViewStyle>
  maxWidth?: number
  shadow?: boolean
  children?: React.ReactNode
  accessibilityRole?: ViewProps["accessibilityRole"]
}) {
  const theme = useTheme()
  const { mounted, progress } = usePresence(open, 200)
  const surface = useSurface({
    shadow,
    style: [
      {
        width: "100%",
        maxWidth,
        gap: 16,
        padding: 24,
        borderRadius: theme.radius,
        borderWidth: theme.borderWidth,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.background,
      },
      style,
    ],
  })
  return (
    <OverlayRoot open={mounted} onClose={dismissable ? onDismiss : () => {}}>
      <Backdrop
        progress={progress}
        color={theme.colors.overlay}
        onPress={dismissable ? onDismiss : undefined}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.center}
        pointerEvents="box-none"
      >
        <Animated.View
          accessibilityViewIsModal
          accessibilityRole={accessibilityRole}
          style={[
            surface.style,
            {
              opacity: progress,
              transform: [
                { scale: progress.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) },
              ],
            },
          ]}
        >
          {surface.underlay}
          <TextStyleProvider value={{ color: theme.colors.foreground, fontSize: 16, lineHeight: 24 }}>
            {children}
          </TextStyleProvider>
        </Animated.View>
      </KeyboardAvoidingView>
    </OverlayRoot>
  )
}

export type DialogContentProps = ViewProps & {
  showCloseButton?: boolean
  /** Prevent closing by tapping the backdrop / back button. */
  dismissable?: boolean
}

export function DialogContent({
  style,
  children,
  showCloseButton = true,
  dismissable = true,
}: DialogContentProps) {
  const { open, setOpen } = useDialog()
  return (
    <ModalPanel open={open} onDismiss={() => setOpen(false)} dismissable={dismissable} style={style}>
      {children}
      {showCloseButton ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close"
          hitSlop={10}
          onPress={() => setOpen(false)}
          style={{ position: "absolute", right: 16, top: 16 }}
        >
          <XIcon size={16} />
        </Pressable>
      ) : null}
    </ModalPanel>
  )
}

/** On narrow screens headers are centered (`text-center sm:text-left`). */
export function useCompact() {
  const { width } = useWindowDimensions()
  return width < 640
}

export function DialogHeader({ style, children, ...props }: ViewProps) {
  const compact = useCompact()
  return (
    <View style={[{ gap: 8 }, style]} {...props}>
      <TextStyleProvider value={{ textAlign: compact ? "center" : "left" }}>
        {renderText(children)}
      </TextStyleProvider>
    </View>
  )
}

export function DialogFooter({ style, ...props }: ViewProps) {
  const compact = useCompact()
  return (
    <View
      style={[
        compact
          ? { flexDirection: "column-reverse", gap: 12 }
          : { flexDirection: "row", justifyContent: "flex-end", gap: 12 },
        style,
      ]}
      {...props}
    />
  )
}

export function DialogTitle({ style, ...props }: TextProps) {
  return (
    <Text
      weight="heading"
      accessibilityRole="header"
      style={[{ fontSize: 18, lineHeight: 20, letterSpacing: -0.45 }, style]}
      {...props}
    />
  )
}

export function DialogDescription({ style, ...props }: TextProps) {
  return <Text size="sm" style={style} {...props} />
}

const styles = StyleSheet.create({
  center: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
})
