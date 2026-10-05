import { inject, type InjectionKey, type Ref } from 'vue'

export interface AutocompleteContextValue {
  id: Readonly<Ref<string>>
  inputRef: Ref<HTMLInputElement | null>
  activeDescendantRef: Ref<HTMLElement | null>
  scrollContainerRef: Ref<HTMLElement | null>
  inputValue: Ref<string>
  deferredInputValue: Ref<string>
  autocompleteSuggestion: Ref<string>
  isMenuDirectlyActivated: Ref<boolean>
  selectedItemLength: Ref<number>
  showMenu: Ref<boolean>
  composing: Ref<boolean>
  setInputValue: (value: string) => void
  setShowMenu: (value: boolean) => void
  setAutocompleteSuggestion: (value: string) => void
  setIsMenuDirectlyActivated: (value: boolean) => void
  setSelectedItemLength: (value: number) => void
  // focus-zone keydown emulation: returns true when the zone consumed the key (source then preventDefaults, focus-zone.mjs:518-520)
  navigate: (event: KeyboardEvent) => boolean
  // input focusin/focusout hooks into the zone (focus-zone.mjs:387-398)
  notifyControlFocus: () => void
  notifyControlBlur: () => void
}

export const AutocompleteContext: InjectionKey<AutocompleteContextValue> = Symbol('AutocompleteContext')
export const AutocompleteInputContext = AutocompleteContext
export const AutocompleteDeferredInputContext = AutocompleteContext
export function useAutocompleteContext() {
  const context = inject(AutocompleteContext, null)
  if (!context) throw new Error('AutocompleteContext returned null values')
  return context
}
