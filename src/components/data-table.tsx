import * as React from "react"
import { Pressable, View, type StyleProp, type ViewStyle } from "react-native"
import { ArrowUpDownIcon, ChevronDownIcon } from "../icons"
import { Text } from "../lib/text"
import { Button } from "./button"
import { Checkbox } from "./checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./dropdown-menu"
import { Input } from "./input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table"

export type DataTableColumn<T> = {
  /** Unique id; also the data key when `accessor` is omitted. */
  key: string
  header?: React.ReactNode
  accessor?: (row: T) => unknown
  cell?: (row: T, index: number) => React.ReactNode
  sortable?: boolean
  /** Allow hiding via the "Columns" menu. Default true. */
  hideable?: boolean
  /** Flex grow (default 1) or fixed width. */
  flex?: number
  width?: number
  align?: "left" | "right" | "center"
}

export type DataTableProps<T> = {
  data: T[]
  columns: DataTableColumn<T>[]
  /** Unique row id. Defaults to the index. */
  getRowId?: (row: T, index: number) => string
  /** Column key used by the filter input. Omit to hide the filter. */
  filterKey?: string
  filterPlaceholder?: string
  /** Adds a checkbox column. */
  selectable?: boolean
  onSelectionChange?: (ids: string[]) => void
  /** Rows per page. Default 10. */
  pageSize?: number
  /** Show the "Columns" visibility menu. Default true. */
  columnToggle?: boolean
  emptyText?: string
  /** Min table width before it scrolls horizontally. */
  minWidth?: number
  style?: StyleProp<ViewStyle>
}

type Sort = { key: string; dir: "asc" | "desc" } | null

/**
 * Batteries-included data table (the neobrutalism.dev TanStack example as
 * a component): filter, sort, select, toggle columns and paginate.
 */
