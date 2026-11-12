import * as React from "react"
import {
  Pressable,
  ScrollView,
  type PressableProps,
  type StyleProp,
  type TextStyle,
  type ViewProps,
  type ViewStyle,
} from "react-native"
import {
  MenuCheckboxItem,
  MenuContent,
  MenuGroup,
  MenuItem,
  MenuLabel,
  MenuPortal,
  MenuRadioGroup,
  MenuRadioItem,
  MenuRootContext,
  MenuSeparator,
  MenuShortcut,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
  useMenuRoot,
  useMenuState,
  type MenuContentProps,
} from "../lib/menu"
import { renderText, TextStyleProvider } from "../lib/text"
import { mergeRefs, type ViewRef } from "../lib/utils"
import { useTheme } from "../theme/ThemeProvider"

/** Horizontal bar of menus (`h-11 rounded-base border-2 bg-background p-1`). Scrolls when narrow. */
export function Menubar({ style, children, ...props }: ViewProps) {
  const theme = useTheme()
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      accessibilityRole="menubar"
      style={[
        {
          flexGrow: 0,
          alignSelf: "flex-start",
          maxWidth: "100%",
          borderRadius: theme.radius,
          borderWidth: theme.borderWidth,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.background,
        },
        style,
      ]}
      contentContainerStyle={{ height: 40, alignItems: "center", gap: 4, padding: 4 }}
      {...props}
    >
      {children}
    </ScrollView>
  )
}

export function MenubarMenu({
  children,
  ...props
}: {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  children?: React.ReactNode
}) {
  const state = useMenuState(props)
  return <MenuRootContext.Provider value={state}>{children}</MenuRootContext.Provider>
}

export type MenubarTriggerProps = Omit<PressableProps, "style" | "children"> & {
  style?: StyleProp<ViewStyle>
  textStyle?: StyleProp<TextStyle>
  children?: React.ReactNode
}

export const MenubarTrigger = React.forwardRef<ViewRef, MenubarTriggerProps>(
  function MenubarTrigger({ style, textStyle, children, onPress, ...props }, ref) {
    const theme = useTheme()
    const root = useMenuRoot()
    const [hovered, setHovered] = React.useState(false)
    const active = root.open || hovered
    return (
      <Pressable
        ref={mergeRefs(ref, root.anchorRef)}
        collapsable={false}
        accessibilityRole="menuitem"
        accessibilityState={{ expanded: root.open }}
        onHoverIn={() => setHovered(true)}
        onHoverOut={() => setHovered(false)}
        onPress={(e) => {
          onPress?.(e)
          root.setAnchorRect(null)
          root.setOpen(!root.open)
        }}
        style={[
          {
            paddingHorizontal: 12,
            paddingVertical: 4,
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
          value={{
            color: active ? theme.colors.mainForeground : theme.colors.foreground,
            fontSize: 14,
            lineHeight: 20,
            weight: "heading",
          }}
        >
          {renderText(children, textStyle, { numberOfLines: 1 })}
        </TextStyleProvider>
      </Pressable>
    )
  },
)

export function MenubarContent({
  align = "start",
  alignOffset = -4,
  sideOffset = 8,
  ...props
}: MenuContentProps) {
  return (
    <MenuContent
      align={align}
      alignOffset={alignOffset}
      sideOffset={sideOffset}
      minWidth={192}
      {...props}
    />
  )
}

export const MenubarGroup = MenuGroup
export const MenubarPortal = MenuPortal
export const MenubarItem = MenuItem
export const MenubarCheckboxItem = MenuCheckboxItem
export const MenubarRadioGroup = MenuRadioGroup
export const MenubarRadioItem = MenuRadioItem
export const MenubarLabel = MenuLabel
export const MenubarSeparator = MenuSeparator
export const MenubarShortcut = MenuShortcut
export const MenubarSub = MenuSub
export const MenubarSubTrigger = MenuSubTrigger
export const MenubarSubContent = MenuSubContent
