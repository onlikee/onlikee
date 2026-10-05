/* eslint-disable vue/one-component-per-file -- Slot matching tests require independent component fixtures. */
import { expect, test, vi } from 'vitest'
import { Comment, Fragment, createSSRApp, defineComponent, h, ref, type Component, type VNodeChild } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { useSlots, asSlot, isSlot, slotChildren } from './useSlots'
import { FormControl } from '../FormControl'
import { RadioGroup } from '../RadioGroup'
import { Radio } from '../Radio'

const Label = defineComponent({ name: 'SlotLabel', __SLOT__: Symbol('Label'), render: () => null })
const Caption = defineComponent({ name: 'SlotCaption', render: () => null })

function captureWarnings<T>(run: () => T) {
  const warnings: string[] = []
  const spy = vi.spyOn(console, 'warn').mockImplementation((message: string) => { warnings.push(message) })
  try {
    return { value: run(), warnings }
  } finally {
    spy.mockRestore()
  }
}

async function render(component: Component, props: Record<string, unknown>, children: VNodeChild[]) {
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
  expect(slots.label).toBe(label)
  expect(slots.caption).toBe(caption)
  expect(Object.hasOwn(slots, 'missing')).toBeTruthy()
  expect(slots.missing).toBe(undefined)
  expect(rest).toStrictEqual(['text', null, false, 0, comment, element])
})

test('handles empty children and config without discarding unmatched content', () => {
  expect(useSlots(undefined, { label: Label })).toStrictEqual([{ label: undefined }, []])
  expect(useSlots(null, { label: Label })).toStrictEqual([{ label: undefined }, []])
  expect(useSlots([], { label: Label })).toStrictEqual([{ label: undefined }, []])
  const children = ['text', h(Label), h('span')]
  expect(useSlots(children, {})).toStrictEqual([{}, children])
})

test('flattens Vue template/v-for Fragments and arrays without traversing DOM or component boundaries', () => {
  const label = h(Label)
  const nestedDOM = h('div', [h(Caption)])
  const wrapper = defineComponent({ name: 'Wrapper', render: () => h(Caption) })
  const nestedComponent = h(wrapper)
  const [slots, rest] = useSlots([h(Fragment, [nestedDOM, h(Fragment, [label])]), [nestedComponent]], {
    label: Label, caption: Caption
  })
  expect(slots.label).toBe(label)
  expect(slots.caption).toBe(undefined)
  expect(rest).toStrictEqual([nestedDOM, nestedComponent])
})

test('supports multiple prop predicates for the same component and leaves rejected variants in rest', () => {
  const inline = h(Label, { variant: 'inline' })
  const block = h(Label, { variant: 'block' })
  const rejected = h(Label, { variant: 'other' })
  const { value: [slots, rest], warnings } = captureWarnings(() => useSlots([rejected, inline, block], {
    block: [Label, props => props.variant === 'block'],
    inline: [Label, props => props.variant === 'inline']
  }))
  expect(slots.block).toBe(block)
  expect(slots.inline).toBe(inline)
  expect(rest).toStrictEqual([rejected])
  expect(warnings).toStrictEqual([])
})

test('recognizes object/function wrappers by marker, including prop predicates', () => {
  const objectWrapper = defineComponent({ name: 'ObjectWrapper', render: () => h(Label) })
  const functionWrapper = () => h(Label)
  expect(asSlot(objectWrapper, Label)).toBe(objectWrapper)
  asSlot(functionWrapper, Label)
  const wrappers: Component[] = [objectWrapper, functionWrapper]
  for (const wrapper of wrappers) {
    const node = h(wrapper, { variant: 'block' })
    expect(isSlot(node, Label)).toBeTruthy()
    expect(useSlots([node], { label: [Label, props => props.variant === 'block'] })[0].label).toBe(node)
  }
  expect(isSlot(null, Label)).toBe(false)
  expect(isSlot(h(Caption), Caption)).toBe(false)
})

test('warns when asSlot has no source marker and when same-name components lack a shared marker', () => {
  const wrapper = defineComponent({ name: 'SlotLabel', render: () => null })
  const { warnings } = captureWarnings(() => {
    asSlot(wrapper, Caption)
    const [slots, rest] = useSlots([h(wrapper)], { label: Label })
    expect(slots.label).toBe(undefined)
    expect(rest.length).toBe(1)
  })
  expect(warnings.length).toBe(2)
  expect(warnings[0]).toMatch(/source has no/)
  expect(warnings[1]).toMatch(/missing the `__SLOT__` marker/)
})

test('keeps the first duplicate and warns before and after all slots are filled in development', () => {
  const first = h(Label)
  const extra = h('div')
  const { value: [slots, rest], warnings } = captureWarnings(() => useSlots([
    first, h(Label), h(Caption), h(Label), extra
  ], { label: Label, caption: Caption }))
  expect(slots.label).toBe(first)
  expect(rest).toStrictEqual([extra])
  expect(warnings.length).toBe(2)
  expect(warnings.every(warning => warning === 'Found duplicate "label" slot. Only the first will be rendered.')).toBeTruthy()
})

test('preserves React production behavior: ignores early duplicates and skips matching once every slot is filled', () => {
  vi.stubEnv('DEV', false)
  const first = h(Label)
  const last = h(Label)
  let checks = 0
  const { value: [slots, rest], warnings } = captureWarnings(() => useSlots([
    first, h(Label), h(Caption), last
  ], {
    label: [Label, () => { checks++; return true }],
    caption: Caption
  }))
  expect(slots.label).toBe(first)
  expect(rest).toStrictEqual([last])
  expect(checks).toBe(2)
  expect(warnings).toStrictEqual([])
})

test('reads default slot functions, array children and string children for validation content', () => {
  const text = h('strong', 'Required')
  expect(slotChildren(h(Label, null, { default: () => [text] }))).toStrictEqual([text])
  expect(slotChildren(h('span', [text]))).toStrictEqual([text])
  expect(slotChildren(h('span', 'Required'))).toStrictEqual(['Required'])
  expect(slotChildren()).toStrictEqual([])
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
  expect(html).toMatch(/<input(?=[^>]*id="choice")(?=[^>]*aria-describedby="choice-caption")[^>]*>/)
  expect(html).toMatch(/<label(?=[^>]*id="choice-label")(?=[^>]*for="choice")[^>]*>/)
  expect(html).toMatch(/Option one/)
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
  expect(html).toMatch(/<legend[^>]*>[\s\S]*Choose one[\s\S]*Help text[\s\S]*Pick an option[\s\S]*<\/legend>/)
  expect(html).toMatch(/<div[^>]*aria-hidden="true"[^>]*>/)
  expect(html.match(/Pick an option/g)?.length).toBe(2)
  expect(html).toMatch(/<input[^>]*name="group"/)
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
  expect(calls).toBe(1)
  expect(first).toMatch(/class="form-control--vertical"/)
  mode.value = 'radio'
  const second = await renderToString(createSSRApp(root))
  expect(calls).toBe(2)
  expect(second).toMatch(/class="form-control--horizontal"/)
  expect(second).toMatch(/for="dynamic"/)
})
