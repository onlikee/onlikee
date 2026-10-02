import { Fragment, isVNode, type Component, type FunctionalComponent, type VNode, type VNodeChild, type VNodeProps } from 'vue'

export interface SlotMarker {
  __SLOT__?: symbol
}

export type WithSlotMarker<T> = T & SlotMarker
type ComponentMatcher = Component | string
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Match predicates may accept the component's own props type.
type ComponentAndPropsMatcher = readonly [ComponentMatcher, (props: any) => boolean]
export type SlotConfig = Record<string, ComponentMatcher | ComponentAndPropsMatcher>

type SlotComponent<Entry> = Entry extends readonly [infer C, unknown] ? C : Entry
type ComponentProps<C> = C extends abstract new (...args: never[]) => { $props: infer P }
  ? P
  : C extends FunctionalComponent<infer P>
    ? P
    : Record<string, unknown>
type SlotElements<Config extends SlotConfig> = {
  [Key in keyof Config]: VNode & {
    props: (ComponentProps<SlotComponent<Config[Key]>> & VNodeProps) | null
  }
}

function marker(value: unknown): symbol | undefined {
  if (value === null || (typeof value !== 'object' && typeof value !== 'function')) return
  return (value as SlotMarker).__SLOT__
}

/** Recognize wrappers that share a source component's slot marker. */
export function isSlot(element: unknown, source: ComponentMatcher): boolean {
  const sourceMarker = marker(source)
  const elementMarker = marker(element) ?? (isVNode(element) ? marker(element.type) : undefined)
  return sourceMarker !== undefined && sourceMarker === elementMarker
}

/** Vue equivalent of React's asSlot: keep the wrapper reference and copy its marker. */
export function asSlot<T extends Component>(component: T, source: ComponentMatcher): WithSlotMarker<T> {
  const sourceMarker = marker(source)
  if (import.meta.env.DEV && sourceMarker === undefined) {
    console.warn('asSlot: the source has no `__SLOT__` marker. The wrapper will not be recognized as a slot.')
  }
  if (sourceMarker !== undefined) Object.assign(component, { __SLOT__: sourceMarker })
  return component as WithSlotMarker<T>
}

function componentName(component: unknown): string | undefined {
  if (component === null || (typeof component !== 'object' && typeof component !== 'function')) return
  const options = component as { displayName?: string; name?: string; __name?: string }
  return options.displayName || options.name || options.__name
}

function isPropsMatcher(entry: SlotConfig[string]): entry is ComponentAndPropsMatcher {
  return Array.isArray(entry)
}

function matches(child: VNode, entry: SlotConfig[string]): boolean {
  if (isPropsMatcher(entry)) {
    const [component, test] = entry
    return (child.type === component || isSlot(child, component)) && test(child.props ?? {})
  }
  return child.type === entry || isSlot(child, entry)
}

function warnMissingMarker(child: VNode, keys: string[], entries: SlotConfig[string][]): void {
  const name = componentName(child.type)
  if (!name) return
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i]
    const component = isPropsMatcher(entry) ? entry[0] : entry
    // A rejected props predicate is not a missing-marker error.
    if (child.type === component || isSlot(child, component)) continue
    if (componentName(component) === name) {
      console.warn(
        `useSlots: child with name "${name}" matches slot "${keys[i]}" by name but is missing the \`__SLOT__\` marker. ` +
        'Use `asSlot(wrapper, SourceComponent)` to copy it.'
      )
      return
    }
  }
}

function forEachChild(children: VNodeChild, visit: (child: VNodeChild) => void): void {
  if (Array.isArray(children)) {
    for (const child of children) forEachChild(child, visit)
  } else if (isVNode(children) && children.type === Fragment) {
    // Vue emits Fragments for template/v-for groups. Do not descend into elements or components.
    forEachChild(children.children as VNodeChild, visit)
  } else {
    visit(children)
  }
}

/**
 * Vue port of react/src/hooks/useSlots.ts. Returns matched slots and remaining children.
 * Config entries accept a component or [component, propsPredicate]; wrappers match by __SLOT__.
 * Call inside the render function with slots.default?.(), so each render reads current children.
 * Vue Fragments are flattened; text/comments and unmatched children remain in rest.
 */
export function useSlots<Config extends SlotConfig>(
  children: VNodeChild,
  config: Config
): [Partial<SlotElements<Config>>, VNodeChild[]] {
  const slots: Partial<SlotElements<Config>> = {}
  const rest: VNodeChild[] = []
  const keys = Object.keys(config) as Array<keyof Config & string>
  const entries = Object.values(config)
  for (const key of keys) slots[key] = undefined
  let slotsFound = 0

  forEachChild(children ?? [], child => {
    if (!isVNode(child) || typeof child.type === 'symbol') {
      rest.push(child)
      return
    }

    // Preserve React's production fast path; development still detects duplicates.
    if (slotsFound === keys.length) {
      if (import.meta.env.DEV) {
        const duplicateIndex = entries.findIndex(entry => matches(child, entry))
        if (duplicateIndex !== -1) {
          console.warn(`Found duplicate "${keys[duplicateIndex]}" slot. Only the first will be rendered.`)
          return
        }
      }
      rest.push(child)
      return
    }

    const index = entries.findIndex(entry => matches(child, entry))
    if (index === -1) {
      if (import.meta.env.DEV) warnMissingMarker(child, keys, entries)
      rest.push(child)
      return
    }

    const key = keys[index]
    if (slots[key] !== undefined) {
      if (import.meta.env.DEV) console.warn(`Found duplicate "${key}" slot. Only the first will be rendered.`)
      return
    }

    slots[key] = child as SlotElements<Config>[typeof key]
    slotsFound++
  })

  return [slots, rest]
}

/** Filter rest down to element/component VNodes, as React's isValidElement does for group bodies. */
export function elementChildren(children: VNodeChild): VNode[] {
  const elements: VNode[] = []
  forEachChild(children, child => {
    if (isVNode(child) && typeof child.type !== 'symbol') elements.push(child)
  })
  return elements
}

/** Read a component's default slot, the Vue equivalent of a React element's props.children. */
export function slotChildren(node?: VNode): VNodeChild[] {
  const children = node?.children
  if (children && typeof children === 'object' && !Array.isArray(children) && 'default' in children) {
    return typeof children.default === 'function' ? children.default() : []
  }
  if (Array.isArray(children)) return children
  return typeof children === 'string' ? [children] : []
}