export function DataTable<T>({
  data,
  columns,
  getRowId = (_r, i) => String(i),
  filterKey,
  filterPlaceholder = "Filter...",
  selectable,
  onSelectionChange,
  pageSize = 10,
  columnToggle = true,
  emptyText = "No results.",
  minWidth,
  style,
}: DataTableProps<T>) {
  const [filter, setFilter] = React.useState("")
  const [sort, setSort] = React.useState<Sort>(null)
  const [hidden, setHidden] = React.useState<Record<string, boolean>>({})
  const [selected, setSelected] = React.useState<Record<string, boolean>>({})
  const [page, setPage] = React.useState(0)

  const valueOf = React.useCallback(
    (row: T, key: string) => {
      const col = columns.find((c) => c.key === key)
      return col?.accessor ? col.accessor(row) : (row as Record<string, unknown>)[key]
    },
    [columns],
  )

  const rows = React.useMemo(() => {
    let out = data.map((row, i) => ({ row, id: getRowId(row, i), index: i }))
    if (filterKey && filter)
      out = out.filter(({ row }) => String(valueOf(row, filterKey) ?? "").toLowerCase().includes(filter.toLowerCase()))
    if (sort) {
      out = [...out].sort((a, b) => {
        const va = valueOf(a.row, sort.key)
        const vb = valueOf(b.row, sort.key)
        const cmp =
          typeof va === "number" && typeof vb === "number"
            ? va - vb
            : String(va ?? "").localeCompare(String(vb ?? ""), undefined, { numeric: true })
        return sort.dir === "asc" ? cmp : -cmp
      })
    }
    return out
  }, [data, filter, filterKey, sort, valueOf, getRowId])

  const pageCount = Math.max(Math.ceil(rows.length / pageSize), 1)
  const current = Math.min(page, pageCount - 1)
  const pageRows = rows.slice(current * pageSize, current * pageSize + pageSize)
  const visibleCols = columns.filter((c) => !hidden[c.key])
  const selectedIds = Object.keys(selected).filter((k) => selected[k])
  const allOnPage = pageRows.length > 0 && pageRows.every((r) => selected[r.id])
  const someOnPage = pageRows.some((r) => selected[r.id])

  const updateSelection = (next: Record<string, boolean>) => {
    setSelected(next)
    onSelectionChange?.(Object.keys(next).filter((k) => next[k]))
  }

  const colStyle = (c: DataTableColumn<T>): ViewStyle =>
    c.width ? { flex: 0, width: c.width } : { flex: c.flex ?? 1 }
  const alignStyle = (c: DataTableColumn<T>): ViewStyle => ({
    alignItems: c.align === "right" ? "flex-end" : c.align === "center" ? "center" : "flex-start",
  })

  return (
    <View style={[{ width: "100%", gap: 16 }, style]}>
      {filterKey || columnToggle ? (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          {filterKey ? (
            <Input
              placeholder={filterPlaceholder}
              value={filter}
              onChangeText={(t) => {
                setFilter(t)
                setPage(0)
              }}
              style={{ flex: 1, maxWidth: 384 }}
            />
          ) : (
            <View style={{ flex: 1 }} />
          )}
          {columnToggle ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="noShadow" style={{ marginLeft: "auto" }}>
                  Columns
                  <ChevronDownIcon size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {columns
                  .filter((c) => c.hideable !== false)
                  .map((c) => (
                    <DropdownMenuCheckboxItem
                      key={c.key}
                      checked={!hidden[c.key]}
                      onCheckedChange={(v) => setHidden((h) => ({ ...h, [c.key]: !v }))}
                    >
                      {typeof c.header === "string" ? c.header : c.key}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </View>
      ) : null}

      <Table minWidth={minWidth}>
        <TableHeader>
          <TableRow>
            {selectable ? (
              <TableHead style={{ flex: 0, width: 48, paddingHorizontal: 16 }}>
                <Checkbox
                  accessibilityLabel="Select all"
                  checked={allOnPage ? true : someOnPage ? "indeterminate" : false}
                  onCheckedChange={() => {
                    // all selected -> clear the page, otherwise select the whole page
                    const next = { ...selected }
                    pageRows.forEach((r) => (next[r.id] = !allOnPage))
                    updateSelection(next)
                  }}
                />
              </TableHead>
            ) : null}
            {visibleCols.map((c) => (
              <TableHead key={c.key} style={[colStyle(c), alignStyle(c)]}>
                {c.sortable ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityHint="Sort"
                    onPress={() =>
                      setSort((s) =>
                        s?.key === c.key ? (s.dir === "asc" ? { key: c.key, dir: "desc" } : null) : { key: c.key, dir: "asc" },
                      )
                    }
                    style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
                  >
                    <Text weight="heading">{c.header ?? c.key}</Text>
                    <ArrowUpDownIcon size={14} />
                  </Pressable>
                ) : (
                  (c.header ?? c.key)
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {pageRows.length ? (
            pageRows.map(({ row, id, index }) => (
              <TableRow key={id} selected={!!selected[id]}>
                {selectable ? (
                  <TableCell style={{ flex: 0, width: 48, paddingHorizontal: 16 }}>
                    <Checkbox
                      accessibilityLabel="Select row"
                      checked={!!selected[id]}
                      onCheckedChange={(v) => updateSelection({ ...selected, [id]: v })}
                    />
                  </TableCell>
                ) : null}
                {visibleCols.map((c) => (
                  <TableCell key={c.key} style={[colStyle(c), alignStyle(c)]}>
                    {c.cell ? c.cell(row, index) : String(valueOf(row, c.key) ?? "")}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell style={{ height: 96, alignItems: "center" }}>{emptyText}</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
        {selectable ? (
          <Text size="sm" style={{ flex: 1 }}>
            {selectedIds.length} of {rows.length} row(s) selected.
          </Text>
        ) : (
          <Text size="sm" style={{ flex: 1 }}>
            Page {current + 1} of {pageCount}
          </Text>
        )}
        <Button variant="noShadow" size="sm" disabled={current <= 0} onPress={() => setPage(current - 1)}>
          Previous
        </Button>
        <Button variant="noShadow" size="sm" disabled={current >= pageCount - 1} onPress={() => setPage(current + 1)}>
          Next
        </Button>
      </View>
    </View>
  )
}
