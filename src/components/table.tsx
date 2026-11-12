import * as React from "react"
import {
  Pressable,
  ScrollView,
  View,
  type PressableProps,
  type StyleProp,
  type TextStyle,
  type ViewProps,
  type ViewStyle,
} from "react-native"
import { renderText, Text, TextStyleProvider, type TextProps } from "../lib/text"
import { useTheme } from "../theme/ThemeProvider"

const RowContext = React.createContext<{ last: boolean; section: "header" | "body" | "footer" }>({
  last: false,
  section: "body",
})
const SelectedContext = React.createContext(false)

export type TableProps = ViewProps & {
  /**
   * Minimum width of the table. When wider than the screen the table
   * scrolls horizontally (`overflow-auto` on the web wrapper).
   */
  minWidth?: number
  containerStyle?: StyleProp<ViewStyle>
}

/** Flexbox table. Cells are `flex: 1` by default; give them `style={{ flex: 2 }}` or a fixed `width`. */
export function Table({ minWidth, style, containerStyle, children, ...props }: TableProps) {
  const theme = useTheme()
  const table = (
    <View
      accessibilityRole="grid"
      style={[
        {
          width: "100%",
          minWidth,
          borderWidth: theme.borderWidth,
          borderColor: theme.colors.border,
        },
        style,
      ]}
      {...props}
    >
      <TextStyleProvider value={{ color: theme.colors.foreground, fontSize: 14, lineHeight: 20 }}>
        {children}
      </TextStyleProvider>
    </View>
  )
  if (!minWidth) return <View style={containerStyle}>{table}</View>
  return (
    <ScrollView
      horizontal
      style={containerStyle}
      contentContainerStyle={{ minWidth: "100%" }}
      showsHorizontalScrollIndicator
    >
      {table}
    </ScrollView>
  )
}

function Section({
  section,
  children,
}: {
  section: "header" | "body" | "footer"
  children?: React.ReactNode
}) {
  const items = React.Children.toArray(children)
  return (
    <>
      {items.map((c, i) => (
        <RowContext.Provider key={i} value={{ last: i === items.length - 1, section }}>
          {c}
        </RowContext.Provider>
      ))}
    </>
  )
}

export function TableHeader({ style, children, ...props }: ViewProps) {
  return (
    <View style={style} {...props}>
      <Section section="header">{children}</Section>
    </View>
  )
}

export function TableBody({ style, children, ...props }: ViewProps) {
  return (
    <View style={style} {...props}>
      <Section section="body">{children}</Section>
    </View>
  )
}

export function TableFooter({ style, children, ...props }: ViewProps) {
  const theme = useTheme()
  return (
    <View
      style={[
        { borderTopWidth: theme.borderWidth, borderColor: theme.colors.border, backgroundColor: theme.colors.background },
        style,
      ]}
      {...props}
    >
      <Section section="footer">{children}</Section>
    </View>
  )
}

export type TableRowProps = Omit<PressableProps, "style" | "children"> & {
  /** `data-[state=selected]` */
  selected?: boolean
  style?: StyleProp<ViewStyle>
  children?: React.ReactNode
}

export function TableRow({ selected, style, children, onPress, ...props }: TableRowProps) {
  const theme = useTheme()
  const { last, section } = React.useContext(RowContext)
  const noBorder = (section === "body" || section === "footer") && last
  const row: ViewStyle = {
    flexDirection: "row",
    alignItems: "stretch",
    borderBottomWidth: noBorder ? 0 : theme.borderWidth,
    borderColor: theme.colors.border,
    backgroundColor: selected ? theme.colors.main : theme.colors.background,
  }
  const content = (
    <SelectedContext.Provider value={!!selected}>
      <TextStyleProvider
        value={{ color: selected ? theme.colors.mainForeground : theme.colors.foreground }}
      >
        {children}
      </TextStyleProvider>
    </SelectedContext.Provider>
  )
  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected }}
        onPress={onPress}
        style={[row, style]}
        {...props}
      >
        {content}
      </Pressable>
    )
  }
  return (
    <View accessibilityRole="none" style={[row, style]} {...(props as ViewProps)}>
      {content}
    </View>
  )
}

export type TableCellProps = ViewProps & { textStyle?: StyleProp<TextStyle> }

export function TableHead({ style, textStyle, children, ...props }: TableCellProps) {
  return (
    <View
      accessibilityRole="header"
      style={[{ flex: 1, minHeight: 48, paddingHorizontal: 16, justifyContent: "center" }, style]}
      {...props}
    >
      <TextStyleProvider value={{ weight: "heading" }}>{renderText(children, textStyle)}</TextStyleProvider>
    </View>
  )
}

export function TableCell({ style, textStyle, children, ...props }: TableCellProps) {
  return (
    <View style={[{ flex: 1, padding: 16, justifyContent: "center" }, style]} {...props}>
      {renderText(children, textStyle)}
    </View>
  )
}

export function TableCaption({ style, ...props }: TextProps) {
  return <Text size="sm" style={[{ marginTop: 16, textAlign: "center" }, style]} {...props} />
}
