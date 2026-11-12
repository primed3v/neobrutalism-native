import * as React from "react"
import { Pressable, View, type PressableProps, type StyleProp, type TextStyle, type ViewProps, type ViewStyle } from "react-native"
import { renderText, TextStyleProvider } from "../lib/text"
import { useTheme } from "../theme/ThemeProvider"
import { withAlpha, type Theme } from "../theme/theme"
import { useMessage } from "./message"

export type BubbleVariant = "default" | "secondary" | "muted" | "destructive"

function variantColors(theme: Theme, variant: BubbleVariant) {
  switch (variant) {
    case "secondary":
      return { bg: theme.colors.secondaryBackground, fg: theme.colors.foreground, hover: theme.colors.background }
    case "muted":
      return { bg: theme.colors.background, fg: theme.colors.foreground, hover: theme.colors.secondaryBackground }
    case "destructive":
      return { bg: theme.colors.destructive, fg: theme.colors.destructiveForeground, hover: withAlpha(theme.colors.destructive, 0.8) }
    default:
      return { bg: theme.colors.main, fg: theme.colors.mainForeground, hover: withAlpha(theme.colors.main, 0.8) }
  }
}

const BubbleContext = React.createContext<{ variant: BubbleVariant; align: "start" | "end" }>({
  variant: "default",
  align: "start",
})

export function BubbleGroup({ style, ...props }: ViewProps) {
  return <View style={[{ minWidth: 0, gap: 8 }, style]} {...props} />
}

export type BubbleProps = ViewProps & { variant?: BubbleVariant; align?: "start" | "end" }

export function Bubble({ variant = "default", align, style, ...props }: BubbleProps) {
  const message = useMessage()
  const a = align ?? message.align
  return (
    <BubbleContext.Provider value={{ variant, align: a }}>
      <View
        style={[
          { maxWidth: "80%", minWidth: 0, gap: 4, alignSelf: a === "end" ? "flex-end" : "flex-start" },
          style,
        ]}
        {...props}
      />
    </BubbleContext.Provider>
  )
}

export type BubbleContentProps = Omit<PressableProps, "style" | "children"> & {
  style?: StyleProp<ViewStyle>
  textStyle?: StyleProp<TextStyle>
  children?: React.ReactNode
}

/** The bubble itself. Becomes pressable (with a hover state) when `onPress` is set. */
export function BubbleContent({ style, textStyle, children, onPress, ...props }: BubbleContentProps) {
  const theme = useTheme()
  const { variant, align } = React.useContext(BubbleContext)
  const c = variantColors(theme, variant)
  const [hovered, setHovered] = React.useState(false)
  const box: ViewStyle = {
    maxWidth: "100%",
    alignSelf: align === "end" ? "flex-end" : "flex-start",
    overflow: "hidden",
    borderRadius: theme.radius,
    borderWidth: theme.borderWidth,
    borderColor: theme.colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: onPress && hovered ? c.hover : c.bg,
  }
  const content = (
    <TextStyleProvider value={{ color: c.fg, fontSize: 14, lineHeight: 20 }}>
      {renderText(children, textStyle)}
    </TextStyleProvider>
  )
  if (!onPress) return <View style={[box, style]}>{content}</View>
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={({ pressed }) => [box, pressed && { backgroundColor: c.hover }, style]}
      {...props}
    >
      {content}
    </Pressable>
  )
}

export function BubbleReactions({
  side = "bottom",
  align = "end",
  style,
  children,
  ...props
}: ViewProps & { side?: "top" | "bottom"; align?: "start" | "end" }) {
  const theme = useTheme()
  return (
    <View
      style={[
        {
          position: "absolute",
          zIndex: 10,
          flexDirection: "row",
          alignItems: "center",
          gap: 4,
          borderRadius: 9999,
          borderWidth: theme.borderWidth,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.secondaryBackground,
          paddingHorizontal: 6,
          paddingVertical: 2,
          transform: [{ translateY: side === "bottom" ? 18 : -18 }],
        },
        side === "bottom" ? { bottom: 0 } : { top: 0 },
        align === "start" ? { left: 12 } : { right: 12 },
        style,
      ]}
      {...props}
    >
      <TextStyleProvider value={{ color: theme.colors.foreground, fontSize: 14, lineHeight: 20 }}>
        {renderText(children)}
      </TextStyleProvider>
    </View>
  )
}
