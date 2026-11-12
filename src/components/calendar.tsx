import * as React from "react"
import { Pressable, View, type StyleProp, type ViewStyle } from "react-native"
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "../icons"
import { Surface } from "../lib/surface"
import { Text, TextStyleProvider } from "../lib/text"
import { useTheme } from "../theme/ThemeProvider"
import { withAlpha } from "../theme/theme"
import { Button, buttonVariantStyle } from "./button"
import { NativeSelect, NativeSelectOption } from "./native-select"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"

// ---------- tiny date helpers (no dependency) ----------

export const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
export const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1)
export const addMonths = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth() + n, 1)
export const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
export const isSameDay = (a?: Date | null, b?: Date | null) =>
  !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
const isBefore = (a: Date, b: Date) => startOfDay(a).getTime() < startOfDay(b).getTime()

const EN_MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
const EN_DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

function monthName(month: number, locale?: string) {
  try {
    if (locale && typeof Intl !== "undefined")
      return new Intl.DateTimeFormat(locale, { month: "long" }).format(new Date(2020, month, 1))
  } catch {}
  return EN_MONTHS[month]
}

function weekdayName(day: number, locale?: string) {
  try {
    if (locale && typeof Intl !== "undefined")
      // 2023-01-01 was a Sunday
      return new Intl.DateTimeFormat(locale, { weekday: "short" }).format(new Date(2023, 0, 1 + day)).slice(0, 2)
  } catch {}
  return EN_DAYS[day]
}

