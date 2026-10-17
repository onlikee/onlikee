import type { InjectionKey } from 'vue'
export const tableGroupContext: InjectionKey<{ headerId: string } | undefined> =
  Symbol('Table.Group')
