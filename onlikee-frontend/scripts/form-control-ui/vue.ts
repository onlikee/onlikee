import { createApp, h } from 'vue'
import { FormControl } from '@implementation/FormControl/index.ts'
import { TextInput } from '@implementation/TextInput/index.ts'
import { Checkbox } from '@implementation/Checkbox/index.ts'
import { Textarea } from '@implementation/Textarea/index.ts'
import { TextInputWithTokens } from '@implementation/TextInputWithTokens/index.ts'
import '@parity-theme/light.css'
import '@parity-theme/dark.css'
import '@parity-theme/typography.css'

const params = new URLSearchParams(location.search)
const scenario = params.get('scenario') || 'error'
if (params.get('theme') === 'dark') document.documentElement.dataset.colorMode = 'dark'

const LeadingIcon = () =>
  h('svg', { width: 16, height: 16, viewBox: '0 0 16 16', fill: 'currentColor', 'aria-hidden': 'true' }, [
    h('path', { d: 'M2 2h12v12H2z' }),
  ])

const scenarios: Record<string, () => ReturnType<typeof h>> = {
  error: () =>
    h(FormControl, null, () => [
      h(FormControl.Label, null, () => 'Release address'),
      h(TextInput, { placeholder: 'Example' }),
      h(FormControl.Validation, { variant: 'error' }, () => 'Only lowercase letters, numbers and hyphens.'),
      h(FormControl.Caption, null, () => 'Lowercase letters, numbers and hyphens only.'),
    ]),
  success: () =>
    h(FormControl, null, () => [
      h(FormControl.Label, null, () => 'Release address'),
      h(TextInput, { placeholder: 'Example' }),
      h(FormControl.Validation, { variant: 'success' }, () => 'Format looks good.'),
      h(FormControl.Caption, null, () => 'Lowercase letters, numbers and hyphens only.'),
    ]),
  required: () =>
    h(FormControl, { required: true }, () => [
      h(FormControl.Label, null, () => 'Application name'),
      h(TextInput, { placeholder: 'Example' }),
      h(FormControl.Caption, null, () => 'Shown on the application card.'),
    ]),
  plain: () =>
    h(FormControl, null, () => [
      h(FormControl.Label, null, () => 'Application name'),
      h(TextInput, { placeholder: 'Example' }),
      h(FormControl.Caption, null, () => 'Shown on the application card.'),
    ]),
  disabled: () =>
    h(FormControl, { disabled: true }, () => [
      h(FormControl.Label, null, () => 'Application name'),
      h(TextInput, { placeholder: 'Example' }),
      h(FormControl.Validation, { variant: 'error' }, () => 'Only lowercase letters, numbers and hyphens.'),
      h(FormControl.Caption, null, () => 'Shown on the application card.'),
    ]),
  checkbox: () =>
    h(FormControl, null, () => [
      h(FormControl.LeadingVisual, null, () => [h(LeadingIcon)]),
      h(Checkbox),
      h(FormControl.Label, null, () => 'Subscribe to updates'),
      h(FormControl.Caption, null, () => 'You can change this later.'),
    ]),
  'hidden-label': () =>
    h(FormControl, null, () => [
      h(FormControl.Label, { visuallyHidden: true }, () => 'Application name'),
      h(TextInput, { placeholder: 'Example' }),
      h(FormControl.Caption, null, () => 'Shown on the application card.'),
    ]),
  textarea: () =>
    h(FormControl, null, () => [
      h(FormControl.Label, null, () => 'Description'),
      h(Textarea, { placeholder: 'Example' }),
      h(FormControl.Caption, null, () => 'Shown on the application card.'),
    ]),
  tokens: () =>
    h(FormControl, null, () => [
      h(FormControl.Label, null, () => 'Reviewers'),
      h(TextInputWithTokens, {
        tokens: [
          { id: '1', name: 'Alpha' },
          { id: '2', name: 'Beta' },
        ],
        onTokenRemove: () => {},
        placeholder: 'Example',
      }),
      h(FormControl.Caption, null, () => 'Shown on the application card.'),
    ]),
}
createApp({ render: scenarios[scenario] ?? scenarios.error }).mount('#app')
