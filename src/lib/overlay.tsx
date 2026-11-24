import * as React from "react"
import {
  Animated,
  BackHandler,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
  type LayoutRectangle,
  type StyleProp,
  type ViewStyle,
} from "react-native"
import { Portal, usePortalAvailable } from "./portal"
import type { ViewRef } from "./utils"

export const NATIVE_DRIVER = Platform.OS !== "web"

/**
 * Keeps content mounted while it animates out.
 * `progress` animates 0 -> 1 on open and 1 -> 0 on close.
 */
export function usePresence(open: boolean, duration = 150) {
  const [mounted, setMounted] = React.useState(open)
  const progress = React.useRef(new Animated.Value(open ? 1 : 0)).current
  React.useEffect(() => {
    if (open) {
      setMounted(true)
      Animated.timing(progress, {
        toValue: 1,
        duration,
        useNativeDriver: NATIVE_DRIVER,
      }).start()
    } else {
      Animated.timing(progress, {
        toValue: 0,
        duration,
        useNativeDriver: NATIVE_DRIVER,
      }).start(({ finished }) => {
        if (finished) setMounted(false)
      })
    }
  }, [open, duration, progress])
  return { mounted, progress }
}

export type Rect = LayoutRectangle

export type MeasurableRef = React.RefObject<ViewRef | null>

export function measureInWindow(ref: MeasurableRef): Promise<Rect | null> {
  return new Promise((resolve) => {
    const node = ref.current as unknown as {
      measureInWindow?: (cb: (x: number, y: number, w: number, h: number) => void) => void
    } | null
    if (!node?.measureInWindow) return resolve(null)
    node.measureInWindow((x, y, width, height) => resolve({ x, y, width, height }))
  })
}

export type OverlayProps = {
  open: boolean
  onClose?: () => void
  /**
   * `modal` (default) renders into a native Modal and blocks the screen.
   * `false` renders into the NeoProvider portal without blocking touches.
   */
  modal?: boolean
  children?: React.ReactNode
}

/** Full-screen layer: native Modal, or portal when `modal={false}`. */
export function OverlayRoot({ open, onClose, modal = true, children }: OverlayProps) {
  const portal = usePortalAvailable()
  React.useEffect(() => {
    if (!open || modal || !onClose) return
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      onClose()
      return true
    })
    return () => sub.remove()
  }, [open, modal, onClose])

  if (!modal && portal) {
    if (!open) return null
    return (
      <Portal>
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          {children}
        </View>
      </Portal>
    )
  }
  return (
    <Modal
      visible={open}
      transparent
      animationType="none"
      statusBarTranslucent
      navigationBarTranslucent
      supportedOrientations={["portrait", "landscape", "portrait-upside-down", "landscape-left", "landscape-right"]}
      onRequestClose={onClose}
    >
      {children}
    </Modal>
  )
}

export type Side = "top" | "bottom" | "left" | "right"
export type Align = "start" | "center" | "end"

export type PositionOptions = {
  side?: Side
  align?: Align
  sideOffset?: number
  alignOffset?: number
  /** keep this far from the screen edges */
  collisionPadding?: number
  /** match the anchor width (e.g. Select) */
  matchAnchorWidth?: boolean
}

export function computePosition(
  anchor: Rect,
  content: { width: number; height: number },
  viewport: { width: number; height: number },
  {
    side = "bottom",
    align = "center",
    sideOffset = 4,
    alignOffset = 0,
    collisionPadding = 8,
  }: PositionOptions,
) {
  const pad = collisionPadding
  let resolvedSide = side
  const spaceBelow = viewport.height - (anchor.y + anchor.height) - sideOffset - pad
  const spaceAbove = anchor.y - sideOffset - pad
  const spaceRight = viewport.width - (anchor.x + anchor.width) - sideOffset - pad
  const spaceLeft = anchor.x - sideOffset - pad

  if (side === "bottom" && content.height > spaceBelow && spaceAbove > spaceBelow)
    resolvedSide = "top"
  else if (side === "top" && content.height > spaceAbove && spaceBelow > spaceAbove)
    resolvedSide = "bottom"
  else if (side === "right" && content.width > spaceRight && spaceLeft > spaceRight)
    resolvedSide = "left"
  else if (side === "left" && content.width > spaceLeft && spaceRight > spaceLeft)
    resolvedSide = "right"

  let top = 0
  let left = 0
  if (resolvedSide === "bottom" || resolvedSide === "top") {
    top =
      resolvedSide === "bottom"
        ? anchor.y + anchor.height + sideOffset
        : anchor.y - sideOffset - content.height
    if (align === "start") left = anchor.x + alignOffset
    else if (align === "end") left = anchor.x + anchor.width - content.width - alignOffset
    else left = anchor.x + anchor.width / 2 - content.width / 2 + alignOffset
  } else {
    left =
      resolvedSide === "right"
        ? anchor.x + anchor.width + sideOffset
        : anchor.x - sideOffset - content.width
    if (align === "start") top = anchor.y + alignOffset
    else if (align === "end") top = anchor.y + anchor.height - content.height - alignOffset
    else top = anchor.y + anchor.height / 2 - content.height / 2 + alignOffset
  }
  left = Math.max(pad, Math.min(left, viewport.width - content.width - pad))
  top = Math.max(pad, Math.min(top, viewport.height - content.height - pad))
  const maxHeight =
    resolvedSide === "bottom"
      ? Math.max(spaceBelow, 120)
      : resolvedSide === "top"
        ? Math.max(spaceAbove, 120)
        : viewport.height - pad * 2
  return { top, left, side: resolvedSide, maxHeight }
}

