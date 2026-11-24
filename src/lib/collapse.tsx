import * as React from "react"
import { Animated, Easing, View, type StyleProp, type ViewStyle } from "react-native"

/**
 * Animates its height between 0 and the natural height of its children
 * (`h-(--accordion-panel-height) transition-[height]`).
 */
export function AnimatedHeight({
  open,
  duration = 200,
  style,
  children,
  keepMounted = true,
}: {
  open: boolean
  duration?: number
  style?: StyleProp<ViewStyle>
  children?: React.ReactNode
  /** Keep children mounted while closed (default true). */
  keepMounted?: boolean
}) {
  const [contentHeight, setContentHeight] = React.useState(0)
  const [measured, setMeasured] = React.useState(false)
  const progress = React.useRef(new Animated.Value(open ? 1 : 0)).current
  const [renderChildren, setRenderChildren] = React.useState(open || keepMounted)

  React.useEffect(() => {
    if (open) setRenderChildren(true)
    Animated.timing(progress, {
      toValue: open ? 1 : 0,
      duration,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished && !open && !keepMounted) setRenderChildren(false)
    })
  }, [open, duration, keepMounted, progress])

  return (
    <Animated.View
      accessibilityElementsHidden={!open}
      importantForAccessibility={open ? "auto" : "no-hide-descendants"}
      style={[
        {
          overflow: "hidden",
          height: measured
            ? progress.interpolate({ inputRange: [0, 1], outputRange: [0, contentHeight] })
            : open
              ? undefined
              : 0,
        },
        style,
      ]}
    >
      <View
        style={{ position: "absolute", top: 0, left: 0, right: 0 }}
        onLayout={(e) => {
          setContentHeight(e.nativeEvent.layout.height)
          setMeasured(true)
        }}
      >
        {renderChildren ? children : null}
      </View>
      {/* keeps the natural height in flow before the first measurement */}
      {!measured && open ? <View style={{ opacity: 0 }}>{children}</View> : null}
    </Animated.View>
  )
}
