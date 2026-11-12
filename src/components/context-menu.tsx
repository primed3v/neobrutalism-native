import * as React from "react"
import { Platform, Pressable, type PressableProps } from "react-native"
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
import { renderText } from "../lib/text"
import { mergeRefs, type ViewRef } from "../lib/utils"

export type ContextMenuProps = {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  children?: React.ReactNode
}

export function ContextMenu({ children, ...props }: ContextMenuProps) {
  const state = useMenuState(props)
  return <MenuRootContext.Provider value={state}>{children}</MenuRootContext.Provider>
}

/**
 * The area that opens the menu: long press on iOS/Android,
 * right click (or long press) on web. The menu opens at the touch point.
 */
export const ContextMenuTrigger = React.forwardRef<ViewRef, PressableProps>(
  function ContextMenuTrigger({ onLongPress, children, ...props }, ref) {
    const root = useMenuRoot()
    const local = React.useRef<ViewRef>(null)
    const { setAnchorRect, setOpen } = root
    const openAt = React.useCallback(
      (x: number, y: number) => {
        setAnchorRect({ x, y, width: 0, height: 0 })
        setOpen(true)
      },
      [setAnchorRect, setOpen],
    )
    React.useEffect(() => {
      if (Platform.OS !== "web") return
      const node = local.current as unknown as HTMLElement | null
      if (!node?.addEventListener) return
      const handler = (e: MouseEvent) => {
        e.preventDefault()
        openAt(e.clientX, e.clientY)
      }
      node.addEventListener("contextmenu", handler)
      return () => node.removeEventListener("contextmenu", handler)
    }, [openAt])
    return (
      <Pressable
        ref={mergeRefs(ref, local, root.anchorRef)}
        collapsable={false}
        delayLongPress={400}
        onLongPress={(e) => {
          onLongPress?.(e)
          openAt(e.nativeEvent.pageX, e.nativeEvent.pageY)
        }}
        {...props}
      >
        {typeof children === "function" ? children : renderText(children)}
      </Pressable>
    )
  },
)

export function ContextMenuContent({
  side = "bottom",
  align = "start",
  sideOffset = 2,
  ...props
}: MenuContentProps) {
  return <MenuContent side={side} align={align} sideOffset={sideOffset} {...props} />
}

export const ContextMenuGroup = MenuGroup
export const ContextMenuPortal = MenuPortal
export const ContextMenuItem = MenuItem
export const ContextMenuCheckboxItem = MenuCheckboxItem
export const ContextMenuRadioGroup = MenuRadioGroup
export const ContextMenuRadioItem = MenuRadioItem
export const ContextMenuLabel = MenuLabel
export const ContextMenuSeparator = MenuSeparator
export const ContextMenuShortcut = MenuShortcut
export const ContextMenuSub = MenuSub
export const ContextMenuSubTrigger = MenuSubTrigger
export const ContextMenuSubContent = MenuSubContent
