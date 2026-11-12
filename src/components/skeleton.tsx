import * as React from "react"
import { Animated, Easing, type ViewProps } from "react-native"
import { NATIVE_DRIVER } from "../lib/overlay"
import { useTheme } from "../theme/ThemeProvider"

/** `animate-pulse rounded-base bg-secondary-background border-2 border-border` */
export function Skeleton({ style, ...props }: ViewProps) {
  const theme = useTheme()
  const pulse = React.useRef(new Animated.Value(1)).current
  React.useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 0.5,
          duration: 1000,
          easing: Easing.bezier(0.4, 0, 0.6, 1),
          useNativeDriver: NATIVE_DRIVER,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1000,
          easing: Easing.bezier(0.4, 0, 0.6, 1),
          useNativeDriver: NATIVE_DRIVER,
        }),
      ]),
    )
    loop.start()
    return () => loop.stop()
  }, [pulse])
  return (
    <Animated.View
      accessibilityRole="progressbar"
      accessibilityLabel="Loading"
      style={[
        {
          opacity: pulse,
          borderRadius: theme.radius,
          borderWidth: theme.borderWidth,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.secondaryBackground,
        },
        style,
      ]}
      {...props}
    />
  )
}
