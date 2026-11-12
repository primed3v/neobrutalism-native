import * as React from "react"
import { View, type ViewProps } from "react-native"
import { Text, type TextProps } from "../lib/text"
import { Slot, useStableId } from "../lib/utils"
import { useTheme } from "../theme/ThemeProvider"
import { Label, type LabelProps } from "./label"

/**
 * Form primitives. They are form-library agnostic: pass the field's
 * `error` from whatever you use. With react-hook-form:
 *
 * ```tsx
 * <Controller control={control} name="username" render={({ field, fieldState }) => (
 *   <FormField name="username" error={fieldState.error?.message}>
 *     <FormItem>
 *       <FormLabel>Username</FormLabel>
 *       <FormControl><Input value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} /></FormControl>
 *       <FormDescription>Your public name.</FormDescription>
 *       <FormMessage />
 *     </FormItem>
 *   </FormField>
 * )} />
 * ```
 */
type FormFieldCtx = { name: string; error?: string; id: string }
const FormFieldContext = React.createContext<FormFieldCtx | null>(null)

export function useFormField() {
  const ctx = React.useContext(FormFieldContext)
  if (!ctx) throw new Error("useFormField should be used within <FormField>")
  return {
    ...ctx,
    formItemId: `${ctx.id}-form-item`,
    formDescriptionId: `${ctx.id}-form-item-description`,
    formMessageId: `${ctx.id}-form-item-message`,
    invalid: !!ctx.error,
  }
}

export function Form({ style, ...props }: ViewProps) {
  return <View style={[{ gap: 24 }, style]} {...props} />
}

export function FormField({
  name,
  error,
  children,
}: {
  name: string
  /** Error message for this field (falsy = valid). */
  error?: string | false | null
  children?: React.ReactNode
}) {
  const id = useStableId(`field-${name}`)
  return (
    <FormFieldContext.Provider value={{ name, error: error || undefined, id }}>
      {children}
    </FormFieldContext.Provider>
  )
}

export function FormItem({ style, ...props }: ViewProps) {
  return <View style={[{ gap: 8 }, style]} {...props} />
}

export function FormLabel({ style, ...props }: LabelProps) {
  const theme = useTheme()
  const { formItemId, invalid } = useFormField()
  return (
    <Label
      nativeID={`${formItemId}-label`}
      style={[invalid && { color: theme.colors.danger }, style]}
      {...props}
    />
  )
}

/** Wires accessibility props + `invalid` into its single child input. */
export function FormControl({ children }: { children?: React.ReactNode }) {
  const { formItemId, invalid } = useFormField()
  return (
    <Slot
      nativeID={formItemId}
      accessibilityLabelledBy={`${formItemId}-label`}
      aria-invalid={invalid}
      invalid={invalid}
    >
      {children}
    </Slot>
  )
}

export function FormDescription({ style, ...props }: TextProps) {
  const { formDescriptionId } = useFormField()
  return <Text nativeID={formDescriptionId} size="sm" style={style} {...props} />
}

export function FormMessage({ style, children, ...props }: TextProps) {
  const theme = useTheme()
  const { error, formMessageId } = useFormField()
  const body = error ?? children
  if (!body) return null
  return (
    <Text
      nativeID={formMessageId}
      accessibilityRole="alert"
      size="sm"
      style={[{ color: theme.colors.danger }, style]}
      {...props}
    >
      {body}
    </Text>
  )
}
