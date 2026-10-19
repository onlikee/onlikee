// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { createSSRApp, h, nextTick, ref } from 'vue'
import { renderToString } from '@vue/server-renderer'
import KeybindingHint from './KeybindingHint.vue'
import { getAccessibleKeybindingHintString } from './utils'
import { PLATFORM_OVERRIDE_KEY, type Platform } from './platform'
import { accessibleChordString, accessibleSequenceString, splitChord } from './chordUtils'

// The behavior caches the first OS result; let each fixture simulate its own platform.
vi.mock('@primer/behaviors/utils', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@primer/behaviors/utils')>()
  return { ...actual, isMacOS: () => /^mac/i.test(navigator.platform) }
})

const wrappers: VueWrapper[] = []
afterEach(() => {
  wrappers.forEach((wrapper) => wrapper.unmount())
  wrappers.length = 0
  document.body.innerHTML = ''
  vi.restoreAllMocks()
})
function track<T extends VueWrapper>(wrapper: T): T {
  wrappers.push(wrapper)
  return wrapper
}
/** 收集元素内所有 VisuallyHidden（internal-visually-hidden）节点的文本。 */
function hiddenTexts(wrapper: { element: Element }): string[] {
  return Array.from(wrapper.element.querySelectorAll('.internal-visually-hidden')).map(
    (node) => node.textContent ?? '',
  )
}

