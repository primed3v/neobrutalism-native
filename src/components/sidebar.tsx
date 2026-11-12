import * as React from "react"
import {
  Animated,
  Pressable,
  ScrollView,
  View,
  useWindowDimensions,
  type PressableProps,
  type StyleProp,
  type TextStyle,
  type ViewProps,
  type ViewStyle,
} from "react-native"
import { PanelLeftIcon } from "../icons"
import { Backdrop, OverlayRoot, usePresence } from "../lib/overlay"
import { renderText, Text, TextStyleProvider, type TextProps } from "../lib/text"
import { Slot, useControllableState, type TextInputRef, type ViewRef } from "../lib/utils"
import { useSafeInsets, useTheme } from "../theme/ThemeProvider"
import { withAlpha } from "../theme/theme"
import { Button, type ButtonProps } from "./button"
import { Input, type InputProps } from "./input"
import { Skeleton } from "./skeleton"

export const SIDEBAR_WIDTH = 256
export const SIDEBAR_WIDTH_MOBILE = 288
export const SIDEBAR_WIDTH_ICON = 48
const MOBILE_BREAKPOINT = 768

type SidebarCtx = {
  state: "expanded" | "collapsed"
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
}

const SidebarContext = React.createContext<SidebarCtx | null>(null)
const SidebarLayoutContext = React.createContext<{ iconOnly: boolean }>({ iconOnly: false })

export function useSidebar() {
  const ctx = React.useContext(SidebarContext)
  if (!ctx) throw new Error("useSidebar must be used within a SidebarProvider.")
  return ctx
}

