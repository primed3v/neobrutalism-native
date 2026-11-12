import * as React from "react"
import { Image, View, type ImageProps, type ViewProps } from "react-native"
import { renderText, TextStyleProvider } from "../lib/text"
import { useTheme } from "../theme/ThemeProvider"

type Size = "sm" | "default" | "lg"
const SIZES: Record<Size, { box: number; font: number; badge: number; badgeIcon: number }> = {
  sm: { box: 32, font: 12, badge: 12, badgeIcon: 0 },
  default: { box: 40, font: 14, badge: 16, badgeIcon: 8 },
  lg: { box: 48, font: 18, badge: 20, badgeIcon: 10 },
}

type Status = "idle" | "loading" | "loaded" | "error"
const AvatarContext = React.createContext<{
  size: Size
  status: Status
  setStatus: (s: Status) => void
}>({ size: "default", status: "idle", setStatus: () => {} })

export type AvatarProps = ViewProps & { size?: Size }

export function Avatar({ size = "default", style, children, ...props }: AvatarProps) {
  const theme = useTheme()
  const [status, setStatus] = React.useState<Status>("idle")
  const d = SIZES[size].box
  return (
    <AvatarContext.Provider value={{ size, status, setStatus }}>
      <View
        style={[
          {
            width: d,
            height: d,
            borderRadius: 9999,
            borderWidth: theme.borderWidth,
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.secondaryBackground,
          },
          style,
        ]}
        {...props}
      >
        {children}
      </View>
    </AvatarContext.Provider>
  )
}

export type AvatarImageProps = Omit<ImageProps, "source"> & {
  /** Image URL (web `src`). */
  src?: string
  source?: ImageProps["source"]
  alt?: string
}

export function AvatarImage({ src, source, alt, style, onLoad, onError, ...props }: AvatarImageProps) {
  const { status, setStatus } = React.useContext(AvatarContext)
  const uri = src
  // key on a primitive so inline `source={{ uri }}` objects don't reset the status
  const sourceKey =
    uri ??
    (source && typeof source === "object" && !Array.isArray(source) && "uri" in source
      ? String(source.uri)
      : source != null
        ? String(source)
        : "")
  React.useEffect(() => {
    setStatus(sourceKey ? "loading" : "error")
  }, [sourceKey, setStatus])
  if (status === "error") return null
  return (
    <Image
      accessibilityLabel={alt}
      source={source ?? { uri }}
      onLoad={(e) => {
        setStatus("loaded")
        onLoad?.(e)
      }}
      onError={(e) => {
        setStatus("error")
        onError?.(e)
      }}
      style={[
        { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, borderRadius: 9999 },
        status !== "loaded" && { opacity: 0 },
        style,
      ]}
      {...props}
    />
  )
}

/** Shown until the image loads (or when it fails). */
export function AvatarFallback({ style, children, ...props }: ViewProps) {
  const theme = useTheme()
  const { size, status } = React.useContext(AvatarContext)
  if (status === "loaded") return null
  return (
    <View
      style={[
        {
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 9999,
          backgroundColor: theme.colors.secondaryBackground,
        },
        style,
      ]}
      {...props}
    >
      <TextStyleProvider value={{ color: theme.colors.foreground, fontSize: SIZES[size].font }}>
        {renderText(children)}
      </TextStyleProvider>
    </View>
  )
}

export function AvatarBadge({ style, children, ...props }: ViewProps) {
  const theme = useTheme()
  const { size } = React.useContext(AvatarContext)
  const s = SIZES[size]
  return (
    <View
      style={[
        {
          position: "absolute",
          right: -theme.borderWidth,
          bottom: -theme.borderWidth,
          zIndex: 10,
          width: s.badge,
          height: s.badge,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 9999,
          borderWidth: theme.borderWidth,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.main,
        },
        style,
      ]}
      {...props}
    >
      {s.badgeIcon ? (
        <TextStyleProvider value={{ color: theme.colors.mainForeground, iconSize: s.badgeIcon }}>
          {children}
        </TextStyleProvider>
      ) : null}
    </View>
  )
}

/** Overlapping avatars (`-space-x-2`). */
export function AvatarGroup({ style, children, ...props }: ViewProps) {
  const items = React.Children.toArray(children)
  return (
    <View style={[{ flexDirection: "row" }, style]} {...props}>
      {items.map((c, i) => (
        <View key={i} style={{ marginLeft: i === 0 ? 0 : -8 }}>
          {c}
        </View>
      ))}
    </View>
  )
}

export function AvatarGroupCount({ style, children, ...props }: ViewProps) {
  const theme = useTheme()
  return (
    <View
      style={[
        {
          width: 40,
          height: 40,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 9999,
          borderWidth: theme.borderWidth,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.secondaryBackground,
        },
        style,
      ]}
      {...props}
    >
      <TextStyleProvider value={{ color: theme.colors.foreground, fontSize: 14, iconSize: 16 }}>
        {renderText(children)}
      </TextStyleProvider>
    </View>
  )
}
