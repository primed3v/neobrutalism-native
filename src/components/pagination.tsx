import * as React from "react"
import { Pressable, View, type PressableProps, type StyleProp, type TextStyle, type ViewProps, type ViewStyle } from "react-native"
import { ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon } from "../icons"
import { renderText, Text, TextStyleProvider } from "../lib/text"
import { useTheme } from "../theme/ThemeProvider"
import { buttonVariantStyle } from "./button"

export function Pagination({ style, ...props }: ViewProps) {
  return (
    <View
      accessibilityRole="none"
      accessibilityLabel="pagination"
      style={[{ width: "100%", flexDirection: "row", justifyContent: "center" }, style]}
      {...props}
    />
  )
}

export function PaginationContent({ style, ...props }: ViewProps) {
  return <View style={[{ flexDirection: "row", alignItems: "center", gap: 4 }, style]} {...props} />
}

export function PaginationItem(props: ViewProps) {
  return <View {...props} />
}

export type PaginationLinkProps = Omit<PressableProps, "style" | "children"> & {
  isActive?: boolean
  size?: "default" | "sm" | "lg" | "icon"
  style?: StyleProp<ViewStyle>
  textStyle?: StyleProp<TextStyle>
  children?: React.ReactNode
}

export function PaginationLink({
  isActive,
  size = "icon",
  style,
  textStyle,
  children,
  ...props
}: PaginationLinkProps) {
  const theme = useTheme()
  const v = buttonVariantStyle(theme, "noShadow", size)
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityState={{ selected: isActive }}
      style={[
        v.container,
        { backgroundColor: isActive ? theme.colors.main : theme.colors.background },
        style,
      ]}
      {...props}
    >
      <TextStyleProvider
        value={{
          color: isActive ? theme.colors.mainForeground : theme.colors.foreground,
          fontSize: v.fontSize,
          iconSize: v.iconSize,
        }}
      >
        {renderText(children, textStyle, { numberOfLines: 1 })}
      </TextStyleProvider>
    </Pressable>
  )
}

export function PaginationPrevious({
  style,
  label = "Previous",
  ...props
}: PaginationLinkProps & { label?: string }) {
  return (
    <PaginationLink
      accessibilityLabel="Go to previous page"
      size="default"
      style={[{ gap: 4, paddingLeft: 10 }, style]}
      {...props}
    >
      <ChevronLeftIcon size={16} />
      <Text>{label}</Text>
    </PaginationLink>
  )
}

export function PaginationNext({
  style,
  label = "Next",
  ...props
}: PaginationLinkProps & { label?: string }) {
  return (
    <PaginationLink
      accessibilityLabel="Go to next page"
      size="default"
      style={[{ gap: 4, paddingRight: 10 }, style]}
      {...props}
    >
      <Text>{label}</Text>
      <ChevronRightIcon size={16} />
    </PaginationLink>
  )
}

export function PaginationEllipsis({ style, ...props }: ViewProps) {
  return (
    <View
      accessibilityLabel="More pages"
      style={[{ width: 36, height: 36, alignItems: "center", justifyContent: "center" }, style]}
      {...props}
    >
      <MoreHorizontalIcon size={16} />
    </View>
  )
}
