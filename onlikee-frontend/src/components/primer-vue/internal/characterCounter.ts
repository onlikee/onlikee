import { computed } from 'vue'

export const SCREEN_READER_DELAY = 500
export function getCharacterCountState(length: number, limit: number) {
  const remaining = limit - length
  const count = Math.abs(remaining)
  return { count, isOverLimit: remaining < 0, message: `${count} ${count === 1 ? 'character' : 'characters'} ${remaining < 0 ? 'over' : 'remaining'}` }
}
export function useCharacterCounter(getLength: () => number, getLimit: () => number | undefined) {
  return computed(() => getLimit() ? getCharacterCountState(getLength(), getLimit()!) : undefined)
}
