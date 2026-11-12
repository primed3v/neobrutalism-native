import * as React from "react"
import { Pressable, View, type StyleProp, type ViewProps, type ViewStyle } from "react-native"
import Svg, { Circle, G, Line, Path, Rect, Text as SvgText } from "react-native-svg"
import { Text, TextStyleProvider } from "../lib/text"
import { useTheme } from "../theme/ThemeProvider"
import type { Theme } from "../theme/theme"

// ---------- config ----------

export type ChartConfig = Record<
  string,
  {
    label?: React.ReactNode
    icon?: React.ComponentType<{ size?: number; color?: string }>
    /** Hex/rgb, a theme key (`"chart1"`) or the web form `"var(--chart-1)"`. */
    color?: string
  }
>

type ChartCtx = { config: ChartConfig; colorOf: (key: string) => string }
const ChartContext = React.createContext<ChartCtx | null>(null)

export function useChart() {
  const ctx = React.useContext(ChartContext)
  if (!ctx) throw new Error("useChart must be used within a <ChartContainer />")
  return ctx
}

function resolveColor(theme: Theme, color: string | undefined, fallbackIndex: number): string {
  const palette = [theme.colors.chart1, theme.colors.chart2, theme.colors.chart3, theme.colors.chart4, theme.colors.chart5]
  if (!color) return palette[fallbackIndex % palette.length]
  const m = color.match(/^var\(--chart-(\d)\)$/) ?? color.match(/^chart-?(\d)$/)
  if (m) return palette[(Number(m[1]) - 1) % palette.length]
  if (color === "var(--main)" || color === "main") return theme.colors.main
  return color
}

export type ChartContainerProps = ViewProps & { config: ChartConfig }

/** Provides colors/labels to the charts inside. Give it a height (default 200). */
export function ChartContainer({ config, style, children, ...props }: ChartContainerProps) {
  const theme = useTheme()
  const keys = Object.keys(config)
  const colorOf = (key: string) => resolveColor(theme, config[key]?.color, Math.max(keys.indexOf(key), 0))
  return (
    <ChartContext.Provider value={{ config, colorOf }}>
      <View style={[{ width: "100%", minHeight: 200 }, style]} {...props}>
        <TextStyleProvider value={{ color: theme.colors.foreground, fontSize: 12, lineHeight: 16 }}>
          {children}
        </TextStyleProvider>
      </View>
    </ChartContext.Provider>
  )
}

/** Kept for API parity (colors are resolved from the config). */
export function ChartStyle() {
  return null
}

// ---------- tooltip & legend ----------

export type TooltipItem = { key: string; label: React.ReactNode; value: number | string; color: string }

export type ChartTooltipContentProps = {
  label?: React.ReactNode
  items: TooltipItem[]
  indicator?: "dot" | "line" | "dashed"
  hideLabel?: boolean
  hideIndicator?: boolean
  formatter?: (value: number | string, key: string) => React.ReactNode
  labelFormatter?: (label: React.ReactNode) => React.ReactNode
  style?: StyleProp<ViewStyle>
}

export function ChartTooltipContent({
  label,
  items,
  indicator = "dot",
  hideLabel,
  hideIndicator,
  formatter,
  labelFormatter,
  style,
}: ChartTooltipContentProps) {
  const theme = useTheme()
  return (
    <View
      style={[
        {
          minWidth: 128,
          gap: 6,
          borderRadius: theme.radius,
          borderWidth: theme.borderWidth,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.background,
          paddingHorizontal: 10,
          paddingVertical: 6,
        },
        style,
      ]}
    >
      {!hideLabel && label != null ? (
        <Text weight="heading" size="xs">
          {labelFormatter ? labelFormatter(label) : label}
        </Text>
      ) : null}
      {items.map((it) => (
        <View key={it.key} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          {!hideIndicator ? (
            <View
              style={[
                { backgroundColor: it.color, borderColor: theme.colors.border, borderWidth: 1 },
                indicator === "dot" ? { width: 10, height: 10, borderRadius: 2 } : { width: 4, height: 14 },
                indicator === "dashed" && { backgroundColor: "transparent", borderStyle: "dashed", borderColor: it.color, borderWidth: 1.5 },
              ]}
            />
          ) : null}
          <Text size="xs" style={{ flex: 1 }}>
            {it.label}
          </Text>
          <Text size="xs" weight="heading" style={{ fontVariant: ["tabular-nums"] }}>
            {formatter ? formatter(it.value, it.key) : typeof it.value === "number" ? it.value.toLocaleString() : it.value}
          </Text>
        </View>
      ))}
    </View>
  )
}

