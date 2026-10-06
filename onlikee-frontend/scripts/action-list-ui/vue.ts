import { createApp, h, provide } from 'vue'
import Dynamic from './vue-dynamic'
import { ActionList } from '@implementation/ActionList/index.ts'
import { FeatureFlags } from '@implementation/FeatureFlags/index.ts'
import '@parity-theme/light.css'
import '@parity-theme/dark.css'
import '@parity-theme/typography.css'
const params = new URLSearchParams(location.search)
const scenario = params.get('scenario') || 'basic'
if (scenario === 'truncate') document.getElementById('app')!.style.maxWidth = '280px'
if (params.get('theme') === 'dark') document.documentElement.dataset.colorMode = 'dark'
const Icon = () => h('svg', { width: 16, height: 16, viewBox: '0 0 16 16', fill: 'currentColor', 'aria-hidden': 'true' }, [h('path', { d: 'M2 2h12v12H2z' })])
createApp(scenario === 'dynamic' ? Dynamic : { setup() {
  provide(ActionList.ContainerContext, scenario === 'menu' ? { container: 'ActionMenu', listRole: 'menu' } : scenario === 'gap' ? { container: 'NavList' } : {})
  return () => {
    const grouped = scenario === 'group' || scenario === 'group-action' || scenario === 'menu'
    const role = scenario === 'menu' ? 'menu' : scenario === 'listbox' ? 'listbox' : undefined
    const selectionVariant = ['single', 'radio', 'multiple', 'listbox', 'menu'].includes(scenario) ? scenario === 'multiple' ? 'multiple' : scenario === 'radio' ? 'radio' : 'single' : undefined
    const entries = [
      h(ActionList.Item, { id: 'first', selected: selectionVariant ? true : undefined, active: scenario === 'states', variant: scenario === 'states' ? 'danger' : 'default' }, { default: () => [
        h(ActionList.LeadingVisual, null, { default: Icon }), 'Alpha',
        h(ActionList.Description, { variant: scenario === 'block' ? 'block' : 'inline', truncate: scenario === 'truncate' }, { default: () => 'Helpful description that may overflow its available width' }),
        h(ActionList.TrailingVisual, null, { default: () => 'Meta' }),
        ['trailing', 'trailing-loading'].includes(scenario) ? h(ActionList.TrailingAction, { icon: Icon, label: 'Edit' }) : null,
      ] }),
      h(ActionList.Item, { id: 'second', size: 'large', disabled: scenario === 'states', loading: scenario === 'loading', inactiveText: scenario === 'inactive' || scenario === 'menu' ? 'Permission required' : undefined }, { default: () => ['Beta', ['trailing', 'trailing-loading'].includes(scenario) ? h(ActionList.TrailingAction, { label: 'Manage', loading: scenario === 'trailing-loading' }) : null] }),
      h(ActionList.Divider),
      h(ActionList.LinkItem, { id: 'link', href: '#target', target: '_blank', rel: 'noopener noreferrer', inactiveText: scenario === 'inactive' ? 'Unavailable link' : undefined }, { default: () => ['Documentation', h(ActionList.TrailingVisual, null, { default: Icon })] }),
    ]
    return h(FeatureFlags, { flags: { primer_react_action_list_group_heading_trailing_action: scenario === 'group-action', primer_react_action_list_item_gap: scenario === 'gap' } }, { default: () => h(ActionList, { variant: scenario === 'full' ? 'full' : scenario === 'horizontal' ? 'horizontal-inset' : 'inset', role, selectionVariant, showDividers: scenario === 'dividers' }, { default: () => [
      ['heading', 'heading-hidden'].includes(scenario) ? h(ActionList.Heading, { as: 'h2', size: 'small', id: 'heading', visuallyHidden: scenario === 'heading-hidden' }, { default: () => 'Actions' }) : null,
      ...(grouped ? [h(ActionList.Group, null, { default: () => [h(ActionList.GroupHeading, { as: role ? undefined : 'h3', variant: 'filled', auxiliaryText: 'Information' }, { default: () => ['Group', scenario === 'group-action' ? h(ActionList.GroupHeading.TrailingAction, { icon: Icon, label: 'Edit group' }) : false] }), ...entries] })] : entries),
    ] }) })
  }
} }).mount('#app')
