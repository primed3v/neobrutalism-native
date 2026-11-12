import { View, type ViewProps } from "react-native"
import { renderText, TextStyleProvider } from "../lib/text"
import { useTheme } from "../theme/ThemeProvider"

export function Kbd({ style, children, ...props }: ViewProps) {
  const theme = useTheme()
  return (
    <View
      pointerEvents="none"
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          alignSelf: "flex-start",
          gap: 4,
          height: 20,
          minWidth: 20,
          paddingHorizontal: 4,
          borderRadius: theme.radius,
          borderWidth: theme.borderWidth,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.secondaryBackground,
        },
        style,
      ]}
      {...props}
    >
      <TextStyleProvider
        value={{
          color: theme.colors.foreground,
          fontSize: 12,
          lineHeight: 14,
          weight: "heading",
          iconSize: 12,
        }}
      >
        {renderText(children)}
      </TextStyleProvider>
    </View>
  )
}

export function KbdGroup({ style, ...props }: ViewProps) {
  return <View style={[{ flexDirection: "row", alignItems: "center", gap: 4 }, style]} {...props} />
}