export type SidebarProviderProps = ViewProps & {
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function SidebarProvider({
  defaultOpen = true,
  open,
  onOpenChange,
  style,
  children,
  ...props
}: SidebarProviderProps) {
  const { width } = useWindowDimensions()
  const isMobile = width < MOBILE_BREAKPOINT
  const [isOpen, setOpen] = useControllableState({ value: open, defaultValue: defaultOpen, onChange: onOpenChange })
  const [openMobile, setOpenMobile] = React.useState(false)
  const value: SidebarCtx = {
    state: isOpen ? "expanded" : "collapsed",
    open: isOpen,
    setOpen,
    openMobile,
    setOpenMobile,
    isMobile,
    toggleSidebar: () => (isMobile ? setOpenMobile(!openMobile) : setOpen(!isOpen)),
  }
  return (
    <SidebarContext.Provider value={value}>
      <View style={[{ flex: 1, width: "100%", flexDirection: "row" }, style]} {...props}>
        {children}
      </View>
    </SidebarContext.Provider>
  )
}

export type SidebarProps = ViewProps & {
  side?: "left" | "right"
  variant?: "sidebar" | "floating" | "inset"
  collapsible?: "offcanvas" | "icon" | "none"
}

export function Sidebar({
  side = "left",
  variant = "sidebar",
  collapsible = "offcanvas",
  style,
  children,
  ...props
}: SidebarProps) {
  const theme = useTheme()
  const insets = useSafeInsets()
  const ctx = useSidebar()
  const bw = theme.borderWidth
  const target = ctx.open ? SIDEBAR_WIDTH : collapsible === "icon" ? SIDEBAR_WIDTH_ICON : 0
  const width = React.useRef(new Animated.Value(collapsible === "none" ? SIDEBAR_WIDTH : target)).current
  React.useEffect(() => {
    if (collapsible === "none") return
    Animated.timing(width, { toValue: target, duration: 200, useNativeDriver: false }).start()
  }, [target, collapsible, width])

  const inner = (iconOnly: boolean) => (
    <SidebarLayoutContext.Provider value={{ iconOnly }}>
      <TextStyleProvider value={{ color: theme.colors.foreground, fontSize: 14, lineHeight: 20 }}>
        {children}
      </TextStyleProvider>
    </SidebarLayoutContext.Provider>
  )

  if (ctx.isMobile && collapsible !== "none") {
    return <MobileSidebar side={side} style={style}>{inner(false)}</MobileSidebar>
  }

  const floating = variant === "floating" || variant === "inset"
  const panel: ViewStyle = {
    flex: 1,
    overflow: "hidden",
    backgroundColor: theme.colors.secondaryBackground,
    paddingTop: floating ? 0 : insets.top,
    paddingBottom: floating ? 0 : insets.bottom,
    ...(variant === "floating"
      ? { borderWidth: bw, borderColor: theme.colors.border, borderRadius: theme.radius }
      : variant === "inset"
        ? {}
        : side === "left"
          ? { borderRightWidth: bw, borderColor: theme.colors.border }
          : { borderLeftWidth: bw, borderColor: theme.colors.border }),
  }

  return (
    <Animated.View
      style={[
        { width, overflow: "hidden" },
        floating && { padding: target === 0 ? 0 : 8, paddingTop: insets.top + 8, paddingBottom: insets.bottom + 8 },
        floating && variant === "inset" && { backgroundColor: theme.colors.secondaryBackground },
      ]}
    >
      <View
        style={[panel, { width: collapsible === "icon" && !ctx.open ? SIDEBAR_WIDTH_ICON - (floating ? 16 : 0) : SIDEBAR_WIDTH - (floating ? 16 : 0) }, style]}
        {...props}
      >
        {inner(collapsible === "icon" && !ctx.open)}
      </View>
    </Animated.View>
  )
}

function MobileSidebar({ side, style, children }: { side: "left" | "right"; style?: StyleProp<ViewStyle>; children?: React.ReactNode }) {
  const theme = useTheme()
  const insets = useSafeInsets()
  const ctx = useSidebar()
  const { mounted, progress } = usePresence(ctx.openMobile, 300)
  const w = SIDEBAR_WIDTH_MOBILE
  return (
    <OverlayRoot open={mounted} onClose={() => ctx.setOpenMobile(false)}>
      <Backdrop progress={progress} color={theme.colors.overlay} onPress={() => ctx.setOpenMobile(false)} />
      <Animated.View
        accessibilityViewIsModal
        style={[
          {
            position: "absolute",
            top: 0,
            bottom: 0,
            width: w,
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
            backgroundColor: theme.colors.secondaryBackground,
            borderColor: theme.colors.border,
            transform: [
              { translateX: progress.interpolate({ inputRange: [0, 1], outputRange: [side === "left" ? -w : w, 0] }) },
            ],
          },
          side === "left" ? { left: 0, borderRightWidth: theme.borderWidth } : { right: 0, borderLeftWidth: theme.borderWidth },
          style,
        ]}
      >
        {children}
      </Animated.View>
    </OverlayRoot>
  )
}

export function SidebarTrigger({ onPress, style, ...props }: ButtonProps) {
  const ctx = useSidebar()
  return (
    <Button
      variant="noShadow"
      size="icon-sm"
      accessibilityLabel="Toggle Sidebar"
      onPress={(e) => {
        onPress?.(e)
        ctx.toggleSidebar()
      }}
      style={style}
      {...props}
    >
      <PanelLeftIcon size={16} />
    </Button>
  )
}

/** Thin edge strip that toggles the sidebar (desktop). */
export function SidebarRail({ style, ...props }: PressableProps & { style?: StyleProp<ViewStyle> }) {
  const ctx = useSidebar()
  const [hovered, setHovered] = React.useState(false)
  const theme = useTheme()
  if (ctx.isMobile) return null
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Toggle Sidebar"
      onPress={ctx.toggleSidebar}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={[
        { position: "absolute", top: 0, bottom: 0, right: -8, width: 16, zIndex: 20, alignItems: "center" },
        style,
      ]}
      {...props}
    >
      <View style={{ width: 2, flex: 1, backgroundColor: hovered ? theme.colors.border : "transparent" }} />
    </Pressable>
  )
}

export function SidebarInset({ style, ...props }: ViewProps) {
  const theme = useTheme()
  return <View style={[{ flex: 1, backgroundColor: theme.colors.background }, style]} {...props} />
}

export const SidebarInput = React.forwardRef<TextInputRef, InputProps>(function SidebarInput({ style, ...props }, ref) {
  return <Input ref={ref} style={[{ minHeight: 32, height: 32, paddingVertical: 4 }, style]} {...props} />
})

