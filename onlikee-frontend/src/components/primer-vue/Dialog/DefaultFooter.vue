<script setup lang="ts">
import { computed, nextTick, onMounted, shallowRef } from 'vue'
import DialogButtons from './DialogButtons.vue'
import DialogFooter from './DialogFooter.vue'
import { FocusKeys, useFocusZone } from '../composables/useFocusZone'
import type { DialogButtonProps, DialogSectionInstance } from './types'

const props = defineProps<{ buttons: DialogButtonProps[] }>()
const footer = shallowRef<DialogSectionInstance | null>(null)
const footerElement = computed(() => (footer.value?.element as HTMLElement | null) ?? null)
const ready = shallowRef(false)
useFocusZone(() => ({
  containerRef: footerElement,
  bindKeys: FocusKeys.ArrowHorizontal | FocusKeys.Tab,
  focusInStrategy: 'closest',
  disabled: !ready.value,
}))
onMounted(async () => {
  // React installs the footer zone after its buttons establish initial focus.
  await nextTick()
  await nextTick()
  await nextTick()
  ready.value = true
})
const actions = shallowRef<{ element: HTMLElement | null } | null>(null)
const element = computed(() => actions.value?.element ?? null)
defineExpose({ element })
</script>

<template>
  <DialogFooter ref="footer"><DialogButtons ref="actions" :buttons="props.buttons" /></DialogFooter>
</template>
