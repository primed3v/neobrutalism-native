import * as React from "react"
import {
  Animated,
  Platform,
  Pressable,
  ScrollView,
  View,
  useWindowDimensions,
  type StyleProp,
  type ViewStyle,
} from "react-native"
import { CheckIcon, ChevronDownIcon } from "../icons"
import { Backdrop, OverlayRoot, usePresence } from "../lib/overlay"
import { fontFor, Text } from "../lib/text"
import { useControllableState } from "../lib/utils"
import { useTheme } from "../theme/ThemeProvider"

export type NativeSelectOptionProps = {
  value: string
  disabled?: boolean
  children?: React.ReactNode
}

/** Declarative option. Only used to describe options; NativeSelect renders them. */
export function NativeSelectOption(_props: NativeSelectOptionProps): React.ReactElement | null {
  return null
}

export function NativeSelectOptGroup(_props: {
  label: string
  disabled?: boolean
  children?: React.ReactNode
}): React.ReactElement | null {
  return null
}

type Opt = { value: string; label: string; disabled?: boolean; group?: string }

function collect(children: React.ReactNode, group?: string, groupDisabled?: boolean): Opt[] {
  const out: Opt[] = []
  React.Children.forEach(children, (c) => {
    if (!React.isValidElement(c)) return
    const p = c.props as Record<string, unknown>
    if (c.type === NativeSelectOptGroup) {
      out.push(...collect(p.children as React.ReactNode, p.label as string, !!p.disabled))
    } else if (c.type === NativeSelectOption) {
      out.push({
        value: p.value as string,
        label: String(p.children ?? p.value),
        disabled: !!p.disabled || groupDisabled,
        group,
      })
    }
  })
  return out
}

export type NativeSelectProps = {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  size?: "sm" | "default"
  disabled?: boolean
  style?: StyleProp<ViewStyle>
  accessibilityLabel?: string
  children?: React.ReactNode
}

/**
 * Platform select. On web it renders a real `<select>`; on iOS/Android it
 * opens a bottom sheet list (the platform-native pattern for pickers).
 */
export function NativeSelect({
  value,
  defaultValue,
  onValueChange,
  placeholder,
  size = "default",
  disabled,
  style,
  accessibilityLabel,
  children,
}: NativeSelectProps) {
  const theme = useTheme()
  const options = collect(children)
  const [current, setCurrent] = useControllableState<string | undefined>({
    value,
    defaultValue: defaultValue ?? (placeholder ? undefined : options[0]?.value),
    onChange: (v) => v !== undefined && onValueChange?.(v),
  })
  const [open, setOpen] = React.useState(false)
  const height = size === "sm" ? 36 : 40
  const selected = options.find((o) => o.value === current)

  const box: ViewStyle = {
    height,
    minWidth: 160,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: theme.radius,
    borderWidth: theme.borderWidth,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.secondaryBackground,
    paddingLeft: 12,
    paddingRight: 36,
  }

  if (Platform.OS === "web") {
    const groups: Record<string, Opt[]> = {}
    const order: (string | Opt)[] = []
    for (const o of options) {
      if (o.group) {
        if (!groups[o.group]) {
          groups[o.group] = []
          order.push(o.group)
        }
        groups[o.group].push(o)
      } else order.push(o)
    }
    const renderOpt = (o: Opt) =>
      React.createElement("option", { key: o.value, value: o.value, disabled: o.disabled }, o.label)
    return (
      <View style={[{ alignSelf: "flex-start" }, disabled && { opacity: 0.5 }, style]}>
        {React.createElement(
          "select",
          {
            value: current ?? "",
            disabled,
            "aria-label": accessibilityLabel,
            onChange: (e: { target: { value: string } }) => setCurrent(e.target.value),
            style: {
              ...box,
              appearance: "none",
              WebkitAppearance: "none",
              borderStyle: "solid",
              color: theme.colors.foreground,
              fontSize: 14,
              fontFamily: theme.fonts.base ?? "inherit",
              fontWeight: theme.fontWeight.base,
              cursor: disabled ? "not-allowed" : "pointer",
              width: "100%",
            },
          },
          placeholder
            ? React.createElement("option", { value: "", disabled: true }, placeholder)
            : null,
          order.map((o) =>
            typeof o === "string"
              ? React.createElement("optgroup", { key: o, label: o }, groups[o].map(renderOpt))
              : renderOpt(o),
          ),
        )}
        <View pointerEvents="none" style={{ position: "absolute", right: 12, top: (height - 16) / 2 }}>
          <ChevronDownIcon size={16} />
        </View>
      </View>
    )
  }

  return (
    <>
      <Pressable
        accessibilityRole="combobox"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ disabled, expanded: open }}
        disabled={disabled}
        onPress={() => setOpen(true)}
        style={[box, disabled && { opacity: 0.5 }, style]}
      >
        <Text size="sm" numberOfLines={1} style={!selected && { opacity: 0.5 }}>
          {selected?.label ?? placeholder ?? ""}
        </Text>
        <View style={{ position: "absolute", right: 12 }}>
          <ChevronDownIcon size={16} />
        </View>
      </Pressable>
      <PickerSheet
        open={open}
        onClose={() => setOpen(false)}
        options={options}
        value={current}
        onSelect={(v) => {
          setCurrent(v)
          setOpen(false)
        }}
      />
    </>
  )
}

