import * as React from "react"
import {
  StyleSheet,
  Text as RNText,
  type StyleProp,
  type TextProps as RNTextProps,
  type TextStyle,
} from "react-native"
import { useTheme } from "../theme/ThemeProvider"
import type { TextRef } from "./utils"
import type { Theme } from "../theme/theme"

/**
 * React Native does not inherit text styles from Views the way CSS does.
 * Components therefore publish the text style their children should use
 * (color, size, weight) through this context, and `Text` + icons read it.
 * This gives us the equivalent of `text-main-foreground` on a <button>.
 */
export type InheritedTextStyle = {
  color?: string
  fontSize?: number
  lineHeight?: number
  weight?: "base" | "heading"
  textAlign?: TextStyle["textAlign"]
  letterSpacing?: number
  /** icon size used by icons that don't specify one */
  iconSize?: number
}

const TextStyleContext = React.createContext<InheritedTextStyle>({})

export function useInheritedTextStyle() {
  return React.useContext(TextStyleContext)
}

export function TextStyleProvider({
  value,
  children,
}: {
  value: InheritedTextStyle
  children?: React.ReactNode
}) {
  const parent = React.useContext(TextStyleContext)
  const merged = React.useMemo(() => {
    const next: InheritedTextStyle = { ...parent }
    for (const k of Object.keys(value) as (keyof InheritedTextStyle)[]) {
      if (value[k] !== undefined) (next as Record<string, unknown>)[k] = value[k]
    }
    return next
  }, [parent, value])
  return (
    <TextStyleContext.Provider value={merged}>{children}</TextStyleContext.Provider>
  )
}

/** Tailwind type scale */
export const fontSizes = {
  xs: { fontSize: 12, lineHeight: 16 },
  sm: { fontSize: 14, lineHeight: 20 },
  base: { fontSize: 16, lineHeight: 24 },
  lg: { fontSize: 18, lineHeight: 28 },
  xl: { fontSize: 20, lineHeight: 28 },
  "2xl": { fontSize: 24, lineHeight: 32 },
  "3xl": { fontSize: 30, lineHeight: 36 },
  "4xl": { fontSize: 36, lineHeight: 40 },
} as const

export type FontSize = keyof typeof fontSizes

export function fontFor(theme: Theme, weight: "base" | "heading"): TextStyle {
  const family =
    weight === "heading" ? (theme.fonts.heading ?? theme.fonts.base) : theme.fonts.base
  return {
    fontFamily: family,
    fontWeight: theme.fontWeight[weight],
  }
}

export type TextProps = RNTextProps & {
  /** `heading` = font-heading (700), `base` = font-base (500) */
  weight?: "base" | "heading"
  size?: FontSize
  color?: string
  children?: React.ReactNode
}

/**
 * Themed Text. Inherits color/size/weight from the closest component
 * (e.g. a Button), like CSS inheritance on the web.
 */
export const Text = React.forwardRef<TextRef, TextProps>(function Text(
  { weight, size, color, style, ...props },
  ref,
) {
  const theme = useTheme()
  const inherited = useInheritedTextStyle()
  const w = weight ?? inherited.weight ?? "base"
  const sizeStyle = size
    ? fontSizes[size]
    : {
        fontSize: inherited.fontSize ?? 14,
        lineHeight: inherited.lineHeight ?? Math.round((inherited.fontSize ?? 14) * 1.43),
      }
  return (
    <RNText
      ref={ref}
      style={[
        {
          color: color ?? inherited.color ?? theme.colors.foreground,
          textAlign: inherited.textAlign,
          letterSpacing: inherited.letterSpacing,
        },
        sizeStyle,
        fontFor(theme, w),
        style,
      ]}
      {...props}
    />
  )
})

/** Heading text (font-heading). */
export const Heading = React.forwardRef<TextRef, TextProps>(function Heading(
  { size = "2xl", ...props },
  ref,
) {
  return <Text ref={ref} weight="heading" size={size} {...props} />
})

/**
 * Wraps raw strings/numbers in `Text`, leaving elements untouched, so that
 * `<Button>Click</Button>` works the same as on the web.
 */
export function renderText(
  children: React.ReactNode,
  textStyle?: StyleProp<TextStyle>,
  textProps?: Partial<RNTextProps>,
): React.ReactNode {
  return React.Children.map(children, (child) => {
    if (typeof child === "string" || typeof child === "number") {
      return (
        <Text style={textStyle} {...textProps}>
          {child}
        </Text>
      )
    }
    return child
  })
}

export function hasTextChildren(children: React.ReactNode) {
  let found = false
  React.Children.forEach(children, (c) => {
    if (typeof c === "string" || typeof c === "number") found = true
  })
  return found
}

export const textStyles = StyleSheet.create({
  srOnly: { position: "absolute", width: 1, height: 1, overflow: "hidden", opacity: 0 },
})
