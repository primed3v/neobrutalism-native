import * as React from "react"
import {
  Pressable,
  StyleSheet,
  View,
  type PressableProps,
  type ViewProps,
  type ViewStyle,
} from "react-native"
import { Text, TextStyleProvider, type TextProps, renderText } from "../lib/text"
import { useTheme } from "../theme/ThemeProvider"
import { Button, type ButtonProps } from "./button"

type Size = "default" | "sm" | "xs"
type State = "idle" | "uploading" | "done" | "error"
type Orientation = "horizontal" | "vertical"

const AttachmentContext = React.createContext<{ size: Size; state: State; orientation: Orientation }>({
  size: "default",
  state: "done",
  orientation: "horizontal",
})

export type AttachmentProps = ViewProps & {
  size?: Size
  /** `idle` = dashed placeholder, `error` = inverted colors. */
  state?: State
  orientation?: Orientation
}

/** A file chip (name, size, thumbnail, actions). */
export function Attachment({
  size = "default",
  state = "done",
  orientation = "horizontal",
  style,
  children,
  ...props
}: AttachmentProps) {
  const theme = useTheme()
  const error = state === "error"
  const pad: Record<Size, ViewStyle> = {
    default: { gap: 8, padding: 8 },
    sm: { gap: 10, padding: 6 },
    xs: { gap: 6, padding: 4 },
  }
  return (
    <AttachmentContext.Provider value={{ size, state, orientation }}>
      <View
        style={[
          {
            maxWidth: "100%",
            minWidth: 0,
            alignSelf: "flex-start",
            flexDirection: orientation === "vertical" ? "column" : "row",
            alignItems: orientation === "vertical" ? "stretch" : "center",
            borderRadius: theme.radius,
            borderWidth: theme.borderWidth,
            borderStyle: state === "idle" ? "dashed" : "solid",
            borderColor: theme.colors.border,
            backgroundColor: error ? theme.colors.destructive : theme.colors.background,
          },
          orientation === "vertical" && { width: 120 },
          pad[size],
          style,
        ]}
        {...props}
      >
        <TextStyleProvider
          value={{
            color: error ? theme.colors.destructiveForeground : theme.colors.foreground,
            fontSize: size === "default" ? 14 : 12,
            lineHeight: size === "default" ? 18 : 16,
          }}
        >
          {children}
        </TextStyleProvider>
      </View>
    </AttachmentContext.Provider>
  )
}

export function AttachmentMedia({
  variant = "default",
  style,
  children,
  ...props
}: ViewProps & { variant?: "default" | "image" }) {
  const theme = useTheme()
  const { size, orientation, state } = React.useContext(AttachmentContext)
  const vertical = orientation === "vertical"
  const dim = size === "xs" ? 28 : size === "sm" ? 32 : 40
  return (
    <View
      style={[
        {
          width: vertical ? "100%" : dim,
          aspectRatio: 1,
          flexShrink: 0,
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          borderRadius: theme.radius,
          borderWidth: theme.borderWidth,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.secondaryBackground,
        },
        style,
      ]}
      {...props}
    >
      <TextStyleProvider
        value={{
          color: state === "error" ? "#000000" : theme.colors.foreground,
          iconSize: vertical ? 24 : size === "xs" ? 14 : 16,
        }}
      >
        {variant === "image" ? (
          <View style={StyleSheet.absoluteFill}>{children}</View>
        ) : (
          children
        )}
      </TextStyleProvider>
    </View>
  )
}

export function AttachmentContent({ style, children, ...props }: ViewProps) {
  const { orientation } = React.useContext(AttachmentContext)
  return (
    <View
      style={[{ flexShrink: 1, minWidth: 0 }, orientation === "vertical" && { paddingHorizontal: 4 }, style]}
      {...props}
    >
      {renderText(children)}
    </View>
  )
}

export function AttachmentTitle({ style, ...props }: TextProps) {
  return <Text numberOfLines={1} style={style} {...props} />
}

export function AttachmentDescription({ style, ...props }: TextProps) {
  return <Text numberOfLines={1} size="xs" style={[{ marginTop: 2 }, style]} {...props} />
}

export function AttachmentActions({ style, ...props }: ViewProps) {
  const { orientation } = React.useContext(AttachmentContext)
  return (
    <View
      style={[
        { flexDirection: "row", alignItems: "center", zIndex: 20 },
        orientation === "vertical" && { position: "absolute", top: 12, right: 12, gap: 4 },
        style,
      ]}
      {...props}
    />
  )
}

export function AttachmentAction({ style, ...props }: ButtonProps) {
  return (
    <Button
      size="icon-xs"
      variant="noShadow"
      style={[{ width: 24, height: 24, borderWidth: 0, backgroundColor: "transparent" }, style]}
      {...props}
    />
  )
}

/** Invisible full-size pressable (e.g. to open/preview the file). */
export function AttachmentTrigger({ style, ...props }: PressableProps) {
  return (
    <Pressable
      accessibilityRole="button"
      style={(state) => [
        StyleSheet.absoluteFill,
        { zIndex: 10 },
        typeof style === "function" ? style(state) : style,
      ]}
      {...props}
    />
  )
}