function PickerSheet({
  open,
  onClose,
  options,
  value,
  onSelect,
}: {
  open: boolean
  onClose: () => void
  options: Opt[]
  value?: string
  onSelect: (v: string) => void
}) {
  const theme = useTheme()
  const { height } = useWindowDimensions()
  const { mounted, progress } = usePresence(open, 200)
  let lastGroup: string | undefined
  return (
    <OverlayRoot open={mounted} onClose={onClose}>
      <Backdrop progress={progress} color={theme.colors.overlay} onPress={onClose} />
      <Animated.View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          maxHeight: height * 0.6,
          backgroundColor: theme.colors.background,
          borderTopWidth: theme.borderWidth,
          borderColor: theme.colors.border,
          borderTopLeftRadius: theme.radius,
          borderTopRightRadius: theme.radius,
          paddingBottom: 24,
          transform: [
            { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [height * 0.6, 0] }) },
          ],
        }}
      >
        <ScrollView contentContainerStyle={{ padding: 8 }}>
          {options.map((o) => {
            const header =
              o.group && o.group !== lastGroup ? (
                <Text
                  key={`g-${o.group}`}
                  weight="heading"
                  size="sm"
                  style={{ paddingHorizontal: 8, paddingVertical: 6 }}
                >
                  {o.group}
                </Text>
              ) : null
            lastGroup = o.group
            const active = o.value === value
            return (
              <React.Fragment key={o.value}>
                {header}
                <Pressable
                  accessibilityRole="menuitem"
                  accessibilityState={{ selected: active, disabled: o.disabled }}
                  disabled={o.disabled}
                  onPress={() => onSelect(o.value)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: 12,
                    paddingHorizontal: 12,
                    borderRadius: theme.radius,
                    borderWidth: theme.borderWidth,
                    borderColor: active ? theme.colors.border : "transparent",
                    backgroundColor: active ? theme.colors.main : "transparent",
                    opacity: o.disabled ? 0.5 : 1,
                  }}
                >
                  <Text
                    style={[
                      fontFor(theme, "base"),
                      { flex: 1, fontSize: 16, color: active ? theme.colors.mainForeground : theme.colors.foreground },
                    ]}
                  >
                    {o.label}
                  </Text>
                  {active ? <CheckIcon size={16} color={theme.colors.mainForeground} /> : null}
                </Pressable>
              </React.Fragment>
            )
          })}
        </ScrollView>
      </Animated.View>
    </OverlayRoot>
  )
}
