// 镜像 React hooks/useOnEscapePress.ts 与 hooks/useOnOutsideClick.tsx 的文档级注册表：
// - 全局仅挂一个 document 监听器（注册表非空时），注册表为空时移除；
// - 按注册顺序的逆序调用处理器（后注册者先执行，即"最上层先响应"）；
// - Escape：任一处理器 preventDefault 后中断（"一次只关一层"，React useOverlay.tsx:34-38）；
// - 外点（capture mousedown）：处理器返回 true（stopPropagation 哨兵）或事件已被 preventDefault 时中断，
//   否则继续穿透到更老的浮层——一次外点可关闭整叠浮层（React 源行为，审计 M9）。

type EscapeHandler = (event: KeyboardEvent) => void
type OutsideHandler = (event: MouseEvent) => boolean | undefined

// React 用返回 true 作为提前中断哨兵（useOnOutsideClick.tsx:14）
const STOP_PROPAGATION = true

const escapeRegistry = new Map<number, EscapeHandler>()
const outsideRegistry = new Map<number, OutsideHandler>()
let handlerId = 0

function handleEscape(event: KeyboardEvent) {
  // React useOnEscapePress.ts:60-65 在注册表包装层过滤非 Escape 键（各 handler 不自查）；
  // 缺此过滤会让 useTooltip 等消费者吞掉任意按键（composables 审计偏差 1，高危回归）。
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

/** 注册 Escape 处理器；返回注销函数。对应 React useOnEscapePress。 */
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

/** 注册外点处理器（capture mousedown）；返回注销函数。对应 React useOnOutsideClick。 */
export function registerOutsideClickHandler(handler: OutsideHandler): () => void {
  if (typeof document === 'undefined') return () => {}
  if (outsideRegistry.size === 0) document.addEventListener('mousedown', handleClick, { capture: true })
  const id = handlerId++
  outsideRegistry.set(id, handler)
  return () => {
    outsideRegistry.delete(id)
    if (outsideRegistry.size === 0) document.removeEventListener('mousedown', handleClick, { capture: true })
  }
}
