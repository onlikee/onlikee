import React from 'react'
import Dynamic from './react-dynamic'
import { createRoot } from 'react-dom/client'
import { ActionList } from '@reference/ActionList/index.ts'
import { FeatureFlags } from '@reference/FeatureFlags/FeatureFlags.tsx'
import '@parity-theme/light.css'
import '@parity-theme/dark.css'
import '@parity-theme/typography.css'
const params = new URLSearchParams(location.search)
const scenario = params.get('scenario') || 'basic'
if (scenario === 'truncate') document.getElementById('app')!.style.maxWidth = '280px'
if (params.get('theme') === 'dark') document.documentElement.dataset.colorMode = 'dark'
const Icon = () => <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M2 2h12v12H2z" /></svg>
function App() {
  const grouped = scenario === 'group' || scenario === 'group-action' || scenario === 'menu'
  const role = scenario === 'menu' ? 'menu' : scenario === 'listbox' ? 'listbox' : undefined
  const selectionVariant = ['single', 'radio', 'multiple', 'listbox', 'menu'].includes(scenario) ? scenario === 'multiple' ? 'multiple' : scenario === 'radio' ? 'radio' : 'single' : undefined
  const entries = [
    <ActionList.Item key="a" id="first" selected={selectionVariant ? true : undefined} active={scenario === 'states'} variant={scenario === 'states' ? 'danger' : 'default'}>
      <ActionList.LeadingVisual><Icon /></ActionList.LeadingVisual>
      Alpha
      <ActionList.Description variant={scenario === 'block' ? 'block' : 'inline'} truncate={scenario === 'truncate'}>Helpful description that may overflow its available width</ActionList.Description>
      <ActionList.TrailingVisual>Meta</ActionList.TrailingVisual>
      {['trailing', 'trailing-loading'].includes(scenario) && <ActionList.TrailingAction icon={Icon} label="Edit" />}
    </ActionList.Item>,
    <ActionList.Item key="b" id="second" size="large" disabled={scenario === 'states'} loading={scenario === 'loading'} inactiveText={scenario === 'inactive' || scenario === 'menu' ? 'Permission required' : undefined}>
      Beta
      {['trailing', 'trailing-loading'].includes(scenario) && <ActionList.TrailingAction label="Manage" loading={scenario === 'trailing-loading'} />}
    </ActionList.Item>,
    <ActionList.Divider key="divider" />,
    <ActionList.LinkItem key="link" id="link" href="#target" target="_blank" rel="noopener noreferrer" inactiveText={scenario === 'inactive' ? 'Unavailable link' : undefined}>Documentation<ActionList.TrailingVisual><Icon /></ActionList.TrailingVisual></ActionList.LinkItem>,
  ]
  return <FeatureFlags flags={{ primer_react_action_list_group_heading_trailing_action: scenario === 'group-action', primer_react_action_list_item_gap: scenario === 'gap' }}>
    <ActionList.ContainerContext.Provider value={scenario === 'menu' ? { container: 'ActionMenu', listRole: 'menu' } : scenario === 'gap' ? { container: 'NavList' } : {}}>
      <ActionList variant={scenario === 'full' ? 'full' : scenario === 'horizontal' ? 'horizontal-inset' : 'inset'} role={role} selectionVariant={selectionVariant} showDividers={scenario === 'dividers'}>
        {['heading', 'heading-hidden'].includes(scenario) && <ActionList.Heading as="h2" size="small" id="heading" visuallyHidden={scenario === 'heading-hidden'}>Actions</ActionList.Heading>}
        {grouped ? <ActionList.Group><ActionList.GroupHeading as={role ? undefined : 'h3'} variant="filled" auxiliaryText="Information">Group{scenario === 'group-action' && <ActionList.GroupHeading.TrailingAction icon={Icon} label="Edit group" />}</ActionList.GroupHeading>{entries}</ActionList.Group> : entries}
      </ActionList>
    </ActionList.ContainerContext.Provider>
  </FeatureFlags>
}
createRoot(document.getElementById('app')!).render(scenario === 'dynamic' ? <Dynamic /> : <App />)
