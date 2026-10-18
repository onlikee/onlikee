const handlers = new WeakMap<HTMLElement, (event: Event) => void>()
const dispatched = new WeakSet<Event>()

export function registerToggleHandler(
  element: HTMLDetailsElement,
  handler: (event: Event) => void,
) {
  handlers.set(element, handler)
  return () => handlers.delete(element)
}

// React's synthetic toggle event bubbles, while the native event does not.
export function forwardToggle(event: Event) {
  if (dispatched.has(event)) return
  dispatched.add(event)
  const descriptor = Object.getOwnPropertyDescriptor(event, 'currentTarget')
  try {
    for (
      let element = event.target as HTMLElement | null;
      element && !event.cancelBubble;
      element = element.parentElement
    ) {
      const handler = handlers.get(element)
      if (handler) {
        Object.defineProperty(event, 'currentTarget', { configurable: true, value: element })
        handler(event)
      }
    }
  } finally {
    if (descriptor) Object.defineProperty(event, 'currentTarget', descriptor)
    else Reflect.deleteProperty(event, 'currentTarget')
  }
}

export function captureToggle(event: Event) {
  dispatched.delete(event)
  const target = event.target as HTMLElement
  if (target === event.currentTarget || handlers.has(target)) return
  // Native children have no Details listener. Run after their target listeners,
  // so stopPropagation and preventDefault reach the ancestor handlers.
  target.addEventListener('toggle', forwardToggle, { once: true })
}
