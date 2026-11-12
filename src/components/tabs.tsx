import * as React from "react"
import {
  Pressable,
  View,
  type PressableProps,
  type StyleProp,
  type TextStyle,
  type ViewProps,
  type ViewStyle,
} from "react-native"
import { renderText, TextStyleProvider } from "../lib/text"
import { useControllableState, type ViewRef } from "../lib/utils"
import { useTheme } from "../theme/ThemeProvider"

type TabsCtx = {
  value: string | undefined
  setValue: (v: string) => void
  orientation: "horizontal" | "vertical"
}
const TabsContext = React.createContext<TabsCtx | null>(null)
const ListContext = React.createContext<{ variant: "default" | "line" }>({ variant: "default" })

function useTabs() {
  const ctx = React.useContext(TabsContext)
  if (!ctx) throw new Error("Tabs components must be used within <Tabs>")
  return ctx
}

export type TabsProps = ViewProps & {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  orientation?: "horizontal" | "vertical"
}

export function Tabs({
  value,
  defaultValue,
  onValueChange,
  orientation = "horizontal",
  style,
  ...props
}: TabsProps) {
  const [current, setCurrent] = useControllableState<string | undefined>({
    value,
    defaultValue,
    onChange: (v) => v !== undefined && onValueChange?.(v),
  })
  return (
    <TabsContext.Provider value={{ value: current, setValue: setCurrent, orientation }}>
      <View
        style={[
          { width: "100%" },
          orientation === "vertical" && { flexDirection: "row", alignItems: "flex-start", gap: 8 },
          style,
        ]}
        {...props}
      />
    </TabsContext.Provider>
  )
}

export type TabsListProps = ViewProps & { variant?: "default" | "line" }

export function TabsList({ variant = "default", style, ...props }: TabsListProps) {
  const theme = useTheme()
  const { orientation } = useTabs()
  const vertical = orientation === "vertical"
  return (
    <ListContext.Provider value={{ variant }}>
      <View
        accessibilityRole="tablist"
        style={[
          {
            flexDirection: vertical ? "column" : "row",
            alignItems: vertical ? "stretch" : "center",
            justifyContent: "center",
          },
          variant === "default"
            ? {
                height: vertical ? undefined : 48,
                borderRadius: theme.radius,
                borderWidth: theme.borderWidth,
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.background,
                padding: 4,
              }
            : {
                gap: 4,
                borderColor: theme.colors.border,
                ...(vertical ? { borderRightWidth: theme.borderWidth } : { borderBottomWidth: theme.borderWidth }),
              },
          style,
        ]}
        {...props}
      />
    </ListContext.Provider>
  )
}

export type TabsTriggerProps = Omit<PressableProps, "style" | "children"> & {
  value: string
  disabled?: boolean
  style?: StyleProp<ViewStyle>
  textStyle?: StyleProp<TextStyle>
  children?: React.ReactNode
}

export const TabsTrigger = React.forwardRef<ViewRef, TabsTriggerProps>(function TabsTrigger(
  { value, disabled, style, textStyle, children, onPress, ...props },
  ref,
) {
  const theme = useTheme()
  const ctx = useTabs()
  const { variant } = React.useContext(ListContext)
  const active = ctx.value === value
  const line = variant === "line"
  const vertical = ctx.orientation === "vertical"
  return (
    <Pressable
      ref={ref}
      accessibilityRole="tab"
      accessibilityState={{ selected: active, disabled }}
      disabled={disabled}
      onPress={(e) => {
        onPress?.(e)
        ctx.setValue(value)
      }}
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: vertical ? "flex-start" : "center",
          gap: 6,
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: theme.radius,
          borderWidth: theme.borderWidth,
          borderColor: active && !line ? theme.colors.border : "transparent",
          backgroundColor: active && !line ? theme.colors.main : "transparent",
        },
        !line && !vertical && { flex: 1, height: "100%" },
        disabled && { opacity: 0.5 },
        style,
      ]}
      {...props}
    >
      <TextStyleProvider
        value={{
          color: active && !line ? theme.colors.mainForeground : theme.colors.foreground,
          fontSize: 14,
          lineHeight: 20,
          weight: "heading",
        }}
      >
        {renderText(children, textStyle, { numberOfLines: 1 })}
      </TextStyleProvider>
      {line && active ? (
        <View
          pointerEvents="none"
          style={[
            { position: "absolute", backgroundColor: theme.colors.main },
            vertical
              ? { top: 0, bottom: 0, right: -theme.borderWidth - 2, width: 4 }
              : { left: 0, right: 0, bottom: -theme.borderWidth - 2, height: 4 },
          ]}
        />
      ) : null}
    </Pressable>
  )
})

export type TabsContentProps = ViewProps & {
  value: string
  /** Keep inactive panels mounted (hidden). Default false. */
  keepMounted?: boolean
}

export function TabsContent({ value, keepMounted, style, ...props }: TabsContentProps) {
  const ctx = useTabs()
  const active = ctx.value === value
  if (!active && !keepMounted) return null
  return (
    <View
      accessibilityRole="none"
      style={[
        ctx.orientation === "vertical" ? { flex: 1 } : { marginTop: 8 },
        !active && { display: "none" },
        style,
      ]}
      {...props}
    />
  )
}
