import * as React from "react"
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from "react-native"
import { renderText } from "./text"
import { Slot, type ViewRef } from "./utils"

export type TriggerProps = Omit<PressableProps, "style" | "children"> & {
  /** Merge behaviour into the child element instead of rendering a Pressable. */
  asChild?: boolean
  style?: StyleProp<ViewStyle>
  children?: React.ReactNode
}

/** Base for Dialog/Popover/... triggers. Supports `asChild`. */
export const Trigger = React.forwardRef<ViewRef, TriggerProps>(function Trigger(
  { asChild, children, ...props },
  ref,
) {
  if (asChild) {
    return (
      <Slot ref={ref} {...(props as Record<string, unknown>)}>
        {children}
      </Slot>
    )
  }
  return (
    <Pressable ref={ref} accessibilityRole="button" {...props}>
      {renderText(children)}
    </Pressable>
  )
})
