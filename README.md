[![npm](https://img.shields.io/npm/v/neobrutalism-native)](https://www.npmjs.com/package/neobrutalism-native)

# neobrutalism-native

The [neobrutalism.dev](https://www.neobrutalism.dev/) component library
([source](https://github.com/ekmas/neobrutalism-components)), ported to **React Native**.
Every component from the original is here, and they run on **iOS, Android and the web** (react-native-web).

- **Pure React Native:** `StyleSheet`, `Animated`, `PanResponder`, `Modal`. No NativeWind, Reanimated or Gesture Handler needed.
- **One peer dependency:** `react-native-svg` (icons and charts).
- **Works with Expo and bare RN**, on both the old and new architecture. React Native ≥ 0.72, React ≥ 18.
- **Familiar API:** the same compound components as shadcn/neobrutalism (`<Dialog><DialogTrigger asChild>…`), plus `asChild` support.
- **Hard shadows on every platform.** Android `elevation` can't draw a zero-blur offset shadow, so the shadow is drawn as its own layer.
- **Typed throughout** with TypeScript.

## Installation

```bash
npm install neobrutalism-native react-native-svg
```

With Expo:

```bash
npx expo install neobrutalism-native react-native-svg
```

## Setup

Wrap your app in `NeoProvider` once. Mount `<Toaster />` if you use toasts.

```tsx
import { NeoProvider, Toaster, createTheme } from "neobrutalism-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

export default function App() {
  const insets = useSafeAreaInsets() // optional but recommended
  return (
    <NeoProvider theme={createTheme({ fonts: { base: "DMSans_500Medium", heading: "DMSans_700Bold" } })} insets={insets}>
      <Main />
      <Toaster />
    </NeoProvider>
  )
}
```

`NeoProvider` provides:

- **theme**: colors, radius, border width, shadow offset, fonts.
- **insets**: safe-area insets for Sheet, Drawer, Sidebar and Toaster. Pass `useSafeAreaInsets()` from
  `react-native-safe-area-context`; without it, rough platform defaults are used.
- **a portal host** for non-modal floating UI (tooltips, web hover cards, toasts). The host wraps your app in a
  `flex: 1` View. Turn it off with `portalHost={false}`; floating UI then falls back to native `Modal`s.

### Fonts

The original uses DM Sans. With Expo:

```bash
npx expo install expo-font @expo-google-fonts/dm-sans
```

```tsx
const [loaded] = useFonts({ DMSans_500Medium, DMSans_700Bold })
// createTheme({ fonts: { base: "DMSans_500Medium", heading: "DMSans_700Bold" } })
```

`fonts.base` and `fonts.heading` are separate families because on Android each weight of a custom font is loaded
as its own family.

## Usage

```tsx
import { Button, Card, CardContent, CardHeader, CardTitle, Dialog, DialogContent, DialogTrigger, Input, toast } from "neobrutalism-native"

<Card>
  <CardHeader>
    <CardTitle>Login</CardTitle>
  </CardHeader>
  <CardContent>
    <Input placeholder="m@example.com" />
  </CardContent>
</Card>

<Dialog>
  <DialogTrigger asChild>
    <Button>Open</Button>
  </DialogTrigger>
  <DialogContent>…</DialogContent>
</Dialog>

<Button onPress={() => toast.success("Saved!")}>Save</Button>
```

Strings inside components are wrapped in a themed `Text` for you, so `<Button>Click</Button>` works just like on the
web. React Native Views don't pass text styles down to their children the way CSS does, so components publish
their text color, size and weight through a context. The library's `Text` and icons read it, which means
`<Button><PlusIcon /><Text>Add</Text></Button>` picks up the button's foreground color. Use the exported `Text` (not
React Native's) inside components.

Every component accepts `style`. Components that render text also accept `textStyle`.

## Theming

```tsx
import { createTheme, darkTheme, mainColors } from "neobrutalism-native"

createTheme({ colors: { main: mainColors.violet } }) // light, violet accent
createTheme({ dark: true })                           // dark
createTheme({ radius: 0, shadow: { x: 6, y: 6 } })     // sharper, deeper shadow
<NeoProvider theme={darkTheme}>                         // full theme object
```

| Token | Web variable | Default |
| --- | --- | --- |
| `colors.background` | `--background` | `#DCEBFE` |
| `colors.secondaryBackground` | `--secondary-background` | `#FFFFFF` |
| `colors.foreground` | `--foreground` | `#000000` |
| `colors.main` | `--main` | `#5294FF` |
| `colors.mainForeground` | `--main-foreground` | `#000000` |
| `colors.border` | `--border` | `#000000` |
| `colors.overlay` | `--overlay` | `rgba(0,0,0,0.8)` |
| `colors.chart1…5` | `--chart-1…5` | as on the web |
| `radius` | `--border-radius` | `5` |
| `shadow` | `--box-shadow-x/y` | `{ x: 4, y: 4 }` |
| `fontWeight.base / heading` | `--base/heading-font-weight` | `500 / 700` |

`useTheme()` returns the current theme. `<Surface shadow>` is a View with the neobrutalism hard shadow, if you want
it in your own components.

## Components

Accordion · Alert · Alert Dialog · Attachment · Avatar · Badge · Breadcrumb · Bubble · Button · Button Group ·
Calendar (+ DatePicker) · Card · Carousel · Chart · Checkbox · Collapsible · Combobox · Command · Context Menu ·
Data Table · Dialog · Direction · Drawer · Dropdown Menu · Empty · Field · Form · Hover Card · Image Card · Input ·
Input Group · Input OTP · Item · Kbd · Label · Marker · Marquee · Menubar · Message · Message Scroller ·
Native Select · Navigation Menu · Pagination · Popover · Progress · Questionnaire · Radio Group · Resizable ·
Scroll Area · Select · Sheet · Sidebar · Skeleton · Slider · Spinner · Switch · Table · Tabs · Textarea · Toast ·
Toggle · Toggle Group · Tooltip

### Platform behavior

Some web interactions have no direct equivalent on touch devices. Here is what each one maps to:

| Component | Web | iOS / Android |
| --- | --- | --- |
| Button press effect | hover **and** press | press |
| Tooltip | hover / focus | long press (hides 1.5 s after release) |
| Hover Card | hover (with open/close delays) | long press (`nativeTrigger="press"` to open on tap) |
| Context Menu | right click or long press, opens at the pointer | long press, opens at the finger |
| Native Select | real `<select>` | bottom-sheet picker |
| Drawer | swipe or drag to dismiss | swipe to dismiss |
| Sidebar | ≥ 768 px wide: collapsible column (`offcanvas` / `icon`). Narrower: slide-over panel | same rule, so phones get the slide-over panel |
| Focus ring | `outline` on keyboard focus | none (the platform shows focus) |

### Differences from the web API

The goal is the same compound API, but a few things had to change:

- **Events**: `onClick` becomes `onPress`. Menu items take `onSelect`.
- **Values follow Base UI**, like the current neobrutalism source: `Accordion`, `ToggleGroup` and `Slider` take arrays
  (`value={["a"]}`, `value={[50]}`), and allow multiple items with the `multiple` prop.
- **Table** is built with flexbox. Cells are `flex: 1` by default, so set `style={{ flex: 2 }}` or a `width` per
  column. Pass `minWidth` to scroll wide tables horizontally.
- **Chart**: Recharts doesn't run on native, so charts are drawn with SVG. Use `<ChartContainer config>` with
  `BarChart` (grouped, stacked, horizontal), `LineChart`, `AreaChart` (stacked, `curve="natural" | "linear" | "step"`) or
  `PieChart` (donut, labels, center label), plus `ChartLegend` and `ChartTooltipContent`. Colors accept hex, `"chart1"`
  or the web form `"var(--chart-1)"`.
- **Data Table** is a ready-made component (`<DataTable data columns filterKey selectable pageSize />`) instead of a
  TanStack recipe.
- **Combobox** and **DatePicker** are ready-made components built from Popover + Command / Calendar.
- **Calendar** has no dependencies. It supports `mode="single" | "multiple" | "range"`, `disabled` matchers,
  `captionLayout="dropdown"`, `numberOfMonths`, `weekStartsOn` and `locale` (via `Intl`).
- **Form** doesn't depend on a form library. Pass each field's `error` to `FormField`, for example from
  react-hook-form's `<Controller>` (see the comment in `src/components/form.tsx`).
- **Toast** uses a global store with a sonner-style API: `toast()`, `toast.success/error/warning/info/loading`,
  `toast.promise`, `toast.dismiss`, `useToast()`. Mount `<Toaster position="bottom-right" />` once.
- **Carousel** uses a snapping ScrollView. Use `basis={1/3}` instead of `basis-1/3`. `setApi` and `useCarousel()` give you
  `scrollPrev`, `scrollNext`, `scrollTo` and so on.
- **InputOTP** uses `pattern={REGEXP_ONLY_DIGITS}` to filter input and show the numeric keyboard.
- `*Portal`, `*Overlay`, `SelectScrollUp/DownButton`, `NavigationMenuViewport/Indicator` and `ScrollBar` are exported
  only so code written for the web keeps compiling. Overlays position themselves.

## Example app

`example/` is an Expo app that shows every component, with light/dark and accent switching.

```bash
npm install
```

```bash
npm run example -- web
```

```bash
npm run example -- ios
```

```bash
npm run example -- android
```

The example resolves `neobrutalism-native` to `../src` (see `example/metro.config.js`), so library edits hot-reload.

## Development

```bash
npm run typecheck
```

```bash
npm run build
```

`npm run build` uses react-native-builder-bob and writes CommonJS, ESM and `.d.ts` files to `lib/`. Metro and Expo read
`src/` directly through the `react-native` field.

## Credits

The design and component set come from [neobrutalism-components](https://github.com/ekmas/neobrutalism-components)
by Samuel Breznjak (MIT). Icons are derived from [Lucide](https://lucide.dev) (ISC).
