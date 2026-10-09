const roots = new Map<string, Element>()
export function registerPortalRoot(root: Element, name = '__default__'): void {
  roots.set(name, root)
}
export function getPortalRoot(name: string): Element | undefined {
  return roots.get(name)
}
