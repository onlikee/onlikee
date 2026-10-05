import { createApp, h, ref } from 'vue'
import { SelectPanel } from '@implementation/SelectPanel/index.ts'
import { FeatureFlags } from '@implementation/FeatureFlags/index.ts'
import '@parity-theme/light.css'
import '@parity-theme/dark.css'
import '@parity-theme/typography.css'
const params = new URLSearchParams(location.search)
const scenario = params.get('scenario') || 'single'
const items = [
  { id: 'a', text: 'Alpha', groupId: 'first' },
  { id: 'b', text: 'Beta', description: 'Helpful description', groupId: 'second' },
  { id: 'c', text: 'Gamma', disabled: true, groupId: 'second' },
]
const VisualIcon = () =>
  h('svg', { width: 16, height: 16, viewBox: '0 0 16 16', fill: 'currentColor', 'aria-hidden': 'true' }, [
    h('path', { d: 'M2 2h12v12H2z' }),
  ])
if (scenario === 'advanced')
  items.splice(
    0,
    items.length,
    ...[
      { id: 'a', text: 'Inline label', description: 'Details', leadingVisual: VisualIcon, trailingText: 'Meta' },
      { id: 'b', text: 'Block label', description: 'Second line', descriptionVariant: 'block', size: 'large' },
      { id: 'c', text: 'Unavailable', inactiveText: 'Insufficient permission' },
      { id: 'd', text: 'Pending', loading: true, leadingVisual: VisualIcon },
      { id: 'e', text: 'Danger option', variant: 'danger' },
      { id: 'f', text: 'Disabled', disabled: true },
    ],
  )
if (params.get('theme') === 'dark') document.documentElement.dataset.colorMode = 'dark'
createApp({
  setup() {
    const selected = ref(['multi', 'all', 'cancel', 'secondary-loading'].includes(scenario) ? [items[0]] : items[0])
    const open = ref(true)
    return () =>
      h(
        FeatureFlags,
        {
          flags: {
            primer_react_merged_forwarded_refs: params.has('merged'),
            primer_react_css_anchor_positioning: params.has('cssanchor'),
            primer_react_select_panel_fullscreen_on_narrow: true,
          },
        },
        () =>
          h(SelectPanel, {
            open: open.value,
            selected: selected.value,
            items: scenario === 'message' || scenario === 'loading' || scenario === 'skeleton' ? [] : items,
            virtualized: params.has('virtual'),
            showSelectAll: scenario === 'all',
            showItemDividers: scenario === 'advanced',
            groupMetadata:
              scenario === 'group'
                ? [
                    { groupId: 'first', header: { title: 'First group' } },
                    { groupId: 'second', header: { title: 'Second group', variant: 'filled', auxiliaryText: '2' } },
                  ]
                : undefined,
            initialLoadingType: scenario === 'skeleton' ? 'skeleton' : 'spinner',
            title: 'Choose a label',
            subtitle: 'Labels for this issue',
            placeholder: 'Select label',
            variant: scenario === 'modal' ? 'modal' : 'anchored',
            onCancel: ['modal', 'cancel'].includes(scenario) ? () => {} : undefined,
            loading: scenario === 'loading' || ['skeleton', 'input-loading'].includes(scenario) ? true : false,
            height: params.get('height') || undefined,
            width: params.get('width') || undefined,
            notice: scenario === 'notice' ? { variant: 'warning', text: 'Some items are unavailable.' } : undefined,
            message:
              scenario === 'message'
                ? { variant: 'warning', title: 'No matching labels', body: 'Try a different search.' }
                : undefined,
            secondaryAction:
              scenario === 'secondary-loading'
                ? h(SelectPanel.SecondaryActionButton, { loading: true }, () => 'Create label')
                : scenario === 'multi'
                  ? h(SelectPanel.SecondaryActionButton, null, () => 'Create label')
                  : undefined,
            'onUpdate:selected': (value) => (selected.value = value),
            'onUpdate:open': (value) => (open.value = value),
          }),
      )
  },
}).mount('#app')
