const roots = new Map<string, Element>()
export const DEFAULT_PORTAL_CONTAINER_NAME = '__default__'

export function registerPortalRoot(root: Element, name = DEFAULT_PORTAL_CONTAINER_NAME): void {
  roots.set(name, root)
}

export function getPortalRoot(name: string): Element | undefined {
  return roots.get(name)
}

export function ensureDefaultPortal(): void {
  const registered = getPortalRoot(DEFAULT_PORTAL_CONTAINER_NAME)
  if (registered && document.body.contains(registered)) return

  let root = document.getElementById('__primerPortalRoot__')
  if (!root) {
    root = document.createElement('div')
    root.id = '__primerPortalRoot__'
    Object.assign(root.style, { position: 'absolute', top: '0', left: '0', width: '100%' })
    ;(document.querySelector('[data-portal-root]') ?? document.body).appendChild(root)
  }
  registerPortalRoot(root)
}