export function ChartLegendContent({
  keys,
  hideIcon,
  style,
}: {
  /** Defaults to every key of the config. */
  keys?: string[]
  hideIcon?: boolean
  style?: StyleProp<ViewStyle>
}) {
  const { config, colorOf } = useChart()
  const theme = useTheme()
  const list = keys ?? Object.keys(config)
  return (
    <View style={[{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 16, paddingTop: 12 }, style]}>
      {list.map((k) => {
        const Icon = config[k]?.icon
        return (
          <View key={k} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            {Icon && !hideIcon ? (
              <Icon size={12} />
            ) : (
              <View
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 2,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  backgroundColor: colorOf(k),
                }}
              />
            )}
            <Text size="xs">{config[k]?.label ?? k}</Text>
          </View>
        )
      })}
    </View>
  )
}

/** Alias: `<ChartLegend />` renders the legend for the config. */
export const ChartLegend = ChartLegendContent

// ---------- shared cartesian helpers ----------

type Datum = Record<string, unknown>

type CartesianProps = {
  data: Datum[]
  /** Key of the category (x axis) value. */
  dataKey: string
  /** Series keys. Defaults to every key in the ChartConfig. */
  series?: string[]
  height?: number
  showGrid?: boolean
  showXAxis?: boolean
  showYAxis?: boolean
  xTickFormatter?: (value: string) => string
  yTickFormatter?: (value: number) => string
  showTooltip?: boolean
  tooltipIndicator?: "dot" | "line" | "dashed"
  tooltipFormatter?: (value: number | string, key: string) => React.ReactNode
  showLegend?: boolean
  stacked?: boolean
  margin?: { top?: number; right?: number; bottom?: number; left?: number }
  style?: StyleProp<ViewStyle>
}

function niceMax(v: number) {
  if (v <= 0) return 1
  const exp = Math.pow(10, Math.floor(Math.log10(v)))
  const f = v / exp
  const nice = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10
  return nice * exp
}

function num(v: unknown) {
  const n = typeof v === "number" ? v : Number(v)
  return Number.isFinite(n) ? n : 0
}

function useCartesian(props: CartesianProps, width: number) {
  const { config } = useChart()
  const series = props.series ?? Object.keys(config)
  const height = props.height ?? 200
  const m = { top: 8, right: 12, bottom: props.showXAxis === false ? 8 : 28, left: props.showYAxis ? 36 : 12, ...props.margin }
  const plotW = Math.max(width - m.left - m.right, 1)
  const plotH = Math.max(height - m.top - m.bottom, 1)
  let min = 0
  let max = 0
  for (const d of props.data) {
    if (props.stacked) {
      let pos = 0
      let neg = 0
      for (const s of series) {
        const v = num(d[s])
        if (v >= 0) pos += v
        else neg += v
      }
      max = Math.max(max, pos)
      min = Math.min(min, neg)
    } else {
      for (const s of series) {
        max = Math.max(max, num(d[s]))
        min = Math.min(min, num(d[s]))
      }
    }
  }
  max = niceMax(max)
  min = min < 0 ? -niceMax(-min) : 0
  const y = (v: number) => m.top + plotH - ((v - min) / (max - min || 1)) * plotH
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => min + t * (max - min))
  return { series, height, m, plotW, plotH, y, ticks, min, max }
}

