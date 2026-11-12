import * as React from "react"
import { Pressable, View, type StyleProp, type TextStyle, type ViewProps, type ViewStyle } from "react-native"
import { CheckIcon } from "../icons"
import { renderText, Text, TextStyleProvider, type TextProps } from "../lib/text"
import { useControllableState } from "../lib/utils"
import { useTheme } from "../theme/ThemeProvider"
import { Button, type ButtonProps } from "./button"
import { Input, type InputProps } from "./input"

export type QuestionnaireValues = Record<string, string | string[]>

type ItemDef = { name: string; required?: boolean }

type Ctx = {
  items: readonly ItemDef[]
  item: string
  setItem: (name: string) => void
  values: QuestionnaireValues
  setValue: (name: string, value: string | string[]) => void
  errors: Record<string, string | undefined>
  setError: (name: string, error?: string) => void
  submit: () => void
  next: () => boolean
  previous: () => void
  skip: () => void
}

const QContext = React.createContext<Ctx | null>(null)
const ItemContext = React.createContext<{ name: string; type: "radio" | "checkbox" | "text"; required?: boolean } | null>(null)

function useQ() {
  const ctx = React.useContext(QContext)
  if (!ctx) throw new Error("Questionnaire components must be used within <Questionnaire>")
  return ctx
}

export function useQuestionnaire() {
  return useQ()
}

export type QuestionnaireProps = ViewProps & {
  /** Ordered list of steps. */
  items: readonly ItemDef[]
  /** Active step name. */
  item?: string
  defaultItem?: string
  onItemChange?: (name: string) => void
  values?: QuestionnaireValues
  defaultValues?: QuestionnaireValues
  onValuesChange?: (values: QuestionnaireValues) => void
  onSubmit?: (values: QuestionnaireValues) => void
  /** Message shown when a required step is empty. */
  requiredMessage?: string
}

/** Multi-step survey: one question at a time with choices or free text. */
export function Questionnaire({
  items,
  item,
  defaultItem,
  onItemChange,
  values,
  defaultValues = {},
  onValuesChange,
  onSubmit,
  requiredMessage = "Please answer this question.",
  style,
  children,
  ...props
}: QuestionnaireProps) {
  const [current, setCurrent] = useControllableState({
    value: item,
    defaultValue: defaultItem ?? items[0]?.name ?? "",
    onChange: onItemChange,
  })
  const [vals, setVals] = useControllableState<QuestionnaireValues>({
    value: values,
    defaultValue: defaultValues,
    onChange: onValuesChange,
  })
  const [errors, setErrors] = React.useState<Record<string, string | undefined>>({})
  const index = items.findIndex((i) => i.name === current)

  const validate = () => {
    const def = items[index]
    if (!def?.required) return true
    const v = vals[def.name]
    const empty = v === undefined || v === "" || (Array.isArray(v) && v.length === 0)
    if (empty) setErrors((e) => ({ ...e, [def.name]: requiredMessage }))
    return !empty
  }

  const ctx: Ctx = {
    items,
    item: current,
    setItem: setCurrent,
    values: vals,
    setValue: (name, value) => {
      setVals({ ...vals, [name]: value })
      setErrors((e) => ({ ...e, [name]: undefined }))
    },
    errors,
    setError: (name, error) => setErrors((e) => ({ ...e, [name]: error })),
    next: () => {
      if (!validate()) return false
      if (index < items.length - 1) setCurrent(items[index + 1].name)
      return true
    },
    previous: () => {
      if (index > 0) setCurrent(items[index - 1].name)
    },
    skip: () => {
      if (index < items.length - 1) setCurrent(items[index + 1].name)
    },
    submit: () => {
      if (validate()) onSubmit?.(vals)
    },
  }
  return (
    <QContext.Provider value={ctx}>
      <View style={[{ width: "100%", minWidth: 0, gap: 24 }, style]} {...props}>
        {children}
      </View>
    </QContext.Provider>
  )
}

/** "1 of 3" (or render function). */
export function QuestionnaireProgress({
  children,
  style,
  ...props
}: Omit<TextProps, "children"> & { children?: (step: number, total: number) => React.ReactNode }) {
  const ctx = useQ()
  const step = ctx.items.findIndex((i) => i.name === ctx.item) + 1
  return (
    <Text size="xs" style={[{ fontVariant: ["tabular-nums"] }, style]} {...props}>
      {children ? children(step, ctx.items.length) : `${step} of ${ctx.items.length}`}
    </Text>
  )
}

export type QuestionnaireItemProps = ViewProps & {
  name: string
  /** `radio` (single choice, default), `checkbox` (multiple) or `text`. */
  type?: "radio" | "checkbox" | "text"
  required?: boolean
}

export function QuestionnaireItem({ name, type = "radio", required, style, ...props }: QuestionnaireItemProps) {
  const ctx = useQ()
  if (ctx.item !== name) return null
  return (
    <ItemContext.Provider value={{ name, type, required }}>
      <View accessibilityRole="none" style={[{ minWidth: 0, gap: 20 }, style]} {...props} />
    </ItemContext.Provider>
  )
}

export function QuestionnaireTitle({ style, ...props }: TextProps) {
  return <Text weight="heading" size="base" accessibilityRole="header" style={[{ lineHeight: 22 }, style]} {...props} />
}

export function QuestionnaireDescription({ style, ...props }: TextProps) {
  return <Text size="sm" style={[{ marginTop: -12 }, style]} {...props} />
}