export function formatDate(d: Date, locale?: string) {
  try {
    if (typeof Intl !== "undefined")
      return new Intl.DateTimeFormat(locale, { year: "numeric", month: "long", day: "numeric" }).format(d)
  } catch {}
  return `${EN_MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
}

// ---------- types ----------

export type DateRange = { from?: Date; to?: Date }
export type Matcher = Date | Date[] | ((date: Date) => boolean) | { before?: Date; after?: Date }

type Common = {
  month?: Date
  defaultMonth?: Date
  onMonthChange?: (month: Date) => void
  disabled?: Matcher
  showOutsideDays?: boolean
  /** 0 = Sunday */
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6
  numberOfMonths?: number
  /** `dropdown` shows month/year selects instead of a label. */
  captionLayout?: "label" | "dropdown"
  fromYear?: number
  toYear?: number
  /** BCP-47 locale for names (uses Intl when available). */
  locale?: string
  style?: StyleProp<ViewStyle>
  /** Disable the hard shadow. */
  shadow?: boolean
}

export type CalendarProps = Common &
  (
    | { mode?: "single"; selected?: Date; onSelect?: (date: Date | undefined) => void; required?: boolean }
    | { mode: "multiple"; selected?: Date[]; onSelect?: (dates: Date[]) => void; required?: boolean }
    | { mode: "range"; selected?: DateRange; onSelect?: (range: DateRange | undefined) => void; required?: boolean }
  )

function matches(date: Date, m?: Matcher): boolean {
  if (!m) return false
  if (m instanceof Date) return isSameDay(date, m)
  if (Array.isArray(m)) return m.some((d) => isSameDay(d, date))
  if (typeof m === "function") return m(date)
  if (m.before && isBefore(date, m.before)) return true
  if (m.after && isBefore(m.after, date)) return true
  return false
}

export function Calendar(props: CalendarProps) {
  const {
    month: monthProp,
    defaultMonth,
    onMonthChange,
    disabled,
    showOutsideDays = true,
    weekStartsOn = 0,
    numberOfMonths = 1,
    captionLayout = "label",
    fromYear,
    toYear,
    locale,
    style,
    shadow = true,
  } = props
  const theme = useTheme()
  const mode = props.mode ?? "single"
  const fromSelection =
    mode === "single" && props.selected instanceof Date
      ? props.selected
      : mode === "range"
        ? (props.selected as DateRange | undefined)?.from
        : undefined
  const initial = defaultMonth ?? fromSelection ?? new Date()
  const [monthState, setMonthState] = React.useState(startOfMonth(initial))
  const month = monthProp ? startOfMonth(monthProp) : monthState
  const setMonth = (m: Date) => {
    if (!monthProp) setMonthState(m)
    onMonthChange?.(m)
  }

  const isSelected = (d: Date): "single" | "start" | "end" | "middle" | null => {
    if (mode === "single") return isSameDay(props.selected as Date | undefined, d) ? "single" : null
    if (mode === "multiple") return ((props.selected as Date[] | undefined) ?? []).some((s) => isSameDay(s, d)) ? "single" : null
    const r = (props.selected as DateRange | undefined) ?? {}
    if (r.from && r.to) {
      if (isSameDay(r.from, d) && isSameDay(r.to, d)) return "single"
      if (isSameDay(r.from, d)) return "start"
      if (isSameDay(r.to, d)) return "end"
      if (!isBefore(d, r.from) && isBefore(d, r.to)) return "middle"
      return null
    }
    return isSameDay(r.from, d) ? "single" : null
  }

  const select = (d: Date) => {
    if (mode === "single") {
      const cur = props.selected as Date | undefined
      const fn = props.onSelect as ((d: Date | undefined) => void) | undefined
      fn?.(isSameDay(cur, d) && !props.required ? undefined : d)
    } else if (mode === "multiple") {
      const cur = (props.selected as Date[] | undefined) ?? []
      const fn = props.onSelect as ((d: Date[]) => void) | undefined
      fn?.(cur.some((s) => isSameDay(s, d)) ? cur.filter((s) => !isSameDay(s, d)) : [...cur, d])
    } else {
      const r = (props.selected as DateRange | undefined) ?? {}
      const fn = props.onSelect as ((r: DateRange | undefined) => void) | undefined
      if (!r.from || (r.from && r.to)) fn?.({ from: d, to: undefined })
      else if (isBefore(d, r.from)) fn?.({ from: d, to: r.from })
      else fn?.({ from: r.from, to: d })
    }
  }

  const years: number[] = []
  const y0 = fromYear ?? month.getFullYear() - 100
  const y1 = toYear ?? month.getFullYear() + 10
  for (let y = y0; y <= y1; y++) years.push(y)

  const navBtn = buttonVariantStyle(theme, "noShadow", "icon-xs")

  return (
    <Surface
      shadow={shadow}
      style={[
        {
          alignSelf: "flex-start",
          padding: 12,
          borderRadius: theme.radius,
          borderWidth: theme.borderWidth,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.background,
        },
        style,
      ]}
    >
      <TextStyleProvider value={{ color: theme.colors.foreground, fontSize: 14, lineHeight: 20 }}>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 16 }}>
          {Array.from({ length: numberOfMonths }, (_, mi) => {
            const m = addMonths(month, mi)
            const first = m
            const offset = (first.getDay() - weekStartsOn + 7) % 7
            const gridStart = addDays(first, -offset)
            const weeks: Date[][] = []
            for (let w = 0; w < 6; w++) {
              const row: Date[] = []
              for (let i = 0; i < 7; i++) row.push(addDays(gridStart, w * 7 + i))
              if (w >= 4 && row.every((d) => d.getMonth() !== m.getMonth())) break
              weeks.push(row)
            }
            return (
              <View key={mi} style={{ gap: 16 }}>
                <View style={{ height: 28, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                  {mi === 0 ? (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Go to the Previous Month"
                      onPress={() => setMonth(addMonths(month, -1))}
                      style={[navBtn.container, { width: 28, height: 28, backgroundColor: theme.colors.secondaryBackground }]}
                    >
                      <ChevronLeftIcon size={16} />
                    </Pressable>
                  ) : (
                    <View style={{ width: 28 }} />
                  )}
                  {captionLayout === "dropdown" ? (
                    <View style={{ flexDirection: "row", gap: 6 }}>
                      <NativeSelect
                        size="sm"
                        value={String(m.getMonth())}
                        onValueChange={(v) => setMonth(addMonths(new Date(m.getFullYear(), Number(v), 1), -mi))}
                        style={{ minWidth: 0 }}
                        accessibilityLabel="Month"
                      >
                        {EN_MONTHS.map((_, i) => (
                          <NativeSelectOption key={i} value={String(i)}>
                            {monthName(i, locale).slice(0, 3)}
                          </NativeSelectOption>
                        ))}
                      </NativeSelect>
                      <NativeSelect
                        size="sm"
                        value={String(m.getFullYear())}
                        onValueChange={(v) => setMonth(addMonths(new Date(Number(v), m.getMonth(), 1), -mi))}
                        style={{ minWidth: 0 }}
                        accessibilityLabel="Year"
                      >
                        {years.map((y) => (
                          <NativeSelectOption key={y} value={String(y)}>
                            {String(y)}
                          </NativeSelectOption>
                        ))}
                      </NativeSelect>
                    </View>
                  ) : (
                    <Text weight="heading" size="sm" accessibilityRole="header">
                      {monthName(m.getMonth(), locale)} {m.getFullYear()}
                    </Text>
                  )}
                  {mi === numberOfMonths - 1 ? (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Go to the Next Month"
                      onPress={() => setMonth(addMonths(month, 1))}
                      style={[navBtn.container, { width: 28, height: 28, backgroundColor: theme.colors.secondaryBackground }]}
                    >
                      <ChevronRightIcon size={16} />
                    </Pressable>
                  ) : (
                    <View style={{ width: 28 }} />
                  )}
                </View>
                <View>
                  <View style={{ flexDirection: "row" }}>
                    {Array.from({ length: 7 }, (_, i) => (
                      <Text key={i} style={{ width: 36, textAlign: "center", fontSize: 12.8 }}>
                        {weekdayName((i + weekStartsOn) % 7, locale)}
                      </Text>
                    ))}
                  </View>
                  {weeks.map((row, wi) => (
                    <View key={wi} style={{ flexDirection: "row", marginTop: 8 }}>
                      {row.map((d, di) => {
                        const outside = d.getMonth() !== m.getMonth()
                        if (outside && !showOutsideDays) return <View key={di} style={{ width: 36, height: 36 }} />
                        const sel = isSelected(d)
                        const isDisabled = matches(d, disabled)
                        const today = isSameDay(d, new Date())
                        const r = theme.radius
                        const joined: ViewStyle =
                          sel === "start"
                            ? { borderTopRightRadius: 0, borderBottomRightRadius: 0, borderRightWidth: 0 }
                            : sel === "end"
                              ? { borderTopLeftRadius: 0, borderBottomLeftRadius: 0, borderLeftWidth: 0 }
                              : sel === "middle"
                                ? { borderRadius: 0, borderLeftWidth: 0, borderRightWidth: 0 }
                                : {}
                        return (
                          <Pressable
                            key={di}
                            accessibilityRole="button"
                            accessibilityLabel={formatDate(d, locale)}
                            accessibilityState={{ selected: !!sel, disabled: isDisabled }}
                            disabled={isDisabled}
                            onPress={() => {
                              if (outside) setMonth(addMonths(startOfMonth(d), -mi))
                              select(d)
                            }}
                            style={[
                              {
                                width: 36,
                                height: 36,
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: r,
                                borderWidth: theme.borderWidth,
                                borderColor: outside && !sel ? "transparent" : theme.colors.border,
                                backgroundColor:
                                  sel === "middle"
                                    ? withAlpha(theme.colors.main, 0.5)
                                    : sel
                                      ? theme.colors.main
                                      : outside
                                        ? "transparent"
                                        : theme.colors.secondaryBackground,
                              },
                              joined,
                              isDisabled && { opacity: 0.5 },
                            ]}
                          >
                            <Text
                              style={[
                                {
                                  color: sel ? theme.colors.mainForeground : theme.colors.foreground,
                                  opacity: outside && !sel ? 0.5 : 1,
                                },
                                today && !sel && { textDecorationLine: "underline" },
                              ]}
                            >
                              {d.getDate()}
                            </Text>
                          </Pressable>
                        )
                      })}
                    </View>
                  ))}
                </View>
              </View>
            )
          })}
        </View>
      </TextStyleProvider>
    </Surface>
  )
}

export type DatePickerProps = {
  value?: Date
  onValueChange?: (date: Date | undefined) => void
  placeholder?: string
  locale?: string
  /** Formats the trigger label. */
  format?: (date: Date) => string
  disabled?: Matcher
  width?: number
  calendarProps?: Omit<Common, "style">
}

/** Button + popover calendar (the neobrutalism.dev date-picker recipe). */
export function DatePicker({
  value,
  onValueChange,
  placeholder = "Pick a date",
  locale,
  format,
  disabled,
  width = 280,
  calendarProps,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [internal, setInternal] = React.useState<Date | undefined>(value)
  const current = value !== undefined ? value : internal
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="noShadow" style={{ width, justifyContent: "flex-start" }}>
          <CalendarIcon size={16} />
          <Text numberOfLines={1}>{current ? (format ? format(current) : formatDate(current, locale)) : placeholder}</Text>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" style={{ width: "auto", padding: 0, borderWidth: 0, backgroundColor: "transparent" }}>
        <Calendar
          mode="single"
          selected={current}
          onSelect={(d) => {
            setInternal(d)
            onValueChange?.(d)
            setOpen(false)
          }}
          disabled={disabled}
          locale={locale}
          shadow={false}
          {...calendarProps}
        />
      </PopoverContent>
    </Popover>
  )
}
