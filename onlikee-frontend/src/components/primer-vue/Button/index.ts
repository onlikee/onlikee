import ButtonRoot from './Button.vue'
import ButtonLeadingVisual from './ButtonLeadingVisual.vue'
import ButtonTrailingVisual from './ButtonTrailingVisual.vue'

export const Button = Object.assign(ButtonRoot, {
  leadingVisual: ButtonLeadingVisual,
  trailingVisual: ButtonTrailingVisual
})

export {
  ButtonLeadingVisual,
  ButtonTrailingVisual
}
