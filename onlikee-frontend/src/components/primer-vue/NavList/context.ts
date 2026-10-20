import { inject, type InjectionKey, type Ref } from 'vue'

export const headingLevelKey: InjectionKey<Readonly<Ref<number | null>>> =
  Symbol('NavListHeadingLevel')
export const subNavDepthKey: InjectionKey<Readonly<Ref<number>>> = Symbol('NavListSubNavDepth')
export const itemWithSubNavKey: InjectionKey<{ buttonId: string; subNavId: string }> =
  Symbol('NavListItemWithSubNav')

export function useGroupHeadingTag() {
  const headingLevel = inject(headingLevelKey, null)
  return () => (headingLevel?.value === 3 ? 'h4' : 'h3')
}
