import * as React from "react"
import { Platform, TextInput, type TextInputProps, type TextStyle } from "react-native"
import { fontFor } from "../lib/text"
import { mergeRefs, webStyle, type TextInputRef } from "../lib/utils"
import { useTheme } from "../theme/ThemeProvider"
import { withAlpha, type Theme } from "../theme/theme"

export type InputProps = TextInputProps & {
  /** Red border (aria-invalid). */
  invalid?: boolean
  disabled?: boolean
  /** Remove border/background (used inside InputGroup). */
  unstyled?: boolean
}

/** Web-only focus ring: `focus-visible:ring-2 ring-black ring-offset-2`. */
export function focusRing(theme: Theme, focused: boolean): TextStyle | null {
  if (Platform.OS !== "web" || !focused) return null
  return {
    outlineWidth: 2,
    outlineStyle: "solid",
    outlineColor: theme.colors.ring,
    outlineOffset: 2,
  } as TextStyle
}

export function inputBaseStyle(theme: Theme): TextStyle {
  return {
    minHeight: 40,
    borderRadius: theme.radius,
    borderWidth: theme.borderWidth,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.secondaryBackground,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: theme.colors.foreground,
    ...fontFor(theme, "base"),
  }
}

export const Input = React.forwardRef<TextInputRef, InputProps>(function Input(
  {
    invalid,
    disabled,
    editable,
    unstyled,
    style,
    onFocus,
    onBlur,
    placeholderTextColor,
    selectionColor,
    ...props
  },
  ref,
) {
  const theme = useTheme()
  const [focused, setFocused] = React.useState(false)
  const inner = React.useRef<TextInputRef>(null)
  return (
    <TextInput
      ref={mergeRefs(ref, inner)}
      editable={editable ?? !disabled}
      aria-disabled={disabled}
      placeholderTextColor={placeholderTextColor ?? withAlpha(theme.colors.foreground, 0.5)}
      selectionColor={selectionColor ?? theme.colors.main}
      onFocus={(e) => {
        setFocused(true)
        onFocus?.(e)
      }}
      onBlur={(e) => {
        setFocused(false)
        onBlur?.(e)
      }}
      style={[
        inputBaseStyle(theme),
        unstyled && {
          borderWidth: 0,
          backgroundColor: "transparent",
          borderRadius: 0,
        },
        invalid && { borderColor: theme.colors.danger },
        disabled && { opacity: 0.5 },
        !unstyled && focusRing(theme, focused),
        unstyled ? webStyle<TextStyle>({ outlineStyle: "none" }) : null,
        style,
      ]}
      {...props}
    />
  )
})
