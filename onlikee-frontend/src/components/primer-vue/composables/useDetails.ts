import {
  onMounted,
  shallowRef,
  toValue,
  watch,
  type ComponentPublicInstance,
  type MaybeRefOrGetter,
  type Ref,
} from 'vue'
import type { DetailsInstance } from '../Details/types'

export interface UseDetailsParameters {
  /** Receives the native details element, including when binding to the Details component. */
  ref?: Ref<HTMLDetailsElement | null>
  closeOnOutsideClick?: boolean
  defaultOpen?: boolean
  onClickOutside?: (event: MouseEvent) => void
}

export type DetailsOpenState = boolean | undefined
export type DetailsOpenUpdate =
  DetailsOpenState | ((previous: DetailsOpenState) => DetailsOpenState)

export function useDetails(options: MaybeRefOrGetter<UseDetailsParameters> = {}) {
  const initial = toValue(options)
  const open = shallowRef<DetailsOpenState>(initial.defaultOpen)
  const backupRef = shallowRef<HTMLDetailsElement | null>(null)
  const getRef = () => toValue(options).ref ?? backupRef
  const boundRef = shallowRef<Element | ComponentPublicInstance | null>(null)

  function setOpen(update: DetailsOpenUpdate) {
    open.value = typeof update === 'function' ? update(open.value) : update
  }

  // Vue component refs expose a component instance; consumers of this composable
  // receive the native DOM element, as they do with the React hook. The exposed
  // element can become available after the component ref callback has run.
  function setRef(value: Element | ComponentPublicInstance | null) {
    boundRef.value = value
    // The owning scope may already be stopped when Vue clears vnode refs.
    if (value === null) getRef().value = null
  }
  watch(
    [getRef, () => (boundRef.value as DetailsInstance | null)?.element ?? boundRef.value],
    ([ref, element], [previousRef]) => {
      if (previousRef && previousRef !== ref) previousRef.value = null
      ref.value = element instanceof HTMLDetailsElement ? element : null
    },
    { flush: 'sync' },
  )

  function onToggle(event: Event) {
    if (!event.defaultPrevented) setOpen((event.target as HTMLDetailsElement).open)
  }

  function onClickOutside(event: MouseEvent) {
    const target = event.target as Element | null
    const closest = typeof target?.closest === 'function' ? target.closest('details') : null
    // Match the source's closest-details rule, including nested disclosures.
    if (closest !== getRef().value) {
      toValue(options).onClickOutside?.(event)
      if (!event.defaultPrevented) setOpen(false)
    }
  }

  onMounted(() => {
    watch(
      [open, () => toValue(options).closeOnOutsideClick, () => getRef().value],
      ([isOpen, closeOnOutsideClick, element], _previous, onCleanup) => {
        if (!isOpen || !closeOnOutsideClick || !element) return
        const document = element.ownerDocument
        document.addEventListener('click', onClickOutside)
        onCleanup(() => document.removeEventListener('click', onClickOutside))
      },
      { immediate: true, flush: 'post' },
    )
  })

  const getDetailsProps = () => ({ open: open.value, onToggle, ref: setRef })
  return { open, setOpen, getDetailsProps }
}

export default useDetails
