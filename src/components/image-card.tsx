import * as React from "react"
import {
  Image,
  View,
  type ImageSourcePropType,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native"
import { Surface } from "../lib/surface"
import { Text } from "../lib/text"
import { useTheme } from "../theme/ThemeProvider"

export type ImageCardProps = {
  /** Remote image URL. */
  imageUrl?: string
  /** Or any Image source (e.g. `require("./photo.png")`). */
  source?: ImageSourcePropType
  caption: React.ReactNode
  /** Default 250, like `w-[250px]`. */
  width?: number | `${number}%`
  style?: StyleProp<ViewStyle>
  captionStyle?: StyleProp<TextStyle>
  accessibilityLabel?: string
}

export function ImageCard({
  imageUrl,
  source,
  caption,
  width = 250,
  style,
  captionStyle,
  accessibilityLabel = "image",
}: ImageCardProps) {
  const theme = useTheme()
  const innerRadius = Math.max(theme.radius - theme.borderWidth, 0)
  return (
    <Surface
      shadow
      style={[
        {
          width,
          borderRadius: theme.radius,
          borderWidth: theme.borderWidth,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.background,
        },
        style,
      ]}
    >
      <View style={{ overflow: "hidden", borderRadius: innerRadius }}>
        <Image
          accessibilityLabel={accessibilityLabel}
          source={source ?? { uri: imageUrl }}
          style={{ width: "100%", aspectRatio: 4 / 3 }}
          resizeMode="cover"
        />
        <View
          style={{
            borderTopWidth: theme.borderWidth,
            borderColor: theme.colors.border,
            padding: 16,
          }}
        >
          {typeof caption === "string" ? (
            <Text style={[{ fontSize: 16, lineHeight: 24 }, captionStyle]}>{caption}</Text>
          ) : (
            caption
          )}
        </View>
      </View>
    </Surface>
  )
}

export default ImageCard
