import * as React from "react"
import {
  PanResponder,
  View,
  type GestureResponderEvent,
  type StyleProp,
  type ViewStyle,
} from "react-native"
import { clamp, useControllableState, webStyle } from "../lib/utils"
import { useTheme } from "../theme/ThemeProvider"

export type SliderProps = {
  /** One value per thumb. `[50]` = single thumb, `[20, 80]` = range. */
  value?: number[]
  defaultValue?: number[]
  onValueChange?: (value: number[]) => void
  /** Called when the user releases the thumb. */
  onValueCommitted?: (value: number[]) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  orientation?: "horizontal" | "vertical"
  style?: StyleProp<ViewStyle>
  accessibilityLabel?: string
}

const THUMB = 20
const TRACK = 12

export function Slider({
  value,
  defaultValue,
  onValueChange,
  onValueCommitted,
  min = 0,
  max = 100,
  step = 1,
  disabled,
  orientation = "horizontal",
  style,
  accessibilityLabel,
}: SliderProps) {
  const theme = useTheme()
  const vertical = orientation === "vertical"
  const [values, setValues] = useControllableState<number[]>({
    value,
    defaultValue: defaultValue ?? [min],
    onChange: onValueChange,
  })
  const [length, setLength] = React.useState(0)
  const state = React.useRef({ values, length, active: 0, start: 0 })
  state.current.values = values
  state.current.length = length

  const usable = Math.max(length - THUMB, 1)
  // reads the latest length from the ref: the pan responder is memoized
  const toValue = (pos: number) => {
    const live = Math.max(state.current.length - THUMB, 1)
    const ratio = clamp((pos - THUMB / 2) / live, 0, 1)
    const raw = min + ratio * (max - min)
    const stepped = Math.round((raw - min) / step) * step + min
    return clamp(+stepped.toFixed(10), min, max)
  }
  const toPos = (v: number) => ((v - min) / (max - min || 1)) * usable

  const update = (pos: number) => {
    const s = state.current
    const v = toValue(vertical ? s.length - pos : pos)
    const next = s.values.slice()
    next[s.active] = v
    // keep range thumbs ordered
    if (s.active > 0 && next[s.active] < next[s.active - 1]) next[s.active] = next[s.active - 1]
    if (s.active < next.length - 1 && next[s.active] > next[s.active + 1])
      next[s.active] = next[s.active + 1]
    setValues(next)
  }

  const responder = React.useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !disabled,
        onMoveShouldSetPanResponder: () => !disabled,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: (e: GestureResponderEvent) => {
          const s = state.current
          const pos = vertical ? e.nativeEvent.locationY : e.nativeEvent.locationX
          const v = toValue(vertical ? s.length - pos : pos)
          let best = 0
          let bestDist = Infinity
          s.values.forEach((tv, i) => {
            const d = Math.abs(tv - v)
            if (d < bestDist || (d === bestDist && v > tv)) {
              best = i
              bestDist = d
            }
          })
          s.active = best
          s.start = pos
          update(pos)
        },
        onPanResponderMove: (_e, g) => {
          update(state.current.start + (vertical ? g.dy : g.dx))
        },
        onPanResponderRelease: () => onValueCommitted?.(state.current.values),
        onPanResponderTerminate: () => onValueCommitted?.(state.current.values),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [disabled, vertical, min, max, step, onValueCommitted],
  )

  const positions = values.map(toPos)
  const lo = values.length > 1 ? Math.min(...positions) : 0
  const hi = Math.max(...positions)
  const bw = theme.borderWidth

  const adjust = (i: number, dir: 1 | -1) => {
    const next = values.slice()
    next[i] = clamp(next[i] + dir * step, min, max)
    setValues(next)
    onValueCommitted?.(next)
  }

  return (
    <View
      {...responder.panHandlers}
      onLayout={(e) =>
        setLength(vertical ? e.nativeEvent.layout.height : e.nativeEvent.layout.width)
      }
      style={[
        vertical
          ? { height: "100%", minHeight: 176, width: THUMB, alignItems: "center" }
          : { width: "100%", height: THUMB, justifyContent: "center" },
        disabled && { opacity: 0.5 },
        webStyle({ userSelect: "none", touchAction: "none" }),
        style,
      ]}
    >
      <View
        pointerEvents="none"
        style={[
          {
            overflow: "hidden",
            borderRadius: theme.radius,
            borderWidth: bw,
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.secondaryBackground,
          },
          vertical ? { width: TRACK, height: "100%" } : { height: TRACK, width: "100%" },
        ]}
      >
        <View
          style={[
            { position: "absolute", backgroundColor: theme.colors.main },
            vertical
              ? { left: 0, right: 0, bottom: lo, height: Math.max(hi - lo + THUMB / 2, 0) }
              : { top: 0, bottom: 0, left: lo, width: Math.max(hi - lo + THUMB / 2, 0) },
          ]}
        />
      </View>
      {positions.map((p, i) => (
        <View
          key={i}
          accessible
          accessibilityRole="adjustable"
          accessibilityLabel={accessibilityLabel}
          accessibilityValue={{ min, max, now: values[i] }}
          accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}
          onAccessibilityAction={(e) => adjust(i, e.nativeEvent.actionName === "increment" ? 1 : -1)}
          pointerEvents="none"
          style={[
            {
              position: "absolute",
              width: THUMB,
              height: THUMB,
              borderRadius: 9999,
              borderWidth: bw,
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.thumb,
            },
            vertical ? { bottom: p } : { left: p },
          ]}
        />
      ))}
    </View>
  )
}
