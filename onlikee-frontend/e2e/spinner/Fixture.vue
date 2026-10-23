<script setup lang="ts">
import { h, onMounted, onUnmounted, ref } from 'vue'
import { Spinner } from '@/components/primer-vue/Spinner'
import { Button, IconButton } from '@/components/primer-vue/Button'
import { ActionList } from '@/components/primer-vue/ActionList'
import { Autocomplete } from '@/components/primer-vue/Autocomplete'
import {
  FilteredActionList,
  FilteredActionListLoadingTypes,
} from '@/components/primer-vue/FilteredActionList'
import { SelectPanel } from '@/components/primer-vue/SelectPanel'
import { TextInput } from '@/components/primer-vue/TextInput'
import { TextInputWithTokens } from '@/components/primer-vue/TextInputWithTokens'
const loading = ref(true)
const open = ref(false)
const delayKey = ref(0)
const mode = new URLSearchParams(location.search).get('mode') === 'input' ? 'input' : 'bodySpinner'
const items = [
  { id: 'alpha', text: 'Alpha' },
  { id: 'beta', text: 'Beta' },
]
const Icon = () =>
  h('svg', { width: 16, height: 16, viewBox: '0 0 16 16', 'aria-hidden': true }, [
    h('path', { d: 'M2 7h5V2h2v5h5v2H9v5H7V9H2z', fill: 'currentColor' }),
  ])
// A real keyboard shortcut changes loading without moving focus from the consumer.
function shortcut(event: KeyboardEvent) {
  if (event.altKey && event.key.toLowerCase() === 'l') {
    event.preventDefault()
    loading.value = !loading.value
  }
}
onMounted(() => window.addEventListener('keydown', shortcut))
onUnmounted(() => window.removeEventListener('keydown', shortcut))
</script>
<template>
  <main>
    <h1>Spinner composition QA</h1>
    <p>Alt+L toggles loading while preserving focus. Reader verification is separate.</p>
    <button id="toggle" @click="loading = !loading">
      {{ loading ? 'Finish loading' : 'Start loading' }}
    </button>
    <output id="state">{{ loading ? 'loading' : 'ready' }}</output>
    <div class="grid">
      <section id="standalone">
        <h2>Sizes and inline alignment</h2>
        <div class="row">
          <span v-for="size in ['small', 'medium', 'large'] as const" :key="size" :data-size="size"
            ><Spinner :size="size" /> {{ size }}</span
          >
        </div>
        <p>
          <Spinner size="small" sr-text="Saving changes" /> Custom label
          <Spinner size="small" :sr-text="null" /> Silent
        </p>
      </section>
      <section id="buttons">
        <h2>Button / IconButton</h2>
        <div class="row">
          <Button id="save" :loading="loading" loading-announcement="Saving">Save</Button
          ><IconButton id="add" aria-label="Add item" :icon="Icon" :loading="loading" />
        </div>
      </section>
      <section id="inputs">
        <h2>Input overlays</h2>
        <div
          v-for="position in ['auto', 'leading', 'trailing'] as const"
          :key="position"
          class="field"
        >
          <TextInput
            :id="`input-${position}`"
            :aria-label="`${position} input`"
            :loading="loading"
            :loader-position="position"
            :leading-visual="Icon"
            :trailing-visual="Icon"
            default-value="Keep typed text"
          />
        </div>
        <TextInput id="plain" aria-label="Plain input" :loading="loading" />
      </section>
      <section id="tokens">
        <h2>Token input overlays</h2>
        <div
          v-for="position in ['auto', 'leading', 'trailing'] as const"
          :key="position"
          class="field"
        >
          <TextInputWithTokens
            :id="`tokens-${position}`"
            :aria-label="`${position} tokens`"
            :tokens="[{ id: 'one', text: 'One' }]"
            :loading="loading"
            :loader-position="position"
            :leading-visual="Icon"
            :trailing-visual="Icon"
          />
        </div>
      </section>
      <section id="actions">
        <h2>ActionList</h2>
        <ActionList aria-label="Actions"
          ><ActionList.Item :loading="loading">Synchronize</ActionList.Item
          ><ActionList.Item>Available action</ActionList.Item></ActionList
        >
      </section>
      <section id="autocomplete">
        <h2>Autocomplete</h2>
        <label id="auto-label" for="auto-input">Find item</label
        ><Autocomplete
          ><Autocomplete.Input id="auto-input" /><Autocomplete.Menu
            :items="items"
            :selected-item-ids="[]"
            :loading="loading"
            aria-labelledby="auto-label"
        /></Autocomplete>
      </section>
      <section id="filtered">
        <h2>FilteredActionList</h2>
        <FilteredActionList
          :items="items"
          :loading="loading"
          :loading-type="FilteredActionListLoadingTypes[mode]"
          :text-input-props="{ 'aria-label': 'Filter items' }"
        />
      </section>
      <section id="panel">
        <h2>SelectPanel</h2>
        <SelectPanel
          :open="open"
          :selected="undefined"
          :items="items"
          :loading="loading"
          :loading-type="FilteredActionListLoadingTypes[mode]"
          title="Choose item"
          input-label="Find panel item"
          placeholder="Choose item"
          @open-change="open = $event"
        />
      </section>
      <section id="delay">
        <h2>Delayed remount</h2>
        <button id="restart" @click="delayKey++">Restart delay</button
        ><span :key="delayKey"><Spinner :delay="500" sr-text="Delayed loading" /></span>
      </section>
    </div>
  </main>
</template>
<style>
body {
  margin: 0;
  background: var(--bgColor-default);
  color: var(--fgColor-default);
  font-family: Arial, sans-serif;
}
main {
  padding: 24px;
  max-width: 1100px;
  margin: auto;
}
h1 {
  font-size: 24px;
}
h2 {
  font-size: 16px;
  margin: 0 0 16px;
}
.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-top: 20px;
}
section {
  border: 1px solid var(--borderColor-default);
  border-radius: 8px;
  padding: 16px;
  min-width: 0;
}
.row {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}
.field {
  margin-bottom: 12px;
}
output {
  margin-left: 12px;
}
@media (max-width: 600px) {
  .grid {
    grid-template-columns: 1fr;
  }
  main {
    padding: 16px;
  }
}
</style>
