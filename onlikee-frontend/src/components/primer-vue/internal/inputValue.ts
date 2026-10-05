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
      // react-dom 18 受控输入 "only set value if changed"（避免同值赋值丢失选区/光标；
      // Vue runtime-dom 与 vModelText 同样先比较再赋值）。缺守卫时受控输入在文本中部
      // 编辑每敲一键光标跳末尾（composables 审计偏差 2，高危回归）。拒绝更新时的恢复语义保留。
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
      // 同 commit：同值守卫（react-dom 仅在值变化时写回）
      if (element.value && element.value.value !== value.value) element.value.value = value.value
    })
  }
  onMounted(() => {
    form = element.value?.form
    form?.addEventListener('reset', reset)
    const el = element.value
    if (el && !(el instanceof HTMLSelectElement)) {
      // react-dom postMountWrapper:1867-1902 + initWrapperState:1790-1796 ——
      // 仅在存在 value/defaultValue prop 时才同步 defaultValue（Vue 以 !==undefined 代理
      // React 的 hasOwnProperty 判定）：两者皆缺时 React 完全不写，Vue 旧代码无条件写
      // String(defaultValue ?? '') 会多出 value="" 属性（composables 审计偏差 9）。
      // submit/reset 类型且 value 为 undefined/null 时跳过（避免覆盖浏览器默认按钮文案）。
      // initialValue：value != null 优先，否则 defaultValue != null ? defaultValue : ''，
      // 经 String() 强转——受控输入因此写入当前 value（而非 props.defaultValue），与源一致。
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
