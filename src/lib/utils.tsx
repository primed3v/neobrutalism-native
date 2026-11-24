import * as React from "react"
import { Platform, type GestureResponderEvent, type ViewStyle } from "react-native"

/** Controlled / uncontrolled state helper (like Radix' useControllableState). */
export function useControllableState<T>({
  value,
  defaultValue,
  onChange,
}: {
  value?: T
  defaultValue: T
  onChange?: (value: T) => void
}): [T, (next: T | ((prev: T) => T)) => void] {
  const [internal, setInternal] = React.useState<T>(defaultValue)
  const controlled = value !== undefined
  const current = controlled ? (value as T) : internal
  const currentRef = React.useRef(current)
  currentRef.current = current
  const onChangeRef = React.useRef(onChange)
  onChangeRef.current = onChange
  const set = React.useCallback(
    (next: T | ((prev: T) => T)) => {
      const resolved =
        typeof next === "function" ? (next as (p: T) => T)(currentRef.current) : next
      if (Object.is(resolved, currentRef.current)) return
      if (!controlled) setInternal(resolved)
      currentRef.current = resolved
      onChangeRef.current?.(resolved)
    },
    [controlled],
  )
  return [current, set]
}

export function composeHandlers<E>(
  ...handlers: (((e: E) => void) | undefined)[]
): (e: E) => void {
  return (e: E) => {
    for (const h of handlers) h?.(e)
  }
}

export function mergeRefs<T>(...refs: (React.Ref<T> | undefined)[]): React.RefCallback<T> {
  return (node: T) => {
    for (const ref of refs) {
      if (typeof ref === "function") ref(node)
      else if (ref) (ref as React.MutableRefObject<T>).current = node
    }
  }
}

type SlotProps = {
  children?: React.ReactNode
  [key: string]: unknown
}

const HANDLER_KEYS = ["onPress", "onLongPress", "onPressIn", "onPressOut", "onHoverIn", "onHoverOut", "onLayout"]

/**
 * Merges its props into its single child element (Radix' `Slot`), so
 * `<DialogTrigger asChild><Button>Open</Button></DialogTrigger>` works.
 */
export const Slot = React.forwardRef<unknown, SlotProps>(function Slot(
  { children, ...props },
  ref,
) {
  const child = React.Children.only(children) as React.ReactElement<Record<string, unknown>>
  if (!React.isValidElement(child)) return null
  const childProps = child.props as Record<string, unknown>
  const merged: Record<string, unknown> = { ...props, ...childProps }
  for (const key of HANDLER_KEYS) {
    const a = props[key] as ((e: unknown) => void) | undefined
    const b = childProps[key] as ((e: unknown) => void) | undefined
    if (a && b) merged[key] = composeHandlers(b, a)
    else merged[key] = a ?? b
  }
  if (props.style && childProps.style) merged.style = [props.style, childProps.style]
  const childRef = (child as unknown as { ref?: React.Ref<unknown> }).ref ?? childProps.ref
  merged.ref = mergeRefs(ref, childRef as React.Ref<unknown>)
  return React.cloneElement(child, merged)
})

export type PressHandler = (e: GestureResponderEvent) => void

/** Simple className-free variant picker. */
export function pick<T extends Record<string, unknown>>(
  map: T,
  key: keyof T | undefined | null,
  fallback: keyof T,
): T[keyof T] {
  return map[(key ?? fallback) as keyof T] ?? map[fallback]
}

let idCounter = 0
/** Stable id that works on React 17+ (useId fallback). */
export function useStableId(prefix = "neo"): string {
  const reactUseId = (React as unknown as { useId?: () => string }).useId
  // eslint-disable-next-line react-hooks/rules-of-hooks
  if (reactUseId) return `${prefix}${reactUseId().replace(/:/g, "")}`
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const ref = React.useRef<string | null>(null)
  if (ref.current === null) ref.current = `${prefix}-${++idCounter}`
  return ref.current
}

export function clamp(v: number, min: number, max: number) {
  return Math.min(Math.max(v, min), max)
}

/**
 * Ref instance types. `React.ComponentRef` resolves correctly whether the
 * installed react-native types declare View as a class (<0.80) or as a
 * function component with a `ref` prop (>=0.80). They are interfaces so
 * emitted .d.ts files reference them by name (RN's own instance types live
 * at private paths that aren't portable).
 */
export interface ViewRef extends React.ComponentRef<typeof import("react-native").View> {}
export interface TextRef extends React.ComponentRef<typeof import("react-native").Text> {}
export interface TextInputRef extends React.ComponentRef<typeof import("react-native").TextInput> {}
export interface ScrollViewRef extends React.ComponentRef<typeof import("react-native").ScrollView> {}

/** Web-only CSS that isn't part of React Native's style types (e.g. outline: none). */
export function webStyle<T = ViewStyle>(css: Record<string, unknown>): NoInfer<T> | null {
  return Platform.OS === "web" ? (css as unknown as NoInfer<T>) : null
}
