import * as React from "react"
import { View, type StyleProp, type TextStyle, type ViewProps, type ViewStyle } from "react-native"
import { Surface } from "../lib/surface"
import { renderText, Text, TextStyleProvider, type TextProps } from "../lib/text"
import type { ViewRef } from "../lib/utils"
import { useTheme } from "../theme/ThemeProvider"

const CardContext = React.createContext<{ spacing: number }>({ spacing: 24 })

export type CardProps = ViewProps & {
  size?: "default" | "sm"
  /** Disable the hard shadow. */
  shadow?: boolean
}

export const Card = React.forwardRef<ViewRef, CardProps>(function Card(
  { size = "default", shadow = true, style, children, ...props },
  ref,
) {
  const theme = useTheme()
  const spacing = size === "sm" ? 16 : 24
  return (
    <CardContext.Provider value={{ spacing }}>
      <Surface
        ref={ref}
        shadow={shadow}
        style={[
          {
            flexDirection: "column",
            gap: spacing,
            paddingVertical: spacing,
            borderRadius: theme.radius,
            borderWidth: theme.borderWidth,
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.background,
          },
          style,
        ]}
        {...props}
      >
        <TextStyleProvider value={{ color: theme.colors.foreground, fontSize: 16, lineHeight: 24 }}>
          {children}
        </TextStyleProvider>
      </Surface>
    </CardContext.Provider>
  )
})

export function CardHeader({ style, children, bordered, ...props }: ViewProps & {
  /** Adds a bottom border + padding (`.border-b` on the web). */
  bordered?: boolean
}) {
  const { spacing } = React.useContext(CardContext)
  const theme = useTheme()
  const items = React.Children.toArray(children)
  const action = items.find((c) => React.isValidElement(c) && c.type === CardAction)
  const rest = items.filter((c) => c !== action)
  return (
    <View
      style={[
        { paddingHorizontal: spacing, flexDirection: "row", alignItems: "flex-start", gap: 6 },
        bordered && {
          borderBottomWidth: theme.borderWidth,
          borderColor: theme.colors.border,
          paddingBottom: spacing,
        },
        style,
      ]}
      {...props}
    >
      <View style={{ flex: 1, gap: 6 }}>{renderText(rest)}</View>
      {action}
    </View>
  )
}

export function CardTitle({ style, ...props }: TextProps) {
  return <Text weight="heading" style={[{ fontSize: 16, lineHeight: 18 }, style]} {...props} />
}

export function CardDescription({ style, ...props }: TextProps) {
  return <Text size="sm" style={style} {...props} />
}

export function CardAction({ style, ...props }: ViewProps) {
  return <View style={[{ alignSelf: "flex-start" }, style]} {...props} />
}

export function CardContent({
  style,
  children,
  textStyle,
  ...props
}: ViewProps & { textStyle?: StyleProp<TextStyle> }) {
  const { spacing } = React.useContext(CardContext)
  return (
    <View style={[{ paddingHorizontal: spacing }, style]} {...props}>
      {renderText(children, textStyle)}
    </View>
  )
}

export function CardFooter({
  style,
  children,
  bordered,
  ...props
}: ViewProps & { bordered?: boolean; style?: StyleProp<ViewStyle> }) {
  const { spacing } = React.useContext(CardContext)
  const theme = useTheme()
  return (
    <View
      style={[
        { paddingHorizontal: spacing, flexDirection: "row", alignItems: "center" },
        bordered && {
          borderTopWidth: theme.borderWidth,
          borderColor: theme.colors.border,
          paddingTop: spacing,
        },
        style,
      ]}
      {...props}
    >
      {renderText(children)}
    </View>
  )
}
