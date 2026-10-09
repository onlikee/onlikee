<script setup lang="ts">
import { ref } from 'vue'

export type BannerType = 'critical' | 'info' | 'success' | 'upsell' | 'warning'
export type BannerActionsLayout = 'default' | 'inline' | 'stacked'
export type BannerResult = { close: () => void }

export interface BannerAction {
  label: string
  href?: string
  onClick?: () => void
}

export interface BannerOptions {
  title?: string
  description?: string
  ariaLabel?: string
  hideTitle?: boolean
  dismissible?: boolean
  primaryAction?: BannerAction
  secondaryAction?: BannerAction
  actionsLayout?: BannerActionsLayout
  flush?: boolean
  duration?: number
}

export interface BannerExposed {
  show: (message: string, type?: BannerType, options?: BannerOptions) => BannerResult
  close: () => void
}

interface BannerState {
  id: number
  type: BannerType
  title: string
  description: string
  ariaLabel?: string
  hideTitle: boolean
  dismissible: boolean
  primaryAction?: BannerAction
  secondaryAction?: BannerAction
  actionsLayout: BannerActionsLayout
  flush: boolean
  duration?: number
}

const LABEL_BY_TYPE: Record<BannerType, string> = {
  critical: 'Critical',
  info: 'Information',
  success: 'Success',
  upsell: 'Recommendation',
  warning: 'Warning',
}

const ICON_PATH: Record<BannerType, string> = {
  critical:
    'M4.47.22A.749.749 0 0 1 5 0h6c.199 0 .389.079.53.22l4.25 4.25c.141.14.22.331.22.53v6a.749.749 0 0 1-.22.53l-4.25 4.25A.749.749 0 0 1 11 16H5a.749.749 0 0 1-.53-.22L.22 11.53A.749.749 0 0 1 0 11V5c0-.199.079-.389.22-.53Zm.84 1.28L1.5 5.31v5.38l3.81 3.81h5.38l3.81-3.81V5.31L10.69 1.5ZM8 4a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 8 4Zm0 8a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z',
  info: 'M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm8-6.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM6.5 7.75A.75.75 0 0 1 7.25 7h1a.75.75 0 0 1 .75.75v2.75h.25a.75.75 0 0 1 0 1.5h-2a.75.75 0 0 1 0-1.5h.25v-2h-.25a.75.75 0 0 1-.75-.75ZM8 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z',
  success:
    'M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm1.5 0a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Zm10.28-1.72-4.5 4.5a.75.75 0 0 1-1.06 0l-2-2a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018l1.47 1.47 3.97-3.97a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042Z',
  upsell:
    'M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm8-6.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM6.5 7.75A.75.75 0 0 1 7.25 7h1a.75.75 0 0 1 .75.75v2.75h.25a.75.75 0 0 1 0 1.5h-2a.75.75 0 0 1 0-1.5h.25v-2h-.25a.75.75 0 0 1-.75-.75ZM8 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z',
  warning:
    'M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575Zm1.763.707a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368Zm.53 3.996v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z',
}

const banners = ref<BannerState[]>([])
const closeTimers = new Map<number, ReturnType<typeof setTimeout>>()
let nextBannerId = 1

function clearCloseTimer(id: number) {
  const timer = closeTimers.get(id)
  if (timer) {
    clearTimeout(timer)
    closeTimers.delete(id)
  }
}

function close() {
  const latestBanner = banners.value[0]
  if (latestBanner) {
    closeBanner(latestBanner.id)
  }
}

function runAction(action: BannerAction) {
  action.onClick?.()
}

function startCloseTimer(nextBanner: BannerState) {
  if (nextBanner.duration && nextBanner.duration > 0) {
    closeTimers.set(
      nextBanner.id,
      setTimeout(() => closeBanner(nextBanner.id), nextBanner.duration),
    )
  }
}

function createBanner(message: string, type: BannerType, options: BannerOptions): BannerState {
  return {
    id: nextBannerId++,
    type,
    title: options.title ?? LABEL_BY_TYPE[type],
    description: options.description ?? message,
    ariaLabel: options.ariaLabel,
    hideTitle: options.hideTitle ?? false,
    dismissible: options.dismissible ?? true,
    primaryAction: options.primaryAction,
    secondaryAction: options.secondaryAction,
    actionsLayout: options.actionsLayout ?? 'default',
    flush: options.flush ?? false,
    duration: options.duration ?? 5000,
  }
}

