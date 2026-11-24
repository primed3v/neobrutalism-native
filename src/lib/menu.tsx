/**
 * Shared building blocks for DropdownMenu, ContextMenu and Menubar.
 */
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
import { CheckIcon, ChevronRightIcon, CircleIcon } from "../icons"
import { useTheme } from "../theme/ThemeProvider"
import { Floating, useFloating, type Align, type Rect, type Side } from "./overlay"
import { renderText, Text, TextStyleProvider, type TextProps } from "./text"
import { mergeRefs, useControllableState, type ViewRef } from "./utils"

type MenuRootCtx = {
  open: boolean
  setOpen: (open: boolean) => void
  anchorRef: React.RefObject<ViewRef | null>
  anchorRect: Rect | null
  setAnchorRect: (r: Rect | null) => void
  /** close the whole menu tree */
  closeAll: () => void
}

export const MenuRootContext = React.createContext<MenuRootCtx | null>(null)

export function useMenuRoot() {
  const ctx = React.useContext(MenuRootContext)
  if (!ctx) throw new Error("Menu components must be used within a menu root")
  return ctx
}

export function useMenuState(props: {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const [open, setOpen] = useControllableState({
    value: props.open,
    defaultValue: props.defaultOpen ?? false,
    onChange: props.onOpenChange,
  })
  const anchorRef = React.useRef<ViewRef>(null)
  const [anchorRect, setAnchorRect] = React.useState<Rect | null>(null)
  const parent = React.useContext(MenuRootContext)
  const value: MenuRootCtx = {
    open,
    setOpen,
    anchorRef,
    anchorRect,
    setAnchorRect,
    closeAll: () => {
      setOpen(false)
      parent?.closeAll()
    },
  }
  return value
}

export function menuItemStyle(theme: ReturnType<typeof useTheme>, highlighted: boolean): ViewStyle {
  return {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: theme.radius,
    borderWidth: theme.borderWidth,
    borderColor: highlighted ? theme.colors.border : "transparent",
    backgroundColor: highlighted ? theme.colors.main : "transparent",
    paddingHorizontal: 8,
    paddingVertical: 6,
  }
}

export type MenuContentProps = ViewProps & {
  side?: Side
  align?: Align
  sideOffset?: number
  alignOffset?: number
  minWidth?: number
}

/** Positioned menu panel (`min-w-[8rem] rounded-base border-2 bg-background p-1`). */
export function MenuContent({
  side = "bottom",
  align = "start",
  sideOffset = 4,
  alignOffset = 0,
  minWidth = 128,
  style,
  children,
  ...props
}: MenuContentProps) {
  const root = useMenuRoot()
  return (
    <Floating
      open={root.open}
      // tapping outside (or back) dismisses the whole menu tree, like Radix
      onOpenChange={(o) => (o ? root.setOpen(true) : root.closeAll())}
      anchorRef={root.anchorRef}
      anchorRect={root.anchorRect}
      side={side}
      align={align}
      sideOffset={sideOffset}
      alignOffset={alignOffset}
    >
      <MenuPanel minWidth={minWidth} style={style} {...props}>
        {children}
      </MenuPanel>
    </Floating>
  )
}

function MenuPanel({ minWidth, style, children, ...props }: ViewProps & { minWidth: number }) {
  const theme = useTheme()
  const { maxHeight } = useFloating()
  return (
    <View
      accessibilityRole="menu"
      style={[
        {
          minWidth,
          maxHeight,
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
      <ScrollView bounces={false} style={{ flexGrow: 0 }} contentContainerStyle={{ padding: 4 }}>
        <TextStyleProvider value={{ color: theme.colors.foreground, fontSize: 14, lineHeight: 20 }}>
          {children}
        </TextStyleProvider>
      </ScrollView>
    </View>
  )
}

export type MenuItemProps = Omit<PressableProps, "style" | "children"> & {
  /** Called when the item is chosen. Return `false` to keep the menu open. */
  onSelect?: () => void | boolean
  inset?: boolean
  disabled?: boolean
  /** Keep the menu open after selecting. */
  closeOnSelect?: boolean
  /** `destructive` renders text in the danger color. */
  variant?: "default" | "destructive"
  style?: StyleProp<ViewStyle>
  textStyle?: StyleProp<TextStyle>
  children?: React.ReactNode
}

function useHighlight() {
  const [hovered, setHovered] = React.useState(false)
  const [pressed, setPressed] = React.useState(false)
  return {
    highlighted: hovered || pressed,
    handlers: {
      onHoverIn: () => setHovered(true),
      onHoverOut: () => setHovered(false),
      onPressIn: () => setPressed(true),
      onPressOut: () => setPressed(false),
    },
  }
}

export const MenuItem = React.forwardRef<ViewRef, MenuItemProps>(function MenuItem(
  {
    onSelect,
    inset,
    disabled,
    closeOnSelect = true,
    variant = "default",
    style,
    textStyle,
    children,
    onPress,
    ...props
  },
  ref,
) {
  const theme = useTheme()
  const root = useMenuRoot()
  const { highlighted, handlers } = useHighlight()
  return (
    <Pressable
      ref={ref}
      accessibilityRole="menuitem"
      accessibilityState={{ disabled }}
      disabled={disabled}
      {...handlers}
      onPress={(e) => {
        onPress?.(e)
        const keep = onSelect?.() === false
        if (closeOnSelect && !keep) root.closeAll()
      }}
      style={[
        menuItemStyle(theme, highlighted),
        inset && { paddingLeft: 32 },
        disabled && { opacity: 0.5 },
        style,
      ]}
      {...props}
    >
      <TextStyleProvider
        value={{
          color: highlighted
            ? theme.colors.mainForeground
            : variant === "destructive"
              ? theme.colors.danger
              : theme.colors.foreground,
        }}
      >
        {renderText(children, textStyle, { numberOfLines: 1 })}
      </TextStyleProvider>
    </Pressable>
  )
})

export type MenuCheckboxItemProps = Omit<MenuItemProps, "onSelect" | "inset"> & {
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

export function MenuCheckboxItem({
  checked,
  defaultChecked = false,
  onCheckedChange,
  disabled,
  closeOnSelect = false,
  style,
  textStyle,
  children,
  ...props
}: MenuCheckboxItemProps) {
  const theme = useTheme()
  const root = useMenuRoot()
  const [on, setOn] = useControllableState({
    value: checked,
    defaultValue: defaultChecked,
    onChange: onCheckedChange,
  })
  const { highlighted, handlers } = useHighlight()
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: on, disabled }}
      disabled={disabled}
      {...handlers}
      onPress={() => {
        setOn(!on)
        if (closeOnSelect) root.closeAll()
      }}
      style={[menuItemStyle(theme, highlighted), { paddingLeft: 32 }, disabled && { opacity: 0.5 }, style]}
      {...props}
    >
      <TextStyleProvider
        value={{ color: highlighted ? theme.colors.mainForeground : theme.colors.foreground }}
      >
        <View style={{ position: "absolute", left: 6, width: 14, alignItems: "center" }}>
          {on ? <CheckIcon size={16} /> : null}
        </View>
        {renderText(children, textStyle, { numberOfLines: 1 })}
      </TextStyleProvider>
    </Pressable>
  )
}

const MenuRadioContext = React.createContext<{
  value?: string
  setValue: (v: string) => void
} | null>(null)

export function MenuRadioGroup({
  value,
  defaultValue,
  onValueChange,
  children,
  ...props
}: ViewProps & {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
}) {
  const [current, setCurrent] = useControllableState<string | undefined>({
    value,
    defaultValue,
    onChange: (v) => v !== undefined && onValueChange?.(v),
  })
  return (
    <MenuRadioContext.Provider value={{ value: current, setValue: setCurrent }}>
      <View accessibilityRole="radiogroup" {...props}>
        {children}
      </View>
    </MenuRadioContext.Provider>
  )
}

export function MenuRadioItem({
  value,
  disabled,
  closeOnSelect = false,
  style,
  textStyle,
  children,
  ...props
}: Omit<MenuItemProps, "onSelect" | "inset"> & { value: string }) {
  const theme = useTheme()
  const root = useMenuRoot()
  const group = React.useContext(MenuRadioContext)
  const checked = group?.value === value
  const { highlighted, handlers } = useHighlight()
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked, disabled }}
      disabled={disabled}
      {...handlers}
      onPress={() => {
        group?.setValue(value)
        if (closeOnSelect) root.closeAll()
      }}
      style={[menuItemStyle(theme, highlighted), { paddingLeft: 32 }, disabled && { opacity: 0.5 }, style]}
      {...props}
    >
      <TextStyleProvider
        value={{ color: highlighted ? theme.colors.mainForeground : theme.colors.foreground }}
      >
        <View style={{ position: "absolute", left: 6, width: 14, alignItems: "center" }}>
          {checked ? <CircleIcon size={8} fill="currentColor" /> : null}
        </View>
        {renderText(children, textStyle, { numberOfLines: 1 })}
      </TextStyleProvider>
    </Pressable>
  )
}

