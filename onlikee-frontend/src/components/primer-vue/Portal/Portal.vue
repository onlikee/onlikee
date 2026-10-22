<script setup lang="ts">
import {
  getCurrentInstance,
  inject,
  nextTick,
  onBeforeUnmount,
  onMounted,
  shallowRef,
  ssrContextKey,
  watch,
} from 'vue'
import { usePortalContext } from './context'
import { DEFAULT_PORTAL_CONTAINER_NAME, ensureDefaultPortal, getPortalRoot } from './portalRoot'

export interface PortalProps {
  containerName?: string
  onMount?: () => void
}

defineOptions({ name: 'Portal', inheritAttrs: false })
const props = defineProps<PortalProps>()
defineSlots<{ default?: () => unknown }>()
const context = usePortalContext()
const serverRendering = inject(ssrContextKey, null) !== null
// Vue populates the public $el before setup only when hydrating existing markup.
// Client-only portals render immediately so parent mounted hooks can read child refs.
const hydrating = getCurrentInstance()?.proxy?.$el != null
const ready = shallowRef(!serverRendering && !hydrating)
const element = serverRendering ? undefined : document.createElement('div')
if (element) {
  element.setAttribute('data-component', 'Portal')
  element.style.position = 'relative'
  element.style.zIndex = '1'
}
let mounted = false

function attach() {
  const name = props.containerName ?? context.value.portalContainerName
  if (name === undefined) ensureDefaultPortal()
  const containerName = name ?? DEFAULT_PORTAL_CONTAINER_NAME
  const container = getPortalRoot(containerName)
  if (!container) {
    throw new Error(
      `Portal container '${containerName}' is not yet registered. Container must be registered with registerPortalRoot before use.`,
    )
  }
  container.appendChild(element!)
}

onMounted(async () => {
  attach()
  mounted = true
  if (!ready.value) {
    ready.value = true
    await nextTick()
  }
  if (mounted) props.onMount?.()
})

onBeforeUnmount(() => {
  mounted = false
  element?.remove()
})

watch(
  [() => props.containerName, () => context.value.portalContainerName],
  () => {
    if (!mounted) return
    element?.remove()
    attach()
    props.onMount?.()
  },
  { flush: 'post' },
)
</script>

<template>
  <Teleport v-if="ready && element" :to="element"><slot /></Teleport>
</template>
