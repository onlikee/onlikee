# SelectPanel 对齐记录

基准：`C:/Users/25336/Desktop/project/react/packages/react/src/SelectPanel`，提交 `8c0b708fc43a3535b643cadc5a7ba97e937555c8`。对照组件、样式、公开类型、测试及其 FilteredActionList、ActionList、Overlay、AnchoredOverlay、Button 和实时播报依赖。React 仓库未修改。

## 本次严格逻辑对齐

2026-10-03，按严格复现本地 React 的要求重新核对逻辑，撤回此前针对 SelectPanel 和 FilteredActionList 的源缺陷修正。以下行为以源码为准，包含源现有边界行为。

- 选中展示按 ID、无 ID 时按引用比较；多选切换使用源相等判断；锚定单选取消选中按对象引用，模态单选取消选中按 `id`。无 ID 模态首次点击仍不选中。引用与 Set 键通过 `toRaw` 归一化 Vue 代理；继承的 `selected: undefined` 同样抑制选中属性。
- 排序使用 Set 查询和稳定排序。快照仅在实际开关变化、选项从空变为非空及清空过滤时重置；初始已打开不初始化选中置顶快照，选中项变化不立即改变排序。
- 首次请求随开关、过滤值、选项、选择状态、过滤回调和内部加载模式变化重新判断。显示加载使用 `loading || (internalLoading && !message)`；外部模式下更新选项不清除已有内部加载。空响应结束首次内部加载，之后使用输入区加载外观。
- 内部后续加载延迟 1000ms，Loading 播报延迟 500ms；源外部加载播报分支仍监听内部 `isLoading`。关闭不取消加载计时器，卸载清理计时器。Notice 使用库默认延迟，按对象替换和重新打开触发；播报不增加文本去重或关闭取消。
- 覆盖而非合并调用方 `overlayProps.style`；模态定位和键盘高度使用源最终样式。外部 keydown 先执行，字母、数字和斜线按源阻止传播，输入框及修饰键快捷键保留传播。
- input/list ref 回调覆盖内部处理；回调替换重新通知当前节点，旧 list 回调收到 null。原始 `onAction` 先执行，收到映射后的选项；`preventDefault()` 阻止随后选择。选择、保存、取消、Escape 和外部点击保留源关闭原因和顺序。
  Vue 将这两个 ref 回调保留为声明属性，通过组件实例派发原生事件，避免 Vue 将仅监听器替换视为无需更新；SelectPanel 和 FilteredActionList 都覆盖只替换回调的回归用例。
- 锚点使用源的 `aria-haspopup="true"`、tabIndex 和标签关联，不额外关联 caption 或传入 disabled/validation；相关属性传给列表。外部 anchorRef 可动态替换，实例暴露仍返回元素。
- 窄屏断点使用 `calc(768px - 0.02px)`；visualViewport 保留 100ms 防抖和缩放识别，关闭清理监听器但不重置已记录高度。页脚及关闭按钮按源条件显示。
- FilteredActionList 列表级 renderItem 覆盖单项/分组 renderer，renderGroup 不额外生效。textInputProps 的键盘回调覆盖默认处理，focus 先执行内部处理再调用外部回调；全选恢复固定 `select-all-checkbox` ID，包含多实例重复 ID 的源行为。
- active-descendant 模式绑定纵向方向键和 PageUp/PageDown；虚拟列表使用 `stop` 和源 scrollToIndex 策略，不增加屏外 Home/End 或循环导航。roving 模式按 ActionList 自身规则循环；源焦点区域可导航到禁用选项，普通选项激活仍阻止禁用、inactive 和 loading 项。

## 本次验证

- Vue 全量 25 个文件、258 项测试通过；测试类型检查、lint 和 build 通过，既有提示见 [TESTING.md](./TESTING.md)。新增 `SelectPanel.parity.test.ts`，更新 SelectPanel、FilteredActionList 和 FormControl 中与源冲突的预期。
- 使用系统 Chrome 执行本地 React 原有 SelectPanel 浏览器测试：152 项通过；另用临时测试复核同 ID 不同引用、无 ID 模态、初始打开排序、overlay 样式及锚点 ARIA、renderer 覆盖、全选重复 ID、继承的 undefined 选择、ref 覆盖和回调替换：9 项通过。
- 逻辑复核的临时浏览器配置及测试位于系统临时目录，React 源码和工作树未修改。严格 UI 对照使用下述独立脚本；下方历史 40 组截图结果不作为本轮验收依据。
- virtual-core 3.13.18 的源 scrollToIndex 可能在卸载后留下嵌套 rAF 重试；严格对齐保留该路径。虚拟导航回归由测试控制 rAF 队列，避免该源缺陷污染后续用例，不恢复旧的屏外导航修正。