function Axes({
  props,
  geo,
  xs,
}: {
  props: CartesianProps
  geo: ReturnType<typeof useCartesian>
  xs: number[]
}) {
  const theme = useTheme()
  const font = theme.fonts.base
  return (
    <G>
      {props.showGrid !== false
        ? geo.ticks.map((t, i) => (
            <Line
              key={i}
              x1={geo.m.left}
              x2={geo.m.left + geo.plotW}
              y1={geo.y(t)}
              y2={geo.y(t)}
              stroke={theme.colors.foreground}
              strokeOpacity={0.15}
              strokeWidth={1}
            />
          ))
        : null}
      {props.showYAxis
        ? geo.ticks.map((t, i) => (
            <SvgText
              key={i}
              x={geo.m.left - 6}
              y={geo.y(t) + 4}
              fontSize={11}
              fontFamily={font}
              fill={theme.colors.foreground}
              textAnchor="end"
            >
              {props.yTickFormatter ? props.yTickFormatter(t) : String(Math.round(t))}
            </SvgText>
          ))
        : null}
      {props.showXAxis !== false
        ? props.data.map((d, i) => {
            const raw = String(d[props.dataKey] ?? "")
            return (
              <SvgText
                key={i}
                x={xs[i]}
                y={geo.height - 8}
                fontSize={11}
                fontFamily={font}
                fill={theme.colors.foreground}
                textAnchor="middle"
              >
                {props.xTickFormatter ? props.xTickFormatter(raw) : raw}
              </SvgText>
            )
          })
        : null}
    </G>
  )
}

function useWidth() {
  const [width, setWidth] = React.useState(0)
  return { width, onLayout: (e: { nativeEvent: { layout: { width: number } } }) => setWidth(e.nativeEvent.layout.width) }
}

function TooltipOverlay({
  x,
  props,
  index,
  series,
  width,
}: {
  x: number
  props: CartesianProps
  index: number
  series: string[]
  width: number
}) {
  const { config, colorOf } = useChart()
  const d = props.data[index]
  const left = Math.min(Math.max(x + 12, 0), Math.max(width - 160, 0))
  return (
    <View pointerEvents="none" style={{ position: "absolute", top: 0, left }}>
      <ChartTooltipContent
        indicator={props.tooltipIndicator}
        formatter={props.tooltipFormatter}
        label={String(d[props.dataKey] ?? "")}
        items={series.map((s) => ({ key: s, label: config[s]?.label ?? s, value: num(d[s]), color: colorOf(s) }))}
      />
    </View>
  )
}

/** Touch/hover zones (one per category) that drive the tooltip. */
function HitZones({
  count,
  xs,
  step,
  height,
  onActive,
}: {
  count: number
  xs: number[]
  step: number
  height: number
  onActive: (i: number | null) => void
}) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <Pressable
          key={i}
          accessibilityRole="button"
          onPressIn={() => onActive(i)}
          onHoverIn={() => onActive(i)}
          onHoverOut={() => onActive(null)}
          style={{ position: "absolute", top: 0, height, left: xs[i] - step / 2, width: step }}
        />
      ))}
    </>
  )
}

// ---------- Bar chart ----------

export type BarChartProps = CartesianProps & {
  /** Corner radius of bars. Default 4. */
  radius?: number
  /** Horizontal bars (recharts `layout="vertical"`). */
  horizontal?: boolean
}

