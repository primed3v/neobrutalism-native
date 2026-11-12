import * as React from "react"
import {
  Pressable,
  ScrollView,
  TextInput,
  View,
  type PressableProps,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewProps,
  type ViewStyle,
} from "react-native"
import { SearchIcon } from "../icons"
import { fontFor, renderText, Text, TextStyleProvider, type TextProps } from "../lib/text"
import { useControllableState, useStableId, webStyle, type TextInputRef } from "../lib/utils"
import { useTheme } from "../theme/ThemeProvider"
import { withAlpha } from "../theme/theme"
import { useDialog, ModalPanel, Dialog, type DialogProps } from "./dialog"

/** Default filter: every search word must appear in the value or keywords. */
export function defaultCommandFilter(value: string, search: string, keywords: string[] = []) {
  const haystack = [value, ...keywords].join(" ").toLowerCase()
  return search
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => haystack.includes(word))
}

type CommandCtx = {
  search: string
  setSearch: (s: string) => void
  filter: (value: string, search: string, keywords?: string[]) => boolean
  shouldFilter: boolean
  register: (id: string, group: string | null, matches: boolean) => void
  unregister: (id: string) => void
  count: number
  groupCounts: Record<string, number>
  dense: boolean
}

const CommandContext = React.createContext<CommandCtx | null>(null)
const GroupContext = React.createContext<string | null>(null)

function useCommand() {
  const ctx = React.useContext(CommandContext)
  if (!ctx) throw new Error("Command components must be used within <Command>")
  return ctx
}

export type CommandProps = ViewProps & {
  /** Controlled search text. */
  value?: string
  onValueChange?: (search: string) => void
  /** Custom filter. Return true to show the item. */
  filter?: (value: string, search: string, keywords?: string[]) => boolean
  /** Set false to do your own filtering. */
  shouldFilter?: boolean
  /** Larger items, used by CommandDialog. */
  dense?: boolean
}

/** Searchable command list (a cmdk port). */
export function Command({
  value,
  onValueChange,
  filter = defaultCommandFilter,
  shouldFilter = true,
  dense = false,
  style,
  children,
  ...props
}: CommandProps) {
  const theme = useTheme()
  const [search, setSearch] = useControllableState({
    value,
    defaultValue: "",
    onChange: onValueChange,
  })
  const registry = React.useRef(new Map<string, { group: string | null; matches: boolean }>())
  const [summary, setSummary] = React.useState({ count: 0, groupCounts: {} as Record<string, number> })
  const recompute = React.useCallback(() => {
    let count = 0
    const groupCounts: Record<string, number> = {}
    registry.current.forEach(({ group, matches }) => {
      if (!matches) return
      count++
      if (group) groupCounts[group] = (groupCounts[group] ?? 0) + 1
    })
    setSummary((prev) => {
      const same =
        prev.count === count &&
        Object.keys(groupCounts).length === Object.keys(prev.groupCounts).length &&
        Object.entries(groupCounts).every(([k, v]) => prev.groupCounts[k] === v)
      return same ? prev : { count, groupCounts }
    })
  }, [])
  const ctx: CommandCtx = {
    search,
    setSearch,
    filter,
    shouldFilter,
    dense,
    count: summary.count,
    groupCounts: summary.groupCounts,
    register: (id, group, matches) => {
      registry.current.set(id, { group, matches })
      recompute()
    },
    unregister: (id) => {
      registry.current.delete(id)
      recompute()
    },
  }
  return (
    <CommandContext.Provider value={ctx}>
      <View
        style={[
          {
            width: "100%",
            overflow: "hidden",
            borderWidth: theme.borderWidth,
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.background,
          },
          style,
        ]}
        {...props}
      >
        <TextStyleProvider value={{ color: theme.colors.foreground, fontSize: 14, lineHeight: 20 }}>
          {children}
        </TextStyleProvider>
      </View>
    </CommandContext.Provider>
  )
}

export const CommandInput = React.forwardRef<
  TextInputRef,
  TextInputProps & { containerStyle?: StyleProp<ViewStyle> }
>(function CommandInput({ containerStyle, style, placeholderTextColor, ...props }, ref) {
  const theme = useTheme()
  const ctx = useCommand()
  return (
    <View
      style={[
        {
          height: ctx.dense ? 48 : 40,
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          paddingHorizontal: 12,
          borderBottomWidth: theme.borderWidth,
          borderColor: theme.colors.border,
        },
        containerStyle,
      ]}
    >
      <SearchIcon size={ctx.dense ? 20 : 16} />
      <TextInput
        ref={ref}
        value={ctx.search}
        onChangeText={ctx.setSearch}
        autoCorrect={false}
        autoCapitalize="none"
        placeholderTextColor={placeholderTextColor ?? withAlpha(theme.colors.foreground, 0.5)}
        selectionColor={theme.colors.main}
        style={[
          {
            flex: 1,
            height: "100%",
            fontSize: 14,
            paddingVertical: 0,
            color: theme.colors.foreground,
            ...fontFor(theme, "base"),
          },
          webStyle<TextStyle>({ outlineStyle: "none" }),
          style,
        ]}
        {...props}
      />
    </View>
  )
})

