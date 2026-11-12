import * as React from "react"
import { Pressable, ScrollView, View } from "react-native"
import { StatusBar } from "expo-status-bar"
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context"
import { DMSans_500Medium, DMSans_700Bold, useFonts } from "@expo-google-fonts/dm-sans"
import {
  ArrowLeftIcon,
  Badge,
  Button,
  createTheme,
  Heading,
  Input,
  mainColors,
  NeoProvider,
  SearchIcon,
  Switch,
  Text,
  Toaster,
  TooltipProvider,
  useTheme,
} from "neobrutalism-native"
import { demos } from "./src/demos"

type Accent = keyof typeof mainColors

export default function App() {
  const [fontsLoaded] = useFonts({ DMSans_500Medium, DMSans_700Bold })
  if (!fontsLoaded) return null
  return (
    <SafeAreaProvider>
      <Root />
    </SafeAreaProvider>
  )
}

function Root() {
  const insets = useSafeAreaInsets()
  const [dark, setDark] = React.useState(false)
  const [accent, setAccent] = React.useState<Accent>("blue")
  const theme = React.useMemo(
    () =>
      createTheme({
        dark,
        colors: { main: mainColors[accent] },
        fonts: { base: "DMSans_500Medium", heading: "DMSans_700Bold" },
      }),
    [dark, accent],
  )
  return (
    <NeoProvider theme={theme} insets={insets}>
      <TooltipProvider>
        <StatusBar style={dark ? "light" : "dark"} />
        <Showcase dark={dark} setDark={setDark} accent={accent} setAccent={setAccent} />
        <Toaster />
      </TooltipProvider>
    </NeoProvider>
  )
}

function Showcase({
  dark,
  setDark,
  accent,
  setAccent,
}: {
  dark: boolean
  setDark: (v: boolean) => void
  accent: Accent
  setAccent: (a: Accent) => void
}) {
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const [query, setQuery] = React.useState("")
  const [current, setCurrent] = React.useState<string | null>(null)
  const demo = demos.find((d) => d.name === current)
  const list = demos.filter((d) => d.name.toLowerCase().includes(query.toLowerCase()))

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background, paddingTop: insets.top }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 2,
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.secondaryBackground,
        }}
      >
        {demo ? (
          <Button size="icon-sm" variant="neutral" accessibilityLabel="Back" onPress={() => setCurrent(null)}>
            <ArrowLeftIcon size={16} />
          </Button>
        ) : null}
        <Heading size="xl" style={{ flex: 1 }} numberOfLines={1}>
          {demo ? demo.name : "neobrutalism-native"}
        </Heading>
        <Text size="sm">Dark</Text>
        <Switch checked={dark} onCheckedChange={setDark} accessibilityLabel="Dark mode" />
      </View>

      {demo ? (
        <ScrollView
          key={demo.name}
          contentContainerStyle={{ padding: 24, paddingBottom: insets.bottom + 96, gap: 24 }}
          keyboardShouldPersistTaps="handled"
        >
          {demo.description ? <Text>{demo.description}</Text> : null}
          <demo.Component />
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32, gap: 16 }}>
          <Text>
            {demos.length} components, ported from neobrutalism.dev to React Native. Runs on iOS, Android and the web.
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
            {(Object.keys(mainColors) as Accent[]).map((c) => (
              <Pressable
                key={c}
                accessibilityRole="button"
                accessibilityLabel={`Accent ${c}`}
                onPress={() => setAccent(c)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 9999,
                  borderWidth: 2,
                  borderColor: theme.colors.border,
                  backgroundColor: mainColors[c],
                  transform: [{ scale: accent === c ? 1.15 : 1 }],
                }}
              />
            ))}
          </ScrollView>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ position: "absolute", left: 12, zIndex: 1 }}>
              <SearchIcon size={16} />
            </View>
            <Input placeholder="Search components..." value={query} onChangeText={setQuery} style={{ flex: 1, paddingLeft: 36 }} />
          </View>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
            {list.map((d) => (
              <Button
                key={d.name}
                variant={dark ? "default" : "neutral"}
                onPress={() => setCurrent(d.name)}
                style={{ flexGrow: 1, minWidth: 150 }}
              >
                {d.name}
              </Button>
            ))}
          </View>
          {list.length === 0 ? <Badge>No match</Badge> : null}
        </ScrollView>
      )}
    </View>
  )
}
