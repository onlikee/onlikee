// @vitest-environment jsdom
import { VueMonacoEditor } from '@guolao/vue-monaco-editor'
import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import FirstStep from './FirstStep.vue'
import SecondStep from './SecondStep.vue'
import { useCreateApplicationForm } from './useCreateApplicationForm'

enableAutoUnmount(afterEach)

describe('new application framework selection', () => {
  it.each(['Vue', 'Svelte', 'Astro', 'Other'])(
    'selects %s and shows its build folder uploader',
    async (label) => {
      const wrapper = mount(FirstStep, {
        props: { selectedFramework: useCreateApplicationForm().selectedFramework.value },
        attachTo: document.body,
      })
      const anchor = wrapper.get('button[aria-haspopup="dialog"]')
      expect(anchor.text()).toBe('HTML')

      await anchor.trigger('click')
      await flushPromises()
      const dialog = document.querySelector('[role="dialog"][aria-label="选择前端框架"]')!
      const options = Array.from(dialog.querySelectorAll<HTMLElement>('[role="option"]'))
      expect(options.map((option) => option.textContent?.trim())).toEqual([
        expect.stringContaining('HTML'),
        expect.stringContaining('Vue'),
        expect.stringContaining('React'),
        expect.stringContaining('Svelte'),
        expect.stringContaining('Astro'),
        expect.stringMatching(/^Other\s*任何带有index\.html的构建目录$/),
      ])
      expect(options[0]?.getAttribute('aria-selected')).toBe('true')
      expect(dialog.querySelector('img')).toBeNull()
      expect(dialog.textContent).not.toContain('推荐')

      options.find((option) => option.textContent?.trim().startsWith(label))!.click()
      await flushPromises()
      expect(wrapper.emitted('update:selected-framework')).toEqual([[label]])
      expect(document.querySelector('[role="dialog"][aria-label="选择前端框架"]')).toBeNull()

      await wrapper.setProps({ selectedFramework: label })
      expect(anchor.text()).toBe(label)

      const uploadStep = mount(SecondStep, {
        props: { selectedFramework: label, files: [], htmlSource: '' },
      })
      expect(uploadStep.find('input[webkitdirectory]').exists()).toBe(true)
    },
  )

  it('opens an empty HTML editor with a placeholder and submits entered code', async () => {
    const form = useCreateApplicationForm()
    const uploadStep = mount(SecondStep, {
      props: {
        selectedFramework: form.selectedFramework.value,
        files: form.files.value,
        htmlSource: form.htmlSource.value,
      },
      global: { stubs: { VueMonacoEditor: true } },
    })

    const editor = uploadStep.getComponent(VueMonacoEditor)
    expect(editor.props('value')).toBe('')
    expect(editor.props('options')).toMatchObject({ placeholder: '请输入 HTML 代码' })
    expect(form.uploadError.value).toBe('请输入 HTML 代码。')
    expect(uploadStep.find('input[webkitdirectory]').exists()).toBe(false)
    form.setHtmlSource('<main>示例</main>')
    expect(form.uploadError.value).toBe('')
    await expect(form.buildRequest()).resolves.toMatchObject({ framework: 'html' })
  })
})
