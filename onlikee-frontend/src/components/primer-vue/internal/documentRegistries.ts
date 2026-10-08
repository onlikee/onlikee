// 按注册顺序的逆序分发浮层事件；处理器调用 preventDefault 后停止分发。

type EscapeHandler = (event: KeyboardEvent) => void
type OutsideHandler = (event: MouseEvent) => boolean | undefined

const STOP_PROPAGATION = true

const escapeRegistry = new Map<number, EscapeHandler>()
const outsideRegistry = new Map<number, OutsideHandler>()
let handlerId = 0

function handleEscape(event: KeyboardEvent) {
  // 按注册顺序的逆序分发浮层事件；处理器调用 preventDefault 后停止分发。
  if (event.key !== 'Escape') return
  if (event.defaultPrevented) return
  for (const handler of [...escapeRegistry.values()].reverse()) {
    handler(event)
    if (event.defaultPrevented) break
  }
}

function handleClick(event: MouseEvent) {
  if (event.defaultPrevented) return
  for (const handler of [...outsideRegistry.values()].reverse()) {
    if (handler(event) === STOP_PROPAGATION || event.defaultPrevented) break
  }
}

export function registerEscapeHandler(handler: EscapeHandler): () => void {
  if (typeof document === 'undefined') return () => {}
  if (escapeRegistry.size === 0) document.addEventListener('keydown', handleEscape)
  const id = handlerId++
  escapeRegistry.set(id, handler)
  return () => {
    escapeRegistry.delete(id)
    if (escapeRegistry.size === 0) document.removeEventListener('keydown', handleEscape)
  }
}

export function registerOutsideClickHandler(handler: OutsideHandler): () => void {
  if (typeof document === 'undefined') return () => {}
  if (outsideRegistry.size === 0)
    document.addEventListener('mousedown', handleClick, { capture: true })
  const id = handlerId++
  outsideRegistry.set(id, handler)
  return () => {
    outsideRegistry.delete(id)
    if (outsideRegistry.size === 0)
      document.removeEventListener('mousedown', handleClick, { capture: true })
  }
}
