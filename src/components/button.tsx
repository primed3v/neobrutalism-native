import * as React from "react"
import {
  Pressable,
  type PressableProps,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native"
import { useSurface } from "../lib/surface"
import type { ViewRef } from "../lib/utils"
import { renderText, TextStyleProvider } from "../lib/text"
import { useTheme } from "../theme/ThemeProvider"
import type { Theme } from "../theme/theme"
import { Spinner } from "./spinner"

export type ButtonVariant = "default" | "noShadow" | "neutral" | "reverse"
export type ButtonSize =
  | "default"
  | "xs"
  | "sm"
  | "lg"
  | "icon"
  | "icon-xs"
  | "icon-sm"
  | "icon-lg"

const SIZES: Record<ButtonSize, ViewStyle & { fontSize: number; icon: number; gap: number }> = {
  default: { height: 40, paddingHorizontal: 16, fontSize: 14, icon: 16, gap: 8 },
  xs: { height: 32, paddingHorizontal: 10, fontSize: 12, icon: 14, gap: 6 },
  sm: { height: 36, paddingHorizontal: 12, fontSize: 14, icon: 16, gap: 8 },
  lg: { height: 44, paddingHorizontal: 32, fontSize: 14, icon: 16, gap: 8 },
  icon: { height: 40, width: 40, fontSize: 14, icon: 16, gap: 8 },
  "icon-xs": { height: 32, width: 32, fontSize: 12, icon: 14, gap: 6 },
  "icon-sm": { height: 36, width: 36, fontSize: 14, icon: 16, gap: 8 },
  "icon-lg": { height: 44, width: 44, fontSize: 14, icon: 16, gap: 8 },
}

/** The style a Button would have (useful to build button-looking things). */
export function buttonVariantStyle(
  theme: Theme,
  variant: ButtonVariant = "default",
  size: ButtonSize = "default",
) {
  const { fontSize, icon, gap, ...box } = SIZES[size]
  const isNeutral = variant === "neutral"
  const container: ViewStyle = {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap,
    borderRadius: theme.radius,
    borderWidth: theme.borderWidth,
    borderColor: theme.colors.border,
    backgroundColor: isNeutral ? theme.colors.secondaryBackground : theme.colors.main,
    ...box,
  }
  return {
    container,
    color: isNeutral ? theme.colors.foreground : theme.colors.mainForeground,
    fontSize,
    iconSize: icon,
  }
}

export type ButtonProps = Omit<PressableProps, "style" | "children"> & {
  variant?: ButtonVariant
  size?: ButtonSize
  /** Shows a spinner and disables the button. */
  loading?: boolean
  style?: StyleProp<ViewStyle>
  textStyle?: StyleProp<TextStyle>
  children?: React.ReactNode
}

/**
 * Neobrutalism button. On web the pressed effect also triggers on hover,
 * matching `hover:translate-x-boxShadowX hover:shadow-none`.
 */
export const Button = React.forwardRef<ViewRef, ButtonProps>(function Button(
  {
    variant = "default",
    size = "default",
    loading,
    disabled,
    style,
    textStyle,
    children,
    onHoverIn,
    onHoverOut,
    onPressIn,
    onPressOut,
    ...props
  },
  ref,
) {
  const theme = useTheme()
  const [active, setActive] = React.useState(false)
  const [hovered, setHovered] = React.useState(false)
  const v = buttonVariantStyle(theme, variant, size)
  const isDisabled = disabled || loading
  const engaged = (active || hovered) && !isDisabled

  const hasShadow = variant === "default" || variant === "neutral"
  const isReverse = variant === "reverse"
  const { x, y } = theme.shadow

  let shadow = hasShadow
  let translate = { x: 0, y: 0 }
  if (engaged && hasShadow) {
    shadow = false
    translate = { x, y }
  } else if (isReverse) {
    shadow = engaged
    translate = engaged ? { x: -x, y: -y } : { x: 0, y: 0 }
  }

  const surface = useSurface({
    style: [v.container, style, isDisabled && { opacity: 0.5 }],
    shadow,
  })

  return (
    <Pressable
      ref={ref}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!isDisabled, busy: !!loading }}
      disabled={isDisabled}
      onPressIn={(e) => {
        setActive(true)
        onPressIn?.(e)
      }}
      onPressOut={(e) => {
        setActive(false)
        onPressOut?.(e)
      }}
      onHoverIn={(e) => {
        setHovered(true)
        onHoverIn?.(e)
      }}
      onHoverOut={(e) => {
        setHovered(false)
        onHoverOut?.(e)
      }}
      style={[
        surface.style,
        { transform: [{ translateX: translate.x }, { translateY: translate.y }] },
      ]}
      {...props}
    >
      {surface.underlay}
      <TextStyleProvider value={{ color: v.color, fontSize: v.fontSize, iconSize: v.iconSize }}>
        {loading ? <Spinner size={v.iconSize} /> : null}
        {renderText(children, textStyle, { numberOfLines: 1 })}
      </TextStyleProvider>
    </Pressable>
  )
})
