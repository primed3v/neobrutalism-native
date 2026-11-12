import * as React from "react"
import {
  Animated,
  Pressable,
  ScrollView,
  View,
  type PressableProps,
  type StyleProp,
  type TextStyle,
  type ViewProps,
  type ViewStyle,
} from "react-native"
import { ChevronDownIcon } from "../icons"
import { Floating, NATIVE_DRIVER, type Align } from "../lib/overlay"
import { renderText, TextStyleProvider } from "../lib/text"
import { mergeRefs, useControllableState, useStableId, type ViewRef } from "../lib/utils"
import { useTheme } from "../theme/ThemeProvider"
import type { Theme } from "../theme/theme"

type NavCtx = { value: string | null; setValue: (v: string | null) => void }
const NavContext = React.createContext<NavCtx | null>(null)
type ItemCtx = { value: string; anchorRef: React.RefObject<ViewRef | null> }
const ItemContext = React.createContext<ItemCtx | null>(null)

export type NavigationMenuProps = ViewProps & {
  value?: string | null
  defaultValue?: string | null
  onValueChange?: (value: string | null) => void
}

export function NavigationMenu({
  value,
  defaultValue = null,
  onValueChange,
  style,
  children,
  ...props
}: NavigationMenuProps) {
  const theme = useTheme()
  const [current, setCurrent] = useControllableState<string | null>({
    value,
    defaultValue,
    onChange: onValueChange,
  })
  return (
    <NavContext.Provider value={{ value: current, setValue: setCurrent }}>
      <View
        accessibilityRole="menubar"
        style={[
          {
            alignSelf: "flex-start",
            maxWidth: "100%",
            borderRadius: theme.radius,
            borderWidth: theme.borderWidth,
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.background,
            padding: 4,
          },
          style,
        ]}
        {...props}
      >
        {children}
      </View>
    </NavContext.Provider>
  )
}

export function NavigationMenuList({ style, children, ...props }: ViewProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[{ flexDirection: "row", alignItems: "center", gap: 4 }, style]}
      {...(props as object)}
    >
      {children}
    </ScrollView>
  )
}

export function NavigationMenuItem({
  value,
  children,
  ...props
}: ViewProps & { value?: string }) {
  const id = useStableId("nav")
  const anchorRef = React.useRef<ViewRef>(null)
  return (
    <ItemContext.Provider value={{ value: value ?? id, anchorRef }}>
      <View {...props}>{children}</View>
    </ItemContext.Provider>
  )
}

/** Styles of a trigger, to make links look like triggers. */
export function navigationMenuTriggerStyle(theme: Theme, active = false): ViewStyle {
  return {
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: theme.radius,
    borderWidth: theme.borderWidth,
    borderColor: active ? theme.colors.border : "transparent",
    backgroundColor: active ? theme.colors.main : theme.colors.background,
  }
}

type PressableTextProps = Omit<PressableProps, "style" | "children"> & {
  style?: StyleProp<ViewStyle>
  textStyle?: StyleProp<TextStyle>
  children?: React.ReactNode
}

export const NavigationMenuTrigger = React.forwardRef<ViewRef, PressableTextProps>(
  function NavigationMenuTrigger({ style, textStyle, children, onPress, ...props }, ref) {
    const theme = useTheme()
    const nav = React.useContext(NavContext)
    const item = React.useContext(ItemContext)
    const open = !!item && nav?.value === item.value
    const [hovered, setHovered] = React.useState(false)
    const rotate = React.useRef(new Animated.Value(open ? 1 : 0)).current
    React.useEffect(() => {
      Animated.timing(rotate, { toValue: open ? 1 : 0, duration: 200, useNativeDriver: NATIVE_DRIVER }).start()
    }, [open, rotate])
    const active = open || hovered
    return (
      <Pressable
        ref={mergeRefs(ref, item?.anchorRef)}
        collapsable={false}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onHoverIn={() => setHovered(true)}
        onHoverOut={() => setHovered(false)}
        onPress={(e) => {
          onPress?.(e)
          if (item) nav?.setValue(open ? null : item.value)
        }}
        style={[navigationMenuTriggerStyle(theme, active), style]}
        {...props}
      >
        <TextStyleProvider
          value={{
            color: active ? theme.colors.mainForeground : theme.colors.foreground,
            fontSize: 14,
            lineHeight: 20,
            weight: "heading",
          }}
        >
          {renderText(children, textStyle, { numberOfLines: 1 })}
          <Animated.View
            style={{
              marginLeft: 8,
              transform: [
                { rotate: rotate.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] }) },
              ],
            }}
          >
            <ChevronDownIcon size={16} />
          </Animated.View>
        </TextStyleProvider>
      </Pressable>
    )
  },
)

export function NavigationMenuContent({
  style,
  children,
  align = "start",
  ...props
}: ViewProps & { align?: Align }) {
  const theme = useTheme()
  const nav = React.useContext(NavContext)
  const item = React.useContext(ItemContext)
  if (!nav || !item) return null
  const open = nav.value === item.value
  return (
    <Floating
      open={open}
      onOpenChange={(o) => !o && nav.setValue(null)}
      anchorRef={item.anchorRef}
      side="bottom"
      align={align}
      sideOffset={10}
      duration={200}
    >
      <View
        style={[
          {
            overflow: "hidden",
            borderRadius: theme.radius,
            borderWidth: theme.borderWidth,
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.background,
            padding: 8,
          },
          style,
        ]}
        {...props}
      >
        <TextStyleProvider value={{ color: theme.colors.foreground, fontSize: 14, lineHeight: 20 }}>
          {children}
        </TextStyleProvider>
      </View>
    </Floating>
  )
}

export function NavigationMenuLink({
  style,
  textStyle,
  children,
  active: activeProp,
  onPress,
  closeOnPress = true,
  ...props
}: PressableTextProps & { active?: boolean; closeOnPress?: boolean }) {
  const theme = useTheme()
  const nav = React.useContext(NavContext)
  const [hovered, setHovered] = React.useState(false)
  const [pressed, setPressed] = React.useState(false)
  const active = activeProp || hovered || pressed
  return (
    <Pressable
      accessibilityRole="link"
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      onPress={(e) => {
        onPress?.(e)
        if (closeOnPress) nav?.setValue(null)
      }}
      style={[
        {
          gap: 4,
          padding: 8,
          borderRadius: theme.radius,
          borderWidth: theme.borderWidth,
          borderColor: active ? theme.colors.border : "transparent",
          backgroundColor: active ? theme.colors.main : "transparent",
        },
        style,
      ]}
      {...props}
    >
      <TextStyleProvider value={{ color: active ? theme.colors.mainForeground : theme.colors.foreground }}>
        {renderText(children, textStyle)}
      </TextStyleProvider>
    </Pressable>
  )
}

/** Kept for API parity: content renders in its own positioned layer. */
export function NavigationMenuViewport() {
  return null
}
/** Kept for API parity. */
export function NavigationMenuIndicator() {
  return null
}
