import * as React from "react"
import {
  Animated,
  Pressable,
  View,
  useWindowDimensions,
  type ViewProps,
  type ViewStyle,
} from "react-native"
import { XIcon } from "../icons"
import { Backdrop, OverlayRoot, usePresence } from "../lib/overlay"
import { renderText, Text, TextStyleProvider, type TextProps } from "../lib/text"
import { Trigger, type TriggerProps } from "../lib/trigger"
import { composeHandlers, type ViewRef } from "../lib/utils"
import { useSafeInsets, useTheme } from "../theme/ThemeProvider"
import { Dialog, useDialog, type DialogProps } from "./dialog"

export type SheetSide = "top" | "right" | "bottom" | "left"

export function Sheet(props: DialogProps) {
  return <Dialog {...props} />
}

export const SheetTrigger = React.forwardRef<ViewRef, TriggerProps>(function SheetTrigger(
  { onPress, ...props },
  ref,
) {
  const { setOpen } = useDialog()
  return <Trigger ref={ref} onPress={composeHandlers(onPress, () => setOpen(true))} {...props} />
})

export const SheetClose = React.forwardRef<ViewRef, TriggerProps>(function SheetClose(
  { onPress, ...props },
  ref,
) {
  const { setOpen } = useDialog()
  return <Trigger ref={ref} onPress={composeHandlers(onPress, () => setOpen(false))} {...props} />
})

export type SheetContentProps = ViewProps & {
  side?: SheetSide
  showCloseButton?: boolean
}

export function SheetContent({
  side = "right",
  showCloseButton = true,
  style,
  children,
  ...props
}: SheetContentProps) {
  const theme = useTheme()
  const insets = useSafeInsets()
  const { open, setOpen } = useDialog()
  const { width, height } = useWindowDimensions()
  const { mounted, progress } = usePresence(open, open ? 500 : 300)
  const horizontal = side === "left" || side === "right"
  const panelWidth = Math.min(width * 0.75, 384)
  const bw = theme.borderWidth

  const position: ViewStyle =
    side === "right"
      ? { top: 0, bottom: 0, right: 0, width: panelWidth, borderLeftWidth: bw }
      : side === "left"
        ? { top: 0, bottom: 0, left: 0, width: panelWidth, borderRightWidth: bw }
        : side === "top"
          ? { top: 0, left: 0, right: 0, borderBottomWidth: bw }
          : { bottom: 0, left: 0, right: 0, borderTopWidth: bw }

  const distance = horizontal ? panelWidth : height
  const translate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [side === "right" || side === "bottom" ? distance : -distance, 0],
  })

  return (
    <OverlayRoot open={mounted} onClose={() => setOpen(false)}>
      <Backdrop progress={progress} color={theme.colors.overlay} onPress={() => setOpen(false)} />
      <Animated.View
        accessibilityViewIsModal
        style={[
          {
            position: "absolute",
            gap: 16,
            backgroundColor: theme.colors.background,
            borderColor: theme.colors.border,
            paddingTop: side === "bottom" ? 0 : insets.top,
            paddingBottom: side === "top" ? 0 : insets.bottom,
            transform: horizontal ? [{ translateX: translate }] : [{ translateY: translate }],
          },
          position,
          style,
        ]}
        {...props}
      >
        <TextStyleProvider value={{ color: theme.colors.foreground, fontSize: 16, lineHeight: 24 }}>
          {children}
        </TextStyleProvider>
        {showCloseButton ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close"
            hitSlop={10}
            onPress={() => setOpen(false)}
            style={{
              position: "absolute",
              right: 16,
              top: 16 + (side === "bottom" ? 0 : insets.top),
            }}
          >
            <XIcon size={16} />
          </Pressable>
        ) : null}
      </Animated.View>
    </OverlayRoot>
  )
}

export function SheetHeader({ style, children, ...props }: ViewProps) {
  return (
    <View style={[{ gap: 6, padding: 16 }, style]} {...props}>
      {renderText(children)}
    </View>
  )
}

export function SheetFooter({ style, ...props }: ViewProps) {
  return <View style={[{ marginTop: "auto", gap: 12, padding: 16 }, style]} {...props} />
}

export function SheetTitle({ style, ...props }: TextProps) {
  return <Text weight="heading" size="base" accessibilityRole="header" style={style} {...props} />
}

export function SheetDescription({ style, ...props }: TextProps) {
  return <Text size="sm" style={style} {...props} />
}