export function BarChart(props: BarChartProps) {
  const theme = useTheme()
  const { colorOf } = useChart()
  const { width, onLayout } = useWidth()
  const geo = useCartesian(props, width)
  const [active, setActive] = React.useState<number | null>(null)
  const n = props.data.length
  const step = geo.plotW / Math.max(n, 1)
  const xs = props.data.map((_, i) => geo.m.left + step * (i + 0.5))
  const groupW = step * 0.7
  const barW = props.stacked ? groupW : groupW / Math.max(geo.series.length, 1)
  const r = props.radius ?? 4
  const bw = theme.borderWidth

  if (props.horizontal) return <HorizontalBars {...props} />

  return (
    <View style={props.style} onLayout={onLayout}>
      {width > 0 ? (
        <View>
          <Svg width={width} height={geo.height}>
            <Axes props={props} geo={geo} xs={xs} />
            {props.data.map((d, i) => {
              let posAcc = 0
              let negAcc = 0
              return (
                <G key={i} opacity={active === null || active === i ? 1 : 0.6}>
                  {geo.series.map((s, si) => {
                    const v = num(d[s])
                    let y0: number
                    let y1: number
                    if (props.stacked) {
                      const base = v >= 0 ? posAcc : negAcc
                      y0 = geo.y(base)
                      y1 = geo.y(base + v)
                      if (v >= 0) posAcc += v
                      else negAcc += v
                    } else {
                      y0 = geo.y(0)
                      y1 = geo.y(v)
                    }
                    const top = Math.min(y0, y1)
                    const h = Math.abs(y1 - y0)
                    const x = props.stacked ? xs[i] - groupW / 2 : xs[i] - groupW / 2 + si * barW
                    if (h <= 0) return null
                    return (
                      <Rect
                        key={s}
                        x={x + bw / 2}
                        y={top + bw / 2}
                        width={Math.max(barW - bw - (props.stacked ? 0 : 2), 1)}
                        height={Math.max(h - bw, 0.5)}
                        rx={Math.min(r, barW / 2)}
                        fill={colorOf(s)}
                        stroke={theme.colors.border}
                        strokeWidth={bw}
                      />
                    )
                  })}
                </G>
              )
            })}
          </Svg>
          {props.showTooltip !== false ? (
            <HitZones count={n} xs={xs} step={step} height={geo.height} onActive={setActive} />
          ) : null}
          {props.showTooltip !== false && active !== null ? (
            <TooltipOverlay x={xs[active]} props={props} index={active} series={geo.series} width={width} />
          ) : null}
        </View>
      ) : null}
      {props.showLegend ? <ChartLegendContent keys={geo.series} /> : null}
    </View>
  )
}

function HorizontalBars(props: BarChartProps) {
  const theme = useTheme()
  const { colorOf, config } = useChart()
  const { width, onLayout } = useWidth()
  const series = props.series ?? Object.keys(config)
  const rowH = 36
  const labelW = 72
  const max = niceMax(Math.max(1, ...props.data.map((d) => series.reduce((a, s) => a + Math.max(num(d[s]), 0), 0))))
  const plotW = Math.max(width - labelW - 12, 1)
  const height = props.data.length * rowH + 8
  const [active, setActive] = React.useState<number | null>(null)
  return (
    <View style={props.style} onLayout={onLayout}>
      {width > 0 ? (
        <View>
          <Svg width={width} height={height}>
            {props.data.map((d, i) => {
              let acc = 0
              const y = 4 + i * rowH
              return (
                <G key={i} opacity={active === null || active === i ? 1 : 0.6}>
                  <SvgText x={labelW - 8} y={y + rowH / 2 + 4} fontSize={11} fill={theme.colors.foreground} textAnchor="end" fontFamily={theme.fonts.base}>
                    {props.xTickFormatter ? props.xTickFormatter(String(d[props.dataKey] ?? "")) : String(d[props.dataKey] ?? "")}
                  </SvgText>
                  {series.map((s) => {
                    const v = Math.max(num(d[s]), 0)
                    const x = labelW + (acc / max) * plotW
                    const w = (v / max) * plotW
                    acc += v
                    if (w <= 0) return null
                    return (
                      <Rect
                        key={s}
                        x={x + 1}
                        y={y + 6}
                        width={Math.max(w - 2, 1)}
                        height={rowH - 12}
                        rx={props.radius ?? 4}
                        fill={colorOf(s)}
                        stroke={theme.colors.border}
                        strokeWidth={theme.borderWidth}
                      />
                    )
                  })}
                </G>
              )
            })}
          </Svg>
          {props.data.map((_, i) => (
            <Pressable
              key={i}
              onPressIn={() => setActive(i)}
              onHoverIn={() => setActive(i)}
              onHoverOut={() => setActive(null)}
              style={{ position: "absolute", left: 0, right: 0, top: 4 + i * rowH, height: rowH }}
            />
          ))}
          {active !== null && props.showTooltip !== false ? (
            <View pointerEvents="none" style={{ position: "absolute", right: 0, top: Math.max(4 + active * rowH - 8, 0) }}>
              <ChartTooltipContent
                indicator={props.tooltipIndicator}
                formatter={props.tooltipFormatter}
                label={String(props.data[active][props.dataKey] ?? "")}
                items={series.map((s) => ({ key: s, label: config[s]?.label ?? s, value: num(props.data[active][s]), color: colorOf(s) }))}
              />
            </View>
          ) : null}
        </View>
      ) : null}
      {props.showLegend ? <ChartLegendContent keys={series} /> : null}
    </View>
  )
}

