import { computed } from 'vue'

export const SCREEN_READER_DELAY = 500
export function getCharacterCountState(length: number, limit: number) {
  const remaining = limit - length
  const count = Math.abs(remaining)
  return { count, isOverLimit: remaining < 0, message: `${count} ${count === 1 ? 'character' : 'characters'} ${remaining < 0 ? 'over' : 'remaining'}` }
}
/** 源 TextInput.tsx:129-137 / Textarea.tsx:105-111：受控长度取原始 prop
    String(value).length（null → 'null' → 4，源怪癖），非受控取跟踪长度。
    getLength 由调用方按该语义组装（composables 审计偏差 8）。 */
export function useCharacterCounter(getLength: () => number, getLimit: () => number | undefined) {
  return computed(() => getLimit() ? getCharacterCountState(getLength(), getLimit()!) : undefined)
}
