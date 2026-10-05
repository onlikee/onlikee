<script setup lang="ts">
import AriaStatus from './AriaStatus.vue'
import VisuallyHidden from './VisuallyHidden.vue'
import Text from '../../Text/Text.vue'
import { SCREEN_READER_DELAY, type getCharacterCountState } from '../characterCounter'
defineProps<{ limit: number; counter: ReturnType<typeof getCharacterCountState>; staticMessageId: string; counterId: string; component?: string }>()
</script>

<template>
  <!-- 源（TextInput.tsx:266-292 / Textarea.tsx:163-188 内联 JSX）：
       AriaStatus 容器与静态消息均为 _VisuallyHidden 的 clip:rect(0,0,0,0) 配方（§6.3-19 内部版），
       可见计数节点为 Text size="small"——data-size/line-height/font-size 由 Text.vue 提供，
       data-component 默认 'Text'（Textarea 侧），TextInput 侧传 component 覆盖（rest 后置语义一致）。 -->
  <AriaStatus
    :announce-on-show="false"
    :delay-ms="SCREEN_READER_DELAY"
    class="internal-visually-hidden"
  >
    {{ counter.message }}
  </AriaStatus>
  <VisuallyHidden :id="staticMessageId">You can enter up to {{ limit }} {{ limit === 1 ? 'character' : 'characters' }}</VisuallyHidden>
  <Text
    size="small"
    :id="counterId"
    class="character-counter"
    :class="{ 'character-counter-error': counter.isOverLimit }"
    v-bind="component !== undefined ? { 'data-component': component } : {}"
    aria-hidden="true"
  ><!-- 源超限态渲染 <AlertFillIcon size={16}/>（octicons-react 原生输出全属性）。 --><svg
    v-if="counter.isOverLimit"
    data-component="Octicon"
    aria-hidden="true"
    focusable="false"
    class="octicon octicon-alert-fill"
    viewBox="0 0 16 16"
    width="16"
    height="16"
    fill="currentColor"
    display="inline-block"
    overflow="visible"
    style="vertical-align: text-bottom"
  ><path d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575ZM8 5a.75.75 0 0 0-.75.75v2.5a.75.75 0 0 0 1.5 0v-2.5A.75.75 0 0 0 8 5Zm1 6a1 1 0 1 0-2 0 1 1 0 0 0 2 0Z" /></svg>{{ counter.message }}</Text>
</template>

<style scoped>
/* Primer React 8c0b708: TextInput/Textarea 计数节点自有声明（flex/gap/颜色）。
   font-size/line-height 由 Text 的 [data-size='small'] 规则提供，不在此重复。
   兜底值对齐 primitives 11.5.1 light 实值（§6.3-20）。 */
.character-counter { display: flex; align-items: center; gap: var(--control-xsmall-gap, 4px); color: var(--fgColor-muted, #59636e); }
.character-counter-error { color: var(--fgColor-danger, #d1242f); }
</style>
