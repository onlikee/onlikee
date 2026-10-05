<script lang="ts">
import { defineComponent, h, type PropType } from 'vue'

/* Primer React 8c0b708 Token/_TokenTextContainer.tsx 直译（内部组件）。
   className={clsx(classes.TokenTextContainer)} 在 {...props} 之前——消费者传 className
   会整体覆盖组件类（源怪癖；Token/IssueLabelToken 调用点不传 className，不可达，
   Vue 侧以类合并胶水替代）。
   源不设置 type：as='button' 时保留隐式 submit 语义（源行为，测试锁定）。 */
export default defineComponent({
  name: 'TokenTextContainer',
  inheritAttrs: false,
  props: {
    as: { type: String as PropType<'button' | 'a' | 'span'>, default: 'span' },
    id: { type: [Number, String], default: undefined }
  },
  setup(props, { attrs, slots }) {
    return () => {
      const { class: cls, ...restAttrs } = attrs
      return h(props.as, {
        id: props.id?.toString(),
        ...restAttrs,
        class: ['token__text', cls]
      }, slots.default?.())
    }
  }
})
</script>

<style scoped>
/* Primer React 8c0b708 Token/_TokenTextContainer.module.css 直译。
   源中 color: inherit 被随后的 color: currentColor 覆盖，两行均保留（死声明忠实镜像）。
   :is(a, button, [tabIndex='0']) 源为大写 tabIndex——CSS 属性选择器大小写不敏感，
   此处按 HTML 规范写小写 tabindex（审计已验证等价）。 */
.token__text { width: auto; min-width: 0; padding: 0; margin: 0; overflow: hidden; font: inherit; line-height: var(--base-text-lineHeight-normal, 1.5); color: inherit; color: currentColor; text-decoration: none; text-overflow: ellipsis; white-space: nowrap; background: transparent; border: none; flex-grow: 1; -webkit-font-smoothing: inherit; -moz-osx-font-smoothing: inherit; appearance: none; }
/* Position psuedo-element above text content, but below the remove button.
   This ensures the <a> or <button> receives the click no matter where on the
   token the user clicks.（源注释原样保留） */
.token__text:is(a, button, [tabindex='0']) { cursor: pointer; }
.token__text:is(a, button, [tabindex='0'])::after { position: absolute; top: 0; right: 0; bottom: 0; left: 0; content: ''; }
</style>
