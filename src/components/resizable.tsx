import * as React from "react"
import { PanResponder, View, type ViewProps } from "react-native"
import { GripVerticalIcon } from "../icons"
import { clamp, webStyle } from "../lib/utils"
import { useTheme } from "../theme/ThemeProvider"

type Direction = "horizontal" | "vertical"

type GroupCtx = {
  direction: Direction
  sizes: number[]
  constraints: { min: number; max: number }[]
  resize: (handleIndex: number, deltaPx: number, start: number[]) => void
  getSizes: () => number[]
}

const GroupContext = React.createContext<GroupCtx | null>(null)
const IndexContext = React.createContext<number>(0)

export type ResizablePanelGroupProps = ViewProps & {
  /** Layout direction. `orientation` is accepted as an alias. */
  direction?: Direction
  orientation?: Direction
  /** Called with the panel sizes (percentages) after a drag. */
  onLayoutChange?: (sizes: number[]) => void
}

export function ResizablePanelGroup({
  direction,
  orientation,
  onLayoutChange,
  style,
  children,
  ...props
}: ResizablePanelGroupProps) {
  const theme = useTheme()
  const dir = direction ?? orientation ?? "horizontal"
  const items = React.Children.toArray(children)
  const panels = items.filter(
    (c): c is React.ReactElement<ResizablePanelProps> =>
      React.isValidElement(c) && c.type === ResizablePanel,
  )
  const constraints = panels.map((p) => ({
    min: p.props.minSize ?? 0,
    max: p.props.maxSize ?? 100,
  }))
  const [sizes, setSizes] = React.useState<number[]>(() => {
    const defined = panels.map((p) => p.props.defaultSize)
    const used = defined.reduce<number>((a, b) => a + (b ?? 0), 0)
    const free = defined.filter((d) => d === undefined).length
    return defined.map((d) => d ?? (free ? (100 - used) / free : 0))
  })
  const [length, setLength] = React.useState(0)
  const sizesRef = React.useRef(sizes)
  sizesRef.current = sizes

  const resize = (handleIndex: number, deltaPx: number, start: number[]) => {
    if (!length) return
    const delta = (deltaPx / length) * 100
    const a = handleIndex
    const b = handleIndex + 1
    if (b >= start.length) return
    const total = start[a] + start[b]
    let nextA = clamp(start[a] + delta, constraints[a].min, constraints[a].max)
    let nextB = total - nextA
    if (nextB < constraints[b].min || nextB > constraints[b].max) {
      nextB = clamp(nextB, constraints[b].min, constraints[b].max)
      nextA = total - nextB
    }
    const next = start.slice()
    next[a] = nextA
    next[b] = nextB
    setSizes(next)
    onLayoutChange?.(next)
  }

  let panelIndex = -1
  return (
    <GroupContext.Provider
      value={{ direction: dir, sizes, constraints, resize, getSizes: () => sizesRef.current }}
    >
      <View
        onLayout={(e) => setLength(dir === "horizontal" ? e.nativeEvent.layout.width : e.nativeEvent.layout.height)}
        style={[
          { width: "100%", height: "100%", flexDirection: dir === "horizontal" ? "row" : "column" },
          { borderColor: theme.colors.border },
          style,
        ]}
        {...props}
      >
        {items.map((c, i) => {
          if (React.isValidElement(c) && c.type === ResizablePanel) panelIndex++
          return (
            <IndexContext.Provider key={i} value={Math.max(panelIndex, 0)}>
              {c}
            </IndexContext.Provider>
          )
        })}
      </View>
    </GroupContext.Provider>
  )
}

export type ResizablePanelProps = ViewProps & {
  /** Initial size in percent. */
  defaultSize?: number
  minSize?: number
  maxSize?: number
}

export function ResizablePanel({ style, defaultSize: _d, minSize: _min, maxSize: _max, ...props }: ResizablePanelProps) {
  const group = React.useContext(GroupContext)
  const index = React.useContext(IndexContext)
  const size = group?.sizes[index] ?? 100
  return (
    <View
      style={[{ flexGrow: size, flexShrink: 1, flexBasis: 0, overflow: "hidden" }, style]}
      {...props}
    />
  )
}

export function ResizableHandle({ withHandle, style, ...props }: ViewProps & { withHandle?: boolean }) {
  const theme = useTheme()
  const group = React.useContext(GroupContext)
  const index = React.useContext(IndexContext)
  const horizontal = group?.direction !== "vertical"
  const start = React.useRef<number[]>([])
  const groupRef = React.useRef(group)
  groupRef.current = group
  const pan = React.useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: () => {
          start.current = groupRef.current?.getSizes().slice() ?? []
        },
        onPanResponderMove: (_e, g) => {
          groupRef.current?.resize(index, horizontal ? g.dx : g.dy, start.current)
        },
      }),
    [index, horizontal],
  )
  return (
    <View
      {...pan.panHandlers}
      accessibilityRole="adjustable"
      accessibilityLabel="Resize"
      hitSlop={horizontal ? { left: 10, right: 10 } : { top: 10, bottom: 10 }}
      style={[
        {
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: theme.colors.border,
          zIndex: 10,
        },
        horizontal ? { width: 2, alignSelf: "stretch" } : { height: 2, alignSelf: "stretch" },
        webStyle({ userSelect: "none", touchAction: "none", cursor: horizontal ? "col-resize" : "row-resize" }),
        style,
      ]}
      {...props}
    >
      {withHandle ? (
        <View
          style={{
            width: horizontal ? 12 : 16,
            height: horizontal ? 16 : 12,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: theme.radius,
            borderWidth: 1,
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.border,
            transform: horizontal ? [] : [{ rotate: "90deg" }],
          }}
        >
          <GripVerticalIcon size={10} color={theme.colors.secondaryBackground} />
        </View>
      ) : null}
    </View>
  )
}
