import * as React from "react"
import { ScrollView, View, type ViewProps } from "react-native"
import { Floating, useFloating, type Align, type Side } from "../lib/overlay"
import { renderText, Text, TextStyleProvider, type TextProps } from "../lib/text"
import { Trigger, type TriggerProps } from "../lib/trigger"
import { composeHandlers, mergeRefs, useControllableState, type ViewRef } from "../lib/utils"
import { useTheme } from "../theme/ThemeProvider"

type PopoverCtx = {
  open: boolean
  setOpen: (open: boolean) => void
  anchorRef: React.RefObject<ViewRef | null>
}

const PopoverContext = React.createContext<PopoverCtx | null>(null)

export function usePopover() {
  const ctx = React.useContext(PopoverContext)
  if (!ctx) throw new Error("Popover components must be used within <Popover>")
  return ctx
}

export type PopoverProps = {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  children?: React.ReactNode
}

export function Popover({ open, defaultOpen = false, onOpenChange, children }: PopoverProps) {
  const [isOpen, setOpen] = useControllableState({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  })
  const anchorRef = React.useRef<ViewRef>(null)
  return (
    <PopoverContext.Provider value={{ open: isOpen, setOpen, anchorRef }}>
      {children}
    </PopoverContext.Provider>
  )
}

export const PopoverTrigger = React.forwardRef<ViewRef, TriggerProps>(function PopoverTrigger(
  { onPress, ...props },
  ref,
) {
  const { open, setOpen, anchorRef } = usePopover()
  return (
    <Trigger
      ref={mergeRefs(ref, anchorRef)}
      collapsable={false}
      accessibilityState={{ expanded: open }}
      onPress={composeHandlers(onPress, () => setOpen(!open))}
      {...props}
    />
  )
})

/** Close button for use inside PopoverContent. */
export const PopoverClose = React.forwardRef<ViewRef, TriggerProps>(function PopoverClose(
  { onPress, ...props },
  ref,
) {
  const { setOpen } = usePopover()
  return <Trigger ref={ref} onPress={composeHandlers(onPress, () => setOpen(false))} {...props} />
})

export type PopoverContentProps = ViewProps & {
  side?: Side
  align?: Align
  sideOffset?: number
  alignOffset?: number
  /** Wrap children in a ScrollView limited to the available height. */
  scrollable?: boolean
}

export function PopoverContent({
  side = "bottom",
  align = "center",
  sideOffset = 4,
  alignOffset = 0,
  scrollable,
  style,
  children,
  ...props
}: PopoverContentProps) {
  const { open, setOpen, anchorRef } = usePopover()
  return (
    <Floating
      open={open}
      onOpenChange={setOpen}
      anchorRef={anchorRef}
      side={side}
      align={align}
      sideOffset={sideOffset}
      alignOffset={alignOffset}
    >
      <PanelBox style={style} scrollable={scrollable} {...props}>
        {children}
      </PanelBox>
    </Floating>
  )
}

function PanelBox({
  scrollable,
  style,
  children,
  ...rest
}: ViewProps & { scrollable?: boolean }) {
  const theme = useTheme()
  const { maxHeight } = useFloating()
  const body = (
    <TextStyleProvider value={{ color: theme.colors.foreground, fontSize: 16, lineHeight: 24 }}>
      {children}
    </TextStyleProvider>
  )
  return (
    <View
      style={[
        {
          width: 288,
          maxHeight,
          gap: 16,
          padding: 16,
          borderRadius: theme.radius,
          borderWidth: theme.borderWidth,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.background,
        },
        style,
      ]}
      {...rest}
    >
      {scrollable ? <ScrollView contentContainerStyle={{ gap: 16 }}>{body}</ScrollView> : body}
    </View>
  )
}

export function PopoverHeader({ style, children, ...props }: ViewProps) {
  return (
    <View style={[{ gap: 4 }, style]} {...props}>
      {renderText(children)}
    </View>
  )
}

export function PopoverTitle({ style, ...props }: TextProps) {
  return <Text weight="heading" style={[{ fontSize: 16, lineHeight: 18 }, style]} {...props} />
}

export function PopoverDescription({ style, ...props }: TextProps) {
  return <Text size="sm" style={style} {...props} />
}
