import * as React from "react"
import {
  Pressable,
  View,
  type PressableProps,
  type StyleProp,
  type TextStyle,
  type ViewProps,
  type ViewStyle,
} from "react-native"
import { renderText, TextStyleProvider } from "../lib/text"
import { useControllableState } from "../lib/utils"
import { useTheme } from "../theme/ThemeProvider"
import { toggleStyle, type ToggleSize, type ToggleVariant } from "./toggle"

type Ctx = {
  value: string[]
  toggle: (v: string) => void
  size: ToggleSize
  spacing: number
  orientation: "horizontal" | "vertical"
  disabled?: boolean
  items: string[]
}

const ToggleGroupContext = React.createContext<Ctx | null>(null)

export type ToggleGroupProps = Omit<ViewProps, "children"> & {
  /** Selected values (Base UI style, always an array). */
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
  /** Allow multiple pressed items. */
  multiple?: boolean
  variant?: ToggleVariant
  size?: ToggleSize
  /** Gap in tailwind spacing units (x4 px). 0 = joined buttons. Default 2. */
  spacing?: number
  orientation?: "horizontal" | "vertical"
  disabled?: boolean
  children?: React.ReactNode
}

export function ToggleGroup({
  value,
  defaultValue = [],
  onValueChange,
  multiple,
  size = "default",
  spacing = 2,
  orientation = "horizontal",
  disabled,
  style,
  children,
  ...props
}: ToggleGroupProps) {
  const [current, setCurrent] = useControllableState<string[]>({
    value,
    defaultValue,
    onChange: onValueChange,
  })
  const items: string[] = []
  React.Children.forEach(children, (c) => {
    if (React.isValidElement<{ value?: string }>(c) && typeof c.props.value === "string")
      items.push(c.props.value)
  })
  const toggle = (v: string) => {
    const on = current.includes(v)
    if (multiple) setCurrent(on ? current.filter((x) => x !== v) : [...current, v])
    else setCurrent(on ? [] : [v])
  }
  return (
    <ToggleGroupContext.Provider
      value={{ value: current, toggle, size, spacing, orientation, disabled, items }}
    >
      <View
        accessibilityRole={multiple ? "toolbar" : "radiogroup"}
        style={[
          {
            flexDirection: orientation === "vertical" ? "column" : "row",
            alignItems: orientation === "vertical" ? "stretch" : "center",
            alignSelf: "flex-start",
            gap: spacing * 4,
          },
          style,
        ]}
        {...props}
      >
        {children}
      </View>
    </ToggleGroupContext.Provider>
  )
}

export type ToggleGroupItemProps = Omit<PressableProps, "style" | "children"> & {
  value: string
  disabled?: boolean
  size?: ToggleSize
  variant?: ToggleVariant
  style?: StyleProp<ViewStyle>
  textStyle?: StyleProp<TextStyle>
  children?: React.ReactNode
}

export function ToggleGroupItem({
  value,
  disabled,
  size,
  variant: _variant,
  style,
  textStyle,
  children,
  onPress,
  ...props
}: ToggleGroupItemProps) {
  const theme = useTheme()
  const ctx = React.useContext(ToggleGroupContext)
  const pressed = !!ctx?.value.includes(value)
  const s = toggleStyle(theme, size ?? ctx?.size ?? "default", pressed)
  const isDisabled = disabled || ctx?.disabled
  let joined: ViewStyle | null = null
  if (ctx && ctx.spacing === 0) {
    const i = ctx.items.indexOf(value)
    const first = i === 0
    const last = i === ctx.items.length - 1
    const r = theme.radius
    joined =
      ctx.orientation === "horizontal"
        ? {
            borderRadius: 0,
            paddingHorizontal: 8,
            borderLeftWidth: first ? theme.borderWidth : 0,
            borderTopLeftRadius: first ? r : 0,
            borderBottomLeftRadius: first ? r : 0,
            borderTopRightRadius: last ? r : 0,
            borderBottomRightRadius: last ? r : 0,
          }
        : {
            borderRadius: 0,
            paddingHorizontal: 8,
            borderTopWidth: first ? theme.borderWidth : 0,
            borderTopLeftRadius: first ? r : 0,
            borderTopRightRadius: first ? r : 0,
            borderBottomLeftRadius: last ? r : 0,
            borderBottomRightRadius: last ? r : 0,
          }
  }
  return (
    <Pressable
      accessibilityRole="togglebutton"
      accessibilityState={{ checked: pressed, disabled: isDisabled }}
      disabled={isDisabled}
      onPress={(e) => {
        ctx?.toggle(value)
        onPress?.(e)
      }}
      style={[s.container, joined, isDisabled && { opacity: 0.5 }, style]}
      {...props}
    >
      <TextStyleProvider value={{ ...s.text, weight: "heading" }}>
        {renderText(children, textStyle, { numberOfLines: 1 })}
      </TextStyleProvider>
    </Pressable>
  )
}
