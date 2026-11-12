import * as React from "react"
import { View, type ViewProps } from "react-native"
import { TextStyleProvider } from "../lib/text"
import { Trigger, type TriggerProps } from "../lib/trigger"
import { composeHandlers, type ViewRef } from "../lib/utils"
import { useTheme } from "../theme/ThemeProvider"
import { Button, type ButtonProps } from "./button"
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  ModalPanel,
  useCompact,
  useDialog,
  type DialogProps,
} from "./dialog"

const SizeContext = React.createContext<"default" | "sm">("default")

/** Like Dialog, but can't be dismissed by tapping outside. */
export function AlertDialog(props: DialogProps) {
  return <Dialog {...props} />
}

export const AlertDialogTrigger = React.forwardRef<ViewRef, TriggerProps>(
  function AlertDialogTrigger({ onPress, ...props }, ref) {
    const { setOpen } = useDialog()
    return <Trigger ref={ref} onPress={composeHandlers(onPress, () => setOpen(true))} {...props} />
  },
)

export function AlertDialogContent({
  style,
  children,
  size = "default",
}: ViewProps & { size?: "default" | "sm" }) {
  const { open, setOpen } = useDialog()
  const compact = useCompact()
  return (
    <SizeContext.Provider value={size}>
      <ModalPanel
        open={open}
        onDismiss={() => setOpen(false)}
        dismissable={false}
        accessibilityRole="alert"
        maxWidth={size === "sm" && !compact ? 384 : 512}
        style={style}
      >
        {children}
      </ModalPanel>
    </SizeContext.Provider>
  )
}

export function AlertDialogHeader({ style, ...props }: ViewProps) {
  const size = React.useContext(SizeContext)
  return (
    <TextStyleProvider value={size === "sm" ? { textAlign: "center" } : {}}>
      <DialogHeader style={[size === "sm" && { alignItems: "center" }, style]} {...props} />
    </TextStyleProvider>
  )
}

export function AlertDialogFooter({ style, children, ...props }: ViewProps) {
  const size = React.useContext(SizeContext)
  if (size === "sm") {
    return (
      <View style={[{ flexDirection: "row", gap: 12 }, style]} {...props}>
        {React.Children.map(children, (c) => (
          <View style={{ flex: 1 }}>{c}</View>
        ))}
      </View>
    )
  }
  return (
    <DialogFooter style={style} {...props}>
      {children}
    </DialogFooter>
  )
}

export function AlertDialogMedia({ style, children, ...props }: ViewProps) {
  const theme = useTheme()
  const size = React.useContext(SizeContext)
  const compact = useCompact()
  const dim = compact ? 48 : 40
  return (
    <View
      style={[
        {
          width: dim,
          height: dim,
          marginBottom: 8,
          alignItems: "center",
          justifyContent: "center",
          alignSelf: compact || size === "sm" ? "center" : "flex-start",
          borderRadius: theme.radius,
          borderWidth: theme.borderWidth,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.main,
        },
        style,
      ]}
      {...props}
    >
      <TextStyleProvider value={{ color: theme.colors.mainForeground, iconSize: compact ? 24 : 20 }}>
        {children}
      </TextStyleProvider>
    </View>
  )
}

export const AlertDialogTitle = DialogTitle
export const AlertDialogDescription = DialogDescription

export function AlertDialogAction({ onPress, ...props }: ButtonProps) {
  const { setOpen } = useDialog()
  return <Button onPress={composeHandlers(onPress, () => setOpen(false))} {...props} />
}

export function AlertDialogCancel({ onPress, variant = "neutral", ...props }: ButtonProps) {
  const { setOpen } = useDialog()
  return (
    <Button variant={variant} onPress={composeHandlers(onPress, () => setOpen(false))} {...props} />
  )
}