describe('KeybindingHint', () => {
  it('renders a kbd with sequence of chords and screen-reader key names', () => {
    const wrapper = track(mount(KeybindingHint, { props: { keys: 'Mod+Shift+P' } }))
    const kbd = wrapper.get('kbd')
    expect(kbd.attributes('data-component')).toBe('KeybindingHint')
    expect(kbd.attributes('data-testid')).toBe('keybinding-hint')
    expect(kbd.classes().some((name) => name.includes('keybinding-hint_'))).toBe(true)
    const chord = kbd.get('[data-kbd-chord]')
    expect(chord.attributes('data-kbd-chord')).toBe('true')
    expect(chord.classes().some((name) => name.includes('keybinding-chord--normal_'))).toBe(true)
    expect(chord.text()).toContain('⌃')
    expect(chord.text()).toContain('⇧')
    expect(chord.text()).toContain('P')
    expect(hiddenTexts(chord).join(' ')).toBe('shift control p')
  })

  it('renders sequences with hidden "then" separators between chords', () => {
    const wrapper = track(mount(KeybindingHint, { props: { keys: 'g i' } }))
    const chords = wrapper.findAll('[data-kbd-chord]')
    expect(chords).toHaveLength(2)
    expect(wrapper.text()).toContain('then')
  })

  it('honors variant/size classes and the full format plus separators', () => {
    const wrapper = track(
      mount(KeybindingHint, {
        props: { keys: 'Mod+K', format: 'full', variant: 'onEmphasis', size: 'small' },
      }),
    )
    const chord = wrapper.get('[data-kbd-chord]')
    expect(chord.classes().some((name) => name.includes('keybinding-chord--on-emphasis_'))).toBe(
      true,
    )
    expect(chord.classes().some((name) => name.includes('keybinding-chord--small_'))).toBe(true)
    const hiddenTexts = chord
      .findAll('span[aria-hidden]')
      .map((node) => node.element.textContent ?? '')
    expect(hiddenTexts).toContain(' + ')
    expect(hiddenTexts).toContain('Control')
    expect(hiddenTexts).toContain('K')
  })

  it('applies the platform override injection (apple)', () => {
    const wrapper = track(
      mount(KeybindingHint, {
        props: { keys: 'Mod+K' },
        global: { provide: { [PLATFORM_OVERRIDE_KEY as symbol]: 'apple' } },
      }),
    )
    const chord = wrapper.get('[data-kbd-chord]')
    expect(chord.text()).toContain('⌘')
    expect(hiddenTexts(chord).join(' ')).toBe('command k')
  })

  it('updates rendered hints when the platform override ref changes', async () => {
    const override = ref<Platform | null>('apple')
    const wrapper = track(
      mount(KeybindingHint, {
        props: { keys: 'Meta+K' },
        global: { provide: { [PLATFORM_OVERRIDE_KEY as symbol]: override } },
      }),
    )
    const visibleKeys = () =>
      wrapper.findAll('span[aria-hidden]').map((node) => node.element.textContent ?? '')
    expect(visibleKeys()).toContain('⌘')
    expect(hiddenTexts(wrapper.get('[data-kbd-chord]')).join(' ')).toBe('command k')
    override.value = 'windows'
    await nextTick()
    expect(visibleKeys()).toContain('Win')
    expect(hiddenTexts(wrapper.get('[data-kbd-chord]')).join(' ')).toBe('Windows k')
    // null 恢复检测值（jsdom → other）：meta → 'Meta' / 'meta'
    override.value = null
    await nextTick()
    expect(visibleKeys()).toContain('Meta')
    expect(hiddenTexts(wrapper.get('[data-kbd-chord]')).join(' ')).toBe('meta k')
  })

  it.each([
    ['MacIntel', 'Mod+K', 'command k', '⌘'],
    ['iPhone', 'Alt+K', 'option k', '⌥'],
    ['Win32', 'Meta+K', 'Windows k', 'Win'],
  ])('detects %s immediately during client rendering', (platform, keys, spoken, symbol) => {
    vi.spyOn(navigator, 'platform', 'get').mockReturnValue(platform)
    const wrapper = track(mount(KeybindingHint, { props: { keys } }))
    expect(hiddenTexts(wrapper).join(' ')).toBe(spoken)
    expect(wrapper.findAll('span[aria-hidden]').map((node) => node.text())).toContain(symbol)
  })

  it.each([
    ['MacIntel', 'Mod+K', 'control k', 'command k'],
    ['iPhone', 'Alt+K', 'alt k', 'option k'],
    ['Win32', 'Meta+K', 'meta k', 'Windows k'],
  ])(
    'hydrates %s hints without replacing server nodes or reporting mismatches',
    async (platform, keys, serverSpoken, clientSpoken) => {
      const platformGetter = vi.spyOn(navigator, 'platform', 'get').mockReturnValue('Linux')
      const render = () => h('div', [h(KeybindingHint, { keys })])
      const host = document.createElement('div')
      document.body.append(host)
      host.innerHTML = await renderToString(createSSRApp({ render }))
      expect(hiddenTexts({ element: host }).join(' ')).toBe(serverSpoken)
      const serverKbd = host.querySelector('kbd')
      platformGetter.mockReturnValue(platform)
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const error = vi.spyOn(console, 'error').mockImplementation(() => {})
      const app = createSSRApp({ render })
      try {
        app.mount(host)
        await nextTick()
        expect(host.querySelector('kbd')).toBe(serverKbd)
        expect(hiddenTexts({ element: host }).join(' ')).toBe(clientSpoken)
        expect(warn).not.toHaveBeenCalled()
        expect(error).not.toHaveBeenCalled()
      } finally {
        app.unmount()
      }
    },
  )

  it('uses the server platform default even when browser globals are present', async () => {
    vi.spyOn(navigator, 'platform', 'get').mockReturnValue('MacIntel')
    const html = await renderToString(
      createSSRApp({ render: () => h(KeybindingHint, { keys: 'Mod+K' }) }),
    )
    const host = document.createElement('div')
    host.innerHTML = html
    expect(hiddenTexts({ element: host }).join(' ')).toBe('control k')
    expect(html).toContain('>⌃</span>')
    expect(html).not.toContain('command')
  })

  it('does not forward unknown attrs to the root kbd (source drops rest in Chord)', () => {
    const wrapper = track(
      mount(KeybindingHint, { props: { keys: 'Mod+K' }, attrs: { id: 'hint', 'data-extra': 'x' } }),
    )
    const kbd = wrapper.get('kbd')
    expect(kbd.attributes('id')).toBeUndefined()
    expect(kbd.attributes('data-extra')).toBeUndefined()
    expect(kbd.attributes('data-component')).toBe('KeybindingHint')
  })

  it('splits and sorts chord keys by modifier priority', () => {
    expect(splitChord('Shift+Meta+Control+K')).toEqual(['control', 'meta', 'shift', 'k'])
    expect(accessibleChordString('Mod+K', 'apple')).toBe('command k')
    expect(accessibleSequenceString('g i', 'other')).toBe('g then i')
  })

  it('builds accessible hint strings for platforms and legacy booleans', () => {
    expect(getAccessibleKeybindingHintString('Mod+Shift+P', true)).toBe('shift command p')
    expect(getAccessibleKeybindingHintString('Mod+K', false)).toBe('control k')
    expect(getAccessibleKeybindingHintString('Mod+K', 'windows')).toBe('control k')
    expect(getAccessibleKeybindingHintString('Meta', 'windows')).toBe('Windows')
    expect(getAccessibleKeybindingHintString('PageUp ArrowDown', 'other')).toBe(
      'page up then down arrow',
    )
    expect(getAccessibleKeybindingHintString('Mod+.', 'apple')).toBe('command period')
  })
})
