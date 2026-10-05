import React from 'react'
import { createRoot } from 'react-dom/client'
import FormControl from '@reference/FormControl'
import TextInput from '@reference/TextInput'
import Checkbox from '@reference/Checkbox'
import Textarea from '@reference/Textarea'
import TextInputWithTokens from '@reference/TextInputWithTokens'
import '@parity-theme/light.css'
import '@parity-theme/dark.css'
import '@parity-theme/typography.css'

const params = new URLSearchParams(location.search)
const scenario = params.get('scenario') || 'error'
if (params.get('theme') === 'dark') document.documentElement.dataset.colorMode = 'dark'

const LeadingIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M2 2h12v12H2z" />
  </svg>
)

function App() {
  switch (scenario) {
    case 'success':
      return (
        <FormControl>
          <FormControl.Label>Release address</FormControl.Label>
          <TextInput placeholder="Example" />
          <FormControl.Validation variant="success">Format looks good.</FormControl.Validation>
          <FormControl.Caption>Lowercase letters, numbers and hyphens only.</FormControl.Caption>
        </FormControl>
      )
    case 'required':
      return (
        <FormControl required>
          <FormControl.Label>Application name</FormControl.Label>
          <TextInput placeholder="Example" />
          <FormControl.Caption>Shown on the application card.</FormControl.Caption>
        </FormControl>
      )
    case 'plain':
      return (
        <FormControl>
          <FormControl.Label>Application name</FormControl.Label>
          <TextInput placeholder="Example" />
          <FormControl.Caption>Shown on the application card.</FormControl.Caption>
        </FormControl>
      )
    case 'disabled':
      return (
        <FormControl disabled>
          <FormControl.Label>Application name</FormControl.Label>
          <TextInput placeholder="Example" />
          <FormControl.Validation variant="error">Only lowercase letters, numbers and hyphens.</FormControl.Validation>
          <FormControl.Caption>Shown on the application card.</FormControl.Caption>
        </FormControl>
      )
    case 'checkbox':
      return (
        <FormControl>
          <FormControl.LeadingVisual>
            <LeadingIcon />
          </FormControl.LeadingVisual>
          <Checkbox />
          <FormControl.Label>Subscribe to updates</FormControl.Label>
          <FormControl.Caption>You can change this later.</FormControl.Caption>
        </FormControl>
      )
    case 'hidden-label':
      return (
        <FormControl>
          <FormControl.Label visuallyHidden>Application name</FormControl.Label>
          <TextInput placeholder="Example" />
          <FormControl.Caption>Shown on the application card.</FormControl.Caption>
        </FormControl>
      )
    case 'textarea':
      return (
        <FormControl>
          <FormControl.Label>Description</FormControl.Label>
          <Textarea placeholder="Example" />
          <FormControl.Caption>Shown on the application card.</FormControl.Caption>
        </FormControl>
      )
    case 'tokens':
      return (
        <FormControl>
          <FormControl.Label>Reviewers</FormControl.Label>
          <TextInputWithTokens
            tokens={[
              { id: '1', name: 'Alpha' },
              { id: '2', name: 'Beta' },
            ]}
            onTokenRemove={() => {}}
            placeholder="Example"
          />
          <FormControl.Caption>Shown on the application card.</FormControl.Caption>
        </FormControl>
      )
    default:
      return (
        <FormControl>
          <FormControl.Label>Release address</FormControl.Label>
          <TextInput placeholder="Example" />
          <FormControl.Validation variant="error">Only lowercase letters, numbers and hyphens.</FormControl.Validation>
          <FormControl.Caption>Lowercase letters, numbers and hyphens only.</FormControl.Caption>
        </FormControl>
      )
  }
}
createRoot(document.getElementById('app')!).render(<App />)
