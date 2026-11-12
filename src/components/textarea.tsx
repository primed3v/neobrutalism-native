import * as React from "react"
import type { TextInputRef } from "../lib/utils"
import { Input, type InputProps } from "./input"

export type TextareaProps = InputProps

/** Multiline Input (`min-h-[80px]`). */
export const Textarea = React.forwardRef<TextInputRef, TextareaProps>(function Textarea(
  { style, numberOfLines = 4, ...props },
  ref,
) {
  return (
    <Input
      ref={ref}
      multiline
      numberOfLines={numberOfLines}
      textAlignVertical="top"
      style={[{ minHeight: 80 }, style]}
      {...props}
    />
  )
})
