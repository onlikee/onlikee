import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { SelectPanel } from '@reference/SelectPanel/SelectPanel.tsx'
import { FeatureFlags } from '@reference/FeatureFlags/FeatureFlags.tsx'
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
const VisualIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M2 2h12v12H2z" />
  </svg>
)
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
function App() {
  const [selected, setSelected] = useState(
    ['multi', 'all', 'cancel', 'secondary-loading'].includes(scenario) ? [items[0]] : items[0],
  )
  const [open, setOpen] = useState(true)
  const [filter, setFilter] = useState('')
  return (
    <FeatureFlags
      flags={{
        primer_react_merged_forwarded_refs: params.has('merged'),
        primer_react_css_anchor_positioning: params.has('cssanchor'),
        primer_react_select_panel_fullscreen_on_narrow: true,
      }}
    >
      <SelectPanel
        open={open}
        selected={selected}
        onSelectedChange={setSelected}
        onOpenChange={setOpen}
        onFilterChange={setFilter}
        filterValue={filter}
        virtualized={params.has('virtual')}
        showSelectAll={scenario === 'all'}
        showItemDividers={scenario === 'advanced'}
        groupMetadata={
          scenario === 'group'
            ? [
                { groupId: 'first', header: { title: 'First group' } },
                { groupId: 'second', header: { title: 'Second group', variant: 'filled', auxiliaryText: '2' } },
              ]
            : undefined
        }
        initialLoadingType={scenario === 'skeleton' ? 'skeleton' : 'spinner'}
        items={scenario === 'message' || scenario === 'loading' || scenario === 'skeleton' ? [] : items}
        title="Choose a label"
        subtitle="Labels for this issue"
        placeholder="Select label"
        variant={scenario === 'modal' ? 'modal' : 'anchored'}
        onCancel={['modal', 'cancel'].includes(scenario) ? () => {} : undefined}
        loading={scenario === 'loading' || ['skeleton', 'input-loading'].includes(scenario) ? true : false}
        height={params.get('height') || undefined}
        width={params.get('width') || undefined}
        notice={scenario === 'notice' ? { variant: 'warning', text: 'Some items are unavailable.' } : undefined}
        message={
          scenario === 'message'
            ? { variant: 'warning', title: 'No matching labels', body: 'Try a different search.' }
            : undefined
        }
        secondaryAction={
          scenario === 'secondary-loading' ? (
            <SelectPanel.SecondaryActionButton loading>Create label</SelectPanel.SecondaryActionButton>
          ) : scenario === 'multi' ? (
            <SelectPanel.SecondaryActionButton>Create label</SelectPanel.SecondaryActionButton>
          ) : undefined
        }
      />
    </FeatureFlags>
  )
}
createRoot(document.getElementById('app')!).render(<App />)
