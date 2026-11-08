// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { mount, type VueWrapper } from '@vue/test-utils'
import { h, nextTick } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import App from '@/App.vue'
import { AxiosError } from 'axios'
import request, { get } from '@/api/request'
import { useSystemStatusStore } from '@/stores/systemStatus'

const wrappers: VueWrapper[] = []
const originalAdapter = request.defaults.adapter

async function render(path = '/', pinia = createPinia()) {
  const page = { render: () => h('main', '页面内容') }
  const router = createRouter({
    history: createMemoryHistory(),
    routes: ['/', '/component', '/auth/login'].map((path) => ({ path, component: page })),
  })
  await router.push(path)
  await router.isReady()
  const wrapper = mount(App, { global: { plugins: [pinia, router] }, attachTo: document.body })
  wrappers.push(wrapper)
  return {
    wrapper,
    router,
    systemStatus: useSystemStatusStore(pinia),
  }
}

afterEach(() => {
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount())
  request.defaults.adapter = originalAdapter
  document.body.innerHTML = ''
  vi.restoreAllMocks()
})

describe('system notices in the application layout', () => {
  it('renders normally without a notice', async () => {
    const { wrapper } = await render()

    expect(wrapper.find('[data-component="Banner"]').exists()).toBe(false)
    expect(wrapper.find('header.header').exists()).toBe(true)
    expect(wrapper.get('.user-menu').text()).toContain('登录')
    expect(wrapper.get('main').text()).toBe('页面内容')
  })

  it('places one persistent warning above navigation while keeping the page usable', async () => {
    const { wrapper, router, systemStatus } = await render()
    systemStatus.setOffline(true)
    systemStatus.setOffline(true)
    await nextTick()

    const banner = wrapper.get('[data-component="Banner"]')
    const header = wrapper.get('header.header')
    expect(
      banner.element.compareDocumentPosition(header.element) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
    expect(banner.attributes('data-variant')).toBe('warning')
    expect(banner.attributes('data-dismissible')).toBeUndefined()
    expect(wrapper.findAll('[data-component="Banner"]')).toHaveLength(1)
    expect(wrapper.get('.user-menu').text()).toContain('登录')
    expect(document.querySelector('#banner-host')).toBeNull()
    await router.push('/component')
    expect(wrapper.find('[data-component="Banner"]').exists()).toBe(true)
    expect(wrapper.get('main').text()).toBe('页面内容')
  })

  it('detects initial offline state and removes the warning after reconnection', async () => {
    const online = vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false)
    const { wrapper } = await render()
    await nextTick()

    expect(wrapper.get('[data-component="Banner.Title"]').text()).toBe('网络连接已断开')
    expect(wrapper.find('[data-component="Banner.PrimaryAction"]').exists()).toBe(false)
    online.mockReturnValue(true)
    window.dispatchEvent(new Event('online'))
    await nextTick()
    expect(wrapper.find('[data-component="Banner"]').exists()).toBe(false)
  })

  it('renders a request failure recorded before the application mounts and deduplicates later failures', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    request.defaults.adapter = async (config) => {
      throw new AxiosError('Network Error', 'ERR_NETWORK', config, {})
    }
    const error = await get('/auth/me').catch((error: unknown) => error)
    expect(error).toBeInstanceOf(AxiosError)

    const { wrapper } = await render('/', pinia)

    expect(wrapper.get('[data-component="Banner.Description"]').text()).toBe(
      '当前无法连接到服务器，请检查网络连接，如无问题服务可能正在维护或出现临时故障。',
    )
    expect(wrapper.get('[data-component="Banner"]').attributes('data-variant')).toBe('warning')
    expect(wrapper.find('[data-component="Banner.PrimaryAction"]').exists()).toBe(false)
    await expect(get('/auth/me')).rejects.toThrow('Network Error')
    await nextTick()
    expect(wrapper.findAll('[data-component="Banner"]')).toHaveLength(1)
  })

  it('prioritizes offline feedback without treating reconnection as server recovery', async () => {
    const { wrapper, systemStatus } = await render()
    systemStatus.setConnectionError(true)
    window.dispatchEvent(new Event('offline'))
    await nextTick()
    expect(wrapper.get('[data-component="Banner.Title"]').text()).toBe('网络连接已断开')

    window.dispatchEvent(new Event('online'))
    await nextTick()
    expect(wrapper.get('[data-component="Banner.Description"]').text()).toBe(
      '当前无法连接到服务器，请检查网络连接，如无问题服务可能正在维护或出现临时故障。',
    )
    expect(wrapper.findAll('[data-component="Banner"]')).toHaveLength(1)

    systemStatus.setConnectionError(false)
    await nextTick()
    expect(wrapper.find('[data-component="Banner"]').exists()).toBe(false)
  })

  it('shows system faults on pages that do not render global navigation', async () => {
    const { wrapper, systemStatus } = await render('/auth/login')
    systemStatus.setOffline(true)
    await nextTick()

    expect(wrapper.find('header.header').exists()).toBe(false)
    expect(wrapper.find('[data-component="Banner"]').exists()).toBe(true)
    expect(wrapper.get('main').text()).toBe('页面内容')
  })

  it('cleans up network listeners when the application unmounts', async () => {
    const { wrapper, systemStatus } = await render()
    wrapper.unmount()
    wrappers.splice(wrappers.indexOf(wrapper), 1)

    window.dispatchEvent(new Event('offline'))
    expect(systemStatus.isOffline).toBe(false)
  })
})
