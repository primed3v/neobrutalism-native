/**
 * A small set of icons used by the components. Paths come from Lucide
 * (https://lucide.dev, ISC License). Any `react-native-svg` based icon set
 * (e.g. `lucide-react-native`) can be used alongside these.
 */
import * as React from "react"
import Svg, { Circle, Path, Rect } from "react-native-svg"
import type { StyleProp, ViewStyle } from "react-native"
import { useInheritedTextStyle } from "../lib/text"
import { useTheme } from "../theme/ThemeProvider"

export type IconProps = {
  size?: number
  color?: string
  strokeWidth?: number
  fill?: string
  style?: StyleProp<ViewStyle>
  accessibilityLabel?: string
}

export type IconComponent = React.FC<IconProps>

type Shape =
  | { p: string }
  | { c: [number, number, number] }
  | { r: [number, number, number, number, number] }

function createIcon(name: string, shapes: Shape[]): IconComponent {
  const Icon: IconComponent = ({
    size,
    color,
    strokeWidth = 2,
    fill = "none",
    style,
    accessibilityLabel,
  }) => {
    const inherited = useInheritedTextStyle()
    const theme = useTheme()
    const c = color ?? inherited.color ?? theme.colors.foreground
    const s = size ?? inherited.iconSize ?? 16
    return (
      <Svg
        width={s}
        height={s}
        viewBox="0 0 24 24"
        fill={fill === "currentColor" ? c : fill}
        stroke={c}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={style}
        // only pass a11y props when labelled: react-native-svg forwards them to the DOM on web
        {...(accessibilityLabel ? { accessibilityLabel, accessible: true } : null)}
      >
        {shapes.map((sh, i) => {
          if ("p" in sh) return <Path key={i} d={sh.p} />
          if ("c" in sh) return <Circle key={i} cx={sh.c[0]} cy={sh.c[1]} r={sh.c[2]} />
          const [x, y, w, h, rx] = sh.r
          return <Rect key={i} x={x} y={y} width={w} height={h} rx={rx} />
        })}
      </Svg>
    )
  }
  Icon.displayName = `${name}Icon`
  return Icon
}

