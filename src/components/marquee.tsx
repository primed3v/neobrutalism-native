import * as React from "react"
import { Animated, Easing, View, type StyleProp, type TextStyle, type ViewStyle } from "react-native"
import { NATIVE_DRIVER } from "../lib/overlay"
import { Text } from "../lib/text"
import { useTheme } from "../theme/ThemeProvider"

export type MarqueeProps = {
  items: React.ReactNode[]
  /** Seconds for one full loop. Default 5 (`animate-marquee 5s linear infinite`). */
  duration?: number
  /** Scroll the other way. */
  reverse?: boolean
  style?: StyleProp<ViewStyle>
  itemStyle?: StyleProp<TextStyle>
}

/** Infinite horizontal ticker. */
export function Marquee({ items, duration = 5, reverse, style, itemStyle }: MarqueeProps) {
  const theme = useTheme()
  const [width, setWidth] = React.useState(0)
  const progress = React.useRef(new Animated.Value(0)).current

  React.useEffect(() => {
    if (!width) return
    progress.setValue(0)
    const loop = Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: duration * 1000,
        easing: Easing.linear,
        useNativeDriver: NATIVE_DRIVER,
      }),
    )
    loop.start()
    return () => loop.stop()
  }, [width, duration, progress])

  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: reverse ? [-width, 0] : [0, -width],
  })

  const row = (key: string, measure?: boolean) => (
    <View
      key={key}
      onLayout={measure ? (e) => setWidth(e.nativeEvent.layout.width) : undefined}
      style={{ flexDirection: "row", paddingVertical: 48 }}
    >
      {items.map((item, i) => (
        <View key={i} style={{ marginHorizontal: 16 }}>
          {typeof item === "string" || typeof item === "number" ? (
            <Text style={[{ fontSize: 36, lineHeight: 40 }, itemStyle]} numberOfLines={1}>
              {item}
            </Text>
          ) : (
            item
          )}
        </View>
      ))}
    </View>
  )

  return (
    <View
      style={[
        {
          width: "100%",
          overflow: "hidden",
          borderTopWidth: theme.borderWidth,
          borderBottomWidth: theme.borderWidth,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.secondaryBackground,
        },
        style,
      ]}
    >
      <Animated.View style={{ flexDirection: "row", alignSelf: "flex-start", transform: [{ translateX }] }}>
        {row("a", true)}
        {row("b")}
        {row("c")}
      </Animated.View>
    </View>
  )
}

export default Marquee
