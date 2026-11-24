import * as React from "react"
import {
  Platform,
  StyleSheet,
  View,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from "react-native"
import { useTheme } from "../theme/ThemeProvider"
import type { ViewRef } from "./utils"

const SURFACE_KEYS = [
  "backgroundColor",
  "borderColor",
  "borderTopColor",
  "borderRightColor",
  "borderBottomColor",
  "borderLeftColor",
  "borderStartColor",
  "borderEndColor",
  "borderStyle",
] as const

const RADIUS_KEYS = [
  "borderRadius",
  "borderTopLeftRadius",
  "borderTopRightRadius",
  "borderBottomLeftRadius",
  "borderBottomRightRadius",
  "borderTopStartRadius",
  "borderTopEndRadius",
  "borderBottomStartRadius",
  "borderBottomEndRadius",
] as const

function sideWidth(s: ViewStyle, side: "Top" | "Right" | "Bottom" | "Left"): number {
  const v = s[`border${side}Width` as const] ?? s.borderWidth ?? 0
  return typeof v === "number" ? v : 0
}

export type SurfaceOptions = {
  style?: StyleProp<ViewStyle>
  /** Show the hard shadow. */
  shadow?: boolean
  /** Override shadow offset (defaults to theme.shadow). Negative = reverse. */
  shadowOffset?: { x: number; y: number }
  /** Override shadow color (defaults to theme.colors.border). */
  shadowColor?: string
}

/**
 * Splits a style into a transparent container + layers that draw the
 * background/border and a zero-blur offset shadow.
 *
 * Native `shadow*`/`elevation` styles can't render a hard offset shadow on
 * Android, so the shadow is an absolutely positioned layer behind a second
 * layer that carries the background + border. The container keeps its
 * border widths (with a transparent color) so layout is identical to a
 * plain View. The layer structure is constant, so toggling `shadow` never
 * remounts children.
 */
export function useSurface({ style, shadow, shadowOffset, shadowColor }: SurfaceOptions) {
  const theme = useTheme()
  const flat = (StyleSheet.flatten(style) ?? {}) as ViewStyle
  const container: Record<string, unknown> = { ...flat }
  const layer: Record<string, unknown> = {}
  const radii: Record<string, unknown> = {}
  for (const k of SURFACE_KEYS) {
    if (flat[k] !== undefined) layer[k] = flat[k]
    delete container[k]
  }
  for (const k of RADIUS_KEYS) {
    if (flat[k] !== undefined) {
      layer[k] = flat[k]
      radii[k] = flat[k]
    }
  }
  for (const side of ["Top", "Right", "Bottom", "Left"] as const) {
    const w = sideWidth(flat, side)
    if (w) layer[`border${side}Width`] = w
  }
  container.borderColor = "transparent"
  // overflow: hidden would clip the shadow layer
  if (container.overflow === "hidden") delete container.overflow
  // On the web, absolutely positioned layers paint above static children
  // (e.g. raw <svg> icons) regardless of DOM order. Make the container a
  // stacking context and push the layers behind its content.
  const web = Platform.OS === "web"
  if (web && container.zIndex === undefined) container.zIndex = 0
  const layerZ = web ? { zIndex: -1 } : null

  const bt = sideWidth(flat, "Top")
  const br = sideWidth(flat, "Right")
  const bb = sideWidth(flat, "Bottom")
  const bl = sideWidth(flat, "Left")
  const { x, y } = shadowOffset ?? theme.shadow

  const underlay = (
    <>
      <View
        pointerEvents="none"
        style={[
          radii as ViewStyle,
          {
            position: "absolute",
            top: -bt + y,
            left: -bl + x,
            right: -br - x,
            bottom: -bb - y,
            backgroundColor: shadowColor ?? theme.colors.border,
            opacity: shadow ? 1 : 0,
          },
          layerZ,
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          layer as ViewStyle,
          { position: "absolute", top: -bt, left: -bl, right: -br, bottom: -bb },
          layerZ,
        ]}
      />
    </>
  )
  return { style: container as ViewStyle, underlay }
}

export type SurfaceProps = ViewProps & Omit<SurfaceOptions, "style">

/** A View with an optional neobrutalism hard shadow (`shadow-shadow`). */
export const Surface = React.forwardRef<ViewRef, SurfaceProps>(function Surface(
  { shadow, shadowOffset, shadowColor, style, children, ...props },
  ref,
) {
  const s = useSurface({ style, shadow, shadowOffset, shadowColor })
  return (
    <View ref={ref} style={s.style} {...props}>
      {s.underlay}
      {children}
    </View>
  )
})
