import * as React from "react"
import { View, type ViewProps, type ViewStyle } from "react-native"
import { renderText, TextStyleProvider } from "../lib/text"
import { useTheme } from "../theme/ThemeProvider"

export type ButtonGroupProps = ViewProps & { orientation?: "horizontal" | "vertical" }

/**
 * Joins its children (buttons, inputs, selects...) into one segmented
 * control by squaring inner corners and collapsing shared borders.
 * Children must accept a `style` prop.
 */
export function ButtonGroup({ orientation = "horizontal", style, children, ...props }: ButtonGroupProps) {
  const items = React.Children.toArray(children).filter(React.isValidElement)
  const horizontal = orientation === "horizontal"
  return (
    <View
      accessibilityRole="none"
      style={[
        { flexDirection: horizontal ? "row" : "column", alignItems: "stretch", alignSelf: "flex-start" },
        style,
      ]}
      {...props}
    >
      {items.map((child, i) => {
        if ((child as React.ReactElement).type === ButtonGroupSeparator) return child
        const first = i === 0
        const last = i === items.length - 1
        const join: ViewStyle = horizontal
          ? {
              ...(first ? {} : { borderTopLeftRadius: 0, borderBottomLeftRadius: 0, borderLeftWidth: 0 }),
              ...(last ? {} : { borderTopRightRadius: 0, borderBottomRightRadius: 0 }),
            }
          : {
              ...(first ? {} : { borderTopLeftRadius: 0, borderTopRightRadius: 0, borderTopWidth: 0 }),
              ...(last ? {} : { borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }),
            }
        const el = child as React.ReactElement<{ style?: unknown }>
        return React.cloneElement(el, {
          key: el.key ?? i,
          style: [el.props.style, join],
        })
      })}
    </View>
  )
}

export function ButtonGroupText({ style, children, ...props }: ViewProps) {
  const theme = useTheme()
  return (
    <View
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          paddingHorizontal: 10,
          borderRadius: theme.radius,
          borderWidth: theme.borderWidth,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.secondaryBackground,
        },
        style,
      ]}
      {...props}
    >
      <TextStyleProvider value={{ color: theme.colors.foreground, fontSize: 14, weight: "heading", iconSize: 16 }}>
        {renderText(children)}
      </TextStyleProvider>
    </View>
  )
}

export function ButtonGroupSeparator({
  orientation = "vertical",
  style,
  ...props
}: ViewProps & { orientation?: "horizontal" | "vertical" }) {
  const theme = useTheme()
  return (
    <View
      accessibilityRole="none"
      style={[
        { alignSelf: "stretch", borderColor: theme.colors.border },
        orientation === "horizontal"
          ? { width: "100%", borderTopWidth: theme.borderWidth, marginVertical: 1 }
          : { borderLeftWidth: theme.borderWidth, marginHorizontal: 1 },
        style,
      ]}
      {...props}
    />
  )
}