function closeBanner(id: number) {
  clearCloseTimer(id)
  const index = banners.value.findIndex((currentBanner) => currentBanner.id === id)
  if (index !== -1) {
    banners.value.splice(index, 1)
  }
}

function show(
  message: string,
  type: BannerType = 'info',
  options: BannerOptions = {},
): BannerResult {
  const nextBanner = createBanner(message, type, options)

  banners.value.unshift(nextBanner)
  startCloseTimer(nextBanner)

  return { close: () => closeBanner(nextBanner.id) }
}

defineExpose<BannerExposed>({
  show,
  close,
})
</script>

<template>
  <div v-if="banners.length" :class="$style['banner-layer']">
    <section
      v-for="banner in banners"
      :key="banner.id"
      :class="[
        $style['banner'],
        $style[`banner--${banner.type}`],
        {
          [$style['banner--flush']]: banner.flush,
          [$style['banner--title-hidden']]: banner.hideTitle,
        },
      ]"
      :data-actions-layout="banner.actionsLayout"
      role="region"
      :aria-label="banner.ariaLabel ?? LABEL_BY_TYPE[banner.type]"
      tabindex="-1"
    >
      <div :class="$style['banner__icon']" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path :d="ICON_PATH[banner.type]" />
        </svg>
      </div>

      <div :class="$style['banner__container']">
        <div :class="$style['banner__content']">
          <h2 v-if="!banner.hideTitle" :class="$style['banner__title']">
            {{ banner.title }}
          </h2>
          <span v-else :class="$style['banner__sr-only']">{{ banner.title }}</span>
          <p :class="$style['banner__description']">
            {{ banner.description }}
          </p>
        </div>

        <div
          v-if="banner.primaryAction || banner.secondaryAction"
          :class="$style['banner__actions']"
        >
          <div :class="[$style['banner__actions-row'], $style['banner__actions-row--trailing']]">
            <template v-if="banner.secondaryAction">
              <a
                v-if="banner.secondaryAction.href"
                :href="banner.secondaryAction.href"
                :class="[$style['banner__action'], $style['banner__action--secondary']]"
              >
                {{ banner.secondaryAction.label }}
              </a>
              <button
                v-else
                type="button"
                :class="[$style['banner__action'], $style['banner__action--secondary']]"
                @click="runAction(banner.secondaryAction)"
              >
                {{ banner.secondaryAction.label }}
              </button>
            </template>

            <template v-if="banner.primaryAction">
              <a
                v-if="banner.primaryAction.href"
                :href="banner.primaryAction.href"
                :class="[$style['banner__action'], $style['banner__action--primary']]"
              >
                {{ banner.primaryAction.label }}
              </a>
              <button
                v-else
                type="button"
                :class="[$style['banner__action'], $style['banner__action--primary']]"
                @click="runAction(banner.primaryAction)"
              >
                {{ banner.primaryAction.label }}
              </button>
            </template>
          </div>

          <div :class="[$style['banner__actions-row'], $style['banner__actions-row--leading']]">
            <template v-if="banner.primaryAction">
              <a
                v-if="banner.primaryAction.href"
                :href="banner.primaryAction.href"
                :class="[$style['banner__action'], $style['banner__action--primary']]"
              >
                {{ banner.primaryAction.label }}
              </a>
              <button
                v-else
                type="button"
                :class="[$style['banner__action'], $style['banner__action--primary']]"
                @click="runAction(banner.primaryAction)"
              >
                {{ banner.primaryAction.label }}
              </button>
            </template>

            <template v-if="banner.secondaryAction">
              <a
                v-if="banner.secondaryAction.href"
                :href="banner.secondaryAction.href"
                :class="[$style['banner__action'], $style['banner__action--secondary']]"
              >
                {{ banner.secondaryAction.label }}
              </a>
              <button
                v-else
                type="button"
                :class="[$style['banner__action'], $style['banner__action--secondary']]"
                @click="runAction(banner.secondaryAction)"
              >
                {{ banner.secondaryAction.label }}
              </button>
            </template>
          </div>
        </div>
      </div>

      <button
        v-if="banner.dismissible"
        type="button"
        :class="$style['banner__dismiss']"
        aria-label="Dismiss banner"
        @click="closeBanner(banner.id)"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path
            d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734L9.06 8l3.22 3.22a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L8 9.06l-3.22 3.22a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z"
          />
        </svg>
      </button>
    </section>
  </div>
</template>

<style module src="./Banner.module.css"></style>
