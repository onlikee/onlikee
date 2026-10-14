<script setup lang="ts">
import { nextTick, onMounted, shallowRef, watch } from 'vue'
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
const mounted = shallowRef(false)
const root = shallowRef<Element>()
onMounted(() => {
  mounted.value = true
})

watch(
  [mounted, () => props.containerName ?? context.value.portalContainerName],
  async ([isMounted, name], _previous, onCleanup) => {
    if (!isMounted) return
    if (name === undefined) ensureDefaultPortal()
    const containerName = name ?? DEFAULT_PORTAL_CONTAINER_NAME
    const container = getPortalRoot(containerName)
    if (!container) {
      throw new Error(
        `Portal container '${containerName}' is not yet registered. Container must be registered with registerPortalRoot before use.`,
      )
    }
    root.value = container
    let cancelled = false
    onCleanup(() => {
      cancelled = true
    })
    await nextTick()
    if (!cancelled) props.onMount?.()
  },
  { flush: 'sync' },
)
</script>

<template>
  <Teleport v-if="root" :to="root">
    <div data-component="Portal" :style="{ position: 'relative', zIndex: 1 }"><slot /></div>
  </Teleport>
</template>