// ---------- Line & Area ----------

export type Curve = "linear" | "natural" | "monotone" | "step"

function buildPath(points: [number, number][], curve: Curve): string {
  if (points.length === 0) return ""
  if (points.length === 1) return `M${points[0][0]},${points[0][1]}`
  if (curve === "linear") return points.map((p, i) => `${i ? "L" : "M"}${p[0]},${p[1]}`).join("")
  if (curve === "step") {
    let d = `M${points[0][0]},${points[0][1]}`
    for (let i = 1; i < points.length; i++) {
      const mx = (points[i - 1][0] + points[i][0]) / 2
      d += `H${mx}V${points[i][1]}H${points[i][0]}`
    }
    return d
  }
  // monotone cubic (d3 curveMonotoneX) — also used for "natural"
  const n = points.length
  const dx: number[] = []
  const slope: number[] = []
  for (let i = 0; i < n - 1; i++) {
    dx[i] = points[i + 1][0] - points[i][0]
    slope[i] = (points[i + 1][1] - points[i][1]) / (dx[i] || 1)
  }
  const t: number[] = [slope[0]]
  for (let i = 1; i < n - 1; i++) {
    if (slope[i - 1] * slope[i] <= 0) t[i] = 0
    else {
      const w1 = 2 * dx[i] + dx[i - 1]
      const w2 = dx[i] + 2 * dx[i - 1]
      t[i] = (w1 + w2) / (w1 / slope[i - 1] + w2 / slope[i])
    }
  }
  t[n - 1] = slope[n - 2]
  let d = `M${points[0][0]},${points[0][1]}`
  for (let i = 0; i < n - 1; i++) {
    const h = dx[i] / 3
    d += `C${points[i][0] + h},${points[i][1] + h * t[i]} ${points[i + 1][0] - h},${points[i + 1][1] - h * t[i + 1]} ${points[i + 1][0]},${points[i + 1][1]}`
  }
  return d
}

export type LineChartProps = CartesianProps & {
  curve?: Curve
  /** Show a dot on every point. */
  dots?: boolean
  strokeWidth?: number
}