export function MenuLabel({ inset, style, ...props }: TextProps & { inset?: boolean }) {
  return (
    <Text
      weight="heading"
      size="sm"
      style={[{ paddingHorizontal: 8, paddingVertical: 6 }, inset && { paddingLeft: 32 }, style]}
      {...props}
    />
  )
}

export function MenuSeparator({ style, ...props }: ViewProps) {
  const theme = useTheme()
  return (
    <View
      accessibilityRole="none"
      style={[{ height: 2, marginVertical: 4, marginHorizontal: -4, backgroundColor: theme.colors.border }, style]}
      {...props}
    />
  )
}

export function MenuShortcut({ style, ...props }: TextProps) {
  return (
    <Text
      size="xs"
      style={[{ marginLeft: "auto", paddingLeft: 16, letterSpacing: 1.2 }, style]}
      {...props}
    />
  )
}

export function MenuGroup(props: ViewProps) {
  return <View {...props} />
}

/** Fragment kept for API parity with the web version. */
export function MenuPortal({ children }: { children?: React.ReactNode }) {
  return <>{children}</>
}

// ---------- submenus ----------

export function MenuSub(props: {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  children?: React.ReactNode
}) {
  const state = useMenuState(props)
  return <MenuRootContext.Provider value={state}>{props.children}</MenuRootContext.Provider>
}