## 本轮严格 UI 对齐

按 `8c0b708` 的实际渲染树恢复标签及嵌套顺序：标题使用 div，Notice 使用 Banner 的 section、隐藏 h2、图标与正文容器；ActionList 行恢复 Content、Spacer、LeadingAction、DividerContainer 和 DescriptionWrap；按钮恢复 buttonContent、text、visual 和尾部 action 的层级。关闭按钮使用 IconButton 结构及 Tooltip，Skeleton 使用 Stack 和 SkeletonBox，加载图标及隐藏说明保留源节点。

SelectPanel、ActionList、Banner、ButtonBase、Tooltip、SkeletonBox 和 Stack 的源 CSS 以带组件前缀的普通 CSS 保存，提前展开源 mixin 和 custom media，保留变量、兜底值、伪元素、强制颜色及减少动画规则。相应子树的按钮使用私有 SelectPanelButton，避免改变其他共享 Button 消费方。TextInput visual 保留源 loading 布尔值对应的稳定层级。

源 CSS 的 MIT 许可及版权声明随 [PRIMER_REACT_LICENSE.txt](./src/components/primer-vue/SelectPanel/PRIMER_REACT_LICENSE.txt) 保存。

保留源的细节及缺陷：active-descendant 的 callback ref 在未启用 merged-ref flag 时不能触发 mixed-descriptions 检查，因此带说明的标题仍为 600 字重；开启该 flag 或使用 roving 模式时按源设置混合说明样式。窄屏关闭按钮仍存在于 DOM，由媒体查询隐藏宽屏按钮；Save and close 的按钮包装不套用 Cancel/Save 的 gap。结构和 flag 分支已加入回归测试。

可复现的浏览器对照脚本见 [scripts/select-panel-ui-parity.mjs](./scripts/select-panel-ui-parity.mjs)，用同一主题、字体和视口分别加载本地 React 源码与 Vue 实现。比较锚点和整个弹层的标签树、Chrome 返回的全部标准计算属性、节点坐标和 RGBA 截图；样式及像素无容差，坐标容差 0.02px。生成逐组 report.json 与两侧截图，不向 React 仓库写入文件。只归一化 React/Vue useId 生成的锚点标识，以及 display:none Tooltip 在初次焦点迁移时留下的坐标；Tooltip 打开后的坐标仍严格比较。不比较 CSS 自定义变量的名称，变量解析后的标准属性参加比较。

矩阵包含 13 类场景 × 浅/深色 × 1024/390px 共 52 组，以及尺寸、虚拟列表、merged-ref、CSS anchor、鼠标悬停、键盘焦点和关闭按钮 Tooltip 的 9 组，共 61 组。13 类场景包括单选、多选、模态、Notice、Message、Spinner、Skeleton、分组、全选、复杂列表行、输入加载、取消/保存、次要按钮加载。

2026-10-03 实际执行结果：Chrome 154.0.8037.95，61/61 组通过，DOM/计算样式差异 0，RGBA 不同像素 0。逐组验收结果保存于 [last-report.json](./scripts/select-panel-ui/last-report.json)，双侧截图位于 `C:/Users/25336/AppData/Local/Temp/select-panel-ui-DzWgaR`。Vue 全量 258 项测试、typecheck:test、lint 和 build 同时通过。

截图验证页关闭动画和 transition，以消除暂停但仍合成的 Spinner 导致的文字抗锯齿差异；组件本身保留源动画。全选 Checkbox 局部撤回共享 Vue 控件额外的减少动画修正，保留源动画及延迟；其余 Checkbox 不受影响。CSS anchor 恢复源 z-index 100 及完整的默认 fallback 列表，普通弹层使用源 z-index:auto。UI 结果限于实际执行的固定内容和 Chrome 矩阵，真实 iOS 软键盘仍由 visualViewport 单元测试覆盖。

## 2026-10-04 TextInput 链严格对齐轮的联动复核

FormControl/TextInput 链按源移植（见 [FORM_CONTROL_MIGRATION.md](./FORM_CONTROL_MIGRATION.md)）后，`FilteredActionListInput.vue` 中修补共享组件偏差的五条 `:deep` 补偿（icon display、wrapper background-position/repeat、input flex/min-width/padding-block/line-height、`.text-input-hidden` clip 配方及其 margin-right）全部移除：TextInputWrapper、UnstyledTextInput 移植样式与 `.text-input-hidden` 现已原生给出源计算值。仅保留源 Header 的 box-shadow/z-index 与 iOS 全屏字号规则。