export const CheckIcon = createIcon("Check", [{ p: "M20 6 9 17l-5-5" }])
export const ChevronDownIcon = createIcon("ChevronDown", [{ p: "m6 9 6 6 6-6" }])
export const ChevronUpIcon = createIcon("ChevronUp", [{ p: "m18 15-6-6-6 6" }])
export const ChevronLeftIcon = createIcon("ChevronLeft", [{ p: "m15 18-6-6 6-6" }])
export const ChevronRightIcon = createIcon("ChevronRight", [{ p: "m9 18 6-6-6-6" }])
export const ChevronsUpDownIcon = createIcon("ChevronsUpDown", [
  { p: "m7 15 5 5 5-5" },
  { p: "m7 9 5-5 5 5" },
])
export const XIcon = createIcon("X", [{ p: "M18 6 6 18" }, { p: "m6 6 12 12" }])
export const CircleIcon = createIcon("Circle", [{ c: [12, 12, 10] }])
export const DotIcon = createIcon("Dot", [{ c: [12.1, 12.1, 1] }])
export const SearchIcon = createIcon("Search", [{ c: [11, 11, 8] }, { p: "m21 21-4.3-4.3" }])
export const MoreHorizontalIcon = createIcon("MoreHorizontal", [
  { c: [12, 12, 1] },
  { c: [19, 12, 1] },
  { c: [5, 12, 1] },
])
export const ArrowLeftIcon = createIcon("ArrowLeft", [{ p: "m12 19-7-7 7-7" }, { p: "M19 12H5" }])
export const ArrowRightIcon = createIcon("ArrowRight", [{ p: "M5 12h14" }, { p: "m12 5 7 7-7 7" }])
export const ArrowDownIcon = createIcon("ArrowDown", [{ p: "M12 5v14" }, { p: "m19 12-7 7-7-7" }])
export const ArrowUpIcon = createIcon("ArrowUp", [{ p: "m5 12 7-7 7 7" }, { p: "M12 19V5" }])
export const ArrowUpDownIcon = createIcon("ArrowUpDown", [
  { p: "m21 16-4 4-4-4" },
  { p: "M17 20V4" },
  { p: "m3 8 4-4 4 4" },
  { p: "M7 4v16" },
])
export const GripVerticalIcon = createIcon("GripVertical", [
  { c: [9, 12, 1] },
  { c: [9, 5, 1] },
  { c: [9, 19, 1] },
  { c: [15, 12, 1] },
  { c: [15, 5, 1] },
  { c: [15, 19, 1] },
])
export const PanelLeftIcon = createIcon("PanelLeft", [
  { r: [3, 3, 18, 18, 2] },
  { p: "M9 3v18" },
])
export const LoaderIcon = createIcon("Loader", [{ p: "M21 12a9 9 0 1 1-6.219-8.56" }])
export const InfoIcon = createIcon("Info", [
  { c: [12, 12, 10] },
  { p: "M12 16v-4" },
  { p: "M12 8h.01" },
])
export const CircleAlertIcon = createIcon("CircleAlert", [
  { c: [12, 12, 10] },
  { p: "M12 8v4" },
  { p: "M12 16h.01" },
])
export const CircleCheckIcon = createIcon("CircleCheck", [
  { c: [12, 12, 10] },
  { p: "m9 12 2 2 4-4" },
])
export const TriangleAlertIcon = createIcon("TriangleAlert", [
  { p: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" },
  { p: "M12 9v4" },
  { p: "M12 17h.01" },
])
export const MinusIcon = createIcon("Minus", [{ p: "M5 12h14" }])
export const PlusIcon = createIcon("Plus", [{ p: "M5 12h14" }, { p: "M12 5v14" }])
export const CalendarIcon = createIcon("Calendar", [
  { p: "M8 2v4" },
  { p: "M16 2v4" },
  { r: [3, 4, 18, 18, 2] },
  { p: "M3 10h18" },
])
export const FileIcon = createIcon("File", [
  { p: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" },
  { p: "M14 2v4a2 2 0 0 0 2 2h4" },
])
export const ImageIcon = createIcon("Image", [
  { r: [3, 3, 18, 18, 2] },
  { c: [9, 9, 2] },
  { p: "m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" },
])
export const InboxIcon = createIcon("Inbox", [
  { p: "M22 12h-6l-2 3h-4l-2-3H2" },
  {
    p: "M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z",
  },
])
export const StarIcon = createIcon("Star", [
  {
    p: "M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z",
  },
])
export const SettingsIcon = createIcon("Settings", [
  {
    p: "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z",
  },
  { c: [12, 12, 3] },
])
export const HomeIcon = createIcon("Home", [
  { p: "M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" },
  {
    p: "M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
  },
])
export const UserIcon = createIcon("User", [
  { p: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" },
  { c: [12, 7, 4] },
])
export const MailIcon = createIcon("Mail", [
  { r: [2, 4, 20, 16, 2] },
  { p: "m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" },
])
export const BoldIcon = createIcon("Bold", [
  { p: "M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8" },
])
export const ItalicIcon = createIcon("Italic", [
  { p: "M19 4h-9" },
  { p: "M14 20H5" },
  { p: "M15 4 9 20" },
])
export const UnderlineIcon = createIcon("Underline", [
  { p: "M6 4v6a6 6 0 0 0 12 0V4" },
  { p: "M4 20h16" },
])
export const CopyIcon = createIcon("Copy", [
  { r: [8, 8, 14, 14, 2] },
  { p: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" },
])
export const TrashIcon = createIcon("Trash", [
  { p: "M3 6h18" },
  { p: "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" },
  { p: "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2" },
])
export const UploadIcon = createIcon("Upload", [
  { p: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" },
  { p: "m17 8-5-5-5 5" },
  { p: "M12 3v12" },
])
export const SendIcon = createIcon("Send", [
  {
    p: "M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z",
  },
  { p: "m21.854 2.147-10.94 10.939" },
])
