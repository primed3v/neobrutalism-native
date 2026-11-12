import * as React from "react"
import { View, type ViewProps } from "react-native"
import { renderText, Text, TextStyleProvider, type TextProps } from "../lib/text"
import { useTheme } from "../theme/ThemeProvider"

const MarkerContext = React.createContext<"default" | "separator" | "border">("default")

export type MarkerProps = ViewProps & { variant?: "default" | "separator" | "border" }

/** A labelled marker/divider row (e.g. "Today" in a chat). */
export function Marker({ variant = "default", style, children, ...props }: MarkerProps) {
  const theme = useTheme()
  const line = <View style={{ flex: 1, minWidth: 0, height: 2, backgroundColor: theme.colors.border }} />
  return (
    <MarkerContext.Provider value={variant}>
      <View
        style={[
          { width: "100%", minHeight: 16, flexDirection: "row", alignItems: "center", gap: 8 },
          variant === "border" && {
            borderBottomWidth: theme.borderWidth,
            borderColor: theme.colors.border,
            paddingBottom: 8,
          },
          style,
        ]}
        {...props}
      >
        <TextStyleProvider value={{ color: theme.colors.foreground, fontSize: 14, lineHeight: 20, iconSize: 16 }}>
          {variant === "separator" ? line : null}
          {renderText(children)}
          {variant === "separator" ? line : null}
        </TextStyleProvider>
      </View>
    </MarkerContext.Provider>
  )
}

export function MarkerIcon({ style, ...props }: ViewProps) {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no"
      style={[{ width: 16, height: 16, alignItems: "center", justifyContent: "center" }, style]}
      {...props}
    />
  )
}

export function MarkerContent({ style, ...props }: TextProps) {
  const variant = React.useContext(MarkerContext)
  return (
    <Text
      style={[
        variant === "separator" ? { flexShrink: 0, textAlign: "center" } : { flexShrink: 1 },
        style,
      ]}
      {...props}
    />
  )
}
