import * as React from "react"
import { Platform, View, type TextStyle, type ViewProps, type ViewStyle } from "react-native"
import { renderText, TextStyleProvider, type TextProps, Text } from "../lib/text"
import { mergeRefs, type TextInputRef } from "../lib/utils"
import { useTheme } from "../theme/ThemeProvider"
import { Button, type ButtonProps } from "./button"
import { Input, type InputProps } from "./input"
import { Textarea } from "./textarea"

type Ctx = { setFocused: (f: boolean) => void; disabled?: boolean; focusInput: () => void; registerInput: (r: TextInputRef | null) => void }
const InputGroupContext = React.createContext<Ctx | null>(null)
const AddonContext = React.createContext<InputGroupAddonAlign | null>(null)

export type InputGroupProps = ViewProps & { disabled?: boolean; invalid?: boolean }

/** An input with addons (icons, text, buttons) inside one bordered box. */
export function InputGroup({ disabled, invalid, style, children, ...props }: InputGroupProps) {
  const theme = useTheme()
  const [focused, setFocused] = React.useState(false)
  const input = React.useRef<TextInputRef | null>(null)
  let block = false
  // Yoga has no CSS `order`, so place start/end addons explicitly
  const starts: React.ReactNode[] = []
  const middle: React.ReactNode[] = []
  const ends: React.ReactNode[] = []
  React.Children.forEach(children, (c) => {
    if (!React.isValidElement<{ align?: string }>(c)) {
      middle.push(c)
      return
    }
    const align = c.type === InputGroupAddon ? (c.props.align ?? "inline-start") : null
    if (align === "block-start" || align === "block-end" || c.type === InputGroupTextarea) block = true
    if (align === "inline-start" || align === "block-start") starts.push(c)
    else if (align === "inline-end" || align === "block-end") ends.push(c)
    else middle.push(c)
  })
  return (
    <InputGroupContext.Provider
      value={{
        setFocused,
        disabled,
        focusInput: () => input.current?.focus(),
        registerInput: (r) => {
          input.current = r
        },
      }}
    >
      <View
        style={[
          {
            width: "100%",
            minHeight: 40,
            flexDirection: block ? "column" : "row",
            alignItems: block ? "stretch" : "center",
            borderRadius: theme.radius,
            borderWidth: theme.borderWidth,
            borderColor: invalid ? theme.colors.danger : theme.colors.border,
            backgroundColor: theme.colors.secondaryBackground,
          },
          disabled && { opacity: 0.5 },
          Platform.OS === "web" && focused
            ? ({ outlineWidth: 2, outlineStyle: "solid", outlineColor: theme.colors.ring, outlineOffset: 2 } as ViewStyle)
            : null,
          style,
        ]}
        {...props}
      >
        <TextStyleProvider value={{ color: theme.colors.foreground, fontSize: 14, lineHeight: 20, iconSize: 16 }}>
          {starts}
          {middle}
          {ends}
        </TextStyleProvider>
      </View>
    </InputGroupContext.Provider>
  )
}

export type InputGroupAddonAlign = "inline-start" | "inline-end" | "block-start" | "block-end"

export function InputGroupAddon({
  align = "inline-start",
  style,
  children,
  ...props
}: ViewProps & { align?: InputGroupAddonAlign }) {
  const ctx = React.useContext(InputGroupContext)
  const pad: ViewStyle =
    align === "inline-start"
      ? { paddingLeft: 12 }
      : align === "inline-end"
        ? { paddingRight: 12 }
        : align === "block-start"
          ? { width: "100%", justifyContent: "flex-start", paddingHorizontal: 10, paddingTop: 8 }
          : { width: "100%", justifyContent: "flex-start", paddingHorizontal: 10, paddingBottom: 8 }
  return (
    <AddonContext.Provider value={align}>
      <View
        onTouchEnd={() => ctx?.focusInput()}
        style={[{ flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 6 }, pad, style]}
        {...props}
      >
        {renderText(children)}
      </View>
    </AddonContext.Provider>
  )
}

export function InputGroupText({ style, ...props }: TextProps) {
  return <Text size="sm" style={style} {...props} />
}

export function InputGroupButton({ size = "xs", variant = "noShadow", style, ...props }: ButtonProps) {
  const theme = useTheme()
  const align = React.useContext(AddonContext)
  const edge: ViewStyle | null =
    align === "inline-end"
      ? {
          height: "100%",
          borderRadius: 0,
          borderTopRightRadius: theme.radius - theme.borderWidth,
          borderBottomRightRadius: theme.radius - theme.borderWidth,
          borderWidth: 0,
          borderLeftWidth: theme.borderWidth,
          paddingHorizontal: 12,
        }
      : align === "inline-start"
        ? {
            height: "100%",
            borderRadius: 0,
            borderTopLeftRadius: theme.radius - theme.borderWidth,
            borderBottomLeftRadius: theme.radius - theme.borderWidth,
            borderWidth: 0,
            borderRightWidth: theme.borderWidth,
            paddingHorizontal: 12,
          }
        : null
  return <Button size={size} variant={variant} style={[edge, style]} {...props} />
}

function useGroupInputProps(props: InputProps, ref: React.Ref<TextInputRef>) {
  const ctx = React.useContext(InputGroupContext)
  return {
    ref: mergeRefs(ref, (r: TextInputRef | null) => ctx?.registerInput(r)),
    unstyled: true,
    disabled: props.disabled ?? ctx?.disabled,
    onFocus: (e: Parameters<NonNullable<InputProps["onFocus"]>>[0]) => {
      ctx?.setFocused(true)
      props.onFocus?.(e)
    },
    onBlur: (e: Parameters<NonNullable<InputProps["onBlur"]>>[0]) => {
      ctx?.setFocused(false)
      props.onBlur?.(e)
    },
  }
}

export const InputGroupInput = React.forwardRef<TextInputRef, InputProps>(function InputGroupInput(
  { style, ...props },
  ref,
) {
  const extra = useGroupInputProps(props, ref)
  return <Input {...props} {...extra} style={[{ flex: 1, minWidth: 0, opacity: 1 }, style as TextStyle]} />
})

export const InputGroupTextarea = React.forwardRef<TextInputRef, InputProps>(function InputGroupTextarea(
  { style, ...props },
  ref,
) {
  const extra = useGroupInputProps(props, ref)
  return <Textarea {...props} {...extra} style={[{ opacity: 1 }, style as TextStyle]} />
})
