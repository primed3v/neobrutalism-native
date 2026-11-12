import * as React from "react"
import { View, type StyleProp, type ViewStyle } from "react-native"
import { CheckIcon, ChevronsUpDownIcon } from "../icons"
import { Text } from "../lib/text"
import { useControllableState } from "../lib/utils"
import { Button } from "./button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./command"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"

export type ComboboxOption = { value: string; label: string; keywords?: string[]; disabled?: boolean }

export type ComboboxProps = {
  options: ComboboxOption[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  /** Width of trigger and list. Default 200. */
  width?: number
  disabled?: boolean
  style?: StyleProp<ViewStyle>
}

/**
 * Searchable select built from Popover + Command (the neobrutalism.dev
 * combobox recipe, packaged as one component). Picking the selected item
 * again clears it.
 */
export function Combobox({
  options,
  value,
  defaultValue = "",
  onValueChange,
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
  emptyText = "No results found.",
  width = 200,
  disabled,
  style,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [current, setCurrent] = useControllableState({
    value,
    defaultValue,
    onChange: onValueChange,
  })
  const selected = options.find((o) => o.value === current)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="noShadow"
          disabled={disabled}
          accessibilityRole="combobox"
          accessibilityState={{ expanded: open }}
          style={[{ width, justifyContent: "space-between" }, style]}
        >
          <Text numberOfLines={1} style={{ flexShrink: 1 }}>
            {selected?.label ?? placeholder}
          </Text>
          <ChevronsUpDownIcon size={16} />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" style={{ width, padding: 0, borderWidth: 0 }}>
        <Command>
          <CommandInput placeholder={searchPlaceholder} autoFocus />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((o) => (
                <CommandItem
                  key={o.value}
                  value={o.label}
                  keywords={[o.value, ...(o.keywords ?? [])]}
                  disabled={o.disabled}
                  onSelect={() => {
                    setCurrent(o.value === current ? "" : o.value)
                    setOpen(false)
                  }}
                >
                  <View style={{ opacity: o.value === current ? 1 : 0 }}>
                    <CheckIcon size={16} />
                  </View>
                  <Text numberOfLines={1}>{o.label}</Text>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
