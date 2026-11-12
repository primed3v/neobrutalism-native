import * as React from "react"
import { Pressable, View, type PressableProps, type StyleProp, type ViewProps, type ViewStyle } from "react-native"
import { useControllableState, type ViewRef } from "../lib/utils"
import { useTheme } from "../theme/ThemeProvider"

type RadioCtx = {
  value: string | undefined
  setValue: (v: string) => void
  disabled?: boolean
  invalid?: boolean
}

const RadioGroupContext = React.createContext<RadioCtx | null>(null)

export function useRadioGroup() {
  return React.useContext(RadioGroupContext)
}

export type RadioGroupProps = ViewProps & {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
  invalid?: boolean
  orientation?: "vertical" | "horizontal"
}

export function RadioGroup({
  value,
  defaultValue,
  onValueChange,
  disabled,
  invalid,
  orientation = "vertical",
  style,
  ...props
}: RadioGroupProps) {
  const [current, setCurrent] = useControllableState<string | undefined>({
    value,
    defaultValue,
    onChange: (v) => v !== undefined && onValueChange?.(v),
  })
  return (
    <RadioGroupContext.Provider
      value={{ value: current, setValue: (v) => setCurrent(v), disabled, invalid }}
    >
      <View
        accessibilityRole="radiogroup"
        style={[{ gap: 8, flexDirection: orientation === "horizontal" ? "row" : "column" }, style]}
        {...props}
      />
    </RadioGroupContext.Provider>
  )
}

export type RadioGroupItemProps = Omit<PressableProps, "style" | "children"> & {
  value: string
  disabled?: boolean
  size?: number
  style?: StyleProp<ViewStyle>
}

export const RadioGroupItem = React.forwardRef<ViewRef, RadioGroupItemProps>(
  function RadioGroupItem({ value, disabled, size = 16, style, onPress, ...props }, ref) {
    const theme = useTheme()
    const ctx = React.useContext(RadioGroupContext)
    const checked = ctx?.value === value
    const isDisabled = disabled || ctx?.disabled
    const color = ctx?.invalid ? theme.colors.danger : theme.colors.foreground
    return (
      <Pressable
        ref={ref}
        accessibilityRole="radio"
        accessibilityState={{ checked, disabled: isDisabled }}
        disabled={isDisabled}
        hitSlop={8}
        onPress={(e) => {
          ctx?.setValue(value)
          onPress?.(e)
        }}
        style={[
          {
            width: size,
            height: size,
            borderRadius: 9999,
            borderWidth: theme.borderWidth,
            borderColor: ctx?.invalid ? theme.colors.danger : theme.colors.border,
            alignItems: "center",
            justifyContent: "center",
          },
          isDisabled && { opacity: 0.5 },
          style,
        ]}
        {...props}
      >
        {checked ? (
          <View
            style={{ width: size / 2, height: size / 2, borderRadius: 9999, backgroundColor: color }}
          />
        ) : null}
      </Pressable>
    )
  },
)
