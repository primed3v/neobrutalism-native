import * as React from "react"
import { StyleSheet, View } from "react-native"

type PortalEntry = { key: string; node: React.ReactNode }

type PortalContextValue = {
  mount: (key: string, node: React.ReactNode) => void
  unmount: (key: string) => void
}

const PortalContext = React.createContext<PortalContextValue | null>(null)

let portalKey = 0

/**
 * Renders portal content above the app, inside the same root view.
 * Used for non-modal floating UI (tooltips, hover cards, toasts) so they
 * don't block touches/hover on the rest of the screen.
 */
export function PortalHost({ children }: { children?: React.ReactNode }) {
  const [entries, setEntries] = React.useState<PortalEntry[]>([])
  const value = React.useMemo<PortalContextValue>(
    () => ({
      mount: (key, node) =>
        setEntries((prev) => {
          const i = prev.findIndex((e) => e.key === key)
          if (i === -1) return [...prev, { key, node }]
          const next = prev.slice()
          next[i] = { key, node }
          return next
        }),
      unmount: (key) => setEntries((prev) => prev.filter((e) => e.key !== key)),
    }),
    [],
  )
  return (
    <PortalContext.Provider value={value}>
      <View style={styles.root} collapsable={false}>
        {children}
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          {entries.map((e) => (
            <React.Fragment key={e.key}>{e.node}</React.Fragment>
          ))}
        </View>
      </View>
    </PortalContext.Provider>
  )
}

export function usePortalAvailable() {
  return React.useContext(PortalContext) !== null
}

/** Renders children into the nearest PortalHost (falls back to inline). */
export function Portal({ children }: { children?: React.ReactNode }) {
  const ctx = React.useContext(PortalContext)
  const keyRef = React.useRef<string | null>(null)
  if (keyRef.current === null) keyRef.current = `portal-${++portalKey}`
  React.useLayoutEffect(() => {
    if (!ctx) return
    ctx.mount(keyRef.current!, children)
  })
  React.useEffect(() => {
    if (!ctx) return
    const key = keyRef.current!
    return () => ctx.unmount(key)
  }, [ctx])
  if (!ctx) return <>{children}</>
  return null
}

const styles = StyleSheet.create({ root: { flex: 1 } })
