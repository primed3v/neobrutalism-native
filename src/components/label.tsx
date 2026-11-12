import * as React from "react"
import { Text, type TextProps } from "../lib/text"
import type { TextRef } from "../lib/utils"

export type LabelProps = TextProps & {
  disabled?: boolean
}

/** `text-sm font-heading leading-none`. Pair with `nativeID` + `accessibilityLabelledBy`. */
export const Label = React.forwardRef<TextRef, LabelProps>(function Label(
  { disabled, style, ...props },
  ref,
) {
  return (
    <Text
      ref={ref}
      weight="heading"
      style={[{ fontSize: 14, lineHeight: 16 }, disabled && { opacity: 0.7 }, style]}
      {...props}
    />
  )
})
