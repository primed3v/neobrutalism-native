import * as React from "react"
import {
  ScrollView,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ViewProps,
} from "react-native"
import { ArrowLeftIcon, ArrowRightIcon } from "../icons"
import type { ScrollViewRef } from "../lib/utils"
import { Button, type ButtonProps } from "./button"

export type CarouselApi = {
  scrollPrev: () => void
  scrollNext: () => void
  scrollTo: (index: number, animated?: boolean) => void
  canScrollPrev: () => boolean
  canScrollNext: () => boolean
  selectedScrollSnap: () => number
  scrollSnapList: () => number[]
}

type CarouselCtx = {
  orientation: "horizontal" | "vertical"
  loop: boolean
  index: number
  count: number
  setCount: (n: number) => void
  itemSize: number
  viewport: number
  setViewport: (n: number) => void
  setIndex: (i: number) => void
  scrollRef: React.RefObject<ScrollViewRef | null>
  api: CarouselApi
}

const CarouselContext = React.createContext<CarouselCtx | null>(null)
const BasisContext = React.createContext<number>(1)

export function useCarousel() {
  const ctx = React.useContext(CarouselContext)
  if (!ctx) throw new Error("useCarousel must be used within a <Carousel />")
  return {
    ...ctx.api,
    orientation: ctx.orientation,
    canScrollPrev: ctx.api.canScrollPrev(),
    canScrollNext: ctx.api.canScrollNext(),
  }
}

export type CarouselProps = ViewProps & {
  orientation?: "horizontal" | "vertical"
  /** Embla-like options. */
  opts?: { loop?: boolean; startIndex?: number }
  setApi?: (api: CarouselApi) => void
  /** Fraction of the viewport each item takes (`basis-1/3` = 1/3). Default 1. */
  basis?: number
  onIndexChange?: (index: number) => void
}

export function Carousel({
  orientation = "horizontal",
  opts,
  setApi,
  basis = 1,
  onIndexChange,
  style,
  children,
  ...props
}: CarouselProps) {
  const scrollRef = React.useRef<ScrollViewRef>(null)
  const [index, setIndexState] = React.useState(opts?.startIndex ?? 0)
  const [count, setCount] = React.useState(0)
  const [viewport, setViewport] = React.useState(0)
  const loop = !!opts?.loop
  const itemSize = viewport * basis
  const visible = Math.max(Math.round(1 / basis), 1)
  const lastIndex = Math.max(count - visible, 0)

  const state = React.useRef({ index, lastIndex, itemSize })
  state.current = { index, lastIndex, itemSize }

  const setIndex = React.useCallback(
    (i: number) => {
      setIndexState((prev) => {
        if (prev !== i) onIndexChange?.(i)
        return i
      })
    },
    [onIndexChange],
  )

  const api = React.useMemo<CarouselApi>(() => {
    const scrollTo = (i: number, animated = true) => {
      const s = state.current
      const target = Math.min(Math.max(i, 0), s.lastIndex)
      const offset = target * s.itemSize
      scrollRef.current?.scrollTo(
        orientation === "horizontal" ? { x: offset, animated } : { y: offset, animated },
      )
      setIndex(target)
    }
    return {
      scrollTo,
      scrollPrev: () => {
        const s = state.current
        scrollTo(s.index <= 0 ? (loop ? s.lastIndex : 0) : s.index - 1)
      },
      scrollNext: () => {
        const s = state.current
        scrollTo(s.index >= s.lastIndex ? (loop ? 0 : s.lastIndex) : s.index + 1)
      },
      canScrollPrev: () => loop || state.current.index > 0,
      canScrollNext: () => loop || state.current.index < state.current.lastIndex,
      selectedScrollSnap: () => state.current.index,
      scrollSnapList: () => Array.from({ length: state.current.lastIndex + 1 }, (_, i) => i),
    }
  }, [orientation, loop, setIndex])

  React.useEffect(() => {
    setApi?.(api)
  }, [api, setApi])

  return (
    <CarouselContext.Provider
      value={{
        orientation,
        loop,
        index,
        count,
        setCount,
        itemSize,
        viewport,
        setViewport,
        setIndex,
        scrollRef,
        api,
      }}
    >
      <BasisContext.Provider value={basis}>
        <View accessibilityRole="adjustable" accessibilityLabel="carousel" style={[{ position: "relative" }, style]} {...props}>
          {children}
        </View>
      </BasisContext.Provider>
    </CarouselContext.Provider>
  )
}

