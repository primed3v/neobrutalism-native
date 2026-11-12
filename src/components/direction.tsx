import * as React from "react"
import { I18nManager, View, type ViewProps } from "react-native"

export type Direction = "ltr" | "rtl"

const DirectionContext = React.createContext<Direction>(I18nManager.isRTL ? "rtl" : "ltr")

/**
 * Sets the reading direction for a subtree. Uses the `direction` style so
 * flex rows flip without reloading the app (I18nManager.forceRTL does
 * the same app-wide but requires a restart).
 */
export function DirectionProvider({
  direction,
  style,
  children,
  ...props
}: ViewProps & { direction: Direction }) {
  return (
    <DirectionContext.Provider value={direction}>
      <View style={[{ direction, flexGrow: 1 }, style]} {...props}>
        {children}
      </View>
    </DirectionContext.Provider>
  )
}

export function useDirection(): Direction {
  return React.useContext(DirectionContext)
}
