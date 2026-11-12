import * as React from "react"
import {
  Animated,
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewProps,
  type ViewStyle,
} from "react-native"
import { DotIcon } from "../icons"
import { NATIVE_DRIVER } from "../lib/overlay"
import { Text } from "../lib/text"
import { mergeRefs, useControllableState, webStyle, type TextInputRef } from "../lib/utils"
import { useTheme } from "../theme/ThemeProvider"

type Slot = { char: string | null; isActive: boolean; hasFakeCaret: boolean }

const OTPContext = React.createContext<{ slots: Slot[]; invalid?: boolean }>({ slots: [] })

export const REGEXP_ONLY_DIGITS = "^\\d+$"
export const REGEXP_ONLY_CHARS = "^[a-zA-Z]+$"
export const REGEXP_ONLY_DIGITS_AND_CHARS = "^[a-zA-Z0-9]+$"

export type InputOTPProps = Omit<TextInputProps, "value" | "onChange" | "maxLength" | "style"> & {
  maxLength: number
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  onComplete?: (value: string) => void
  /** Regex source each character must match, e.g. REGEXP_ONLY_DIGITS. */
  pattern?: string
  disabled?: boolean
  invalid?: boolean
  containerStyle?: StyleProp<ViewStyle>
  children?: React.ReactNode
}

export const InputOTP = React.forwardRef<TextInputRef, InputOTPProps>(function InputOTP(
  {
    maxLength,
    value,
    defaultValue = "",
    onChange,
    onComplete,
    pattern,
    disabled,
    invalid,
    containerStyle,
    children,
    onFocus,
    onBlur,
    ...props
  },
  ref,
) {
  const [code, setCode] = useControllableState({ value, defaultValue, onChange })
  const [focused, setFocused] = React.useState(false)
  const input = React.useRef<TextInputRef>(null)
  const regex = pattern ? new RegExp(pattern) : null

  const slots: Slot[] = Array.from({ length: maxLength }, (_, i) => {
    const isActive = focused && (i === code.length || (code.length === maxLength && i === maxLength - 1))
    return {
      char: code[i] ?? null,
      isActive,
      hasFakeCaret: isActive && code.length < maxLength && i === code.length,
    }
  })

  return (
    <OTPContext.Provider value={{ slots, invalid }}>
      <View
        style={[
          { flexDirection: "row", alignItems: "center", gap: 8, alignSelf: "flex-start" },
          disabled && { opacity: 0.5 },
          containerStyle,
        ]}
      >
        {children}
        <TextInput
          ref={mergeRefs(ref, input)}
          value={code}
          editable={!disabled}
          maxLength={maxLength}
          caretHidden
          autoComplete="one-time-code"
          textContentType="oneTimeCode"
          keyboardType={pattern === REGEXP_ONLY_DIGITS ? "number-pad" : "default"}
          onChangeText={(t) => {
            const next = t.slice(0, maxLength)
            if (regex && next && !regex.test(next)) return
            setCode(next)
            if (next.length === maxLength) onComplete?.(next)
          }}
          onFocus={(e) => {
            setFocused(true)
            onFocus?.(e)
          }}
          onBlur={(e) => {
            setFocused(false)
            onBlur?.(e)
          }}
          style={[
            StyleSheet.absoluteFill,
            { opacity: 0.011, color: "transparent", fontSize: 1 },
            webStyle<TextStyle>({ outlineStyle: "none" }),
          ]}
          {...props}
        />
      </View>
    </OTPContext.Provider>
  )
})

const GroupContext = React.createContext<{ first: number; last: number } | null>(null)

export function InputOTPGroup({ style, children, ...props }: ViewProps) {
  const indexes: number[] = []
  React.Children.forEach(children, (c) => {
    if (React.isValidElement<{ index?: number }>(c) && typeof c.props.index === "number")
      indexes.push(c.props.index)
  })
  return (
    <GroupContext.Provider
      value={{ first: Math.min(...indexes), last: Math.max(...indexes) }}
    >
      <View style={[{ flexDirection: "row", alignItems: "center" }, style]} pointerEvents="none" {...props}>
        {children}
      </View>
    </GroupContext.Provider>
  )
}

function Caret() {
  const blink = React.useRef(new Animated.Value(1)).current
  React.useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(blink, { toValue: 0, duration: 500, useNativeDriver: NATIVE_DRIVER }),
        Animated.timing(blink, { toValue: 1, duration: 500, useNativeDriver: NATIVE_DRIVER }),
      ]),
    )
    loop.start()
    return () => loop.stop()
  }, [blink])
  const theme = useTheme()
  return (
    <Animated.View
      style={{ width: 1, height: 16, backgroundColor: theme.colors.foreground, opacity: blink }}
    />
  )
}

export function InputOTPSlot({ index, style }: { index: number; style?: StyleProp<ViewStyle> }) {
  const theme = useTheme()
  const { slots, invalid } = React.useContext(OTPContext)
  const group = React.useContext(GroupContext)
  const slot = slots[index] ?? { char: null, isActive: false, hasFakeCaret: false }
  const first = group?.first === index
  const last = group?.last === index
  const bw = theme.borderWidth
  const color = invalid ? theme.colors.danger : theme.colors.border
  return (
    <View
      style={[
        {
          width: 40,
          height: 40,
          alignItems: "center",
          justifyContent: "center",
          borderTopWidth: bw,
          borderBottomWidth: bw,
          borderRightWidth: bw,
          borderLeftWidth: first ? bw : 0,
          borderColor: color,
          backgroundColor: theme.colors.secondaryBackground,
          borderTopLeftRadius: first ? theme.radius : 0,
          borderBottomLeftRadius: first ? theme.radius : 0,
          borderTopRightRadius: last ? theme.radius : 0,
          borderBottomRightRadius: last ? theme.radius : 0,
          zIndex: slot.isActive ? 10 : 0,
        },
        style,
      ]}
    >
      {slot.isActive ? (
        <View
          style={{
            position: "absolute",
            top: -bw - 1,
            bottom: -bw - 1,
            left: first ? -bw - 1 : -1 - bw,
            right: -bw - 1,
            borderWidth: 1,
            borderColor: invalid ? theme.colors.danger : theme.colors.ring,
            borderRadius: first || last ? theme.radius : 0,
          }}
        />
      ) : null}
      {slot.char ? <Text size="sm">{slot.char}</Text> : null}
      {slot.hasFakeCaret ? <Caret /> : null}
    </View>
  )
}

export function InputOTPSeparator({ style }: { style?: StyleProp<ViewStyle> }) {
  return (
    <View accessibilityRole="none" style={style}>
      <DotIcon size={16} />
    </View>
  )
}