function LineLike({ area, ...props }: LineChartProps & { area?: boolean; fillOpacity?: number }) {
  const theme = useTheme()
  const { colorOf } = useChart()
  const { width, onLayout } = useWidth()
  const geo = useCartesian(props, width)
  const [active, setActive] = React.useState<number | null>(null)
  const n = props.data.length
  const step = n > 1 ? geo.plotW / (n - 1) : geo.plotW
  const xs = props.data.map((_, i) => (n > 1 ? geo.m.left + step * i : geo.m.left + geo.plotW / 2))
  const curve = props.curve ?? "natural"
  const sw = props.strokeWidth ?? 2

  const stackBase = props.data.map(() => 0)
  const layers = geo.series.map((s) => {
    const base = stackBase.slice()
    const top = props.data.map((d, i) => {
      const v = num(d[s]) + (props.stacked ? stackBase[i] : 0)
      if (props.stacked) stackBase[i] = v
      return v
    })
    return { s, base, top }
  })

  return (
    <View style={props.style} onLayout={onLayout}>
      {width > 0 ? (
        <View>
          <Svg width={width} height={geo.height}>
            <Axes props={props} geo={geo} xs={xs} />
            {(area ? [...layers].reverse() : layers).map(({ s, base, top }) => {
              const pts = top.map((v, i) => [xs[i], geo.y(v)] as [number, number])
              const line = buildPath(pts, curve)
              let fill: string | null = null
              if (area) {
                const basePts = base.map((v, i) => [xs[i], geo.y(props.stacked ? v : 0)] as [number, number]).reverse()
                const back = props.stacked
                  ? buildPath(basePts, curve).replace(/^M/, "L")
                  : `L${xs[n - 1]},${geo.y(0)}L${xs[0]},${geo.y(0)}`
                fill = `${line}${back}Z`
              }
              return (
                <G key={s}>
                  {fill ? (
                    <Path d={fill} fill={colorOf(s)} fillOpacity={props.fillOpacity ?? 1} stroke={theme.colors.border} strokeWidth={sw} />
                  ) : (
                    <Path d={line} fill="none" stroke={colorOf(s)} strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round" />
                  )}
                  {props.dots
                    ? pts.map((p, i) => (
                        <Circle key={i} cx={p[0]} cy={p[1]} r={4} fill={colorOf(s)} stroke={theme.colors.border} strokeWidth={2} />
                      ))
                    : null}
                  {active !== null ? (
                    <Circle
                      cx={pts[active][0]}
                      cy={pts[active][1]}
                      r={5}
                      fill={theme.colors.chartActiveDot}
                      stroke={theme.colors.border}
                      strokeWidth={2}
                    />
                  ) : null}
                </G>
              )
            })}
          </Svg>
          {props.showTooltip !== false ? (
            <HitZones count={n} xs={xs} step={n > 1 ? step : geo.plotW} height={geo.height} onActive={setActive} />
          ) : null}
          {props.showTooltip !== false && active !== null ? (
            <TooltipOverlay x={xs[active]} props={props} index={active} series={geo.series} width={width} />
          ) : null}
        </View>
      ) : null}
      {props.showLegend ? <ChartLegendContent keys={geo.series} /> : null}
    </View>
  )
}

export function LineChart(props: LineChartProps) {
  return <LineLike {...props} />
}

export type AreaChartProps = LineChartProps & { fillOpacity?: number }

export function AreaChart(props: AreaChartProps) {
  return <LineLike area {...props} />
}

// ---------- Pie ----------

export type PieChartProps = {
  data: Datum[]
  /** Numeric value key. */
  dataKey: string
  /** Category key; its values are looked up in the ChartConfig for color/label. */
  nameKey: string
  /** > 0 renders a donut. Fraction of the radius (0..0.9). */
  innerRadius?: number
  size?: number
  showLabels?: boolean
  showTooltip?: boolean
  showLegend?: boolean
  /** Content rendered in the middle of a donut. */
  centerLabel?: React.ReactNode
  /** Pull out this slice (pie-donut-active). */
  activeIndex?: number
  style?: StyleProp<ViewStyle>
}