export function SidebarHeader({ style, ...props }: ViewProps) {
  return <View style={[{ gap: 8, padding: 8 }, style]} {...props} />
}

export function SidebarFooter({ style, ...props }: ViewProps) {
  return <View style={[{ gap: 8, padding: 8 }, style]} {...props} />
}

export function SidebarSeparator({ style, ...props }: ViewProps) {
  const theme = useTheme()
  return <View style={[{ height: theme.borderWidth, marginHorizontal: 8, backgroundColor: theme.colors.border }, style]} {...props} />
}

export function SidebarContent({ style, children, ...props }: ViewProps) {
  return (
    <ScrollView style={[{ flex: 1 }, style]} contentContainerStyle={{ gap: 8 }} {...(props as object)}>
      {children}
    </ScrollView>
  )
}

export function SidebarGroup({ style, ...props }: ViewProps) {
  return <View style={[{ width: "100%", minWidth: 0, padding: 8 }, style]} {...props} />
}

export function SidebarGroupLabel({ style, children, ...props }: ViewProps) {
  const { iconOnly } = React.useContext(SidebarLayoutContext)
  return (
    <View
      style={[
        { height: 32, flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 8 },
        iconOnly && { marginTop: -32, opacity: 0 },
        style,
      ]}
      {...props}
    >
      <TextStyleProvider value={{ weight: "heading", fontSize: 14 }}>{renderText(children, undefined, { numberOfLines: 1 })}</TextStyleProvider>
    </View>
  )
}

export function SidebarGroupAction({ style, children, ...props }: PressableProps & { style?: StyleProp<ViewStyle> }) {
  const { iconOnly } = React.useContext(SidebarLayoutContext)
  if (iconOnly) return null
  return (
    <Pressable
      accessibilityRole="button"
      hitSlop={8}
      style={[{ position: "absolute", right: 12, top: 14, width: 20, height: 20, alignItems: "center", justifyContent: "center" }, style]}
      {...props}
    >
      {children as React.ReactNode}
    </Pressable>
  )
}

export function SidebarGroupContent({ style, ...props }: ViewProps) {
  return <View style={[{ width: "100%" }, style]} {...props} />
}

export function SidebarMenu({ style, ...props }: ViewProps) {
  return <View accessibilityRole="menu" style={[{ width: "100%", minWidth: 0, gap: 4 }, style]} {...props} />
}

export function SidebarMenuItem({ style, ...props }: ViewProps) {
  return <View style={[{ position: "relative" }, style]} {...props} />
}

export type SidebarMenuButtonProps = Omit<PressableProps, "style" | "children"> & {
  isActive?: boolean
  size?: "default" | "sm" | "lg"
  asChild?: boolean
  style?: StyleProp<ViewStyle>
  textStyle?: StyleProp<TextStyle>
  children?: React.ReactNode
}

export const SidebarMenuButton = React.forwardRef<ViewRef, SidebarMenuButtonProps>(function SidebarMenuButton(
  { isActive, size = "default", asChild, style, textStyle, children, ...props },
  ref,
) {
  const theme = useTheme()
  const { iconOnly } = React.useContext(SidebarLayoutContext)
  const [hovered, setHovered] = React.useState(false)
  const [pressed, setPressed] = React.useState(false)
  const active = isActive || hovered || pressed
  const h = size === "sm" ? 28 : size === "lg" ? 48 : 32
  const items = React.Children.toArray(children)
  const content = iconOnly ? items.slice(0, 1) : items
  const boxStyle: StyleProp<ViewStyle> = [
    {
      width: iconOnly ? 32 : "100%",
      height: iconOnly ? 32 : h,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: iconOnly ? "center" : "flex-start",
      gap: 8,
      padding: iconOnly ? 0 : 8,
      overflow: "hidden",
      borderRadius: theme.radius,
      borderWidth: theme.borderWidth,
      borderColor: active ? theme.colors.border : "transparent",
      backgroundColor: active ? theme.colors.main : "transparent",
    },
    style,
  ]
  const body = (
    <TextStyleProvider
      value={{
        color: active ? theme.colors.mainForeground : theme.colors.foreground,
        fontSize: size === "sm" ? 12 : 14,
        iconSize: 16,
      }}
    >
      {renderText(content, textStyle, { numberOfLines: 1 })}
    </TextStyleProvider>
  )
  if (asChild) {
    return (
      <Slot ref={ref} style={boxStyle} {...(props as Record<string, unknown>)}>
        {children}
      </Slot>
    )
  }
  return (
    <Pressable
      ref={ref}
      accessibilityRole="menuitem"
      accessibilityState={{ selected: isActive }}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={boxStyle}
      {...props}
    >
      {body}
    </Pressable>
  )
})

