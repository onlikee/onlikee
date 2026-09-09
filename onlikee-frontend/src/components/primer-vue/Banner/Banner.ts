import { createVNode, render } from 'vue'
import BannerView, {
  type BannerExposed,
  type BannerOptions,
  type BannerResult,
  type BannerType
} from './Banner.vue'

type BannerFn = ((message: string, type?: BannerType, options?: BannerOptions) => BannerResult) & {
  info: (message: string, options?: BannerOptions) => BannerResult
  success: (message: string, options?: BannerOptions) => BannerResult
  warning: (message: string, options?: BannerOptions) => BannerResult
  critical: (message: string, options?: BannerOptions) => BannerResult
  upsell: (message: string, options?: BannerOptions) => BannerResult
  error: (message: string, options?: BannerOptions) => BannerResult
  close: () => void
}

const HOST_ID = 'banner-host'
let service: BannerExposed | null = null

function getService() {
  if (service) return service

  let host = document.getElementById(HOST_ID)
  if (!host) {
    host = document.createElement('div')
    host.id = HOST_ID
    document.body.appendChild(host)
  }

  const vnode = createVNode(BannerView)
  render(vnode, host)
  service = vnode.component!.exposed as BannerExposed
  return service
}

const Banner = ((message: string, type: BannerType = 'info', options: BannerOptions = {}) => {
  return getService().show(message, type, options)
}) as BannerFn

Banner.info = (message, options) => Banner(message, 'info', options)
Banner.success = (message, options) => Banner(message, 'success', options)
Banner.warning = (message, options) => Banner(message, 'warning', options)
Banner.critical = (message, options) => Banner(message, 'critical', options)
Banner.upsell = (message, options) => Banner(message, 'upsell', options)
Banner.error = (message, options) => Banner(message, 'critical', options)
Banner.close = () => getService().close()

export type { BannerOptions, BannerResult, BannerType } from './Banner.vue'
export default Banner
