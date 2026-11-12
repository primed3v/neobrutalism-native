import * as React from "react"
import { Animated, View, type StyleProp, type ViewProps, type ViewStyle } from "react-native"
import { Text, type TextProps } from "../lib/text"
import { useTheme } from "../theme/ThemeProvider"

const ProgressContext = React.createContext<{ value: number | null; max: number }>({
  value: null,
  max: 100,
})

export type ProgressProps = ViewProps & {
  /** 0..max. `null` = indeterminate. */
  value?: number | null
  max?: number
  trackStyle?: StyleProp<ViewStyle>
  indicatorStyle?: StyleProp<ViewStyle>
}

/** Progress bar. Children (ProgressLabel / ProgressValue) render above the track. */
export function Progress({
  value = null,
  max = 100,
  style,
  trackStyle,
  indicatorStyle,
  children,
  ...props
}: ProgressProps) {
  return (
    <ProgressContext.Provider value={{ value, max }}>
      <View
        accessibilityRole="progressbar"
        accessibilityValue={value === null ? undefined : { min: 0, max, now: value }}
        style={[{ width: "100%", flexDirection: "row", flexWrap: "wrap", gap: 8 }, style]}
        {...props}
      >
        {children}
        <ProgressTrack style={trackStyle}>
          <ProgressIndicator style={indicatorStyle} />
        </ProgressTrack>
      </View>
    </ProgressContext.Provider>
  )
}

export function ProgressTrack({ style, ...props }: ViewProps) {
  const theme = useTheme()
  return (
    <View
      style={[
        {
          width: "100%",
          height: 16,
          overflow: "hidden",
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

export function ProgressIndicator({ style, ...props }: ViewProps) {
  const theme = useTheme()
  const { value, max } = React.useContext(ProgressContext)
  const pct = value === null ? 0 : Math.min(Math.max(value / max, 0), 1) * 100
  const anim = React.useRef(new Animated.Value(pct)).current
  React.useEffect(() => {
    Animated.timing(anim, { toValue: pct, duration: 150, useNativeDriver: false }).start()
  }, [pct, anim])
  return (
    <Animated.View
      style={[
        {
          height: "100%",
          width: anim.interpolate({ inputRange: [0, 100], outputRange: ["0%", "100%"] }),
          backgroundColor: theme.colors.main,
          borderRightWidth: pct > 0 && pct < 100 ? theme.borderWidth : 0,
          borderColor: theme.colors.border,
        },
        style,
      ]}
      {...props}
    />
  )
}

export function ProgressLabel({ style, ...props }: TextProps) {
  return <Text weight="heading" size="sm" style={style} {...props} />
}

/** Shows the value as a percentage, or pass a render function. */
export function ProgressValue({
  style,
  children,
  ...props
}: Omit<TextProps, "children"> & {
  children?: React.ReactNode | ((formatted: string, value: number | null) => React.ReactNode)
}) {
  const { value, max } = React.useContext(ProgressContext)
  const formatted = value === null ? "" : `${Math.round((value / max) * 100)}%`
  return (
    <Text size="sm" style={[{ marginLeft: "auto", fontVariant: ["tabular-nums"] }, style]} {...props}>
      {typeof children === "function" ? children(formatted, value) : (children ?? formatted)}
    </Text>
  )
}
