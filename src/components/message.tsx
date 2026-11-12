import * as React from "react"
import { View, type ViewProps } from "react-native"
import { renderText, TextStyleProvider } from "../lib/text"
import { useTheme } from "../theme/ThemeProvider"

const MessageContext = React.createContext<{ align: "start" | "end" }>({ align: "start" })

export function useMessage() {
  return React.useContext(MessageContext)
}

export function MessageGroup({ style, ...props }: ViewProps) {
  return <View style={[{ minWidth: 0, gap: 8 }, style]} {...props} />
}

export type MessageProps = ViewProps & { align?: "start" | "end" }

/** A chat message row: avatar + content. `align="end"` mirrors it. */
export function Message({ align = "start", style, ...props }: MessageProps) {
  const theme = useTheme()
  return (
    <MessageContext.Provider value={{ align }}>
      <TextStyleProvider value={{ color: theme.colors.foreground, fontSize: 14, lineHeight: 20 }}>
        <View
          style={[
            { width: "100%", minWidth: 0, gap: 8, flexDirection: align === "end" ? "row-reverse" : "row" },
            style,
          ]}
          {...props}
        />
      </TextStyleProvider>
    </MessageContext.Provider>
  )
}

export function MessageAvatar({ style, ...props }: ViewProps) {
  return <View style={[{ flexShrink: 0, alignSelf: "flex-start" }, style]} {...props} />
}

export function MessageContent({ style, ...props }: ViewProps) {
  const { align } = useMessage()
  return (
    <View
      style={[
        { flex: 1, minWidth: 0, gap: 10, alignItems: align === "end" ? "flex-end" : "flex-start" },
        style,
      ]}
      {...props}
    />
  )
}

export function MessageHeader({ style, children, ...props }: ViewProps) {
  return (
    <View
      style={[{ maxWidth: "100%", flexDirection: "row", alignItems: "center", paddingHorizontal: 12, gap: 6 }, style]}
      {...props}
    >
      <TextStyleProvider value={{ fontSize: 12, lineHeight: 16 }}>{renderText(children)}</TextStyleProvider>
    </View>
  )
}

export function MessageFooter({ style, children, ...props }: ViewProps) {
  const { align } = useMessage()
  return (
    <View
      style={[
        {
          maxWidth: "100%",
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 12,
          gap: 6,
          justifyContent: align === "end" ? "flex-end" : "flex-start",
        },
        style,
      ]}
      {...props}
    >
      <TextStyleProvider value={{ fontSize: 12, lineHeight: 16 }}>{renderText(children)}</TextStyleProvider>
    </View>
  )
}
