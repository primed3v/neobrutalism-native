import * as React from "react"
import { Platform, View, type ViewProps } from "react-native"
import { Floating, type Align, type Side } from "../lib/overlay"
import { renderText, TextStyleProvider } from "../lib/text"
import { Trigger, type TriggerProps } from "../lib/trigger"
import { composeHandlers, mergeRefs, useControllableState, type ViewRef } from "../lib/utils"
import { useTheme } from "../theme/ThemeProvider"

const ProviderContext = React.createContext<{ delay: number; closeDelay: number }>({
  delay: 0,
  closeDelay: 0,
})

export function TooltipProvider({
  delay = 0,
  closeDelay = 0,
  children,
}: {
  /** ms before opening on hover (web). Default 0. */
  delay?: number
  closeDelay?: number
  children?: React.ReactNode
}) {
  return (
    <ProviderContext.Provider value={{ delay, closeDelay }}>{children}</ProviderContext.Provider>
  )
}

type TooltipCtx = {
  open: boolean
  setOpen: (open: boolean) => void
  anchorRef: React.RefObject<ViewRef | null>
  delay: number
  closeDelay: number
}

const TooltipContext = React.createContext<TooltipCtx | null>(null)

function useTooltip() {
  const ctx = React.useContext(TooltipContext)
  if (!ctx) throw new Error("Tooltip components must be used within <Tooltip>")
  return ctx
}

export type TooltipProps = {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  delay?: number
  closeDelay?: number
  children?: React.ReactNode
}

/**
 * Web: opens on hover/focus. iOS/Android: opens on long press and hides
 * shortly after the finger is lifted.
 */
export function Tooltip({ open, defaultOpen = false, onOpenChange, delay, closeDelay, children }: TooltipProps) {
  const provider = React.useContext(ProviderContext)
  const [isOpen, setOpen] = useControllableState({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  })
  const anchorRef = React.useRef<ViewRef>(null)
  return (
    <TooltipContext.Provider
      value={{
        open: isOpen,
        setOpen,
        anchorRef,
        delay: delay ?? provider.delay,
        closeDelay: closeDelay ?? provider.closeDelay,
      }}
    >
      {children}
    </TooltipContext.Provider>
  )
}

export const TooltipTrigger = React.forwardRef<ViewRef, TriggerProps>(function TooltipTrigger(
  { onHoverIn, onHoverOut, onLongPress, onPressOut, onFocus, onBlur, ...props },
  ref,
) {
  const { setOpen, anchorRef, delay, closeDelay } = useTooltip()
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const clear = () => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = null
  }
  React.useEffect(() => clear, [])
  const schedule = (open: boolean, ms: number) => {
    clear()
    if (ms <= 0) setOpen(open)
    else timer.current = setTimeout(() => setOpen(open), ms)
  }
  const web = Platform.OS === "web"
  return (
    <Trigger
      ref={mergeRefs(ref, anchorRef)}
      collapsable={false}
      onHoverIn={composeHandlers(onHoverIn, () => schedule(true, delay))}
      onHoverOut={composeHandlers(onHoverOut, () => schedule(false, closeDelay))}
      onFocus={composeHandlers(onFocus, () => web && schedule(true, delay))}
      onBlur={composeHandlers(onBlur, () => web && schedule(false, 0))}
      onLongPress={composeHandlers(onLongPress, () => !web && schedule(true, 0))}
      onPressOut={composeHandlers(onPressOut, () => !web && schedule(false, 1500))}
      {...props}
    />
  )
})

export type TooltipContentProps = ViewProps & {
  side?: Side
  align?: Align
  sideOffset?: number
  alignOffset?: number
}

export function TooltipContent({
  side = "top",
  align = "center",
  sideOffset = 4,
  alignOffset = 0,
  style,
  children,
  ...props
}: TooltipContentProps) {
  const theme = useTheme()
  const { open, setOpen, anchorRef } = useTooltip()
  return (
    <Floating
      open={open}
      onOpenChange={setOpen}
      anchorRef={anchorRef}
      modal={false}
      side={side}
      align={align}
      sideOffset={sideOffset}
      alignOffset={alignOffset}
    >
      <View
        pointerEvents="none"
        accessibilityRole="text"
        style={[
          {
            overflow: "hidden",
            borderRadius: theme.radius,
            borderWidth: theme.borderWidth,
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.secondaryBackground,
            paddingHorizontal: 12,
            paddingVertical: 6,
          },
          style,
        ]}
        {...props}
      >
        <TextStyleProvider value={{ color: theme.colors.foreground, fontSize: 14, lineHeight: 20 }}>
          {renderText(children)}
        </TextStyleProvider>
      </View>
    </Floating>
  )
}
