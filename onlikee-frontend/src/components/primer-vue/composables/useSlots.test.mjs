/* eslint-disable vue/one-component-per-file -- Slot matching tests require independent component fixtures. */
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { after, test } from 'node:test'
import { Comment, Fragment, createSSRApp, defineComponent, h, ref } from 'vue'
import { renderToString } from '@vue/server-renderer'
import vue from '@vitejs/plugin-vue'
import { createServer, transformWithEsbuild } from 'vite'

const server = await createServer({
  configFile: false,
  plugins: [vue()],
  optimizeDeps: { noDiscovery: true, entries: [] },
  server: { middlewareMode: true },
  appType: 'custom'
})
after(() => server.close())

const { useSlots, asSlot, isSlot, slotChildren } = await server.ssrLoadModule(
  '/src/components/primer-vue/composables/useSlots.ts'
)
const { FormControl } = await server.ssrLoadModule('/src/components/primer-vue/FormControl/index.ts')
const { RadioGroup } = await server.ssrLoadModule('/src/components/primer-vue/RadioGroup/index.ts')
const { Radio } = await server.ssrLoadModule('/src/components/primer-vue/Radio/index.ts')

const productionSource = await transformWithEsbuild(
  await readFile(new URL('./useSlots.ts', import.meta.url), 'utf8'),
  'useSlots.ts',
  { format: 'esm', define: { 'import.meta.env.DEV': 'false' } }
)
const productionCode = productionSource.code.replace(/from (["'])vue\1/g, `from ${JSON.stringify(import.meta.resolve('vue'))}`)
const { useSlots: useProductionSlots } = await import(`data:text/javascript;base64,${Buffer.from(productionCode).toString('base64')}`)

const Label = defineComponent({ name: 'SlotLabel', __SLOT__: Symbol('Label'), render: () => null })
const Caption = defineComponent({ name: 'SlotCaption', render: () => null })

function captureWarnings(run) {
  const original = console.warn
  const warnings = []
  console.warn = message => warnings.push(message)
  try {
    return { value: run(), warnings }
  } finally {
    console.warn = original
  }
}

async function render(component, props, children) {
  return renderToString(createSSRApp({
    render: () => h(component, props, { default: () => children })
  }))
}

test('extracts configured components in any order, initializes missing slots and preserves rest', () => {
  const caption = h(Caption)
  const label = h(Label)
  const element = h('div', 'extra')
  const comment = h(Comment)
  const [slots, rest] = useSlots(['text', caption, null, false, label, 0, comment, element], {
    label: Label, caption: Caption, missing: 'aside'
  })
  assert.equal(slots.label, label)
  assert.equal(slots.caption, caption)
  assert.ok(Object.hasOwn(slots, 'missing'))
  assert.equal(slots.missing, undefined)
  assert.deepEqual(rest, ['text', null, false, 0, comment, element])
})

test('handles empty children and config without discarding unmatched content', () => {
  assert.deepEqual(useSlots(undefined, { label: Label }), [{ label: undefined }, []])
  assert.deepEqual(useSlots(null, { label: Label }), [{ label: undefined }, []])
  assert.deepEqual(useSlots([], { label: Label }), [{ label: undefined }, []])
  const children = ['text', h(Label), h('span')]
  assert.deepEqual(useSlots(children, {}), [{}, children])
})

test('flattens Vue template/v-for Fragments and arrays without traversing DOM or component boundaries', () => {
  const label = h(Label)
  const nestedDOM = h('div', [h(Caption)])
  const wrapper = defineComponent({ name: 'Wrapper', render: () => h(Caption) })
  const nestedComponent = h(wrapper)
  const [slots, rest] = useSlots([h(Fragment, [nestedDOM, h(Fragment, [label])]), [nestedComponent]], {
    label: Label, caption: Caption
  })
  assert.equal(slots.label, label)
  assert.equal(slots.caption, undefined)
  assert.deepEqual(rest, [nestedDOM, nestedComponent])
})

test('supports multiple prop predicates for the same component and leaves rejected variants in rest', () => {
  const inline = h(Label, { variant: 'inline' })
  const block = h(Label, { variant: 'block' })
  const rejected = h(Label, { variant: 'other' })
  const { value: [slots, rest], warnings } = captureWarnings(() => useSlots([rejected, inline, block], {
    block: [Label, props => props.variant === 'block'],
    inline: [Label, props => props.variant === 'inline']
  }))
  assert.equal(slots.block, block)
  assert.equal(slots.inline, inline)
  assert.deepEqual(rest, [rejected])
  assert.deepEqual(warnings, [])
})

test('recognizes object/function wrappers by marker, including prop predicates', () => {
  const objectWrapper = defineComponent({ name: 'ObjectWrapper', render: () => h(Label) })
  const functionWrapper = () => h(Label)
  assert.equal(asSlot(objectWrapper, Label), objectWrapper)
  asSlot(functionWrapper, Label)
  for (const wrapper of [objectWrapper, functionWrapper]) {
    const node = h(wrapper, { variant: 'block' })
    assert.ok(isSlot(node, Label))
    assert.equal(useSlots([node], { label: [Label, props => props.variant === 'block'] })[0].label, node)
  }
  assert.equal(isSlot(null, Label), false)
  assert.equal(isSlot(h(Caption), Caption), false)
})

test('warns when asSlot has no source marker and when same-name components lack a shared marker', () => {
  const wrapper = defineComponent({ name: 'SlotLabel', render: () => null })
  const { warnings } = captureWarnings(() => {
    asSlot(wrapper, Caption)
    const [slots, rest] = useSlots([h(wrapper)], { label: Label })
    assert.equal(slots.label, undefined)
    assert.equal(rest.length, 1)
  })
  assert.equal(warnings.length, 2)
  assert.match(warnings[0], /source has no/)
  assert.match(warnings[1], /missing the `__SLOT__` marker/)
})

test('keeps the first duplicate and warns before and after all slots are filled in development', () => {
  const first = h(Label)
  const extra = h('div')
  const { value: [slots, rest], warnings } = captureWarnings(() => useSlots([
    first, h(Label), h(Caption), h(Label), extra
  ], { label: Label, caption: Caption }))
  assert.equal(slots.label, first)
  assert.deepEqual(rest, [extra])
  assert.equal(warnings.length, 2)
  assert.ok(warnings.every(warning => warning === 'Found duplicate "label" slot. Only the first will be rendered.'))
})

test('preserves React production behavior: ignores early duplicates and skips matching once every slot is filled', () => {
  const first = h(Label)
  const last = h(Label)
  let checks = 0
  const { value: [slots, rest], warnings } = captureWarnings(() => useProductionSlots([
    first, h(Label), h(Caption), last
  ], {
    label: [Label, () => { checks++; return true }],
    caption: Caption
  }))
  assert.equal(slots.label, first)
  assert.deepEqual(rest, [last])
  assert.equal(checks, 2)
  assert.deepEqual(warnings, [])
})

test('reads default slot functions, array children and string children for validation content', () => {
  const text = h('strong', 'Required')
  assert.deepEqual(slotChildren(h(Label, null, { default: () => [text] })), [text])
  assert.deepEqual(slotChildren(h('span', [text])), [text])
  assert.deepEqual(slotChildren(h('span', 'Required')), ['Required'])
  assert.deepEqual(slotChildren(), [])
})

test('FormControl recognizes a marked label wrapper inside Fragments and forwards radio accessibility attributes', async () => {
  const wrapper = asSlot(defineComponent({
    name: 'WrappedLabel',
    setup(_, { slots, attrs }) {
      return () => h(FormControl.Label, attrs, slots)
    }
  }), FormControl.Label)
  const html = await render(FormControl, { id: 'choice' }, [h(Fragment, [
    h(Radio, { name: 'choice', value: 'one' }),
    h(wrapper, null, () => 'Option one'),
    h(FormControl.Caption, null, () => 'Caption')
  ])])
  assert.match(html, /<input(?=[^>]*id="choice")(?=[^>]*aria-describedby="choice-caption")[^>]*>/)
  assert.match(html, /<label(?=[^>]*id="choice-label")(?=[^>]*for="choice")[^>]*>/)
  assert.match(html, /Option one/)
})

test('RadioGroup uses extracted slots for its legend and accessible validation text', async () => {
  const html = await render(RadioGroup, { id: 'group', name: 'group' }, [
    h(Fragment, [
      h(RadioGroup.Label, null, () => 'Choose one'),
      h(RadioGroup.Caption, null, () => 'Help text'),
      h(RadioGroup.Validation, { variant: 'error' }, () => 'Pick an option')
    ]),
    h(FormControl, { id: 'option' }, () => [
      h(Radio, { value: 'one' }), h(FormControl.Label, null, () => 'Option')
    ])
  ])
  assert.match(html, /<legend[^>]*>[\s\S]*Choose one[\s\S]*Help text[\s\S]*Pick an option[\s\S]*<\/legend>/)
  assert.match(html, /<div aria-hidden="true"[^>]*>/)
  assert.equal(html.match(/Pick an option/g)?.length, 2)
  assert.match(html, /<input[^>]*name="group"/)
})

test('FormControl evaluates a dynamic default slot once per render, including its ordinary input branch', async () => {
  const mode = ref('input')
  let calls = 0
  const root = {
    render: () => h(FormControl, { id: 'dynamic' }, {
      default: () => {
        calls++
        return [
          h(FormControl.Label, null, () => mode.value),
          mode.value === 'radio' ? h(Radio, { name: 'dynamic', value: 'one' }) : h('input', { name: 'ordinary' })
        ]
      }
    })
  }
  const first = await renderToString(createSSRApp(root))
  assert.equal(calls, 1)
  assert.match(first, /class="form-control"/)
  mode.value = 'radio'
  const second = await renderToString(createSSRApp(root))
  assert.equal(calls, 2)
  assert.match(second, /class="form-control--horizontal"/)
  assert.match(second, /for="dynamic"/)
})