export function SidebarMenuAction({ style, children, ...props }: PressableProps & { style?: StyleProp<ViewStyle> }) {
  const { iconOnly } = React.useContext(SidebarLayoutContext)
  if (iconOnly) return null
  return (
    <Pressable
      accessibilityRole="button"
      hitSlop={8}
      style={[{ position: "absolute", right: 4, top: 6, width: 20, height: 20, alignItems: "center", justifyContent: "center" }, style]}
      {...props}
    >
      {children as React.ReactNode}
    </Pressable>
  )
}

export function SidebarMenuBadge({ style, children, ...props }: ViewProps) {
  const theme = useTheme()
  const { iconOnly } = React.useContext(SidebarLayoutContext)
  if (iconOnly) return null
  return (
    <View
      pointerEvents="none"
      style={[
        {
          position: "absolute",
          right: 4,
          top: 6,
          height: 20,
          minWidth: 20,
          paddingHorizontal: 4,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: theme.radius,
        },
        style,
      ]}
      {...props}
    >
      {renderText(children, { fontSize: 12, fontVariant: ["tabular-nums"] })}
    </View>
  )
}

export function SidebarMenuSkeleton({ showIcon, style, ...props }: ViewProps & { showIcon?: boolean }) {
  const width = React.useMemo(() => `${Math.floor(Math.random() * 40) + 50}%` as const, [])
  return (
    <View style={[{ height: 32, flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 8 }, style]} {...props}>
      {showIcon ? <Skeleton style={{ width: 16, height: 16 }} /> : null}
      <Skeleton style={{ height: 16, flex: 0, width }} />
    </View>
  )
}

export function SidebarMenuSub({ style, ...props }: ViewProps) {
  const theme = useTheme()
  const { iconOnly } = React.useContext(SidebarLayoutContext)
  if (iconOnly) return null
  return (
    <View
      style={[
        {
          marginHorizontal: 14,
          paddingHorizontal: 10,
          paddingVertical: 2,
          gap: 4,
          borderLeftWidth: theme.borderWidth,
          borderColor: withAlpha(theme.colors.foreground, 0.5),
        },
        style,
      ]}
      {...props}
    />
  )
}

export function SidebarMenuSubItem({ style, ...props }: ViewProps) {
  return <View style={[{ position: "relative" }, style]} {...props} />
}

export function SidebarMenuSubButton({
  isActive,
  size = "md",
  style,
  textStyle,
  children,
  ...props
}: Omit<SidebarMenuButtonProps, "size" | "asChild"> & { size?: "sm" | "md" }) {
  const theme = useTheme()
  const [hovered, setHovered] = React.useState(false)
  const active = isActive || hovered
  return (
    <Pressable
      accessibilityRole="link"
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={[
        {
          height: 28,
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          paddingHorizontal: 8,
          borderRadius: theme.radius,
          borderWidth: theme.borderWidth,
          borderColor: active ? theme.colors.border : "transparent",
          backgroundColor: active ? theme.colors.main : "transparent",
        },
        style,
      ]}
      {...props}
    >
      <TextStyleProvider
        value={{ color: active ? theme.colors.mainForeground : theme.colors.foreground, fontSize: size === "sm" ? 12 : 14 }}
      >
        {renderText(children, textStyle, { numberOfLines: 1 })}
      </TextStyleProvider>
    </Pressable>
  )
}

/** Plain text helper for sidebar labels. */
export function SidebarText(props: TextProps) {
  return <Text numberOfLines={1} {...props} />
}
