import * as React from "react"
import { Pressable, type PressableProps, type StyleProp, type TextStyle, type ViewStyle } from "react-native"
import { renderText, TextStyleProvider } from "../lib/text"
import { useControllableState, type ViewRef } from "../lib/utils"
import { useTheme } from "../theme/ThemeProvider"
import type { Theme } from "../theme/theme"

export type ToggleSize = "default" | "sm" | "lg"
export type ToggleVariant = "default" | "outline"

const SIZES: Record<ToggleSize, { height: number; minWidth: number; paddingHorizontal: number; fontSize: number; icon: number }> = {
  default: { height: 40, minWidth: 40, paddingHorizontal: 12, fontSize: 14, icon: 16 },
  sm: { height: 36, minWidth: 36, paddingHorizontal: 10, fontSize: 12.8, icon: 14 },
  lg: { height: 44, minWidth: 44, paddingHorizontal: 16, fontSize: 14, icon: 16 },
}

export function toggleStyle(theme: Theme, size: ToggleSize, pressed: boolean) {
  const s = SIZES[size]
  return {
    container: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
      height: s.height,
      minWidth: s.minWidth,
      paddingHorizontal: s.paddingHorizontal,
      borderRadius: theme.radius,
      borderWidth: theme.borderWidth,
      borderColor: theme.colors.border,
      backgroundColor: pressed ? theme.colors.main : theme.colors.secondaryBackground,
    } as ViewStyle,
    text: {
      color: pressed ? theme.colors.mainForeground : theme.colors.foreground,
      fontSize: s.fontSize,
      iconSize: s.icon,
    },
  }
}

export type ToggleProps = Omit<PressableProps, "style" | "children"> & {
  pressed?: boolean
  defaultPressed?: boolean
  onPressedChange?: (pressed: boolean) => void
  variant?: ToggleVariant
  size?: ToggleSize
  disabled?: boolean
  style?: StyleProp<ViewStyle>
  textStyle?: StyleProp<TextStyle>
  children?: React.ReactNode
}

export const Toggle = React.forwardRef<ViewRef, ToggleProps>(function Toggle(
  {
    pressed,
    defaultPressed = false,
    onPressedChange,
    size = "default",
    variant: _variant,
    disabled,
    style,
    textStyle,
    children,
    onPress,
    ...props
  },
  ref,
) {
  const theme = useTheme()
  const [on, setOn] = useControllableState({
    value: pressed,
    defaultValue: defaultPressed,
    onChange: onPressedChange,
  })
  const s = toggleStyle(theme, size, on)
  return (
    <Pressable
      ref={ref}
      accessibilityRole="togglebutton"
      accessibilityState={{ checked: on, disabled }}
      disabled={disabled}
      onPress={(e) => {
        setOn(!on)
        onPress?.(e)
      }}
      style={[s.container, disabled && { opacity: 0.5 }, style]}
      {...props}
    >
      <TextStyleProvider value={{ ...s.text, weight: "heading" }}>
        {renderText(children, textStyle, { numberOfLines: 1 })}
      </TextStyleProvider>
    </Pressable>
  )
})
