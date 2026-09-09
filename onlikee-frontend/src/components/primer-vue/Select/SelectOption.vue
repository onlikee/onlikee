<template>
  <span
    ref="optionSourceRef"
    class="select-option-source"
  >
    <slot />
  </span>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, onUpdated, ref, watch } from 'vue'
import { useSelectContext } from './context'

const props = defineProps<{
  value: string
  label?: string
}>()

const selectContext = useSelectContext()
const optionSourceRef = ref<HTMLSpanElement | null>(null)
const slotLabel = ref('')
const optionId = Symbol('SelectOption')

const option = computed(() => ({
  value: props.value,
  label: props.label ?? slotLabel.value
}))

onMounted(() => {
  syncSlotLabel()
  selectContext?.registerOption(optionId, option.value)
})

onUpdated(syncOption)

onBeforeUnmount(() => {
  selectContext?.unregisterOption(optionId)
})

watch(() => [props.value, props.label] as const, () => {
  selectContext?.updateOption(optionId, option.value)
})

function syncOption() {
  syncSlotLabel()
  selectContext?.updateOption(optionId, option.value)
}

function syncSlotLabel() {
  slotLabel.value = optionSourceRef.value?.textContent?.trim() ?? ''
}
</script>

<style scoped>
.select-option-source {
  display: none;
}
</style>