export function QuestionnaireChoices({ style, ...props }: ViewProps) {
  const item = React.useContext(ItemContext)
  return (
    <View
      accessibilityRole={item?.type === "checkbox" ? "none" : "radiogroup"}
      style={[{ minWidth: 0, gap: 12 }, style]}
      {...props}
    />
  )
}

export type QuestionnaireChoiceProps = {
  value: string
  /** Keyboard-style hint shown on the right (e.g. "1"). */
  shortcut?: string
  disabled?: boolean
  style?: StyleProp<ViewStyle>
  textStyle?: StyleProp<TextStyle>
  children?: React.ReactNode
}

export function QuestionnaireChoice({ value, shortcut, disabled, style, textStyle, children }: QuestionnaireChoiceProps) {
  const theme = useTheme()
  const ctx = useQ()
  const item = React.useContext(ItemContext)
  if (!item) return null
  const v = ctx.values[item.name]
  const multiple = item.type === "checkbox"
  const checked = multiple ? Array.isArray(v) && v.includes(value) : v === value
  const bw = theme.borderWidth
  return (
    <Pressable
      accessibilityRole={multiple ? "checkbox" : "radio"}
      accessibilityState={{ checked, disabled }}
      disabled={disabled}
      onPress={() => {
        if (multiple) {
          const arr = Array.isArray(v) ? v : []
          ctx.setValue(item.name, checked ? arr.filter((x) => x !== value) : [...arr, value])
        } else ctx.setValue(item.name, value)
      }}
      style={[
        {
          minHeight: 44,
          flexDirection: "row",
          alignItems: "flex-start",
          gap: 12,
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderRadius: theme.radius,
          borderWidth: bw,
          borderColor: theme.colors.border,
          backgroundColor: checked ? theme.colors.background : theme.colors.secondaryBackground,
        },
        disabled && { opacity: 0.5 },
        style,
      ]}
    >
      <View
        style={{
          width: 16,
          height: 16,
          marginTop: 2,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: multiple ? theme.radius : 9999,
          borderWidth: bw,
          borderColor: theme.colors.border,
          backgroundColor: checked && multiple ? theme.colors.main : theme.colors.secondaryBackground,
        }}
      >
        {checked ? (
          multiple ? (
            <CheckIcon size={12} color={theme.colors.mainForeground} strokeWidth={3} />
          ) : (
            <View style={{ width: 8, height: 8, borderRadius: 9999, backgroundColor: theme.colors.foreground }} />
          )
        ) : null}
      </View>
      <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
        <TextStyleProvider value={{ color: theme.colors.foreground, fontSize: 14, lineHeight: 20 }}>
          {renderText(children, textStyle)}
        </TextStyleProvider>
      </View>
      {shortcut ? (
        <View
          style={{
            width: 20,
            height: 20,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 9999,
            borderWidth: bw,
            borderColor: theme.colors.border,
            backgroundColor: checked ? theme.colors.background : theme.colors.secondaryBackground,
          }}
        >
          <Text style={{ fontSize: 11, lineHeight: 12 }}>{shortcut}</Text>
        </View>
      ) : null}
    </Pressable>
  )
}

export function QuestionnaireChoiceDescription(props: TextProps) {
  return <Text size="sm" {...props} />
}

/** Free-text answer for `type="text"` items. */
export function QuestionnaireInput(props: InputProps) {
  const ctx = useQ()
  const item = React.useContext(ItemContext)
  if (!item) return null
  const v = ctx.values[item.name]
  return (
    <Input
      value={typeof v === "string" ? v : ""}
      onChangeText={(t) => ctx.setValue(item.name, t)}
      invalid={!!ctx.errors[item.name]}
      onSubmitEditing={() => ctx.next()}
      {...props}
    />
  )
}

export function QuestionnaireError({ style, children, ...props }: TextProps) {
  const theme = useTheme()
  const ctx = useQ()
  const item = React.useContext(ItemContext)
  const error = item ? ctx.errors[item.name] : undefined
  if (!error && !children) return null
  if (!error) return null
  return (
    <Text accessibilityRole="alert" size="sm" style={[{ marginTop: 8, color: theme.colors.danger }, style]} {...props}>
      {children ?? error}
    </Text>
  )
}

export function QuestionnaireActions({ style, ...props }: ViewProps) {
  return (
    <View
      style={[{ width: "100%", minHeight: 44, flexDirection: "row", alignItems: "center", gap: 8 }, style]}
      {...props}
    />
  )
}

export function QuestionnairePrevious({ children = "Back", variant = "neutral", ...props }: ButtonProps) {
  const ctx = useQ()
  const first = ctx.items[0]?.name === ctx.item
  return (
    <Button variant={variant} disabled={first} onPress={() => ctx.previous()} style={{ marginRight: "auto" }} {...props}>
      {children}
    </Button>
  )
}

export function QuestionnaireSkip({ children = "Skip", variant = "noShadow", ...props }: ButtonProps) {
  const ctx = useQ()
  return (
    <Button variant={variant} onPress={() => ctx.skip()} {...props}>
      {children}
    </Button>
  )
}

export function QuestionnaireNext({ children = "Next", ...props }: ButtonProps) {
  const ctx = useQ()
  const last = ctx.items[ctx.items.length - 1]?.name === ctx.item
  if (last) return null
  return (
    <Button onPress={() => ctx.next()} {...props}>
      {children}
    </Button>
  )
}

export function QuestionnaireSubmit({ children = "Submit", ...props }: ButtonProps) {
  const ctx = useQ()
  const last = ctx.items[ctx.items.length - 1]?.name === ctx.item
  if (!last) return null
  return (
    <Button onPress={() => ctx.submit()} {...props}>
      {children}
    </Button>
  )
}
