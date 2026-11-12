import * as React from "react"
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
} from "../lib/menu"
import { Trigger, type TriggerProps } from "../lib/trigger"
import { composeHandlers, mergeRefs, type ViewRef } from "../lib/utils"

export type DropdownMenuProps = {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  children?: React.ReactNode
}

export function DropdownMenu({ children, ...props }: DropdownMenuProps) {
  const state = useMenuState(props)
  return <MenuRootContext.Provider value={state}>{children}</MenuRootContext.Provider>
}

export const DropdownMenuTrigger = React.forwardRef<ViewRef, TriggerProps>(
  function DropdownMenuTrigger({ onPress, ...props }, ref) {
    const root = useMenuRoot()
    return (
      <Trigger
        ref={mergeRefs(ref, root.anchorRef)}
        collapsable={false}
        accessibilityState={{ expanded: root.open }}
        onPress={composeHandlers(onPress, () => {
          root.setAnchorRect(null)
          root.setOpen(!root.open)
        })}
        {...props}
      />
    )
  },
)

export const DropdownMenuContent = MenuContent
export const DropdownMenuGroup = MenuGroup
export const DropdownMenuPortal = MenuPortal
export const DropdownMenuItem = MenuItem
export const DropdownMenuCheckboxItem = MenuCheckboxItem
export const DropdownMenuRadioGroup = MenuRadioGroup
export const DropdownMenuRadioItem = MenuRadioItem
export const DropdownMenuLabel = MenuLabel
export const DropdownMenuSeparator = MenuSeparator
export const DropdownMenuShortcut = MenuShortcut
export const DropdownMenuSub = MenuSub
export const DropdownMenuSubTrigger = MenuSubTrigger
export const DropdownMenuSubContent = MenuSubContent
