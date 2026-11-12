import * as React from "react"
import { View, type ViewProps } from "react-native"
import { Surface } from "../lib/surface"
import { renderText, Text, TextStyleProvider, type TextProps } from "../lib/text"
import type { ViewRef } from "../lib/utils"
import { useTheme } from "../theme/ThemeProvider"

export type AlertProps = ViewProps & {
  variant?: "default" | "destructive"
  /** Optional leading icon. Any non-AlertTitle/AlertDescription element child also works. */
  icon?: React.ReactNode
}

export const Alert = React.forwardRef<ViewRef, AlertProps>(function Alert(
  { variant = "default", icon, style, children, ...props },
  ref,
) {
  const theme = useTheme()
  const destructive = variant === "destructive"
  const items = React.Children.toArray(children)
  const isContent = (c: React.ReactNode) =>
    !React.isValidElement(c) || c.type === AlertTitle || c.type === AlertDescription
  const leading = icon ?? items.find((c) => !isContent(c))
  const content = items.filter((c) => isContent(c) && c !== leading)
  return (
    <Surface
      ref={ref}
      shadow
      accessibilityRole="alert"
      style={[
        {
          width: "100%",
          flexDirection: "row",
          alignItems: "flex-start",
          gap: leading ? 12 : 0,
          borderRadius: theme.radius,
          borderWidth: theme.borderWidth,
          borderColor: theme.colors.border,
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: destructive ? theme.colors.destructive : theme.colors.background,
        },
        style,
      ]}
      {...props}
    >
      <TextStyleProvider
        value={{
          color: destructive ? theme.colors.destructiveForeground : theme.colors.foreground,
          fontSize: 14,
          lineHeight: 20,
          iconSize: 16,
        }}
      >
        {leading ? <View style={{ marginTop: 2 }}>{leading}</View> : null}
        <View style={{ flex: 1, gap: 2 }}>{renderText(content)}</View>
      </TextStyleProvider>
    </Surface>
  )
})

export function AlertTitle({ style, ...props }: TextProps) {
  return (
    <Text
      weight="heading"
      numberOfLines={1}
      style={[{ minHeight: 16, letterSpacing: -0.35 }, style]}
      {...props}
    />
  )
}

export function AlertDescription({ style, ...props }: TextProps) {
  return <Text size="sm" style={[{ lineHeight: 22 }, style]} {...props} />
}
