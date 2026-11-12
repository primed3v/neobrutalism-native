import * as React from "react"
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from "react-native"
import { CheckIcon, MinusIcon } from "../icons"
import { useControllableState, type ViewRef } from "../lib/utils"
import { useTheme } from "../theme/ThemeProvider"

export type CheckedState = boolean | "indeterminate"

export type CheckboxProps = Omit<PressableProps, "style" | "children" | "onPress"> & {
  checked?: CheckedState
  defaultChecked?: CheckedState
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  invalid?: boolean
  /** Box size. Default 16 (`size-4`). */
  size?: number
  style?: StyleProp<ViewStyle>
}

export const Checkbox = React.forwardRef<ViewRef, CheckboxProps>(function Checkbox(
  {
    checked,
    defaultChecked = false,
    onCheckedChange,
    disabled,
    invalid,
    size = 16,
    style,
    hitSlop = 8,
    ...props
  },
  ref,
) {
  const theme = useTheme()
  const [state, setState] = useControllableState<CheckedState>({
    value: checked,
    defaultValue: defaultChecked,
    onChange: (v) => onCheckedChange?.(v === true),
  })
  const on = state === true || state === "indeterminate"
  return (
    <Pressable
      ref={ref}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: state === "indeterminate" ? "mixed" : state, disabled }}
      disabled={disabled}
      hitSlop={hitSlop}
      onPress={() => setState(state === true ? false : true)}
      style={[
        {
          width: size,
          height: size,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: theme.borderWidth,
          borderColor: invalid ? theme.colors.danger : theme.colors.border,
          backgroundColor: on ? theme.colors.main : "transparent",
        },
        disabled && { opacity: 0.5 },
        style,
      ]}
      {...props}
    >
      {state === true ? (
        <CheckIcon size={size} color={theme.colors.mainForeground} strokeWidth={2.5} />
      ) : state === "indeterminate" ? (
        <MinusIcon size={size} color={theme.colors.mainForeground} strokeWidth={2.5} />
      ) : null}
    </Pressable>
  )
})
