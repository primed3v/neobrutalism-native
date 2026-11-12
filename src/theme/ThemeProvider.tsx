import * as React from "react"
import { Platform, StatusBar } from "react-native"
import { PortalHost } from "../lib/portal"
import { createTheme, lightTheme, type Theme, type ThemeOverrides } from "./theme"

const ThemeContext = React.createContext<Theme>(lightTheme)

export type SafeInsets = { top: number; bottom: number; left: number; right: number }

/**
 * Rough defaults used when no insets are provided. For exact values pass
 * `useSafeAreaInsets()` from react-native-safe-area-context to NeoProvider.
 */
export const defaultInsets: SafeInsets = Platform.select({
  ios: { top: 47, bottom: 34, left: 0, right: 0 },
  android: { top: StatusBar.currentHeight ?? 24, bottom: 0, left: 0, right: 0 },
  default: { top: 0, bottom: 0, left: 0, right: 0 },
})

const InsetsContext = React.createContext<SafeInsets>(defaultInsets)

/** Safe area insets used by full-screen overlays (Sheet, Drawer, Toaster...). */
export function useSafeInsets(): SafeInsets {
  return React.useContext(InsetsContext)
}

export type NeoProviderProps = {
  /** A full theme (e.g. `darkTheme`) or partial overrides of the light theme. */
  theme?: Theme | ThemeOverrides
  children?: React.ReactNode
  /**
   * Render a portal host so non-modal floating UI (tooltips, hover cards,
   * toasts) can render above the app. Default true. The host wraps children
   * in a `flex: 1` View.
   */
  portalHost?: boolean
  /**
   * Safe area insets for edge-anchored overlays (Sheet, Drawer, Toaster).
   * Tip: `insets={useSafeAreaInsets()}` from react-native-safe-area-context.
   */
  insets?: Partial<SafeInsets>
}

function isFullTheme(t: Theme | ThemeOverrides): t is Theme {
  return (
    "colors" in t &&
    !!t.colors &&
    "fontWeight" in t &&
    typeof (t as Theme).radius === "number" &&
    typeof (t as Theme).borderWidth === "number" &&
    !!(t as Theme).shadow &&
    Object.keys(t.colors).length >= Object.keys(lightTheme.colors).length
  )
}

/**
 * Provides the neobrutalism theme to every component below it.
 * Optional: components fall back to the light theme without a provider,
 * and floating UI falls back to native Modals.
 */
export function NeoProvider({ theme, children, portalHost = true, insets }: NeoProviderProps) {
  const value = React.useMemo<Theme>(() => {
    if (!theme) return lightTheme
    return isFullTheme(theme) ? theme : createTheme(theme)
  }, [theme])
  const safe = React.useMemo<SafeInsets>(
    () => ({ ...defaultInsets, ...insets }),
    [insets?.top, insets?.bottom, insets?.left, insets?.right],
  )
  return (
    <ThemeContext.Provider value={value}>
      <InsetsContext.Provider value={safe}>
        {portalHost ? <PortalHost>{children}</PortalHost> : children}
      </InsetsContext.Provider>
    </ThemeContext.Provider>
  )
}

/** Alias of `NeoProvider`. */
export const ThemeProvider = NeoProvider

export function useTheme(): Theme {
  return React.useContext(ThemeContext)
}
