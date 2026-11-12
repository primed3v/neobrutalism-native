import * as React from "react"
import {
  Pressable,
  View,
  type PressableProps,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from "react-native"
import { renderText, Text, TextStyleProvider, type TextProps } from "../lib/text"
import { useTheme } from "../theme/ThemeProvider"

type Size = "default" | "sm" | "xs"
const ItemContext = React.createContext<{ size: Size }>({ size: "default" })

const PAD: Record<Size, ViewStyle> = {
  default: { gap: 14, paddingHorizontal: 16, paddingVertical: 14 },
  sm: { gap: 10, paddingHorizontal: 12, paddingVertical: 10 },
  xs: { gap: 8, paddingHorizontal: 10, paddingVertical: 8 },
}

export function ItemGroup({ style, ...props }: ViewProps) {
  return <View accessibilityRole="list" style={[{ width: "100%", gap: 16 }, style]} {...props} />
}

export type ItemProps = Omit<PressableProps, "style" | "children"> & {
  size?: Size
  variant?: "default" | "outline" | "muted"
  style?: StyleProp<ViewStyle>
  children?: React.ReactNode
}

/** List row with media, content and actions. Pressable when `onPress` is set (hover/press → main). */
export function Item({ size = "default", variant = "default", style, children, onPress, ...props }: ItemProps) {
  const theme = useTheme()
  const [hovered, setHovered] = React.useState(false)
  const [pressed, setPressed] = React.useState(false)
  const active = !!onPress && (hovered || pressed)
  const box: ViewStyle = {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    borderRadius: theme.radius,
    borderWidth: theme.borderWidth,
    borderColor: theme.colors.border,
    backgroundColor: active
      ? theme.colors.main
      : variant === "muted"
        ? theme.colors.secondaryBackground
        : theme.colors.background,
    ...PAD[size],
  }
  const content = (
    <ItemContext.Provider value={{ size }}>
      <TextStyleProvider
        value={{ color: active ? theme.colors.mainForeground : theme.colors.foreground, fontSize: 14, lineHeight: 20 }}
      >
        {children}
      </TextStyleProvider>
    </ItemContext.Provider>
  )
  if (!onPress) {
    return (
      <View style={[box, style]} {...(props as ViewProps)}>
        {content}
      </View>
    )
  }
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[box, style]}
      {...props}
    >
      {content}
    </Pressable>
  )
}

export function ItemMedia({
  variant = "default",
  style,
  children,
  ...props
}: ViewProps & { variant?: "default" | "icon" | "image" }) {
  const theme = useTheme()
  const { size } = React.useContext(ItemContext)
  const imageSize = size === "xs" ? 24 : size === "sm" ? 32 : 40
  return (
    <View
      style={[
        { flexShrink: 0, alignItems: "center", justifyContent: "center", gap: 8 },
        variant === "image" && {
          width: imageSize,
          height: imageSize,
          overflow: "hidden",
          borderRadius: theme.radius,
          borderWidth: theme.borderWidth,
          borderColor: theme.colors.border,
        },
        style,
      ]}
      {...props}
    >
      <TextStyleProvider value={{ iconSize: variant === "icon" ? 20 : undefined }}>{children}</TextStyleProvider>
    </View>
  )
}

export function ItemContent({ style, children, ...props }: ViewProps) {
  const { size } = React.useContext(ItemContext)
  return (
    <View style={[{ flex: 1, gap: size === "xs" ? 0 : 4 }, style]} {...props}>
      {renderText(children)}
    </View>
  )
}

export function ItemTitle({ style, ...props }: TextProps) {
  return <Text numberOfLines={1} style={[{ fontSize: 14, lineHeight: 18 }, style]} {...props} />
}

export function ItemDescription({ style, ...props }: TextProps) {
  const { size } = React.useContext(ItemContext)
  return (
    <Text
      numberOfLines={2}
      size={size === "xs" ? "xs" : "sm"}
      style={style}
      {...props}
    />
  )
}

export function ItemActions({ style, ...props }: ViewProps) {
  return <View style={[{ flexDirection: "row", alignItems: "center", gap: 8 }, style]} {...props} />
}

export function ItemHeader({ style, children, ...props }: ViewProps) {
  return (
    <View
      style={[{ width: "100%", flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 }, style]}
      {...props}
    >
      {renderText(children)}
    </View>
  )
}

export function ItemFooter(props: ViewProps) {
  return <ItemHeader {...props} />
}

export function ItemSeparator({ style, ...props }: ViewProps) {
  const theme = useTheme()
  return <View style={[{ height: theme.borderWidth, backgroundColor: theme.colors.border }, style]} {...props} />
}
