import assert from 'node:assert/strict'
import { after, test } from 'node:test'
import { createSSRApp, h } from 'vue'
import { renderToString } from '@vue/server-renderer'
import vue from '@vitejs/plugin-vue'
import { createServer } from 'vite'

const server = await createServer({
  configFile: false,
  plugins: [vue()],
  optimizeDeps: { noDiscovery: true, entries: [] },
  server: { middlewareMode: true },
  appType: 'custom'
})
after(() => server.close())

const { UnderlinePanels } = await server.ssrLoadModule('/src/components/primer-vue/UnderlinePanels/index.ts')

async function render(props, children) {
  return renderToString(createSSRApp({
    render: () => h(UnderlinePanels, props, { default: () => children })
  }))
}

test('pairs tabs and panels by value and exposes the selected panel', async () => {
  const html = await render({ id: 'refs', value: 'tag', 'aria-label': 'Ref type' }, [
    h(UnderlinePanels.Tab, { value: 'branch' }, () => 'Branches'),
    h(UnderlinePanels.Tab, { value: 'tag' }, () => 'Tags'),
    h(UnderlinePanels.Panel, { value: 'branch' }, () => 'Branch panel'),
    h(UnderlinePanels.Panel, { value: 'tag' }, () => 'Tag panel')
  ])

  assert.match(html, /role="tablist"[^>]*aria-label="Ref type"/)
  assert.match(html, /id="refs-tab-tag"[^>]*aria-controls="refs-panel-tag"[^>]*aria-selected="true"/)
  assert.match(html, /id="refs-panel-branch"[^>]*hidden/)
  assert.match(html, /id="refs-panel-tag"[^>]*data-selected(?:\s|>)/)
})

test('pairs omitted values by their order and honors aria-selected', async () => {
  const html = await render({ id: 'ordered' }, [
    h(UnderlinePanels.Tab, null, () => 'One'),
    h(UnderlinePanels.Tab, { 'aria-selected': true }, () => 'Two'),
    h(UnderlinePanels.Panel, null, () => 'First'),
    h(UnderlinePanels.Panel, null, () => 'Second')
  ])

  assert.match(html, /<button(?=[^>]*id="ordered-tab-1")(?=[^>]*aria-selected="true")[^>]*>/)
  assert.match(html, /id="ordered-panel-0"[^>]*hidden/)
  assert.match(html, /id="ordered-panel-1"[^>]*data-selected(?:\s|>)/)
})

test('defaultValue takes precedence over aria-selected and an unknown value falls back to the first tab', async () => {
  const children = [
    h(UnderlinePanels.Tab, { value: 'first', 'aria-selected': true }, () => 'First'),
    h(UnderlinePanels.Tab, { value: 'second' }, () => 'Second'),
    h(UnderlinePanels.Panel, { value: 'first' }, () => 'First panel'),
    h(UnderlinePanels.Panel, { value: 'second' }, () => 'Second panel')
  ]
  const preferred = await render({ id: 'preferred', defaultValue: 'second' }, children)
  const fallback = await render({ id: 'fallback', value: 'missing' }, children)

  assert.match(preferred, /<button(?=[^>]*id="preferred-tab-second")(?=[^>]*aria-selected="true")[^>]*>/)
  assert.match(fallback, /<button(?=[^>]*id="fallback-tab-first")(?=[^>]*aria-selected="true")[^>]*>/)
})

test('rejects duplicate tab values in development', async () => {
  await assert.rejects(render({ id: 'duplicate' }, [
    h(UnderlinePanels.Tab, { value: 'same' }, () => 'One'),
    h(UnderlinePanels.Tab, { value: 'same' }, () => 'Two'),
    h(UnderlinePanels.Panel, { value: 'same' }, () => 'First'),
    h(UnderlinePanels.Panel, { value: 'other' }, () => 'Second')
  ]), /unique value/)
})