export function CommandList({ style, children, ...props }: ViewProps) {
  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      style={[{ maxHeight: 300 }, style]}
      {...(props as object)}
    >
      {children}
    </ScrollView>
  )
}

export function CommandEmpty({ style, children, ...props }: TextProps) {
  const ctx = useCommand()
  if (ctx.count > 0) return null
  return (
    <Text size="sm" style={[{ paddingVertical: 24, textAlign: "center" }, style]} {...props}>
      {children}
    </Text>
  )
}

export function CommandGroup({
  heading,
  style,
  children,
  ...props
}: ViewProps & { heading?: React.ReactNode }) {
  const ctx = useCommand()
  const id = useStableId("cmd-group")
  const hidden = ctx.search && ctx.shouldFilter && !ctx.groupCounts[id]
  return (
    <GroupContext.Provider value={id}>
      <View
        accessibilityRole="list"
        style={[{ padding: ctx.dense ? 8 : 8, overflow: "hidden" }, hidden ? { display: "none" } : null, style]}
        {...props}
      >
        {heading ? (
          typeof heading === "string" ? (
            <Text weight="heading" size="base" style={{ paddingHorizontal: 8, paddingVertical: 6, marginBottom: ctx.dense ? 4 : 0 }}>
              {heading}
            </Text>
          ) : (
            heading
          )
        ) : null}
        {children}
      </View>
    </GroupContext.Provider>
  )
}

export function CommandSeparator({ style, ...props }: ViewProps) {
  const theme = useTheme()
  const ctx = useCommand()
  if (ctx.search) return null
  return (
    <View
      style={[{ height: 2, marginHorizontal: -4, backgroundColor: theme.colors.border }, style]}
      {...props}
    />
  )
}

function textOf(node: React.ReactNode): string {
  let out = ""
  React.Children.forEach(node, (c) => {
    if (typeof c === "string" || typeof c === "number") out += c
    else if (React.isValidElement<{ children?: React.ReactNode }>(c)) out += textOf(c.props.children)
  })
  return out.trim()
}

export type CommandItemProps = Omit<PressableProps, "style" | "children" | "onPress"> & {
  /** Value used for filtering + onSelect. Defaults to the text content. */
  value?: string
  keywords?: string[]
  onSelect?: (value: string) => void
  disabled?: boolean
  /** Force the highlighted style (e.g. keyboard selection). */
  selected?: boolean
  style?: StyleProp<ViewStyle>
  textStyle?: StyleProp<TextStyle>
  children?: React.ReactNode
}

export function CommandItem({
  value,
  keywords,
  onSelect,
  disabled,
  selected,
  style,
  textStyle,
  children,
  ...props
}: CommandItemProps) {
  const theme = useTheme()
  const ctx = useCommand()
  const group = React.useContext(GroupContext)
  const id = useStableId("cmd-item")
  const itemValue = value ?? textOf(children)
  const matches = !ctx.shouldFilter || !ctx.search || ctx.filter(itemValue, ctx.search, keywords)
  const [hovered, setHovered] = React.useState(false)
  const [pressed, setPressed] = React.useState(false)
  const { register, unregister } = ctx
  React.useLayoutEffect(() => {
    register(id, group, matches)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, group, matches])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => () => unregister(id), [id])
  if (!matches) return null
  const highlighted = selected || hovered || pressed
  return (
    <Pressable
      accessibilityRole="menuitem"
      accessibilityState={{ disabled, selected: highlighted }}
      disabled={disabled}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      onPress={() => onSelect?.(itemValue)}
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          paddingHorizontal: 8,
          paddingVertical: ctx.dense ? 12 : 6,
          borderRadius: theme.radius,
          borderWidth: theme.borderWidth,
          borderColor: highlighted ? theme.colors.border : "transparent",
          backgroundColor: highlighted ? theme.colors.main : "transparent",
        },
        webStyle<ViewStyle>({ cursor: "default" }),
        disabled && { opacity: 0.5 },
        style,
      ]}
      {...props}
    >
      <TextStyleProvider
        value={{
          color: highlighted ? theme.colors.mainForeground : theme.colors.foreground,
          iconSize: ctx.dense ? 20 : 16,
        }}
      >
        {renderText(children, textStyle, { numberOfLines: 1 })}
      </TextStyleProvider>
    </Pressable>
  )
}

export function CommandShortcut({ style, ...props }: TextProps) {
  return <Text size="xs" style={[{ marginLeft: "auto", letterSpacing: 1.6 }, style]} {...props} />
}

export type CommandDialogProps = DialogProps &
  Omit<CommandProps, "children"> & {
    children?: React.ReactNode
  }

/** Command palette in a modal. */
export function CommandDialog({
  open,
  defaultOpen,
  onOpenChange,
  children,
  ...commandProps
}: CommandDialogProps) {
  return (
    <Dialog open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      <CommandDialogPanel {...commandProps}>{children}</CommandDialogPanel>
    </Dialog>
  )
}

function CommandDialogPanel({ children, ...props }: CommandProps) {
  const { open, setOpen } = useDialog()
  return (
    <ModalPanel
      open={open}
      onDismiss={() => setOpen(false)}
      style={{ padding: 0, gap: 0, borderRadius: 0, borderWidth: 0 }}
    >
      <Command dense {...props}>
        {children}
      </Command>
    </ModalPanel>
  )
}