export type FloatingProps = PositionOptions & {
  open: boolean
  onOpenChange?: (open: boolean) => void
  anchorRef: MeasurableRef
  /** Explicit anchor rect (e.g. a touch point for context menus). */
  anchorRect?: Rect | null
  modal?: boolean
  /** Close when tapping outside. Default true. */
  dismissable?: boolean
  style?: StyleProp<ViewStyle>
  children?: React.ReactNode
  /** Duration of the fade/zoom animation. */
  duration?: number
}

const SLIDE: Record<Side, { x: number; y: number }> = {
  bottom: { x: 0, y: -8 },
  top: { x: 0, y: 8 },
  left: { x: 8, y: 0 },
  right: { x: -8, y: 0 },
}

/**
 * Positions content next to an anchor, like Floating UI / Radix Popper.
 * Animation mirrors `fade-in-0 zoom-in-95 slide-in-from-*-2`.
 */
export function Floating({
  open,
  onOpenChange,
  anchorRef,
  anchorRect,
  modal = true,
  dismissable = true,
  style,
  children,
  duration = 150,
  matchAnchorWidth,
  ...position
}: FloatingProps) {
  const { mounted, progress } = usePresence(open, duration)
  const viewport = useWindowDimensions()
  const rootRef = React.useRef<ViewRef>(null)
  const [anchor, setAnchor] = React.useState<Rect | null>(null)
  const [origin, setOrigin] = React.useState<{ x: number; y: number } | null>(null)
  const [size, setSize] = React.useState<{ width: number; height: number } | null>(null)

  React.useEffect(() => {
    if (!open) return
    let cancelled = false
    if (anchorRect) setAnchor(anchorRect)
    else
      measureInWindow(anchorRef).then((r) => {
        if (!cancelled) setAnchor(r)
      })
    return () => {
      cancelled = true
    }
  }, [open, anchorRef, anchorRect, viewport.width, viewport.height])

  React.useEffect(() => {
    if (!mounted) {
      setSize(null)
      setOrigin(null)
    }
  }, [mounted])

  const close = React.useCallback(() => onOpenChange?.(false), [onOpenChange])

  const measureRoot = React.useCallback(() => {
    measureInWindow(rootRef).then((r) => setOrigin(r ? { x: r.x, y: r.y } : { x: 0, y: 0 }))
  }, [])

  let placement: ReturnType<typeof computePosition> | null = null
  if (anchor && size && origin) {
    const local = { ...anchor, x: anchor.x - origin.x, y: anchor.y - origin.y }
    placement = computePosition(local, size, viewport, position)
  }
  const slide = SLIDE[placement?.side ?? position.side ?? "bottom"]

  return (
    <OverlayRoot open={mounted} onClose={close} modal={modal}>
      <View
        ref={rootRef}
        collapsable={false}
        onLayout={measureRoot}
        style={StyleSheet.absoluteFill}
        pointerEvents="box-none"
      >
        {modal && (
          <Pressable
            accessibilityLabel="Close"
            accessibilityRole="button"
            style={StyleSheet.absoluteFill}
            onPress={dismissable ? close : undefined}
          />
        )}
        <Animated.View
          onLayout={(e) => {
            const { width, height } = e.nativeEvent.layout
            if (!size || Math.abs(size.width - width) > 0.5 || Math.abs(size.height - height) > 0.5)
              setSize({ width, height })
          }}
          style={[
            {
              position: "absolute",
              top: placement?.top ?? 0,
              left: placement?.left ?? 0,
              maxWidth: viewport.width - 16,
              opacity: placement ? progress : 0,
              transform: [
                {
                  translateX: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [slide.x, 0],
                  }),
                },
                {
                  translateY: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [slide.y, 0],
                  }),
                },
                {
                  scale: progress.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }),
                },
              ],
            },
            matchAnchorWidth && anchor ? { minWidth: anchor.width } : null,
            style,
          ]}
        >
          <FloatingContext.Provider
            value={{ maxHeight: placement?.maxHeight, side: placement?.side, close }}
          >
            {children}
          </FloatingContext.Provider>
        </Animated.View>
      </View>
    </OverlayRoot>
  )
}

export const FloatingContext = React.createContext<{
  maxHeight?: number
  side?: Side
  close?: () => void
}>({})

export function useFloating() {
  return React.useContext(FloatingContext)
}

/** Backdrop + centered/edge content with fade (dialogs, sheets, drawers). */
export function Backdrop({
  progress,
  color,
  onPress,
}: {
  progress: Animated.Value
  color: string
  onPress?: () => void
}) {
  return (
    <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: color, opacity: progress }]}>
      <Pressable
        accessibilityLabel="Close"
        accessibilityRole="button"
        style={StyleSheet.absoluteFill}
        onPress={onPress}
      />
    </Animated.View>
  )
}