export function CarouselContent({ style, children, ...props }: ViewProps) {
  const ctx = React.useContext(CarouselContext)!
  const horizontal = ctx.orientation === "horizontal"
  const items = React.Children.toArray(children)
  const { setCount } = ctx
  React.useEffect(() => setCount(items.length), [items.length, setCount])
  const onEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!ctx.itemSize) return
    const off = horizontal ? e.nativeEvent.contentOffset.x : e.nativeEvent.contentOffset.y
    ctx.setIndex(Math.round(off / ctx.itemSize))
  }
  return (
    <View
      style={[{ overflow: "hidden" }, !horizontal && { height: ctx.viewport || undefined }, style]}
      onLayout={(e) =>
        ctx.setViewport(horizontal ? e.nativeEvent.layout.width : e.nativeEvent.layout.height)
      }
      {...props}
    >
      <ScrollView
        ref={ctx.scrollRef}
        horizontal={horizontal}
        snapToInterval={ctx.itemSize || undefined}
        snapToAlignment="start"
        decelerationRate="fast"
        disableIntervalMomentum
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        onMomentumScrollEnd={onEnd}
        onScrollEndDrag={(e) => {
          // web has no momentum events
          if (!e.nativeEvent.velocity || (e.nativeEvent.velocity.x === 0 && e.nativeEvent.velocity.y === 0)) onEnd(e)
        }}
        scrollEventThrottle={16}
        contentContainerStyle={horizontal ? undefined : { flexDirection: "column" }}
      >
        {items.map((c, i) => (
          <View
            key={i}
            style={
              horizontal
                ? { width: ctx.itemSize || undefined }
                : { height: ctx.itemSize || undefined }
            }
          >
            {c}
          </View>
        ))}
      </ScrollView>
    </View>
  )
}

/** One slide. Add horizontal padding for gutters (`pl-4` on the web). */
export function CarouselItem({ style, ...props }: ViewProps) {
  return <View accessibilityRole="none" style={[{ flex: 1 }, style]} {...props} />
}

export function CarouselPrevious({ style, variant = "neutral", size = "icon-sm", ...props }: ButtonProps) {
  const ctx = React.useContext(CarouselContext)!
  const horizontal = ctx.orientation === "horizontal"
  return (
    <Button
      variant={variant}
      size={size}
      accessibilityLabel="Previous slide"
      disabled={!ctx.api.canScrollPrev()}
      onPress={() => ctx.api.scrollPrev()}
      style={[
        { position: "absolute", width: 32, height: 32 },
        horizontal
          ? { left: -48, top: "50%", marginTop: -16 }
          : { top: -48, left: "50%", marginLeft: -16, transform: [{ rotate: "90deg" }] },
        style,
      ]}
      {...props}
    >
      <ArrowLeftIcon size={16} />
    </Button>
  )
}

export function CarouselNext({ style, variant = "neutral", size = "icon-sm", ...props }: ButtonProps) {
  const ctx = React.useContext(CarouselContext)!
  const horizontal = ctx.orientation === "horizontal"
  return (
    <Button
      variant={variant}
      size={size}
      accessibilityLabel="Next slide"
      disabled={!ctx.api.canScrollNext()}
      onPress={() => ctx.api.scrollNext()}
      style={[
        { position: "absolute", width: 32, height: 32 },
        horizontal
          ? { right: -48, top: "50%", marginTop: -16 }
          : { bottom: -48, left: "50%", marginLeft: -16, transform: [{ rotate: "90deg" }] },
        style,
      ]}
      {...props}
    >
      <ArrowRightIcon size={16} />
    </Button>
  )
}
