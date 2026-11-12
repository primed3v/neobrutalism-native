import * as React from "react"
import { Platform, Pressable, type ViewProps } from "react-native"
import { Floating, type Align, type Side } from "../lib/overlay"
import { renderText, TextStyleProvider } from "../lib/text"
import { Trigger, type TriggerProps } from "../lib/trigger"
import { composeHandlers, mergeRefs, useControllableState, type ViewRef } from "../lib/utils"
import { useTheme } from "../theme/ThemeProvider"

type Ctx = {
  open: boolean
  setOpen: (open: boolean) => void
  anchorRef: React.RefObject<ViewRef | null>
  schedule: (open: boolean) => void
  nativeTrigger: "press" | "longPress"
}

const HoverCardContext = React.createContext<Ctx | null>(null)

function useHoverCard() {
  const ctx = React.useContext(HoverCardContext)
  if (!ctx) throw new Error("HoverCard components must be used within <HoverCard>")
  return ctx
}

export type HoverCardProps = {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** ms (web). Default 600. */
  openDelay?: number
  /** ms (web). Default 300. */
  closeDelay?: number
  /** Gesture that opens the card on iOS/Android. Default "longPress". */
  nativeTrigger?: "press" | "longPress"
  children?: React.ReactNode
}

export function HoverCard({
  open,
  defaultOpen = false,
  onOpenChange,
  openDelay = 600,
  closeDelay = 300,
  nativeTrigger = "longPress",
  children,
}: HoverCardProps) {
  const [isOpen, setOpen] = useControllableState({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  })
  const anchorRef = React.useRef<ViewRef>(null)
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  React.useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current)
  }, [])
  const schedule = React.useCallback(
    (next: boolean) => {
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(() => setOpen(next), next ? openDelay : closeDelay)
    },
    [openDelay, closeDelay, setOpen],
  )
  return (
    <HoverCardContext.Provider value={{ open: isOpen, setOpen, anchorRef, schedule, nativeTrigger }}>
      {children}
    </HoverCardContext.Provider>
  )
}

export const HoverCardTrigger = React.forwardRef<ViewRef, TriggerProps>(function HoverCardTrigger(
  { onHoverIn, onHoverOut, onLongPress, onPress, ...props },
  ref,
) {
  const { setOpen, anchorRef, schedule, nativeTrigger } = useHoverCard()
  const web = Platform.OS === "web"
  return (
    <Trigger
      ref={mergeRefs(ref, anchorRef)}
      collapsable={false}
      onHoverIn={composeHandlers(onHoverIn, () => schedule(true))}
      onHoverOut={composeHandlers(onHoverOut, () => schedule(false))}
      onLongPress={composeHandlers(onLongPress, () => !web && nativeTrigger === "longPress" && setOpen(true))}
      onPress={
        !web && nativeTrigger === "press" ? composeHandlers(onPress, () => setOpen(true)) : onPress
      }
      {...props}
    />
  )
})

export type HoverCardContentProps = ViewProps & {
  side?: Side
  align?: Align
  sideOffset?: number
  alignOffset?: number
}

export function HoverCardContent({
  side = "bottom",
  align = "center",
  sideOffset = 4,
  alignOffset = 0,
  style,
  children,
  ...props
}: HoverCardContentProps) {
  const theme = useTheme()
  const { open, setOpen, anchorRef, schedule } = useHoverCard()
  const web = Platform.OS === "web"
  return (
    <Floating
      open={open}
      onOpenChange={setOpen}
      anchorRef={anchorRef}
      modal={!web}
      side={side}
      align={align}
      sideOffset={sideOffset}
      alignOffset={alignOffset}
    >
      <Pressable
        accessible={false}
        onHoverIn={() => schedule(true)}
        onHoverOut={() => schedule(false)}
        style={[
          {
            width: 256,
            padding: 16,
            borderRadius: theme.radius,
            borderWidth: theme.borderWidth,
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.background,
          },
          style,
        ]}
        {...(props as object)}
      >
        <TextStyleProvider value={{ color: theme.colors.foreground, fontSize: 16, lineHeight: 24 }}>
          {renderText(children)}
        </TextStyleProvider>
      </Pressable>
    </Floating>
  )
}
