import { defineComponent, h, provide, reactive, ref } from 'vue'
import { ActionList } from '@implementation/ActionList/index.ts'

export default defineComponent({ setup() {
  const state = reactive({ selected: false, active: false, loading: false, disabled: false, inactive: false, prevent: false, description: 'Description that overflows the available space in narrow viewports' })
  const events: string[] = []
  const link = ref<{ element: HTMLElement | null; focus: () => void } | null>(null)
  Object.assign(window, {
    updateActionList: (patch: Partial<typeof state>) => Object.assign(state, patch),
    actionListProbe: () => ({ events, linkElement: link.value?.element?.tagName ?? null }),
    focusActionListLink: () => link.value?.focus(),
  })
  provide(ActionList.ContainerContext, { afterSelect: (event: Event) => events.push(`after:${event.type}:${event.defaultPrevented}`) })
  return () => h(ActionList, { role: 'listbox', selectionVariant: 'multiple', showDividers: true, 'aria-label': 'Dynamic actions' }, { default: () => [
    h(ActionList.Item, { id: 'first', selected: state.selected, active: state.active, loading: state.loading, disabled: state.disabled, inactiveText: state.inactive ? 'Unavailable' : undefined, onSelect: (event: Event) => {
      events.push(`select:${event.type}:${event.defaultPrevented}`)
      if (state.prevent) event.preventDefault()
      else state.selected = !state.selected
    } }, { default: () => ['Alpha', h(ActionList.Description, { truncate: true }, { default: () => state.description })] }),
    h(ActionList.Item, { id: 'second' }, { default: () => 'Beta' }),
    h(ActionList.LinkItem, { id: 'link', href: '#target', ref: link, privateTooltipText: 'Link details', inactiveText: state.inactive ? 'Unavailable link' : undefined, onClick: (event: Event) => {
      events.push(`link:${event.type}:${event.defaultPrevented}`)
      event.preventDefault()
    } }, { default: () => 'Documentation' }),
  ] })
} })
