import { createApp, h, shallowRef } from 'vue'
import { ActionMenu } from '@implementation/ActionMenu/index.ts'
import { ActionList } from '@implementation/ActionList/index.ts'
import Button from '@implementation/SelectPanel/SelectPanelButton.vue'
import Tooltip from '@implementation/TooltipV2/Tooltip.vue'
import { FeatureFlags } from '@implementation/FeatureFlags/index.ts'
import '@parity-theme/light.css'
import '@parity-theme/dark.css'
import '@parity-theme/typography.css'

const params = new URLSearchParams(location.search)
const scenario = params.get('scenario') || 'basic'
document.documentElement.dataset.colorMode = params.get('theme') || 'light'
const Icon = () => h('svg', { width: 16, height: 16, viewBox: '0 0 16 16', fill: 'currentColor', 'aria-hidden': 'true' }, [h('path', { d: 'M2 2h12v12H2z' })])
const item = (label: string, props = {}) => h(ActionList.Item, props, { default: () => label })
createApp({ setup() {
  const open = shallowRef(false), selected = shallowRef('Copy'), version = shallowRef(0), controlled = shallowRef(true)
  const anchorRef = shallowRef<HTMLElement | null>(null)
  const controlledScenario = ['controlled', 'release', 'external', 'context'].includes(scenario)
  const select = (label: string) => { selected.value = label }
  return () => h(FeatureFlags, { flags: { primer_react_css_anchor_positioning: scenario.startsWith('css-') } }, { default: () => [
    h('div', { id: 'context-area', style: scenario === 'css-edge' ? { position: 'fixed', bottom: '16px', right: '16px' } : undefined, onContextmenu: scenario === 'context' ? (event: MouseEvent) => { event.preventDefault(); open.value = true } : undefined }, [
      scenario === 'external' ? h('button', { key: version.value, ref: anchorRef, id: 'detached', onClick: () => { open.value = !open.value } }, 'Detached') : null,
      h(ActionMenu, { ...(controlledScenario ? { open: controlled.value ? open.value : undefined, onOpenChange: (value: boolean) => { open.value = value } } : {}), anchorRef: scenario === 'external' ? anchorRef : undefined }, { default: () => [
        scenario === 'external' ? null : scenario === 'custom' || scenario === 'tooltip'
          ? h(ActionMenu.Anchor, { id: 'trigger' }, { default: () => scenario === 'tooltip'
            ? h(Tooltip, { text: 'Tools', type: 'label' }, { default: () => h(Button, { icon: Icon }) })
            : h(Button, { className: 'authored', id: 'child-id' }, { default: () => 'Tools' }) })
          : h(ActionMenu.Button, { id: 'trigger', className: 'authored' }, { default: () => 'Open menu' }),
        h(ActionMenu.Overlay, {
          width: scenario === 'sizes' ? 'large' : 'small', height: scenario === 'sizes' ? 'small' : undefined,
          maxHeight: scenario === 'scroll' ? 'xsmall' : undefined, overflow: scenario === 'scroll' ? 'auto' : undefined,
          align: scenario === 'sizes' ? 'end' : 'start', side: scenario === 'sizes' ? 'outside-top' : scenario === 'css-edge' ? 'outside-right' : undefined,
          variant: scenario === 'fullscreen' ? { regular: 'anchored', narrow: 'fullscreen' } : { regular: 'anchored', narrow: 'anchored', wide: 'anchored' },
          'aria-labelledby': scenario === 'label' ? 'external-label' : undefined, as: scenario === 'surface' ? 'section' : undefined
        }, { default: () => [
          scenario === 'nested' ? h(ActionList, null, { default: () => [
            item('Cut', { id: 'cut' }), h(ActionMenu, null, { default: () => [
              h(ActionMenu.Anchor, { id: 'submenu' }, { default: () => item('Export') }),
              h(ActionMenu.Overlay, null, { default: () => h(ActionList, null, { default: () => [
                item('Markdown', { id: 'markdown', onSelect: () => select('Markdown') }), h(ActionMenu, null, { default: () => [
                  h(ActionMenu.Anchor, { id: 'deep' }, { default: () => item('More') }),
                  h(ActionMenu.Overlay, null, { default: () => h(ActionList, null, { default: () => item('Leaf', { id: 'leaf', onSelect: () => select('Leaf') }) }) })
                ] })
              ] }) })
            ] })
          ] }) : h(ActionList, { selectionVariant: scenario === 'single' ? 'single' : scenario === 'multiple' ? 'multiple' : undefined, showDividers: scenario === 'dividers' }, { default: () => [
            h(ActionList.Item, { id: 'cut', loading: scenario === 'loading', inactiveText: scenario === 'inactive' ? 'Unavailable due to an outage' : undefined, selected: scenario === 'single' || scenario === 'multiple' ? selected.value === 'Cut' : undefined, onSelect: () => select('Cut') }, { default: () => [h(ActionList.LeadingVisual, null, { default: Icon }), 'Cut'] }),
            item('Copy', { id: 'copy', selected: scenario === 'single' || scenario === 'multiple' ? selected.value === 'Copy' : undefined, onSelect: () => select('Copy') }),
            item('Disabled', { id: 'disabled', disabled: true }), h(ActionMenu.Divider),
            item('Delete', { id: 'delete', variant: 'danger', 'aria-keyshortcuts': 'z', onSelect: (event: Event) => { select('Delete'); event.preventDefault() } }),
            h(ActionList.LinkItem, { id: 'link', href: '#target' }, { default: () => 'Link' })
          ] }),
          scenario === 'external' ? h('button', { id: 'replace', onClick: () => { version.value++ } }, 'Replace') : null
        ] })
      ] })
    ]),
    h('button', { id: 'after' }, 'After'), h('button', { id: 'release', onClick: () => { controlled.value = false } }, 'Release'),
    h('span', { id: 'external-label' }, 'External menu label'), h('output', { id: 'result' }, selected.value)
  ] })
} }).mount('#app')