export function PieChart({
  data,
  dataKey,
  nameKey,
  innerRadius = 0,
  size = 220,
  showLabels,
  showTooltip = true,
  showLegend,
  centerLabel,
  activeIndex,
  style,
}: PieChartProps) {
  const theme = useTheme()
  const { config } = useChart()
  const [active, setActive] = React.useState<number | null>(null)
  const total = data.reduce((a, d) => a + Math.max(num(d[dataKey]), 0), 0) || 1
  const cx = size / 2
  const cy = size / 2
  const R = size / 2 - 12
  const r = Math.min(Math.max(innerRadius, 0), 0.9) * R
  let angle = -Math.PI / 2
  const slices = data.map((d, i) => {
    const v = Math.max(num(d[dataKey]), 0)
    const a0 = angle
    const a1 = angle + (v / total) * Math.PI * 2
    angle = a1
    const name = String(d[nameKey])
    return { i, v, a0, a1, name, color: resolveColor(theme, (d.fill as string) ?? config[name]?.color, i) }
  })
  const arc = (a0: number, a1: number, pull: number) => {
    const mid = (a0 + a1) / 2
    const ox = Math.cos(mid) * pull
    const oy = Math.sin(mid) * pull
    const large = a1 - a0 > Math.PI ? 1 : 0
    const p = (rad: number, a: number) => `${cx + ox + Math.cos(a) * rad},${cy + oy + Math.sin(a) * rad}`
    if (a1 - a0 >= Math.PI * 2 - 1e-6) {
      // full circle
      return r > 0
        ? `M${cx - R},${cy}a${R},${R} 0 1,0 ${R * 2},0a${R},${R} 0 1,0 ${-R * 2},0M${cx - r},${cy}a${r},${r} 0 1,1 ${r * 2},0a${r},${r} 0 1,1 ${-r * 2},0`
        : `M${cx - R},${cy}a${R},${R} 0 1,0 ${R * 2},0a${R},${R} 0 1,0 ${-R * 2},0`
    }
    if (r > 0) return `M${p(R, a0)}A${R},${R} 0 ${large} 1 ${p(R, a1)}L${p(r, a1)}A${r},${r} 0 ${large} 0 ${p(r, a0)}Z`
    return `M${cx + ox},${cy + oy}L${p(R, a0)}A${R},${R} 0 ${large} 1 ${p(R, a1)}Z`
  }
  const shown = active ?? activeIndex ?? null
  return (
    <View style={[{ alignItems: "center" }, style]}>
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size}>
          {slices.map((s) => (
            <Path
              key={s.i}
              d={arc(s.a0, s.a1, s.i === activeIndex ? 8 : 0)}
              fill={s.color}
              fillRule="evenodd"
              stroke={theme.colors.border}
              strokeWidth={theme.borderWidth}
              strokeLinejoin="round"
            />
          ))}
          {showLabels
            ? slices.map((s) => {
                const mid = (s.a0 + s.a1) / 2
                const lr = r > 0 ? (R + r) / 2 : R * 0.65
                return (
                  <SvgText
                    key={s.i}
                    x={cx + Math.cos(mid) * lr}
                    y={cy + Math.sin(mid) * lr + 4}
                    fontSize={12}
                    fontFamily={theme.fonts.heading ?? theme.fonts.base}
                    fontWeight="bold"
                    fill={theme.colors.mainForeground}
                    textAnchor="middle"
                  >
                    {String(s.v)}
                  </SvgText>
                )
              })
            : null}
        </Svg>
        {/* one hit-test layer (by angle/radius) instead of per-path handlers, which
            react-native-svg forwards to the DOM on web */}
        <Pressable
          accessibilityRole="image"
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
          onPressIn={(e) => {
            const dx = e.nativeEvent.locationX - cx
            const dy = e.nativeEvent.locationY - cy
            const dist = Math.sqrt(dx * dx + dy * dy)
            if (dist > R + 8 || dist < r) return setActive(null)
            let a = Math.atan2(dy, dx)
            if (a < -Math.PI / 2) a += Math.PI * 2
            const hit = slices.find((sl) => a >= sl.a0 && a < sl.a1)
            setActive(hit ? hit.i : null)
          }}
          onPressOut={() => setActive(null)}
        />
        {centerLabel ? (
          <View pointerEvents="none" style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center" }}>
            {typeof centerLabel === "string" || typeof centerLabel === "number" ? (
              <Text weight="heading" size="2xl">
                {centerLabel}
              </Text>
            ) : (
              centerLabel
            )}
          </View>
        ) : null}
        {showTooltip && shown !== null && active !== null ? (
          <View pointerEvents="none" style={{ position: "absolute", top: 0, right: -8 }}>
            <ChartTooltipContent
              hideLabel
              items={[
                {
                  key: slices[shown].name,
                  label: config[slices[shown].name]?.label ?? slices[shown].name,
                  value: slices[shown].v,
                  color: slices[shown].color,
                },
              ]}
            />
          </View>
        ) : null}
      </View>
      {showLegend ? <ChartLegendContent keys={slices.map((s) => s.name)} /> : null}
    </View>
  )
}
