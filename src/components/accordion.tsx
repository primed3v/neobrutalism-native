import * as React from "react"
import {
  Animated,
  Pressable,
  View,
  type PressableProps,
  type StyleProp,
  type TextStyle,
  type ViewProps,
  type ViewStyle,
} from "react-native"
import { ChevronDownIcon } from "../icons"
import { AnimatedHeight } from "../lib/collapse"
import { NATIVE_DRIVER } from "../lib/overlay"
import { Surface } from "../lib/surface"
import { renderText, TextStyleProvider } from "../lib/text"
import { useControllableState, type ViewRef } from "../lib/utils"
import { useTheme } from "../theme/ThemeProvider"

type AccordionCtx = {
  value: string[]
  toggle: (v: string) => void
  disabled?: boolean
}
const AccordionContext = React.createContext<AccordionCtx | null>(null)
const ItemContext = React.createContext<{ value: string; open: boolean; disabled?: boolean } | null>(
  null,
)

export type AccordionProps = ViewProps & {
  /** Open items (Base UI style: always an array). */
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
  /** Allow several items open at once. */
  multiple?: boolean
  disabled?: boolean
}

export function Accordion({
  value,
  defaultValue = [],
  onValueChange,
  multiple = false,
  disabled,
  style,
  ...props
}: AccordionProps) {
  const [current, setCurrent] = useControllableState<string[]>({
    value,
    defaultValue,
    onChange: onValueChange,
  })
  const toggle = (v: string) => {
    const open = current.includes(v)
    if (multiple) setCurrent(open ? current.filter((x) => x !== v) : [...current, v])
    else setCurrent(open ? [] : [v])
  }
  return (
    <AccordionContext.Provider value={{ value: current, toggle, disabled }}>
      <View style={[{ gap: 16 }, style]} {...props} />
    </AccordionContext.Provider>
  )
}

export type AccordionItemProps = ViewProps & { value: string; disabled?: boolean }

export const AccordionItem = React.forwardRef<ViewRef, AccordionItemProps>(function AccordionItem(
  { value, disabled, style, children, ...props },
  ref,
) {
  const theme = useTheme()
  const ctx = React.useContext(AccordionContext)
  const open = !!ctx?.value.includes(value)
  return (
    <ItemContext.Provider value={{ value, open, disabled: disabled || ctx?.disabled }}>
      <Surface
        ref={ref}
        shadow
        style={[
          {
            borderRadius: theme.radius,
            borderWidth: theme.borderWidth,
            borderColor: theme.colors.border,
          },
          style,
        ]}
        {...props}
      >
        <View style={{ overflow: "hidden", borderRadius: Math.max(theme.radius - theme.borderWidth, 0) }}>
          {children}
        </View>
      </Surface>
    </ItemContext.Provider>
  )
})

export type AccordionTriggerProps = Omit<PressableProps, "style" | "children"> & {
  style?: StyleProp<ViewStyle>
  textStyle?: StyleProp<TextStyle>
  children?: React.ReactNode
}

export function AccordionTrigger({ style, textStyle, children, onPress, ...props }: AccordionTriggerProps) {
  const theme = useTheme()
  const ctx = React.useContext(AccordionContext)
  const item = React.useContext(ItemContext)
  const open = !!item?.open
  const rotate = React.useRef(new Animated.Value(open ? 1 : 0)).current
  React.useEffect(() => {
    Animated.timing(rotate, { toValue: open ? 1 : 0, duration: 200, useNativeDriver: NATIVE_DRIVER }).start()
  }, [open, rotate])
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ expanded: open, disabled: item?.disabled }}
      disabled={item?.disabled}
      onPress={(e) => {
        onPress?.(e)
        if (item) ctx?.toggle(item.value)
      }}
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          padding: 16,
          backgroundColor: theme.colors.main,
          borderBottomWidth: open ? theme.borderWidth : 0,
          borderColor: theme.colors.border,
        },
        item?.disabled && { opacity: 0.5 },
        style,
      ]}
      {...props}
    >
      <TextStyleProvider
        value={{ color: theme.colors.mainForeground, fontSize: 16, lineHeight: 24, weight: "heading" }}
      >
        <View style={{ flex: 1 }}>{renderText(children, textStyle)}</View>
        <Animated.View
          style={{
            transform: [
              { rotate: rotate.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] }) },
            ],
          }}
        >
          <ChevronDownIcon size={20} />
        </Animated.View>
      </TextStyleProvider>
    </Pressable>
  )
}

export function AccordionContent({
  style,
  children,
  textStyle,
}: {
  style?: StyleProp<ViewStyle>
  textStyle?: StyleProp<TextStyle>
  children?: React.ReactNode
}) {
  const theme = useTheme()
  const item = React.useContext(ItemContext)
  return (
    <AnimatedHeight open={!!item?.open} style={{ backgroundColor: theme.colors.secondaryBackground }}>
      <View style={[{ padding: 16 }, style]}>
        <TextStyleProvider value={{ color: theme.colors.foreground, fontSize: 14, lineHeight: 20 }}>
          {renderText(children, textStyle)}
        </TextStyleProvider>
      </View>
    </AnimatedHeight>
  )
}