复跑 `select-panel-ui-parity.mjs` 全矩阵：61/61 组通过，DOM/计算样式差异 0、RGBA 不同像素 0；[last-report.json](./scripts/select-panel-ui/last-report.json) 已更新为本轮结果（Chrome 154.0.8037.95，478 项标准属性）。首轮复跑曾在 `12-modal-dark-390` 出现 146 个 ±1 通道像素差，位于 Save 按钮圆角边缘抗锯齿，节点/样式/几何差异均为 0；单独及全量重跑均恢复一致，判定为光栅化非确定性抖动。后续运行若再遇"零样式差异 + 少量边缘 ±1 通道像素"，应重跑该场景确认后视为通过。

同日全面复核轮追加两处结构保真并再次全矩阵复跑 61/61：FAL 全屏字号类从 header div 的 `:deep(input)` 迁至 TextInput 根 className（源 `.FullScreenTextInput` 挂 wrapper，经 `font-size: inherit` 生效；Chrome 桌面不命中 `@supports (-webkit-touch-callout: none)`，纯结构保真），并按源补传 `color="fg.default"`（经 TextInput 的 inputProps 落在 input 元素，与 React DOM 属性一致）。

## 上轮外观修正（历史记录）

- 恢复源默认自动宽高、192px 最小宽度、视口边界及尺寸 token；移除原先固定 medium 宽度和额外高度限制。弹层挂入 Portal，修正页面存在外边距时的位置偏移；模态居中和遮罩层级保持按钮可点击。
- 对齐标题、副标题、关闭按钮、搜索框的间距和分隔阴影；使用对应 Octicon SVG 替换文字图标，并修正关闭图标颜色及锚点按钮展开态背景。默认未传 secondaryAction 时不再误显示空页脚。
- 对齐列表行高度、内边距、选中和焦点外观、勾选图标、模态单选圆点、禁用颜色、说明、不可用提示、尾部内容及分组标题和边框。
- 对齐 Notice 的紧凑 Banner、Message 的居中布局和图标尺寸、Spinner、Skeleton 行数和动画；私有样式仍使用 Vue scoped CSS，并提供变量兜底。
- 对齐单选、多选、模态及窄屏全屏的页脚按钮和拉伸规则；SecondaryActionButton 与 SecondaryActionLink 使用源对应的 Button 外观。

## 上轮视觉验收（历史记录）

2026-10-03，使用本机 Chrome，通过临时 Vite 页面分别加载本地 React 源码和 Vue 组件，使用相同字体和主题变量；进行截图及 DOM 几何和计算样式对照。

| 范围 | 结果 |
| --- | --- |
| 单选、多选、模态、Notice、Message、Spinner、Skeleton、分组、全选 × 1024/390px 宽度 × 浅色/深色 | 36 组对照通过 |
| 指定宽高、initial 高度、虚拟列表 | 4 组对照通过 |
| 合并 ref、CSS 锚点定位等 FeatureFlags 分支 | 补充对照通过 |
| 真实鼠标选择、键盘选择、模态保存、窄屏 Save and close、关闭后的焦点 | React 与 Vue 均通过 |
| 外部 mousedown 关闭、非主按钮不关闭 | React 与 Vue 均通过 |
| Vue 未加载主题变量 | 表面、文字颜色和尺寸兜底有效 |

40 组对照中，面板位置和尺寸、标题、副标题、搜索区、页脚、消息区、列表行及按钮颜色的检查结果一致。宽屏默认单选面板为 241 × 207px，模态面板为 241 × 264px；窄屏全屏为 390 × 768px。这些是固定测试内容的测量值，组件仍随内容自适应。

`npm run test:run`：24 个文件、231 项测试通过。`npm run typecheck:test`、`npm run lint`、`npm run build` 均通过；保留原有 playground 格式提示及大分块提示。回归用例就近保存在 SelectPanel、FilteredActionList 和 Overlay 等组件目录。

浏览器矩阵在减少动画模式下测量稳定布局；动画另外按源 CSS 和 WAAPI 对照，并保留减少动画和强制颜色媒体查询。真实 iOS 软键盘未在 Chrome 中模拟为设备验收，其视口处理通过单元测试验证。此次视觉对照仅覆盖 SelectPanel 及其渲染依赖。

## 保留的 Vue 适配

继续使用命名 v-model、原生事件、具名插槽、Vue useId、SSR 所需的 DOM 防护和组件实例暴露；回调中的 React ref 对象转换为 Vue 元素回调。样式使用带组件前缀的普通 CSS，局部适配仍使用 scoped CSS。单选/多选类型关联、模态取消和独立锚点约束保持不变，不新增兼容开关。AnchoredOverlay 恢复源 data-component 标记。
