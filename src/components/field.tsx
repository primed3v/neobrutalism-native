import * as React from "react"
import { View, useWindowDimensions, type ViewProps } from "react-native"
import { renderText, Text, TextStyleProvider, type TextProps } from "../lib/text"
import { useTheme } from "../theme/ThemeProvider"
import { Label, type LabelProps } from "./label"

const FieldContext = React.createContext<{ invalid?: boolean; disabled?: boolean } | null>(null)

export function useField() {
  return React.useContext(FieldContext)
}

export function FieldSet({ style, ...props }: ViewProps) {
  return <View style={[{ gap: 16 }, style]} {...props} />
}

export function FieldLegend({
  variant = "legend",
  style,
  ...props
}: TextProps & { variant?: "legend" | "label" }) {
  return (
    <Text
      weight="heading"
      size={variant === "label" ? "sm" : "base"}
      accessibilityRole="header"
      style={[{ marginBottom: 6 }, style]}
      {...props}
    />
  )
}

export function FieldGroup({ style, ...props }: ViewProps) {
  return <View style={[{ width: "100%", gap: 20 }, style]} {...props} />
}

export type FieldProps = ViewProps & {
  orientation?: "vertical" | "horizontal" | "responsive"
  invalid?: boolean
  disabled?: boolean
}

export function Field({ orientation = "vertical", invalid, disabled, style, children, ...props }: FieldProps) {
  const theme = useTheme()
  const { width } = useWindowDimensions()
  const horizontal = orientation === "horizontal" || (orientation === "responsive" && width >= 768)
  return (
    <FieldContext.Provider value={{ invalid, disabled }}>
      <View
        accessibilityRole="none"
        style={[
          { width: "100%", gap: 8 },
          horizontal ? { flexDirection: "row", alignItems: "center" } : { flexDirection: "column" },
          disabled && { opacity: 0.5 },
          style,
        ]}
        {...props}
      >
        <TextStyleProvider value={invalid ? { color: theme.colors.danger } : {}}>{children}</TextStyleProvider>
      </View>
    </FieldContext.Provider>
  )
}

export function FieldContent({ style, children, ...props }: ViewProps) {
  return (
    <View style={[{ flex: 1, gap: 2 }, style]} {...props}>
      {renderText(children)}
    </View>
  )
}

export function FieldLabel({ disabled, ...props }: LabelProps) {
  const field = useField()
  return <Label disabled={disabled ?? field?.disabled} {...props} />
}

export function FieldTitle({ style, ...props }: TextProps) {
  return <Text weight="heading" size="sm" style={style} {...props} />
}

export function FieldDescription({ style, ...props }: TextProps) {
  return <Text size="sm" style={[{ lineHeight: 21 }, style]} {...props} />
}

export function FieldSeparator({ style, children, ...props }: ViewProps) {
  const theme = useTheme()
  return (
    <View style={[{ height: 20, justifyContent: "center", marginVertical: -8 }, style]} {...props}>
      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 9,
          borderTopWidth: theme.borderWidth,
          borderColor: theme.colors.border,
        }}
      />
      {children ? (
        <View style={{ alignSelf: "center", backgroundColor: theme.colors.background, paddingHorizontal: 8 }}>
          {renderText(children, { fontSize: 14 })}
        </View>
      ) : null}
    </View>
  )
}

export type FieldErrorProps = ViewProps & {
  /** Error objects, e.g. from react-hook-form / zod. */
  errors?: ({ message?: string } | undefined)[]
}

export function FieldError({ errors, style, children, ...props }: FieldErrorProps) {
  const theme = useTheme()
  const messages = [
    ...new Set((errors ?? []).map((e) => e?.message).filter((m): m is string => !!m)),
  ]
  if (!children && messages.length === 0) return null
  return (
    <View accessibilityRole="alert" style={[{ gap: 4 }, style]} {...props}>
      <TextStyleProvider value={{ color: theme.colors.danger, fontSize: 14, lineHeight: 20 }}>
        {children
          ? renderText(children)
          : messages.length === 1
            ? <Text>{messages[0]}</Text>
            : messages.map((m) => (
                <Text key={m} style={{ marginLeft: 16 }}>
                  {"•"} {m}
                </Text>
              ))}
      </TextStyleProvider>
    </View>
  )
}