export const MenuSubTrigger = React.forwardRef<
  ViewRef,
  Omit<MenuItemProps, "onSelect" | "closeOnSelect">
>(function MenuSubTrigger({ inset, disabled, style, textStyle, children, ...props }, ref) {
  const theme = useTheme()
  const sub = useMenuRoot()
  const { highlighted, handlers } = useHighlight()
  const active = highlighted || sub.open
  return (
    <Pressable
      ref={mergeRefs(ref, sub.anchorRef)}
      collapsable={false}
      accessibilityRole="menuitem"
      accessibilityState={{ expanded: sub.open, disabled }}
      disabled={disabled}
      {...handlers}
      onPress={() => sub.setOpen(!sub.open)}
      style={[menuItemStyle(theme, active), inset && { paddingLeft: 32 }, disabled && { opacity: 0.5 }, style]}
      {...props}
    >
      <TextStyleProvider
        value={{ color: active ? theme.colors.mainForeground : theme.colors.foreground }}
      >
        {renderText(children, textStyle, { numberOfLines: 1 })}
        <View style={{ marginLeft: "auto" }}>
          <ChevronRightIcon size={16} />
        </View>
      </TextStyleProvider>
    </Pressable>
  )
})

export function MenuSubContent(props: MenuContentProps) {
  return <MenuContent side="right" align="start" sideOffset={2} alignOffset={-4} {...props} />
}
