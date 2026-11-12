import type { TextStyle } from "react-native"

/**
 * Design tokens. These mirror the CSS variables used by neobrutalism.dev
 * (`--background`, `--main`, `--border`, `--box-shadow-x`, ...).
 */
export type ThemeColors = {
  /** Page / surface background. Web: `--background` */
  background: string
  /** Inputs, neutral buttons, panels. Web: `--secondary-background` */
  secondaryBackground: string
  /** Default text color. Web: `--foreground` */
  foreground: string
  /** Text drawn on top of `main`. Web: `--main-foreground` */
  mainForeground: string
  /** Accent color. Web: `--main` */
  main: string
  /** Borders and hard shadows. Web: `--border` */
  border: string
  /** Focus ring. Web: `--ring` */
  ring: string
  /** Modal backdrop. Web: `--overlay` */
  overlay: string
  /** Error text and invalid borders (tailwind red-500). */
  danger: string
  /** Background of the destructive variants. */
  destructive: string
  /** Text on top of `destructive`. */
  destructiveForeground: string
  /** Thumb color for switches/sliders/radios. */
  thumb: string
  chart1: string
  chart2: string
  chart3: string
  chart4: string
  chart5: string
  chartActiveDot: string
}

export type ThemeFonts = {
  /**
   * Font family for regular text (`font-base`). Leave undefined to use the
   * platform font. On Android each weight of a custom font is usually loaded
   * as its own family, so you can set `base` and `heading` independently,
   * e.g. `{ base: "DMSans_500Medium", heading: "DMSans_700Bold" }`.
   */
  base?: string
  /** Font family for headings (`font-heading`). Defaults to `base`. */
  heading?: string
}

export type Theme = {
  dark: boolean
  colors: ThemeColors
  fonts: ThemeFonts
  fontWeight: {
    base: TextStyle["fontWeight"]
    heading: TextStyle["fontWeight"]
  }
  /** Web: `--border-radius` (5px) */
  radius: number
  /** Border width used everywhere (2px). */
  borderWidth: number
  /** Hard shadow offset. Web: `--box-shadow-x/y` (4px) */
  shadow: { x: number; y: number }
}

export type ThemeOverrides = {
  dark?: boolean
  colors?: Partial<ThemeColors>
  fonts?: Partial<ThemeFonts>
  fontWeight?: Partial<Theme["fontWeight"]>
  radius?: number
  borderWidth?: number
  shadow?: Partial<Theme["shadow"]>
}

/** hsl(214, 95%, 93%) */
const LIGHT_BACKGROUND = "#DCEBFE"
/** hsl(217, 100%, 66%) */
const BLUE = "#5294FF"

export const lightTheme: Theme = {
  dark: false,
  colors: {
    background: LIGHT_BACKGROUND,
    secondaryBackground: "#FFFFFF",
    foreground: "#000000",
    mainForeground: "#000000",
    main: BLUE,
    border: "#000000",
    ring: "#000000",
    overlay: "rgba(0,0,0,0.8)",
    danger: "#EF4444",
    destructive: "#000000",
    destructiveForeground: "#FFFFFF",
    thumb: "#FFFFFF",
    chart1: "#5294FF",
    chart2: "#FF4D50",
    chart3: "#FACC00",
    chart4: "#05E17A",
    chart5: "#7A83FF",
    chartActiveDot: "#000000",
  },
  fonts: {},
  fontWeight: { base: "500", heading: "700" },
  radius: 5,
  borderWidth: 2,
  shadow: { x: 4, y: 4 },
}

export const darkTheme: Theme = {
  ...lightTheme,
  dark: true,
  colors: {
    ...lightTheme.colors,
    background: "#272933",
    secondaryBackground: "#212121",
    foreground: "#E6E6E6",
    mainForeground: "#000000",
    border: "#000000",
    ring: "#FFFFFF",
    destructive: "#000000",
    destructiveForeground: "#FFFFFF",
    chartActiveDot: "#FFFFFF",
  },
}

/**
 * Accent presets matching the color options offered on neobrutalism.dev's
 * styling page. Pass one to `createTheme({ colors: { main: mainColors.red } })`.
 */
export const mainColors = {
  blue: "#5294FF",
  red: "#FF4D50",
  orange: "#FF7A05",
  amber: "#FFBF00",
  yellow: "#FACC00",
  lime: "#88CC19",
  green: "#05E17A",
  teal: "#00D6BD",
  cyan: "#00D5FF",
  violet: "#A985FF",
  purple: "#C26BFF",
  pink: "#FF66C2",
} as const

/** Deep-merges overrides into a base theme (light by default). */
export function createTheme(
  overrides: ThemeOverrides = {},
  base: Theme = overrides.dark ? darkTheme : lightTheme,
): Theme {
  return {
    dark: overrides.dark ?? base.dark,
    colors: { ...base.colors, ...overrides.colors },
    fonts: { ...base.fonts, ...overrides.fonts },
    fontWeight: { ...base.fontWeight, ...overrides.fontWeight },
    radius: overrides.radius ?? base.radius,
    borderWidth: overrides.borderWidth ?? base.borderWidth,
    shadow: { ...base.shadow, ...overrides.shadow },
  }
}

/**
 * Returns `color` with the given alpha (0-1). Supports #rgb, #rrggbb,
 * #rrggbbaa, rgb() and rgba(). Other formats are returned unchanged.
 */
export function withAlpha(color: string, alpha: number): string {
  const c = color.trim()
  if (c.startsWith("#")) {
    let hex = c.slice(1)
    if (hex.length === 3 || hex.length === 4)
      hex = hex
        .split("")
        .map((ch) => ch + ch)
        .join("")
    const r = parseInt(hex.slice(0, 2), 16)
    const g = parseInt(hex.slice(2, 4), 16)
    const b = parseInt(hex.slice(4, 6), 16)
    const a = hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1
    return `rgba(${r},${g},${b},${+(a * alpha).toFixed(3)})`
  }
  const m = c.match(/^rgba?\(([^)]+)\)$/i)
  if (m) {
    const [r, g, b, a = "1"] = m[1].split(",").map((s) => s.trim())
    return `rgba(${r},${g},${b},${+(parseFloat(a) * alpha).toFixed(3)})`
  }
  return c
}
