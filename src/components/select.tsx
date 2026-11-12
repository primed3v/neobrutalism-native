import * as React from "react"
import {
  Pressable,
  ScrollView,
  View,
  type PressableProps,
  type StyleProp,
  type TextStyle,
  type ViewProps,
  type ViewStyle,
} from "react-native"
import { CheckIcon, ChevronDownIcon } from "../icons"
import { Floating, useFloating, type Align, type Side } from "../lib/overlay"
import { renderText, Text, TextStyleProvider, type TextProps } from "../lib/text"
import { mergeRefs, useControllableState, type ViewRef } from "../lib/utils"
import { useTheme } from "../theme/ThemeProvider"

type SelectCtx = {
  value: string | undefined
  setValue: (v: string) => void
  open: boolean
  setOpen: (o: boolean) => void
  anchorRef: React.RefObject<ViewRef | null>
  labels: Map<string, React.ReactNode>
  disabled?: boolean
  invalid?: boolean
}

const SelectContext = React.createContext<SelectCtx | null>(null)

function useSelect() {
  const ctx = React.useContext(SelectContext)
  if (!ctx) throw new Error("Select components must be used within <Select>")
  return ctx
}

/** Walks the element tree to find SelectItem labels (so SelectValue works before first open). */
function collectLabels(children: React.ReactNode, map: Map<string, React.ReactNode>) {
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return
    const props = child.props as { value?: string; children?: React.ReactNode; label?: React.ReactNode }
    if (child.type === SelectItem && typeof props.value === "string") {
      map.set(props.value, props.label ?? props.children)
    } else if (props.children) {
      collectLabels(props.children, map)
    }
  })
}

export type SelectProps = {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  disabled?: boolean
  invalid?: boolean
  /** Optional value -> label map (Base UI `items`), used by SelectValue. */
  items?: Record<string, React.ReactNode> | { value: string; label: React.ReactNode }[]
  children?: React.ReactNode
}

export function Select({
  value,
  defaultValue,
  onValueChange,
  open,
  defaultOpen = false,
  onOpenChange,
  disabled,
  invalid,
  items,
  children,
}: SelectProps) {
  const [current, setCurrent] = useControllableState<string | undefined>({
    value,
    defaultValue,
    onChange: (v) => v !== undefined && onValueChange?.(v),
  })
  const [isOpen, setOpen] = useControllableState({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  })
  const anchorRef = React.useRef<ViewRef>(null)
  const labels = new Map<string, React.ReactNode>()
  if (Array.isArray(items)) items.forEach((i) => labels.set(i.value, i.label))
  else if (items) Object.entries(items).forEach(([k, v]) => labels.set(k, v))
  collectLabels(children, labels)
  return (
    <SelectContext.Provider
      value={{
        value: current,
        setValue: setCurrent,
        open: isOpen,
        setOpen,
        anchorRef,
        labels,
        disabled,
        invalid,
      }}
    >
      {children}
    </SelectContext.Provider>
  )
}

export type SelectTriggerProps = Omit<PressableProps, "style" | "children"> & {
  size?: "default" | "sm"
  style?: StyleProp<ViewStyle>
  children?: React.ReactNode
}

export const SelectTrigger = React.forwardRef<ViewRef, SelectTriggerProps>(function SelectTrigger(
  { size = "default", style, children, onPress, ...props },
  ref,
) {
  const theme = useTheme()
  const ctx = useSelect()
  return (
    <Pressable
      ref={mergeRefs(ref, ctx.anchorRef)}
      collapsable={false}
      accessibilityRole="combobox"
      accessibilityState={{ expanded: ctx.open, disabled: ctx.disabled }}
      disabled={ctx.disabled}
      onPress={(e) => {
        onPress?.(e)
        ctx.setOpen(!ctx.open)
      }}
      style={[
        {
          height: size === "sm" ? 36 : 40,
          width: "100%",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          paddingHorizontal: 12,
          borderRadius: theme.radius,
          borderWidth: theme.borderWidth,
          borderColor: ctx.invalid ? theme.colors.danger : theme.colors.border,
          backgroundColor: theme.colors.main,
        },
        ctx.disabled && { opacity: 0.5 },
        style,
      ]}
      {...props}
    >
      <TextStyleProvider value={{ color: theme.colors.mainForeground, fontSize: 14, lineHeight: 20 }}>
        <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 8 }}>
          {renderText(children, undefined, { numberOfLines: 1 })}
        </View>
        <ChevronDownIcon size={16} />
      </TextStyleProvider>
    </Pressable>
  )
})

