import * as React from "react"
import { Pressable, View, type PressableProps, type StyleProp, type TextStyle, type ViewProps, type ViewStyle } from "react-native"
import { ChevronRightIcon, MoreHorizontalIcon } from "../icons"
import { renderText, Text, TextStyleProvider, type TextProps } from "../lib/text"
import { Slot } from "../lib/utils"
import { useTheme } from "../theme/ThemeProvider"

export function Breadcrumb(props: ViewProps) {
  return <View accessibilityLabel="breadcrumb" accessibilityRole="none" {...props} />
}

export function BreadcrumbList({ style, ...props }: ViewProps) {
  const theme = useTheme()
  return (
    <TextStyleProvider value={{ color: theme.colors.foreground, fontSize: 14, lineHeight: 20 }}>
      <View
        accessibilityRole="list"
        style={[{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 6 }, style]}
        {...props}
      />
    </TextStyleProvider>
  )
}

export function BreadcrumbItem({ style, children, ...props }: ViewProps) {
  return (
    <View style={[{ flexDirection: "row", alignItems: "center", gap: 6 }, style]} {...props}>
      {renderText(children)}
    </View>
  )
}

export function BreadcrumbLink({
  asChild,
  style,
  textStyle,
  children,
  ...props
}: Omit<PressableProps, "style" | "children"> & {
  asChild?: boolean
  style?: StyleProp<ViewStyle>
  textStyle?: StyleProp<TextStyle>
  children?: React.ReactNode
}) {
  const [hovered, setHovered] = React.useState(false)
  if (asChild) return <Slot {...(props as Record<string, unknown>)}>{children}</Slot>
  return (
    <Pressable
      accessibilityRole="link"
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={style}
      {...props}
    >
      {renderText(children, [hovered && { textDecorationLine: "underline" }, textStyle])}
    </Pressable>
  )
}

export function BreadcrumbPage(props: TextProps) {
  return <Text accessibilityRole="link" accessibilityState={{ disabled: true }} {...props} />
}

export function BreadcrumbSeparator({ style, children, ...props }: ViewProps) {
  return (
    <View accessibilityElementsHidden importantForAccessibility="no" style={style} {...props}>
      {children ?? <ChevronRightIcon size={14} />}
    </View>
  )
}

export function BreadcrumbEllipsis({ style, ...props }: ViewProps) {
  return (
    <View
      accessibilityLabel="More"
      style={[{ width: 36, height: 36, alignItems: "center", justifyContent: "center" }, style]}
      {...props}
    >
      <MoreHorizontalIcon size={16} />
    </View>
  )
}
