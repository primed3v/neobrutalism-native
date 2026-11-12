import * as React from "react"
import { Animated, Pressable, type PressableProps, type StyleProp, type ViewStyle } from "react-native"
import { NATIVE_DRIVER } from "../lib/overlay"
import { useControllableState, type ViewRef } from "../lib/utils"
import { useTheme } from "../theme/ThemeProvider"

export type SwitchProps = Omit<PressableProps, "style" | "children" | "onPress"> & {
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  size?: "default" | "sm"
  style?: StyleProp<ViewStyle>
}

const DIMS = {
  default: { w: 48, h: 24, thumb: 16, off: 4, on: 24 },
  sm: { w: 36, h: 20, thumb: 12, off: 4, on: 16 },
}

export const Switch = React.forwardRef<ViewRef, SwitchProps>(function Switch(
  { checked, defaultChecked = false, onCheckedChange, disabled, size = "default", style, ...props },
  ref,
) {
  const theme = useTheme()
  const [on, setOn] = useControllableState({
    value: checked,
    defaultValue: defaultChecked,
    onChange: onCheckedChange,
  })
  const d = DIMS[size]
  const anim = React.useRef(new Animated.Value(on ? 1 : 0)).current
  React.useEffect(() => {
    Animated.timing(anim, {
      toValue: on ? 1 : 0,
      duration: 150,
      useNativeDriver: NATIVE_DRIVER,
    }).start()
  }, [on, anim])
  const bw = theme.borderWidth
  return (
    <Pressable
      ref={ref}
      accessibilityRole="switch"
      accessibilityState={{ checked: on, disabled }}
      disabled={disabled}
      hitSlop={6}
      onPress={() => setOn(!on)}
      style={[
        {
          width: d.w,
          height: d.h,
          borderRadius: 9999,
          borderWidth: bw,
          borderColor: theme.colors.border,
          backgroundColor: on ? theme.colors.main : theme.colors.secondaryBackground,
          justifyContent: "center",
        },
        disabled && { opacity: 0.5 },
        style,
      ]}
      {...props}
    >
      <Animated.View
        pointerEvents="none"
        style={{
          position: "absolute",
          left: 0,
          width: d.thumb,
          height: d.thumb,
          borderRadius: 9999,
          borderWidth: bw,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.thumb,
          transform: [
            {
              translateX: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [d.off - bw, d.on - bw],
              }),
            },
          ],
        }}
      />
    </Pressable>
  )
})
