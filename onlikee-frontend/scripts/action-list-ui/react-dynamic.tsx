import React, { useRef, useState } from 'react'
import { ActionList } from '@reference/ActionList/index.ts'

export default function Dynamic() {
  const [state, setState] = useState({ selected: false, active: false, loading: false, disabled: false, inactive: false, prevent: false, description: 'Description that overflows the available space in narrow viewports' })
  const events = useRef<string[]>([])
  const link = useRef<HTMLAnchorElement>(null)
  Object.assign(window, {
    updateActionList: (patch: Partial<typeof state>) => setState(previous => ({ ...previous, ...patch })),
    actionListProbe: () => ({ events: events.current, linkElement: link.current?.tagName ?? null }),
    focusActionListLink: () => link.current?.focus(),
  })
  return <ActionList.ContainerContext.Provider value={{ afterSelect: event => events.current.push(`after:${event.type}:${event.defaultPrevented}`) }}>
    <ActionList role="listbox" selectionVariant="multiple" showDividers aria-label="Dynamic actions">
      <ActionList.Item id="first" selected={state.selected} active={state.active} loading={state.loading} disabled={state.disabled} inactiveText={state.inactive ? 'Unavailable' : undefined} onSelect={event => {
        events.current.push(`select:${event.type}:${event.defaultPrevented}`)
        if (state.prevent) event.preventDefault()
        else setState(previous => ({ ...previous, selected: !previous.selected }))
      }}>
        Alpha<ActionList.Description truncate>{state.description}</ActionList.Description>
      </ActionList.Item>
      <ActionList.Item id="second">Beta</ActionList.Item>
      <ActionList.LinkItem id="link" href="#target" ref={link} _PrivateTooltipText="Link details" inactiveText={state.inactive ? 'Unavailable link' : undefined} onClick={event => {
        events.current.push(`link:${event.type}:${event.defaultPrevented}`)
        event.preventDefault()
      }}>Documentation</ActionList.LinkItem>
    </ActionList>
  </ActionList.ContainerContext.Provider>
}
