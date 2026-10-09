// jsdom 缺少 adoptedStyleSheets；为 Popover polyfill 补充可读写的样式表集合。

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
