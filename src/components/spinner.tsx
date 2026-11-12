import * as React from "react"
import { Animated, Easing, type StyleProp, type ViewStyle } from "react-native"
import { LoaderIcon } from "../icons"
import { NATIVE_DRIVER } from "../lib/overlay"

export type SpinnerProps = {
  size?: number
  color?: string
  style?: StyleProp<ViewStyle>
}

/** Spinning loader (`Loader2Icon animate-spin`). */
export function Spinner({ size = 16, color, style }: SpinnerProps) {
  const spin = React.useRef(new Animated.Value(0)).current
  React.useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: NATIVE_DRIVER,
      }),
    )
    loop.start()
    return () => loop.stop()
  }, [spin])
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] })
  return (
    <Animated.View
      accessibilityRole="progressbar"
      accessibilityLabel="Loading"
      style={[{ width: size, height: size, transform: [{ rotate }] }, style]}
    >
      <LoaderIcon size={size} color={color} />
    </Animated.View>
  )
}
