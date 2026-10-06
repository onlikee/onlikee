import React, { useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { ActionMenu } from '@reference/ActionMenu/index.ts'
import { ActionList } from '@reference/ActionList/index.ts'
import { Button, IconButton } from '@reference/Button/index.ts'
import { Tooltip } from '@reference/TooltipV2/Tooltip.tsx'
import { FeatureFlags } from '@reference/FeatureFlags/FeatureFlags.tsx'
import '@parity-theme/light.css'
import '@parity-theme/dark.css'
import '@parity-theme/typography.css'

const params = new URLSearchParams(location.search)
const scenario = params.get('scenario') || 'basic'
document.documentElement.dataset.colorMode = params.get('theme') || 'light'
const Icon = () => <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M2 2h12v12H2z" /></svg>
function App() {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState('Copy')
  const [version, setVersion] = useState(0)
  const [controlled, setControlled] = useState(true)
  const anchorRef = useRef<HTMLButtonElement>(null)
  const controlledScenario = ['controlled', 'release', 'external', 'context'].includes(scenario)
  const rootProps = controlledScenario ? { open: controlled ? open : undefined, onOpenChange: setOpen } : {}
  const children = [
    <ActionList.Item key="cut" id="cut" loading={scenario === 'loading'} inactiveText={scenario === 'inactive' ? 'Unavailable due to an outage' : undefined} selected={scenario === 'single' || scenario === 'multiple' ? selected === 'Cut' : undefined} onSelect={() => setSelected('Cut')}>
      <ActionList.LeadingVisual><Icon /></ActionList.LeadingVisual>Cut
    </ActionList.Item>,
    <ActionList.Item key="copy" id="copy" selected={scenario === 'single' || scenario === 'multiple' ? selected === 'Copy' : undefined} onSelect={() => setSelected('Copy')}>Copy</ActionList.Item>,
    <ActionList.Item key="disabled" id="disabled" disabled>Disabled</ActionList.Item>,
    <ActionMenu.Divider key="divider" />,
    <ActionList.Item key="delete" id="delete" variant="danger" aria-keyshortcuts="z" onSelect={event => { setSelected('Delete'); event.preventDefault() }}>Delete</ActionList.Item>,
    <ActionList.LinkItem key="link" id="link" href="#target">Link</ActionList.LinkItem>
  ]
  const contents = scenario === 'nested' ? <ActionList>
    <ActionList.Item id="cut">Cut</ActionList.Item>
    <ActionMenu>
      <ActionMenu.Anchor id="submenu"><ActionList.Item>Export</ActionList.Item></ActionMenu.Anchor>
      <ActionMenu.Overlay><ActionList>
        <ActionList.Item id="markdown" onSelect={() => setSelected('Markdown')}>Markdown</ActionList.Item>
        <ActionMenu>
          <ActionMenu.Anchor id="deep"><ActionList.Item>More</ActionList.Item></ActionMenu.Anchor>
          <ActionMenu.Overlay><ActionList><ActionList.Item id="leaf" onSelect={() => setSelected('Leaf')}>Leaf</ActionList.Item></ActionList></ActionMenu.Overlay>
        </ActionMenu>
      </ActionList></ActionMenu.Overlay>
    </ActionMenu>
  </ActionList> : <ActionList selectionVariant={scenario === 'single' ? 'single' : scenario === 'multiple' ? 'multiple' : undefined} showDividers={scenario === 'dividers'}>{children}</ActionList>
  const customAnchor = scenario === 'tooltip' || scenario === 'custom'
  return <FeatureFlags flags={{ primer_react_css_anchor_positioning: scenario.startsWith('css-') }}>
    <div style={scenario === 'css-edge' ? { position: 'fixed', bottom: 16, right: 16 } : undefined} onContextMenu={scenario === 'context' ? event => { event.preventDefault(); setOpen(true) } : undefined} id="context-area">
      {scenario === 'external' && <button key={version} ref={anchorRef} id="detached" onClick={() => setOpen(!open)}>Detached</button>}
      <ActionMenu {...rootProps} anchorRef={scenario === 'external' ? anchorRef : undefined}>
        {scenario === 'external' ? [] : (customAnchor ? <ActionMenu.Anchor id="trigger">
          {scenario === 'tooltip' ? <Tooltip text="Tools" type="label"><IconButton icon={Icon} /></Tooltip> : <Button className="authored" id="child-id">Tools</Button>}
        </ActionMenu.Anchor> : <ActionMenu.Button id="trigger" className="authored">Open menu</ActionMenu.Button>)}
        <ActionMenu.Overlay width={scenario === 'sizes' ? 'large' : 'small'} height={scenario === 'sizes' ? 'small' : undefined}
          maxHeight={scenario === 'scroll' ? 'xsmall' : undefined} overflow={scenario === 'scroll' ? 'auto' : undefined}
          align={scenario === 'sizes' ? 'end' : 'start'} side={scenario === 'sizes' ? 'outside-top' : scenario === 'css-edge' ? 'outside-right' : undefined}
          variant={scenario === 'fullscreen' ? { regular: 'anchored', narrow: 'fullscreen' } : { regular: 'anchored', narrow: 'anchored', wide: 'anchored' }}
          aria-labelledby={scenario === 'label' ? 'external-label' : undefined}
          as={scenario === 'surface' ? 'section' : undefined}>
          {contents}
          {scenario === 'external' && <button id="replace" onClick={() => setVersion(version + 1)}>Replace</button>}
        </ActionMenu.Overlay>
      </ActionMenu>
    </div>
    <button id="after">After</button>
    <button id="release" onClick={() => setControlled(false)}>Release</button>
    <span id="external-label">External menu label</span>
    <output id="result">{selected}</output>
  </FeatureFlags>
}
createRoot(document.getElementById('app')!).render(<App />)
