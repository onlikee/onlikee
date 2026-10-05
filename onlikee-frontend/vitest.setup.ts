// 测试环境垫片。
//
// 背景：Primer React 官方测试跑在 @vitest/browser（真实浏览器，原生支持 Popover API 与
// adoptedStyleSheets），TooltipV2 的 `apply()`（@oddbird/popover-polyfill）从不执行。
// 本仓库测试使用 jsdom 27.4.0：无 showPopover / adoptedStyleSheets，但 CSSStyleSheet
// 构造器可用 —— polyfill 的 injectStyles() 会走 adoptedStyleSheets 分支并因属性缺失崩溃
// （"root.adoptedStyleSheets is not iterable"）。这里补一个符合规范语义的最小实现，
// 使 isSupported() === false 时 apply() 能完整跑通（与 React 在不支持浏览器中的行为一致）。
// apply() 之后 'popover' in HTMLElement.prototype 为 true，后续挂载不会重复执行。

if (typeof Document !== 'undefined' && !('adoptedStyleSheets' in Document.prototype)) {
  const store = new WeakMap<object, CSSStyleSheet[]>()
  const descriptor: PropertyDescriptor = {
    configurable: true,
    enumerable: true,
    get(this: object) {
      let sheets = store.get(this)
      if (!sheets) {
        sheets = []
        store.set(this, sheets)
      }
      return sheets
    },
    set(this: object, value: CSSStyleSheet[]) {
      store.set(this, Array.isArray(value) ? [...value] : value)
    },
  }
  Object.defineProperty(Document.prototype, 'adoptedStyleSheets', descriptor)
  if (typeof ShadowRoot !== 'undefined' && !('adoptedStyleSheets' in ShadowRoot.prototype)) {
    Object.defineProperty(ShadowRoot.prototype, 'adoptedStyleSheets', descriptor)
  }
}
