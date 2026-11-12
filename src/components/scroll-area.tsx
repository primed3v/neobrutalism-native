import * as React from "react"
import {
  Animated,
  ScrollView,
  View,
  type LayoutChangeEvent,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from "react-native"
import type { ScrollViewRef } from "../lib/utils"
import { useTheme } from "../theme/ThemeProvider"

export type ScrollAreaProps = ScrollViewProps & {
  orientation?: "vertical" | "horizontal"
  /** Style of the outer (clipping) container. Put size here. */
  containerStyle?: StyleProp<ViewStyle>
  /** Hide the custom scrollbar. */
  hideScrollbar?: boolean
}

/**
 * ScrollView with the neobrutalism scrollbar (a rounded `bg-border` thumb)
 * drawn on every platform instead of the native indicator.
 */
export const ScrollArea = React.forwardRef<ScrollViewRef, ScrollAreaProps>(function ScrollArea(
  {
    orientation = "vertical",
    containerStyle,
    style,
    hideScrollbar,
    onScroll,
    onLayout,
    onContentSizeChange,
    scrollEventThrottle = 16,
    children,
    ...props
  },
  ref,
) {
  const theme = useTheme()
  const horizontal = orientation === "horizontal"
  const [viewport, setViewport] = React.useState(0)
  const [content, setContent] = React.useState(0)
  const offset = React.useRef(new Animated.Value(0)).current

  const scrollable = content > viewport + 1 && viewport > 0
  const track = Math.max(viewport - 2, 0)
  const thumb = scrollable ? Math.max((viewport / content) * track, 20) : 0
  const maxOffset = Math.max(content - viewport, 1)
  const translate = offset.interpolate({
    inputRange: [0, maxOffset],
    outputRange: [0, Math.max(track - thumb, 0)],
    extrapolate: "clamp",
  })

  return (
    <View style={[{ position: "relative", overflow: "hidden" }, containerStyle]}>
      <ScrollView
        ref={ref}
        horizontal={horizontal}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={scrollEventThrottle}
        onLayout={(e: LayoutChangeEvent) => {
          setViewport(horizontal ? e.nativeEvent.layout.width : e.nativeEvent.layout.height)
          onLayout?.(e)
        }}
        onContentSizeChange={(w, h) => {
          setContent(horizontal ? w : h)
          onContentSizeChange?.(w, h)
        }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: horizontal ? { x: offset } : { y: offset } } }],
          { useNativeDriver: false, listener: onScroll as never },
        )}
        style={style}
        {...props}
      >
        {children}
      </ScrollView>
      {scrollable && !hideScrollbar ? (
        <View
          pointerEvents="none"
          style={[
            { position: "absolute", padding: 1 },
            horizontal
              ? { left: 0, right: 0, bottom: 0, height: 10 }
              : { top: 0, bottom: 0, right: 0, width: 10 },
          ]}
        >
          <Animated.View
            style={[
              { borderRadius: 9999, backgroundColor: theme.colors.border },
              horizontal
                ? { height: "100%", width: thumb, transform: [{ translateX: translate }] }
                : { width: "100%", height: thumb, transform: [{ translateY: translate }] },
            ]}
          />
        </View>
      ) : null}
    </View>
  )
})

/** Kept for API parity: ScrollArea draws its own scrollbar. */
export function ScrollBar() {
  return null
}
