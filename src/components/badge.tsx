import * as React from "react"
import { View, type StyleProp, type TextStyle, type ViewProps, type ViewStyle } from "react-native"
import { renderText, TextStyleProvider } from "../lib/text"
import type { ViewRef } from "../lib/utils"
import { useTheme } from "../theme/ThemeProvider"

export type BadgeProps = ViewProps & {
  variant?: "default" | "neutral"
  style?: StyleProp<ViewStyle>
  textStyle?: StyleProp<TextStyle>
}

export const Badge = React.forwardRef<ViewRef, BadgeProps>(function Badge(
  { variant = "default", style, textStyle, children, ...props },
  ref,
) {
  const theme = useTheme()
  return (
    <View
      ref={ref}
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          alignSelf: "flex-start",
          gap: 4,
          borderRadius: theme.radius,
          borderWidth: theme.borderWidth,
          borderColor: theme.colors.border,
          paddingHorizontal: 10,
          paddingVertical: 2,
          overflow: "hidden",
          backgroundColor:
            variant === "neutral" ? theme.colors.secondaryBackground : theme.colors.background,
        },
        style,
      ]}
      {...props}
    >
      <TextStyleProvider
        value={{ color: theme.colors.foreground, fontSize: 12, lineHeight: 16, iconSize: 12 }}
      >
        {renderText(children, textStyle, { numberOfLines: 1 })}
      </TextStyleProvider>
    </View>
  )
})
