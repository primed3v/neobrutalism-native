import { View, useWindowDimensions, type ViewProps } from "react-native"
import { renderText, Text, TextStyleProvider, type TextProps } from "../lib/text"
import { useTheme } from "../theme/ThemeProvider"

export function Empty({ style, children, ...props }: ViewProps) {
  const theme = useTheme()
  const { width } = useWindowDimensions()
  return (
    <View
      style={[
        {
          width: "100%",
          flexGrow: 1,
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          padding: width >= 768 ? 48 : 24,
          borderRadius: theme.radius,
          borderWidth: theme.borderWidth,
          borderStyle: "dashed",
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.background,
        },
        style,
      ]}
      {...props}
    >
      <TextStyleProvider value={{ color: theme.colors.foreground, textAlign: "center", fontSize: 14 }}>
        {children}
      </TextStyleProvider>
    </View>
  )
}

export function EmptyHeader({ style, children, ...props }: ViewProps) {
  return (
    <View style={[{ maxWidth: 384, alignItems: "center", gap: 8 }, style]} {...props}>
      {renderText(children)}
    </View>
  )
}

export function EmptyMedia({
  variant = "default",
  style,
  children,
  ...props
}: ViewProps & { variant?: "default" | "icon" }) {
  const theme = useTheme()
  return (
    <View
      style={[
        { marginBottom: 8, alignItems: "center", justifyContent: "center" },
        variant === "icon" && {
          width: 40,
          height: 40,
          borderRadius: theme.radius,
          borderWidth: theme.borderWidth,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.secondaryBackground,
        },
        style,
      ]}
      {...props}
    >
      <TextStyleProvider value={{ iconSize: variant === "icon" ? 20 : undefined }}>{children}</TextStyleProvider>
    </View>
  )
}

export function EmptyTitle({ style, ...props }: TextProps) {
  return <Text weight="heading" size="sm" style={[{ letterSpacing: -0.35 }, style]} {...props} />
}

export function EmptyDescription({ style, ...props }: TextProps) {
  return <Text size="sm" style={[{ lineHeight: 22 }, style]} {...props} />
}

export function EmptyContent({ style, children, ...props }: ViewProps) {
  return (
    <View
      style={[{ width: "100%", maxWidth: 384, alignItems: "center", gap: 10 }, style]}
      {...props}
    >
      {renderText(children)}
    </View>
  )
}