export function SelectValue({
  placeholder,
  style,
  ...props
}: TextProps & { placeholder?: string }) {
  const ctx = useSelect()
  const label = ctx.value !== undefined ? ctx.labels.get(ctx.value) : undefined
  if (label !== undefined && typeof label !== "string" && typeof label !== "number") {
    return <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>{label}</View>
  }
  return (
    <Text numberOfLines={1} style={[{ flex: 1 }, label === undefined && { opacity: 0.8 }, style]} {...props}>
      {label ?? ctx.value ?? placeholder ?? ""}
    </Text>
  )
}

export type SelectContentProps = ViewProps & {
  side?: Side
  align?: Align
  sideOffset?: number
  alignOffset?: number
}

export function SelectContent({
  side = "bottom",
  align = "start",
  sideOffset = 4,
  alignOffset = 0,
  style,
  children,
  ...props
}: SelectContentProps) {
  const ctx = useSelect()
  return (
    <Floating
      open={ctx.open}
      onOpenChange={ctx.setOpen}
      anchorRef={ctx.anchorRef}
      side={side}
      align={align}
      sideOffset={sideOffset}
      alignOffset={alignOffset}
      matchAnchorWidth
    >
      <SelectPanel style={style} {...props}>
        {children}
      </SelectPanel>
    </Floating>
  )
}

function SelectPanel({ style, children, ...props }: ViewProps) {
  const theme = useTheme()
  const { maxHeight } = useFloating()
  return (
    <View
      accessibilityRole="list"
      style={[
        {
          maxHeight: Math.min(maxHeight ?? 384, 384),
          overflow: "hidden",
          borderRadius: theme.radius,
          borderWidth: theme.borderWidth,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.background,
        },
        style,
      ]}
      {...props}
    >
      <ScrollView bounces={false} contentContainerStyle={{ padding: 4 }}>
        <TextStyleProvider value={{ color: theme.colors.foreground, fontSize: 14, lineHeight: 20 }}>
          {children}
        </TextStyleProvider>
      </ScrollView>
    </View>
  )
}

export function SelectGroup(props: ViewProps) {
  return <View accessibilityRole="none" {...props} />
}

export function SelectLabel({ style, ...props }: TextProps) {
  return (
    <Text
      size="sm"
      style={[{ paddingVertical: 6, paddingRight: 32, paddingLeft: 10 }, style]}
      {...props}
    />
  )
}

export type SelectItemProps = Omit<PressableProps, "style" | "children"> & {
  value: string
  /** Label shown by SelectValue when children aren't a plain string. */
  label?: React.ReactNode
  disabled?: boolean
  style?: StyleProp<ViewStyle>
  textStyle?: StyleProp<TextStyle>
  children?: React.ReactNode
}

export function SelectItem({
  value,
  disabled,
  style,
  textStyle,
  children,
  onPress,
  label: _label,
  ...props
}: SelectItemProps) {
  const theme = useTheme()
  const ctx = useSelect()
  const [hovered, setHovered] = React.useState(false)
  const [pressed, setPressed] = React.useState(false)
  const selected = ctx.value === value
  const highlighted = hovered || pressed
  return (
    <Pressable
      accessibilityRole="menuitem"
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      onPress={(e) => {
        onPress?.(e)
        ctx.setValue(value)
        ctx.setOpen(false)
      }}
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          paddingVertical: 6,
          paddingLeft: 8,
          paddingRight: 32,
          borderRadius: theme.radius,
          borderWidth: theme.borderWidth,
          borderColor: highlighted ? theme.colors.border : "transparent",
          backgroundColor: highlighted ? theme.colors.main : "transparent",
        },
        disabled && { opacity: 0.5 },
        style,
      ]}
      {...props}
    >
      <TextStyleProvider
        value={{ color: highlighted ? theme.colors.mainForeground : theme.colors.foreground }}
      >
        <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 8 }}>
          {renderText(children, textStyle, { numberOfLines: 1 })}
        </View>
        {selected ? (
          <View style={{ position: "absolute", right: 8 }}>
            <CheckIcon size={16} />
          </View>
        ) : null}
      </TextStyleProvider>
    </Pressable>
  )
}

export function SelectSeparator({ style, ...props }: ViewProps) {
  const theme = useTheme()
  return (
    <View
      style={[{ height: 1, marginVertical: 4, marginHorizontal: -4, backgroundColor: theme.colors.border }, style]}
      {...props}
    />
  )
}

/** Kept for API parity; the list scrolls natively. */
export function SelectScrollUpButton() {
  return null
}
/** Kept for API parity; the list scrolls natively. */
export function SelectScrollDownButton() {
  return null
}
