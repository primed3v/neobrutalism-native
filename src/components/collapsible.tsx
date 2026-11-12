import * as React from "react"
import type { StyleProp, ViewProps, ViewStyle } from "react-native"
import { AnimatedHeight } from "../lib/collapse"
import { Trigger, type TriggerProps } from "../lib/trigger"
import { composeHandlers, useControllableState, type ViewRef } from "../lib/utils"
import { View } from "react-native"

type Ctx = { open: boolean; setOpen: (o: boolean) => void; disabled?: boolean }
const CollapsibleContext = React.createContext<Ctx | null>(null)

export function useCollapsible() {
  const ctx = React.useContext(CollapsibleContext)
  if (!ctx) throw new Error("Collapsible components must be used within <Collapsible>")
  return ctx
}

export type CollapsibleProps = ViewProps & {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  disabled?: boolean
}

export function Collapsible({
  open,
  defaultOpen = false,
  onOpenChange,
  disabled,
  children,
  ...props
}: CollapsibleProps) {
  const [isOpen, setOpen] = useControllableState({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  })
  return (
    <CollapsibleContext.Provider value={{ open: isOpen, setOpen, disabled }}>
      <View {...props}>{children}</View>
    </CollapsibleContext.Provider>
  )
}

export const CollapsibleTrigger = React.forwardRef<ViewRef, TriggerProps>(
  function CollapsibleTrigger({ onPress, ...props }, ref) {
    const { open, setOpen, disabled } = useCollapsible()
    return (
      <Trigger
        ref={ref}
        disabled={disabled}
        accessibilityState={{ expanded: open, disabled }}
        onPress={composeHandlers(onPress, () => setOpen(!open))}
        {...props}
      />
    )
  },
)

export function CollapsibleContent({
  style,
  children,
}: {
  style?: StyleProp<ViewStyle>
  children?: React.ReactNode
}) {
  const { open } = useCollapsible()
  return (
    <AnimatedHeight open={open} style={style}>
      {children}
    </AnimatedHeight>
  )
}
