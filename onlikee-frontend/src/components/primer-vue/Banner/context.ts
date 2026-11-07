import type { InjectionKey } from 'vue'

export const bannerContextKey: InjectionKey<{ titleId: string }> = Symbol('Banner')
