import { computed, nextTick, onBeforeUnmount, onMounted, ref, type Ref } from 'vue'

/** Preserve native defaults while restoring controlled inputs when an update is rejected. */
export function useInputValue<T extends HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
  props: { value?: string | number | null; defaultValue?: string | number },
  element: Ref<T | undefined>,
  update: (value: string, event: Event) => void,
) {
  const localValue = ref(String(props.defaultValue ?? ''))
  const value = computed(() => props.value === undefined ? localValue.value : String(props.value ?? ''))
  let composing = false
  let form: HTMLFormElement | null | undefined
  let justComposedValue: string | undefined
  function commit(event: Event) {
    const next = (event.target as T).value
    if (props.value === undefined) localValue.value = next
    update(next, event)
    void nextTick(() => {
      // 仅在值变化时写回 DOM，避免重置选区和光标；父组件拒绝更新时恢复受控值。
      if (element.value && props.value !== undefined && element.value.value !== value.value) element.value.value = value.value
    })
  }
  function input(event: Event) {
    if (composing || (event as InputEvent).isComposing) return
    const next = (event.target as T).value
    if (justComposedValue !== undefined && next === justComposedValue) {
      justComposedValue = undefined
      return
    }
    justComposedValue = undefined
    commit(event)
  }
  function compositionStart() { composing = true }
  function compositionEnd(event: CompositionEvent) {
    if (!composing) return
    composing = false
    justComposedValue = (event.target as T).value
    commit(event)
  }
  function reset() {
    void nextTick(() => {
      if (element.value instanceof HTMLSelectElement && props.value === undefined) {
        localValue.value = element.value.value
        return
      }
      if (props.value === undefined) localValue.value = String(props.defaultValue ?? '')
      if (element.value && element.value.value !== value.value) element.value.value = value.value
    })
  }
  onMounted(() => {
    form = element.value?.form
    form?.addEventListener('reset', reset)
    const el = element.value
    if (el && !(el instanceof HTMLSelectElement)) {
      const hasValueProp = props.value !== undefined
      const hasDefaultProp = props.defaultValue !== undefined
      if (hasValueProp || hasDefaultProp) {
        const type = (el as HTMLInputElement).type
        const isButton = type === 'submit' || type === 'reset'
        if (!(isButton && props.value == null)) {
          const defaultValue = props.defaultValue == null ? '' : props.defaultValue
          el.defaultValue = String(props.value != null ? props.value : defaultValue)
        }
      }
    }
  })
  onBeforeUnmount(() => form?.removeEventListener('reset', reset))
  return { value, input, commit, compositionStart, compositionEnd, setUncontrolledValue: (next: string) => { localValue.value = next } }
}
