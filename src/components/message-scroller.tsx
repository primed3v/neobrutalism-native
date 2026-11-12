import * as React from "react"
import {
  Animated,
  ScrollView,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ScrollViewProps,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from "react-native"
import { ArrowDownIcon } from "../icons"
import { NATIVE_DRIVER } from "../lib/overlay"
import type { ScrollViewRef } from "../lib/utils"
import { Button, type ButtonProps } from "./button"

type Ctx = {
  scrollRef: React.RefObject<ScrollViewRef | null>
  atStart: boolean
  atEnd: boolean
  setEdges: (start: boolean, end: boolean) => void
  scrollToEnd: (animated?: boolean) => void
  scrollToStart: (animated?: boolean) => void
}

const MessageScrollerContext = React.createContext<Ctx | null>(null)

export function useMessageScroller() {
  const ctx = React.useContext(MessageScrollerContext)
  if (!ctx) throw new Error("useMessageScroller must be used within <MessageScroller>")
  return ctx
}

/** Optional explicit provider (MessageScroller creates one itself). */
export function MessageScrollerProvider({ children }: { children?: React.ReactNode }) {
  const scrollRef = React.useRef<ScrollViewRef>(null)
  const [edges, setEdgesState] = React.useState({ atStart: true, atEnd: true })
  const value = React.useMemo<Ctx>(
    () => ({
      scrollRef,
      ...edges,
      setEdges: (atStart, atEnd) =>
        setEdgesState((p) => (p.atStart === atStart && p.atEnd === atEnd ? p : { atStart, atEnd })),
      scrollToEnd: (animated = true) => scrollRef.current?.scrollToEnd({ animated }),
      scrollToStart: (animated = true) => scrollRef.current?.scrollTo({ y: 0, animated }),
    }),
    [edges],
  )
  return <MessageScrollerContext.Provider value={value}>{children}</MessageScrollerContext.Provider>
}

/** Chat scroll container that sticks to the newest message. */
export function MessageScroller({ style, children, ...props }: ViewProps) {
  const existing = React.useContext(MessageScrollerContext)
  const body = (
    <View style={[{ flex: 1, minHeight: 0, overflow: "hidden" }, style]} {...props}>
      {children}
    </View>
  )
  return existing ? body : <MessageScrollerProvider>{body}</MessageScrollerProvider>
}

export type MessageScrollerViewportProps = ScrollViewProps & {
  /** Distance (px) from the end that still counts as "at the end". Default 24. */
  threshold?: number
  /** Keep scrolled to the end when new content arrives while at the end. Default true. */
  stickToEnd?: boolean
}

export function MessageScrollerViewport({
  threshold = 24,
  stickToEnd = true,
  onScroll,
  onContentSizeChange,
  scrollEventThrottle = 16,
  style,
  ...props
}: MessageScrollerViewportProps) {
  const ctx = useMessageScroller()
  const atEndRef = React.useRef(true)
  const initial = React.useRef(true)
  return (
    <ScrollView
      ref={ctx.scrollRef}
      style={[{ flex: 1 }, style]}
      scrollEventThrottle={scrollEventThrottle}
      onScroll={(e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent
        const atStart = contentOffset.y <= threshold
        const atEnd = contentOffset.y + layoutMeasurement.height >= contentSize.height - threshold
        atEndRef.current = atEnd
        ctx.setEdges(atStart, atEnd)
        onScroll?.(e)
      }}
      onContentSizeChange={(w, h) => {
        if (initial.current) {
          initial.current = false
          ctx.scrollRef.current?.scrollToEnd({ animated: false })
        } else if (stickToEnd && atEndRef.current) {
          ctx.scrollRef.current?.scrollToEnd({ animated: true })
        }
        onContentSizeChange?.(w, h)
      }}
      {...props}
    />
  )
}

export function MessageScrollerContent({ style, ...props }: ViewProps) {
  return <View style={[{ gap: 24, flexGrow: 1 }, style]} {...props} />
}

export function MessageScrollerItem(props: ViewProps) {
  return <View {...props} />
}

export type MessageScrollerButtonProps = ButtonProps & {
  /** Which edge the button scrolls to. Default "end". */
  direction?: "start" | "end"
  containerStyle?: StyleProp<ViewStyle>
}

/** Floating "jump to latest" button, visible when not at that edge. */
export function MessageScrollerButton({
  direction = "end",
  containerStyle,
  style,
  children,
  onPress,
  ...props
}: MessageScrollerButtonProps) {
  const ctx = useMessageScroller()
  const active = direction === "end" ? !ctx.atEnd : !ctx.atStart
  const anim = React.useRef(new Animated.Value(active ? 1 : 0)).current
  React.useEffect(() => {
    Animated.timing(anim, {
      toValue: active ? 1 : 0,
      duration: active ? 200 : 300,
      useNativeDriver: NATIVE_DRIVER,
    }).start()
  }, [active, anim])
  return (
    <Animated.View
      pointerEvents={active ? "box-none" : "none"}
      style={[
        {
          position: "absolute",
          left: 0,
          right: 0,
          alignItems: "center",
          opacity: anim,
          transform: [
            { scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) },
            {
              translateY: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [direction === "end" ? 16 : -16, 0],
              }),
            },
          ],
        },
        direction === "end" ? { bottom: 16 } : { top: 16 },
        containerStyle,
      ]}
    >
      <Button
        size="icon-xs"
        variant="neutral"
        accessibilityLabel={direction === "end" ? "Scroll to latest" : "Scroll to start"}
        onPress={(e) => {
          onPress?.(e)
          if (direction === "end") ctx.scrollToEnd()
          else ctx.scrollToStart()
        }}
        style={[{ borderRadius: 9999 }, style]}
        {...props}
      >
        {children ?? (
          <View style={direction === "start" ? { transform: [{ rotate: "180deg" }] } : undefined}>
            <ArrowDownIcon size={14} />
          </View>
        )}
      </Button>
    </Animated.View>
  )
}
