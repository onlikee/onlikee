# SelectPanel 迁移比对审计问题总清单

审计日期：2026-10-03。基准：Primer React `8c0b708fc43a`（本地仓库 `C:/Users/25336/Desktop/project/react`）vs `src/components/primer-vue/`。
方法：6 个方向的只读逐行比对（Overlay/定位链路、SelectPanel 主体、FilteredActionList 交互逻辑、FilteredActionList 渲染结构、CSS 全量、依赖与库补齐）+ 1 份迟到的 FilteredActionList 综合审计（其新增发现已并入 M27、L49–L58），外加主导代理对定位链路与两处存疑结论（H2 specificity、L27a 分组缩进）的独立实测复核。行号以审计时的工作区状态为准。
注意：FAL 综合审计期间工作区文件曾被外部进程更新过一次（早期读取与最终磁盘内容不同，如 select-all 文案等早期差异在当前版本已修复对齐）；全部结论以最终复核版本为准。若 `FilteredActionList.vue`/`TextInput.vue` 等再次变更，相关条目需重新核对。

## 〇、为什么对照脚本 61/61 通过，实际仍有可见差异

`scripts/select-panel-ui-parity.mjs` 的通过是真实的，但它的探测范围有四个盲区，本轮多数高危问题恰好落在盲区里：

1. **夹具页注入了统一字体**（`body{font:14px/1.5 -apple-system,...}`），掩盖了应用全局 `style.css` 与 BaseStyles 的字体栈/行高差异（→ M23）。
2. **验证页冻结全部动画**（`animation:none!important`），掩盖了骨架屏 shimmer 因 motion token 缺失而失效的问题（→ H1）。
3. **夹具页没有应用的全局样式**（`src/css/style.css` 的 `h1{margin:0.67em 0;font-weight:bold}` 等），掩盖了标题 h1 被全局规则命中的问题（→ H2）。
4. **矩阵只测固定场景与静止帧**：flag 关闭使 CSS anchor 分支缺口未被触发（→ H3）；无嵌套弹层、无 IME、无异步过滤滚动、无 tooltip+Escape 等交互场景；DOM 比较不对比 class 属性（分组 ul 缺 class 一项因此不可见，且其计算样式恰好被后代规则补偿 → 已降级为 L27a）。

结论：对照脚本适合做"静止帧回归"，本轮问题多来自**真实应用环境（全局样式、token 缺失）与交互过程（焦点、IME、滚动、tooltip/Escape）**，两者互补，脚本通过不代表应用内一致。

## 一、高危（用户可直接感知 / 功能性回归）

### H1. 骨架屏 shimmer 动画在本应用中完全失效
- Vue：`FilteredActionList/FilteredActionListBodyLoader.css:55` `animation-duration: var(--base-duration-1000, [ object Object])`
- React：`Skeleton/SkeletonBox.module.css:18-24`（构建产物即含破损兜底 `[object Object]`，但 React 环境由 primitives base motion token 提供 `--base-duration-1000:1000ms`）
- 根因：Vue 应用全局**未定义任何 `--base-duration-*`/`--base-easing-*` motion token**（grep 证实 0 处），非法兜底 → animation-duration 计算失败取 0s。
- 仲裁说明：一份 FAL 报告曾称此处"与 React 无 fallback 行为等效"——该结论**仅在两侧环境都缺 token 时成立**（对照夹具正是如此，两侧都 0s，所以像素差为 0）。真实 React 部署环境（github.com / Storybook）由 primitives base CSS 定义 `--base-duration-1000:1000ms`，shimmer 正常播放；Vue 真实应用缺 token → 不动。故本条成立。
- 影响：`loading` 出现在 body（body-skeleton）时骨架条静止不闪。SelectPanel 正常可见路径的直接回归。
- 修复：全局补 motion token（推荐，一并解决后续同类问题），或将该行兜底改为 `1000ms`（参照 `Spinner/Spinner.vue:107` 已有的干净兜底做法）。

### H2. SelectPanel 标题 h1 被应用全局样式命中（margin/字重与源不符）
- Vue：`SelectPanel/SelectPanel.vue:320-332`（裸 `<h1>`）、`SelectPanel/SelectPanel.css:35-38`（`.select-panel__title` 只有 font-size/margin-left）、`SelectPanel.vue:508` scoped `:where(.select-panel__title){margin:0;font-weight:var(--base-text-weight-semibold,600)}`、`src/css/style.css:21-25`（全局 `h1{font-size:2em;font-weight:bold;margin:0.67em 0}`，`main.ts:6` 全局引入）
- React：`SelectPanel/SelectPanel.tsx:918` 用 `Heading as="h1"`，`Heading/Heading.module.css:1-4` 提供 `margin:0; font-weight:600`
- **精确根因（specificity）**：Heading 基础样式其实已被移植进 scoped 块，但用的是 `:where(...)`（specificity 0,0,0，为对齐源 CSS Modules 的 `:where` 语义）；应用全局 `h1` 元素选择器是 (0,0,1) → **在真实应用中压过 `:where` 规则**。对照夹具没有全局 h1 规则，`:where` 能压过 UA 默认样式，所以脚本探测不到。font-size 不受影响（`.select-panel__title` 类选择器 (0,1,0) 压过 h1）。
- 影响：**每个 SelectPanel 实例**标题上下多 ~0.67em 外边距、字重 700（源 600），头部高度与层级明显不一致。当前应用里最直观的全局性视觉偏差。
- 修复（二选一，推荐前者）：① 收敛 `src/css/style.css` 的全局标题规则（它本身就偏离 BaseStyles，见 M23），改为不覆盖组件内 h1 或整体移除；② 把 `SelectPanel.vue:508` 的 `:where` 换成普通类选择器抬高 specificity（偏离源的 specificity 策略，需在文档记录）。

### ~~H3~~（已降级为 L27a）分组模式列表项缩进
初审报告称分组内层 `ul` 缺 `group-list` class 会多出 ~40px 默认缩进。**复核推翻视觉影响**：`FilteredActionList.css:39-44` 的后代规则 `.filtered-action-list__list ul{list-style:none;margin:0;padding:0}` 已把嵌套 ul 的 padding 清零，与 React `.GroupList{padding-inline-start:0}`（`Group.module.css:9-11`，仅此一条）计算结果一致；对照脚本 group 场景像素差 0 与此吻合。剩余问题是 DOM 层面无 class + `FilteredActionList.css:874` 死规则，见低危 L27a。

### H3.（条件性高危，原 H4）CSS anchor positioning 分支成体系缺口
仅当 `primer_react_css_anchor_positioning` flag 被启用时爆发；两侧默认 false 且应用代码无启用点 → 当前实际影响低，但按"严格对齐"目标属高危缺口：
1. 特性检测：Vue 仅 `CSS.supports('anchor-name:…')`（`Overlay.vue:30-31`）；React 要求 `anchorName`+`positionTryFallbacks`+`positionVisibility` 三属性齐备且无 `portalContainerName`（`AnchoredOverlay.tsx:188-200`）。
2. 双轴溢出 suggestedSide 翻转缺失（React `AnchoredOverlay.tsx:501-515`；Vue `Overlay.vue:109-116` 只算 data-css-align）。
3. 底部溢出抬升 `--anchored-overlay-top-override` 缺失（React `:355-363`）。
4. 窄视口偏移公式不同：React 仅在两侧都放不下时生成 left/right 两个 offset；Vue 恒写单一 `--primer-overlay-inline-offset`（只有 right 公式），align-left 分支无修正（`Overlay.vue:115,183`）。
5. React `.AnchoredOverlay{position:fixed!important;z-index:100}`；Vue 无 `!important` 且沿用基类 z-index（SelectPanel.css 已补偿，裸 Overlay 无）。
6. **Popover API 路径整体缺失**：`renderAs='popover'`、`popover='manual'`、`showPopover()`、popovertarget、top-layer（React `AnchoredOverlay.tsx:127,201-202,296-301,366-375`）。
7. anchor-name 管理：React 独立 effect 且**保留已有 anchor-name** 防闪烁（`:305-317,323`）；Vue 无条件覆盖并随依赖变化 cleanup→重设（`Overlay.vue:94-124`），存在 React 特意避免的 flicker。
8. 间距 token：React CSS 固定 `--base-size-4`；Vue 尊重 `anchorOffset` prop（更"对"但与源不一致）。
一致部分：position-try-fallbacks 三策略与六个 `@position-try` 块逐值一致（`Overlay.vue:102-107,187-192` ↔ `AnchoredOverlay.module.css:112-155`）。

## 二、中危

### A. 定位 / Overlay / AnchoredOverlay

- **M1 初始焦点时序缺陷**：Vue 的 focusTrap/首焦点与定位 watcher 同批 `flush:post` 执行，此时 DOM 仍带内联 `visibility:hidden` → behaviors 的可聚焦遍历对隐藏元素返回空、`focus()` 为 no-op → **焦点静默留在锚点**（`Overlay.vue:57-68`）。React 的 trap/focusZone 以 `disabled:!open||(!position&&!cssAnchor)` 等 position 就绪后才武装（`AnchoredOverlay.tsx:285-294`）+ layout effect 同步重渲保证可见。SelectPanel 靠自身 `watch([input,open])→nextTick→input.focus()`（`SelectPanel.vue:218-220`，复刻源怪癖）救回；其他 Overlay 消费方会中招。
- **M2 首焦点候选集合手写替代库 API**：Vue `querySelector('input:not(:disabled),button:not(:disabled),[tabindex="0"]')`，找不到时聚焦容器自身（`Overlay.vue:66-67,161`）；React 用 `@primer/behaviors/utils` 的 `iterateFocusableElements`（含 a[href]/select/textarea/contenteditable/tabindex=-1，跳过 disabled/hidden，从不聚焦容器）（`useOpenAndCloseFocus.ts:25`）。behaviors 已是现有依赖，可直接 import utils 子包。
- **M3 z-index/token 体系与源不一致**：Vue 基类 `z-index:var(--zIndex-overlay,10001)`（`Overlay.vue:170`）；React Overlay 无 z-index（靠 portal wrapper `z-index:1` + DOM 顺序），primitives 的 `--zIndex-overlay` 实为 **300** 且未 vendored。SelectPanel.css:2-7 已补偿（auto/100），裸 Overlay 消费者会得到源里不存在的 10001 层级，可能压过/被压过应用级元素。
- **M4 fullscreen 变体语义不同**：Vue 纯字符串 `variant="fullscreen"` 或 `{regular:'fullscreen'}` → **无条件全屏**（`AnchoredOverlay.vue:48`），且 `.primer-overlay--fullscreen` 无 media query 包裹、无 vh/vw 回退（`Overlay.vue:179`）；React 只认 `variant.narrow==='fullscreen'`（字符串入参永不全屏——源怪癖），CSS 全部包在 narrow 媒体查询内双保险（`Overlay.module.css:203-224`）。`{narrow:'fullscreen'}`（SelectPanel 用法）两侧一致。
- **M5 关闭按钮条件与默认值相反**：React 默认 `displayCloseButton=true` 且 `showXIcon = onClose && variant.narrow==='fullscreen' && displayCloseButton` 三条件 + 默认 `aria-label='Close'`（`AnchoredOverlay.tsx:180,400,455-471`）；Vue 默认 **false**、只看 `displayCloseButton`、无默认 aria-label（`AnchoredOverlay.vue:9-11,88-101`）。narrow 屏 + anchored（非 fullscreen）变体下 Vue 会显示 React 不显示的关闭按钮；未传 closeButtonProps 时渲染无名图标按钮（a11y）。SelectPanel 显式传值不受影响。
- **M6 overlay 级 focusZone 缺失**：React AnchoredOverlay 对 overlay 容器挂 behaviors focusZone（方向键/Home/End roving，position 未就绪时 disabled）（`AnchoredOverlay.tsx:285-289`）；Vue 完全没有（`useFocusZone.ts` 仅被 FilteredActionList 使用）。SelectPanel 不受影响（React 侧显式 `focusZoneSettings={disabled:true}`），其他 AnchoredOverlay 消费方（菜单类）失去 overlay 内方向键导航。
- **M7 非锚定 Overlay 的 top 兜底不同**：Vue 无 anchor/无 top 时强制内联 `top:0px;left:0px`（`Overlay.vue:40-41`）；React 仅 left 兜底 0，top 保持 `auto`（`Overlay.tsx:215` + `Overlay.module.css:38-43`）。把 Overlay 当静态浮层用时 Vue 钉死在 portal 根左上角。
- **M8 onPositionChange API 缺失（原"关闭时清空 position"系对源的误读，已核实更正）**：核实源——React **并不**在关闭时清空 position：`AnchoredOverlay.tsx:277-283` 的 `updateOverlayRef(null)` 只清 ref（供重开时重算），不触发 updatePosition；`:271` enabled 门控 + `:268-270` 注释明言关闭时跳过监听器以"避免清掉陈旧的 open-position 状态"；`useAnchoredPosition.ts:128-133` useLayoutEffect 守卫 `floatingElementRef.current instanceof Element` 在关闭 ref 变 null 时短路 → updatePosition 不被调用 → `:108-111` else 分支的 `setPosition(undefined)`+`onPositionChange(undefined)` 在关闭时不可达（仅 enabled=true 且 refs 未就绪的重算路径命中）。Vue `composables/useAnchoredPosition.ts:82`（enabled=false 早退）+ `:119`（watch 守卫）**与源一致**（同样保留陈旧 position，非偏差）。真实缺口仅是 Overlay/AnchoredOverlay 未暴露 onPositionChange API（已补，见 §6.1-M8）。
- **M9 多层弹层外点关闭语义**：React 全局 registry 逆序调用**所有** overlay 的 handler，点击空白一次可级联关闭多层（`useOnOutsideClick.tsx:20-29,47-67`）；Vue `overlayStack` 只允许栈顶响应（`Overlay.vue:70,76`）。Escape 两侧等效。嵌套/并列弹层场景行为不同。
- **M10 trap 重建风暴（潜伏）**：Vue focus/escape/outside 的 watchEffect 依赖 `props.initialFocusRef`（AnchoredOverlay 传入的是**解包后的元素** `focusTrapSettings?.initialFocusRef?.value`，`AnchoredOverlay.vue:82`），元素身份一变即整套拆卸重建，cleanup 会把焦点弹回锚点（`Overlay.vue:57-93`）；React effect 依赖稳定的 ref 对象身份，`.current` 变化不重跑，disableTrap 默认不恢复焦点。

### B. SelectPanel / Button / Tooltip

- **M11 `#anchor` 插槽是死代码，demo 文档失实**：`SelectPanel.vue:283` 使 renderAnchor 恒为函数或 null（永不 undefined）→ `AnchoredOverlay.vue:60-67` 的 slot 分支不可达；demo 页 `select-panel.vue:114` 却宣称"anchor 插槽可替换触发器"。用户按文档使用会被静默忽略。
- **M12 Tooltip 打开时按 Escape：React 只关 tooltip，Vue 关整个面板**：React `TooltipV2/Tooltip.tsx:188-198` 用 useOnEscapePress `stopImmediatePropagation()+preventDefault()`；Vue `SelectPanelButton.vue:35-45` 无任何 Escape 处理 → 焦点在带 tooltip 的关闭按钮上时一次 Escape 直接触发面板关闭手势（modal 还会触发 onCancel）。
- **M13 SelectPanelButton 缺失大量源 props/属性**：props 仅 12 个（`SelectPanelButton.vue:10-15`）；缺 `count`（CounterLabel）、`alignContent`（data-align 被硬编码 center）、`inactive`、`labelWrap`、`notificationIndicator`、`loadingAnnouncement`（硬编码 'Loading'）、`description`、`tooltipDirection`、`unsafeDisableTooltip`、`keyshortcuts/keybindingHint`、外层 Tooltip context 检测、hasActivePopup 抑制；uuid 不以用户 id 为种子；`as` 多态仅 button|a（React 任意元素）。`SecondaryActionButton/Link` 声称透传 ButtonProps 实际这些键全部无效。SelectPanelButton.css 已移植对应死规则（data-notification-indicator 等）永不命中。
- **M14 Tooltip 其余行为缺口**：`popover="manual"`（Vue `SelectPanelButton.vue:145`）vs React 运行时 `popover='auto'` → 缺原生 light-dismiss；方向映射仅 n/e/s/w 四向 vs React 8 向（`Tooltip.tsx:73-82`），而 `SelectPanelTooltip.css:64-86` 已移植 8 向箭头规则（ne/nw/se/sw 永不生效，翻转后箭头错位）；无 `onTouchEnd` 10ms 关闭（触屏 tooltip 滞留）；mouseover 冒泡 vs 捕获。打开延迟 50ms 一致。
- **M15 共享 `Button/Button.vue` 与 React ButtonBase 明显分叉**（子树外消费者受影响）：loading 用真实 `disabled`（源用 `aria-disabled` 保持可聚焦）、额外 `aria-busy`/`data-icon-button`、`data-block="true"`（源 `"block"`）、无 ConditionalWrapper/loading 读屏播报/`${uuid}-label` aria-labelledby 机制、无 icon/count props（`Button.vue:6-17` ↔ `ButtonBase.tsx:92-108,139,197`）。

### C. FilteredActionList

- **M16 items 更新后缺"滚动激活项回视口"effect**：React `FilteredActionList.tsx:380-387`（items 变化 → scrollIntoView(activeDescendant, 容器, {0/8})）；Vue 无对应（`FilteredActionList.vue:134-147` 仅在直接激活/前置元素时滚动）。异步过滤返回后激活项可能在视口外，Enter 激活看不见的项。**主导代理已实测仲裁**：两份 FAL 报告对此结论相反，经核对当前文件，React effect 确实存在（依赖 `[items, readInputRef, readScrollContainerRef, scrollBehavior]`）、Vue 确实缺失（scrollIntoView 仅在 onActive 内），本条成立。
- **M17 IME 组合输入过滤时机不同**：React TextInput onChange=原生 input 事件，组合期逐键过滤（`TextInput.tsx:187-189,235`）；Vue `internal/inputValue.ts:22-38` 组合期丢弃 input、compositionend 才提交 → 拼音打字过程中列表不更新。这是 Vue 移植层 TextInput 的**全局有意设计**，与源不一致；需要产品决策（对齐源 or 保留并记录）。
- **M18 li 泄漏非法 `variant` 属性 + data-variant 语义不同**：React 仅 `variant==='danger'` 输出 data-variant 并消费 variant prop（`Item.tsx:88,327`）；Vue 对任意值输出 data-variant 且 renderItem 解构未剔除 variant → li 上渲染非法 HTML 属性 `variant="default|danger"`（`FilteredActionList.vue:224-228,248`）。
- **M19 `actionListProps` 未剥离直接 v-bind 到 ul**：React List 剥离 `className/variant/selectionVariant/showDividers/role/as`（`List.tsx:19-29`）；Vue 直接 spread（`FilteredActionList.vue:323`）→ ul 泄漏 `selectionvariant`/`showdividers` 垃圾属性，`className` 以 DOM property 与 `:class` 竞争（当前顺序侥幸获胜，脆弱）。
- **M20 loading+inactiveText 组合的 spinner 分支不同**：listbox 场景 React 的 spinner 只由 loading 驱动 → 同时显示 spinner 和 inactive 警告（`Item.tsx:350-382`、`Visuals.tsx:62-70`）；Vue 用 `loading && !inactiveText` 门控 → 只显示警告（`FilteredActionList.vue:236,243-244`）。
- **M27 列表项 id 生成方案不同（波及所有派生 id）**：Vue 用 `${listId}-item-${item.id ?? index}`（`FilteredActionList.vue:187-192`）；React 用 `useId(id)`（item.id 原样或生成 `:rN:`，`Item.tsx:210-215`），派生 `--label/--inline-description/--block-description/--trailing-visual/--warning-message`。每个 li 及派生节点的 DOM id 值全部不同；ARIA 引用各自体系内自洽、可访问性不破坏，但任何按 `item.id` 做 `getElementById`、CSS 锚定或测试选择器的外部代码在 Vue 侧失效。重复 item.id → 重复 DOM id 的怪癖两侧一致保留。

### D. 主题 / 全局样式

- **M21 vendored 主题 token 漂移**：`src/css/themes/light.css:806-807,890-893`（及 auto 副本 1703-1704,1787-1790）`--shadow-floating-large/medium/xlarge` 的 1px 环色由透明 `#d1d9e000` 写成不透明 `#d1d9e0`、`--shadow-resting-small/xsmall` 值不同；`dark.css:166/869` `--controlTrack/Knob-bgColor-rest` 互换。对照 primitives 11.5.1。影响：大浮层/按钮静息阴影多出一圈实色描边。
- **M22 primitives base/motion/zIndex token 全局未引入**：`--base-size-*`/`--borderRadius-*`/`--zIndex-*`/`--base-duration-*` 均 0 处定义，全靠组件 fallback（尺寸类 fallback 与构建一致故无害；motion 已击穿 → H1；zIndex → M3）。建议整体 vendored primitives base+motion，一次性消除该类风险。
- **M23 全局 body 字体栈/行高与 BaseStyles 不等价**：`src/css/style.css:15-19`（Segoe UI/Tahoma/… 无行高）vs `BaseStyles.module.css:56-61`（`--fontStack-system` + `line-height:1.5`）。依赖继承的文本在真实应用中的字体/行距与 React 环境不同；对照夹具因两侧注入相同字体而探测不到。另 BaseStyles 的 `table{border-collapse}`、`color-scheme`、焦点重置（`:focus:not(:focus-visible)`）、`:where(a)` 链接默认样式均未移植（`style.css:7-13` 的全局 reset 反而超出源）。
- **M24 TextInputWrapper 错误态聚焦 specificity 翻转**（子树外）：Vue 焦点环 (0,4,0) 压过 `[data-validation='error']` (0,3,0)（`TextInputWrapper.vue:77-81,91`）；源全走 `:where` (0,1,0) 靠顺序让 error 获胜 → Vue 中错误输入框聚焦时边框变蓝（应红），且缺 error+focus 的 border-color 与 `[data-trailing-action][data-focused]` 分支。
- **M25 TextInputAction 自创 tooltip、丢源规则**（子树外）：`TextInputAction.vue:50-58` 简易 fixed 提示 vs 源 TooltipV2 popover 全套（入场动画/方向桥/forced-colors/max-width 250px）；缺 `.TextInputAction` margin/line-height、`[data-invisible]` 触摸命中区 44px、focusOutline。
- **M26 共享 `ActionList/` 组件是走样的第二套自创实现**（子树外）：active 指示条颜色 token 用错（`--bgColor-accent-emphasis` vs 源 `--borderColor-accent-emphasis`）、几何不同、硬编码 padding、选中态挂钩 `data-selected` 而非 `aria-checked/aria-selected`、自创 keyframes（`ActionList.vue:105-138`、`ActionListItemBase.vue:496-519`）。FilteredActionList 不使用它们，但作为"ActionList 的 Vue 版"属于多余+走样，未来消费者会踩坑。

## 三、低危（按域分组，简列）

### 定位/Overlay（L1–L10）
- L1 pinPosition 锁高实现差异：Vue 同步设 height 且 pin 命中时跳过 previousHeight 更新；React rAF 内设且总是 setPrevHeight（`useAnchoredPosition.ts:25-30` ↔ `hooks/useAnchoredPosition.ts:71-84,112`）→ 顶部翻转收缩场景锁高解除时机差一轮。
- L2 onPositionChange 源怪癖未复刻：React 仅 `prev.anchorSide===new.anchorSide` 时回调（翻转帧不回调）；Vue 无条件回调。
- L3 监听集合差异：Vue 为超集（visualViewport scroll/resize、anchor ResizeObserver、passive scroll）但缺 React 的 documentElement ResizeObserver；静态位置无差，动态触发时机不同。
- L4 modal 变体下 React 仍白算 JS 定位（怪癖），Vue 以 `top!==undefined` 直接禁用；首帧 visibility 时序差一拍，终态一致。
- L5 滑入动画 Vue 加了源没有的 `prefers-reduced-motion` 守卫并会 cancel（行为"更正确"但不严格对齐）。
- L6 data-* 命名体系不同：Vue `data-width="small"` vs React `data-width-small=""`（含 undefined 怪癖属性）、`data-side` 语义（请求值 vs 翻转后实际值）、缺 `data-anchor-position`/`data-reflow-container`/`data-responsive`；`preventOverflow` prop 未实现。
- L7 role 默认值：React `role='none'`，Vue 未传时无属性。
- L8 Portal：无命名容器/registerPortalRoot/PortalContext/onMount/根被移出后重建；初始 open=true 时内容晚一拍挂载（绘制前，通常不可见）。
- L9 renderAnchor 返回多根组件时 Vue `$el` 可能为注释节点 → getAnchoredPosition 抛错；默认锚 `<button>Open</button>` 为 Vue 自创（React 无默认锚）。
- L10 Escape 先 preventDefault 后 emit（React 顺序相反）；returnFocus 有 previousFocus 兜底（Vue 增强）；每 overlay 独立 document 监听 vs React 共享单监听。

### SelectPanel/Button/Tooltip（L11–L18）
- L11 loading+tooltip 并存时 `aria-labelledby` 丢 tooltipId（`SelectPanelButton.vue:28-29`）。
- L12 **【data-component 部分已撤销】** 原记录：svg 图标"多出" `data-component="Octicon"`（多处）。**撤销理由**：octicons-react v19.28.1 对**所有** React 侧图标 stamp `data-component="Octicon"`（`node_modules/octicons-react/dist/index.esm.mjs:108-110`），源 ButtonBase 直接渲染 `<Visual />`（`ButtonBase.tsx:165-167,218-220`）→ React 图标本就带该属性；vendored Vue 图标（`icons/*.vue`）不自动 stamp，需**调用点补 stamp** 才与源一致（Button.vue 本已带、SelectPanelButton.vue:225,256 已补）→ 故此为**必需而非偏差**，原 finding 方向写反。剩余子项：Notice 描述 div 缺字面类 `BannerDescription`（Banner 子树，本轮未复核，维持低危）。
- L13 Backdrop 被 Teleport 到 body（React 在组件原位渲染兄弟 div）；视觉等价，DOM 位置不同。
- L14 `as='a'` 时丢弃用户传入的 type。
- L15 children 真值判断：Vue 过滤纯空白/注释节点，React 任何 truthy children 都渲染 text span → loading+空白 children 时 aria-labelledby 悬空引用（边缘）。
- L16 内部 uuid 不以用户 id 为种子（测试/快照对齐差异）。
- L17 AnchoredOverlay 细节：closeButtonProps spread 顺序相反（Vue 用户可覆盖固定属性）、无 aria-label 'Close' 兜底、anchor/overlay 强设 id、data-component 覆盖顺序相反。
- L18 ActionList 级 flag（`action_list_item_gap`、group heading trailingAction）未在 Vue 接线（默认全 false 时行为一致，开启无效）；`onFilterChange` 未传时 Vue 静默无操作（React 抛错）；React `needsNoItemsAnnouncement` 残留状态未移植（合理省略）。

### FilteredActionList（L19–L30）
- L19 useScrollFlash 未移植（打开列表不再闪现滚动条提示）。
- L20 React ActionList 层第二个 roving focus zone 未复刻：点击项后 React 会把该项置回 tabindex=0（进 Tab 序又被弹回输入框的 quirk），Vue 恒 -1；焦点异常落 ul 内时 React 有 Home/End/PageUp/Down。
- L21 focused/data-input-focused 生命周期不同（blur 清除 vs focusin 监听 + loading 结束重同步）→ 仅 roving 模式高亮残留时机差异。
- L22 roving zone 参数差异：Vue 尊重 setInitialFocus/focusPrependedElements，React roving 恒 'previous'/false。
- L23 focus zone 重建条件：Vue 任一设置变化即重建（激活项重置回首项）；React deps 固定（配置滞留）。
- L24 live-region 动态 import → 首次播报可能滞后一拍（SSR 安全的有意权衡）。
- L25 AriaStatus 三处微差（额外监听 aria-label、hidden 主动 cancel、import resolve 前写 previousText）——FAL 不经 AriaStatus，仅影响其他消费者。
- L26 BodyLoader 首帧守卫缺失：Vue 立即渲染（skeleton 首帧按 height=0 出 3 行再修正）；React 要求 scrollContainer ref 已挂载，首帧退回列表/message。补充（源自总审计）：React 在 **roving 模式（flag off）下无重渲染触发，loading spinner 可能一直不出现**（源缺陷）；callback 形式 scrollContainerRef + flag off 时 React 的 `readScrollContainerRef.current` 恒 undefined（loader 与虚拟化均失效）。Vue 用内部 shallowRef"修好"了这两处源缺陷——用户可见结果改善，但违背"严格对齐含怪癖"声明，需记录为有意偏离。
- L27 属性细节：`data-dividers=false` 省略（React 输出 "false"）；li 缺 `data-active` 支持（CSS 留有死引用）；loading-spinner 的 trailing 容器缺 id；`aria-selected` 无条件输出（React 仅 selectable role）；分组项 index 语义（全局 vs 组内，落点等价）；TextInput `color="fg.default"` 未传（React 泄漏噪声属性）；FullScreenTextInput 类位置改为 header 修饰类（视觉等价，原类成死代码）；Skeleton Stack 默认 data-* 不全（效果等价）；滚动容器多加 data-component；全选区 `showSelectAll` 新增 prop + 显式 aria-checked 冗余。
- L27a 分组内层 ul 缺 `filtered-action-list__group-list` class（`FilteredActionList.vue:257` ↔ React `Group.tsx:120`）：计算样式已被 `.filtered-action-list__list ul` 后代规则补偿（padding 均为 0），**无视觉影响**；但 DOM 与 React 差一个 class，且 `FilteredActionList.css:874` 成死规则。建议补 class 保持 DOM 严格一致。
- L28 renderVisual 与 `isValidElementType` 不完全等价：字符串标签名（'svg'）React 实例化为元素，Vue 渲染成文本；FAL 内联版本与 internal/RenderVisual.ts 重复未复用。
- L29 data-mixed-descriptions 计算来源：React 渲染后 DOM 查询（只见虚拟化窗口内项），Vue 从 props.items 全量计算 → 虚拟化瞬时差异，稳态一致。
- L30 滚动重渲同步性：React flushSync vs Vue triggerRef 异步批处理（框架固有）。
- L49 Group 结构 4 处细节（`FilteredActionList.vue:255-257` ↔ `Group.tsx:95-126,196-214`）：a) Vue group li 尊重 `group.className`，React FAL 忽略它；b) 标题 span id——React FAL 场景无 id，Vue 恒有 `${listId}-group-${groupId}`；c) title 为非字符串节点时 React 的 ul aria-label 渲染 `"[object Object]"`（源怪癖），Vue 回退 `Group ${groupId}`；d) group li 的 key 语义（index vs groupId，仅内部 patch）。字符串 title 场景两侧完全一致。
- L50 'Loading' 隐藏文本判定：React `loading === true && !inactive`，Vue truthy 判定（传 `loading={1}` 时行为不同）。
- L51 `merged_forwarded_refs` flag ON 路径分歧：React flag ON 时 readRef 切内部 ref + merged 转发，且 `List.tsx:53,62-68` 的第二个 focus zone 在 AD 模式被激活（绑 mousemove → 悬停把真实焦点移入 li，与 AD zone 冲突，源潜在 bug）；Vue flag 仅影响 mixedDescriptions 门控，refs/zone 恒为"merged"行为。默认 off 两侧一致。
- L52 callback 形式 `inputRef` + flag off 的源失效怪癖未复刻：React 下 AD zone 不创建、播报拿不到 input、focusin 判定失效（`useProvidedRefOrCreate` 对 callback ref 原样返回）；Vue 内部 shallowRef 恒可用。属越型用法的源缺陷，Vue"更可用"。
- L53 单选 CheckIcon 的 svg 缺 `octicon octicon-check` class 与 octicons-react 的内联样式（display:inline-block/overflow:visible/vertical-align:text-bottom），Vue 靠 `SelectPanel.css:8-13` 补偿；可见性切换 CSS 两侧等价，但依赖 `.octicon` 全局类的外部样式在 Vue 侧不生效，且补偿不全时有 1-2px 基线偏移风险。
- L54 Selection 的开发期 warning（selected 但无 selectionVariant）未移植。
- L55 `renderItem` 逃生舱差异：React 的 mapped props 含 `data-id`、虚拟化时含 `ref`(measureElement)+`key`；Vue 均缺 → renderItem+virtualized 组合下自定义项高度固定按 32px 估算、无稳定 key。item 级 renderItem 被 list 级覆盖（含 undefined 覆盖）的怪癖两侧一致。
- L56 ul 上 restProps/actionListProps 覆盖优先级相反：React `{...restProps}` 最后（消费者可覆盖 data-component 等默认值）；Vue 显式绑定恒胜。常规用法一致。
- L57 类型/API 面：**ItemInput 不支持函数形式** `(props)=>ReactElement`（React 支持；Vue 会当普通对象渲染出空项，静默破坏）；`onInputRefChanged` 传 element 而非 RefObject（有意适配，类型已明示）；`renderGroup`/`group.renderItem` 声明未实现（React 同样不使用，等效）；Vue 增强 size/loading/inactiveText/key/showSelectAll/update:filterValue。
- L58 TextInput `icon` prop 包装结构：Vue 用 span.TextInput-icon 包裹，React 直接渲染 `<IconComponent className="TextInput-icon">`（仅 textInputProps.icon 场景，FAL 自身不传）。

### CSS / 主题（L31–L42）
- L31 移植 CSS 系统性丢失颜色兜底值（React 构建为所有颜色注入 light.json 兜底；Vue 五个 CSS 文件约百余处无兜底）——本应用主题 token 齐全故无害，**组件脱离本应用主题即全面失效**；"保留兜底值"仅对尺寸类成立。
- L32 手写 scoped 兜底值漂移（旧版主题色）：`TextInputWrapper.vue:69,76,84,86,106`（#d0d7de/#656d76/#8c959f 应为 #d1d9e0/#59636e/#818b98）；`Overlay.vue:170` shadow-floating-small 兜底缺中间层；与 `SelectPanelMessage.vue:43-46` 的正确新值并存，两套手写兜底互不一致。
- L33 Spinner 干净兜底（1s/linear）vs BodyLoader 忠实破损兜底（[object Object]）——生成策略不统一（后者即 H1 根因；前者反而"不忠实但正确"）。
- L34 TextInput 共享组件自创 padding/显示补丁链（`TextInputWrapper.vue:107-112`），子树内被 `FilteredActionListInput.vue:52-54` 再修补回源计算值（有效但脆弱）；子树外保留 5px 纵向 padding 等偏离。
- L35 TextInputWrapper 遗漏源规则（子树外）：small/large size padding、large 的 height→min-height、嵌套 leading/trailing 12px、textarea padding、base outline:none；`[data-variant='small']` 源无效声明被"修复"、large 的 font-size 丢失。
- L36 `.TextInput-wrapper` background-repeat/position 规则被挪到 FAL Input 的 :deep（子树外丢失）。
- L37 自创 sr-only 配方（clip:rect vs 源 clip-path:inset(50%)+守卫），视觉等效。
- L38 重复规则：select-all-checkbox margin 两处定义（px 与 rem 兜底并存）；SelectPanelMessage scoped 层与全局 SelectPanel.css 重复且用 px 兜底/margin-block-start；svg[data-octicon] 规则三处重复且 scoped 版缺 overflow:visible（全局补齐）。
- L39 **【已撤销】** 原记录：`data-justify="start"` 多加（源 Stack 无 justify，flex-start vs normal）。**撤销理由**：源 Stack `justify` prop 默认 `'start'`（Stack.tsx:91）且经 `getResponsiveAttributes('justify', justify)` 恒渲染 data-justify（Stack.tsx:111；Stack.test.tsx:141-143 "should set the default justify to `start`"）→ 源 FAL skeleton 行 Stack（FilteredActionListLoaders.tsx:46，无 justify prop）本就渲染 `data-justify="start"` → 计算值 `justify-content: flex-start`（Stack.module.css:110）。Vue `FilteredActionListBodyLoader.vue:45` 的 `data-justify="start"` **与源一致，非多加**；原 finding "源 Stack 无 justify / flex-start vs normal" 系错误前提（源同样是 flex-start）。
- L40 死选择器 `a.filtered-action-list__focus-visible`（Vue useFocusZone 从不加该类）。
- L41 Checkbox 自创 reduced-motion 取消块（源无此规则；FAL 用 !important 还原源行为但依赖样式注入顺序，脆弱；子树外 Checkbox 行为被改变）。ValidationAnimationContainer 把源 `(prefers-reduced-motion)` 恒匹配 bug"修复"为 `reduce`（违反保留源 bug 承诺，子树外）。
- L42 断点单位双轨：全局移植 CSS 用 `calc(48rem - 0.02px)`，scoped 用 `calc(768px - 0.02px)`——根字号≠16px 时同一 narrow 断点在两组文件于不同宽度触发。Overlay specificity 抬升（`[data-width='small']` (0,3,0) vs 源 `:where` (0,1,0)）；fullscreen 机制改 JS 类 + `100dvw!important`（结果等价，见 SelectPanel 报告 I2）。

### 依赖/基础设施（L43–L48）
- L43 octicons-vue3 仅 16px 画稿（size=24 为放大，笔画偏细；子树全 16px 无实际影响）；IconProps 不兼容靠 scoped CSS 补偿。
- L44 octicons-vue3 缺 14 个上游图标（均不被子树使用）且无版本溯源标注（实测与 19.28.1 一致）。
- L45 @primer/behaviors 精确 pin 1.10.3（React ^1.10.3；当前字节级一致，上游 patch 不自动跟进）。
- L46 暗色主题无运行时激活：index.html 静态 light，src 无任何设置 `data-color-mode="dark"` 的代码 → dark.css 加载但永不生效。
- L47 无 popover polyfill（Safari<17 tooltip 静默不显示；React 子树同样未用，基本对等）。
- L48 clsx/mini-throttle/react-is 手写替代（子树用法等价；未复刻 clsx 条件对象语法与 mini-throttle leading-edge，移植其他组件时注意）。

## 四、修复优先级建议

**第一批（用户可直接感知，修复成本低）**
1. H2 标题 h1 —— 收敛全局 `style.css` 的 h1 规则，或抬高 `:where(.select-panel__title)` 的 specificity。
2. H1 骨架屏动画 —— 全局补 motion token（顺带为 M22 打基础）。
3. M12 Escape 关 tooltip —— SelectPanelButton 补 Escape 拦截。
4. M21 主题 token 漂移 —— 按 primitives 11.5.1 修正 vendored 值。
5. M16 items 变化滚动激活项 —— 补一个 watch。
6. M11 #anchor 死插槽 —— 修 renderAnchor 判断或改文档。
7. L27a 分组 ul 补 class（一行，顺手修）。

**第二批（正确性/健壮性）**
8. M22 primitives base/zIndex token 整体 vendored（连带复核 M3 z-index 策略）。
9. M1/M2/M10 Overlay 焦点三件套：等 position 就绪再武装 trap、改用 behaviors `iterateFocusableElements`、watchEffect 依赖改传 ref 而非解包元素。
10. M18/M19 FAL 属性泄漏两处（剔除 variant、剥离 actionListProps）。
11. M4/M5 fullscreen 语义与关闭按钮三条件对齐。
12. M23 全局字体栈/行高对齐 BaseStyles（同时更新对照夹具，让脚本今后能探测到）。

**第三批（决策/长尾）**
13. M17 IME 过滤时机 —— 产品决策：对齐源（组合期逐键过滤）或保留 Vue 设计并在文档记录。
14. H3 CSS anchor 分支补齐（仅当计划启用该 flag 时）。
15. M13/M14/M15 Button/Tooltip API 面补齐（按消费需求排期）。
16. M6/M7/M8/M9/M20 及低危清单按需跟进。

## 五、已确认一致的部分（给结论以置信度）

- **定位核心同源**：两侧都真实调用 `@primer/behaviors@1.10.3` 的 `getAnchoredPosition`（dist 文件 SHA256 逐字节一致）；Portal 几何（根容器 absolute/top0/left0/width100% → wrapper relative z-index:1 → 弹层 absolute 文档坐标）一致；默认配置下锚定弹层静止位置理论逐像素一致，与对照脚本 61/61 通过互相印证。
- **依赖补齐质量高**：behaviors/live-region-element/tanstack-virtual 三库同名同版且真正被调用；图标 path 抽查逐字一致；FeatureFlags 8 个 flag 同名同默认；vitest 的 live-region 浏览器构建映射正确。
- **SelectPanel 状态机与怪癖**：选择状态（单选引用相等/多选 Set/toggle/undefined 保持）、Save/Cancel 手势映射、排序快照、过滤加载状态机（1000ms 计时、播报时序、清空 live-region）、footer 分支矩阵、preventBubbling、visualViewport 键盘适配、overlayProps 合并怪癖、FAL 透传覆盖顺序、FormControl autoLabel 接线——逐项对齐，19 条 parity 测试佐证。
- **FAL 主体**：虚拟列表配置（estimateSize 32/overscan 10/measureElement/getItemKey）、播报四段文案逐字一致、全选逻辑、键盘事件映射、项内层级（Spacer→Selection→LeadingVisual→DividerContainer→Label/Description→Trailing→Inactive）一致。
- **CSS 移植保真**：五个移植 CSS 对 React 构建产物（postcss-preset-primer 展开后）高保真，含构建工件、forced-colors、reduced-motion、keyframes；Banner/Tooltip/ButtonBase(727 行)/ActionList(814 行)/Stack/Skeleton/Checkbox/Spinner/VisuallyHidden 全量核对通过。

## 六、修复状态（2026-10-04 修复轮）

本轮按"全部高危+中危（除缓期项）+ 指定低危"执行修复；文中行号以审计时状态为准，修复后相关文件行号已漂移。每批次修复后均通过：`vitest run src/components/primer-vue` 285/285、`select-panel-ui-parity.mjs` 61/61、eslint 0 错 0 警、`vue-tsc --noEmit`（primer-vue 范围 0 错）。

### 6.1 已修复

**高危**
- ✅ H1 骨架屏 shimmer：vendored `themes/base-motion.css`（`--base-duration-*`/`--base-easing-*`），BodyLoader 动画恢复；与 M22 同批。
- ✅ H2 标题 h1：采用方案②——`SelectPanel.vue` 的标题规则由 `:where(.select-panel__title)` 改为普通类选择器 `.select-panel__title{margin-block:0;font-weight:600}`，specificity (0,1,0) 压过应用全局 `h1{(0,0,1)}`；偏离源 specificity 策略一事已入偏差登记册（§6.3-13）。

**中危**
- ✅ M1 Overlay 焦点武装时序：trap/focusZone 等 position 就绪（或 cssAnchor）后才武装，对齐 React `disabled:!open||(!position&&!cssAnchor)`。
- ✅ M2 首焦点候选：改用 `@primer/behaviors` 的 `iterateFocusableElements`，不再聚焦容器自身。
- ✅ M3 z-index：`SelectPanel.css:2-7` 以 `.primer-overlay.select-panel__overlay[data-component]{z-index:auto}` + `[data-css-anchor]{z-index:100}` 补偿；Overlay 基类保留 `var(--zIndex-overlay,10001)`（zIndex token 未 vendored，见偏差登记册 §6.3-12）。
- ✅ M4 fullscreen：只认 `variant.narrow==='fullscreen'`（字符串入参永不全屏的源怪癖已复刻），CSS 包回 narrow 媒体查询。
- ✅ M5 关闭按钮：`displayCloseButton` 默认 true + `onClose && narrow fullscreen && displayCloseButton` 三条件 + 默认 `aria-label='Close'`。
- ✅ M6 overlay 级 focusZone 已补（behaviors focusZone，position 未就绪时 disabled）。
- ✅ M7 非锚定 Overlay：仅 left 兜底 0，top 保持 auto。
- ✅ M8 Overlay/AnchoredOverlay 暴露 onPositionChange API（`Overlay.vue:43,211` + composable `:95,101`）。**更正**：关闭时 position 的保留行为本就与源一致——Vue `composables/useAnchoredPosition.ts:82`（enabled=false 早退）+ `:119`（watch 守卫）不清空，React 同样不清空（详见 M8 finding 核实）；原文"关闭时 position 清空 + onPositionChange(undefined) 回调"系基于 finding 误读，实际修复仅为补齐 API 暴露，未改变（也无需改变）关闭时的 position 保留语义。
- ✅ M9 外点关闭改全局 registry 逆序级联（对齐 React useOnOutsideClick 语义，嵌套弹层一次点击可级联关闭）。
- ✅ M10 trap watchEffect 依赖改传 ref 对象（不解包元素），消除重建风暴。
- ✅ M11 `#anchor` 死插槽：renderAnchor 判断修正，插槽路径可达；demo 文档同步更正。
- ✅ M12 Escape 拦截：SelectPanelButton 接入 `useTooltipController` 的 registerEscapeHandler（tooltip 打开时 stopImmediatePropagation+preventDefault，只关 tooltip 不关面板），对齐 React documentRegistries 逆序 + defaultPrevented 短路机制。
- ✅ M13 SelectPanelButton 全量重写（ButtonBase+IconButton 融合）：count/CounterLabel、alignContent、inactive、labelWrap、notificationIndicator、loadingAnnouncement、description、tooltipDirection、unsafeDisableTooltip、keyshortcuts/keybindingHint、外层 Tooltip context 抑制、hasActivePopup 抑制、uuid 以用户 id 为种子（`${id}-label`/`${id}-loading-announcement`）、ConditionalWrapper、loading 读屏播报（公共 VisuallyHidden + AriaStatus）、多态 `as` 任意元素。
- ✅ M14 Tooltip 行为补齐：新组件 `TooltipV2/`（Tooltip + TooltipElement + useTooltipController）——运行时 `popover='auto'` + `@oddbird/popover-polyfill` apply（连带修复 L47）、8 向 directionToPosition/positionToDirection、onTouchEnd 10ms 延迟关闭、mouseover 捕获阶段、delay short/medium/long（50/400/1200ms）、:focus-visible 门控、label/description 两型 aria 接线、KeybindingHint 容器（' or ' 分隔 + condensed/onEmphasis/small）。
- ✅ M16 items 变化后 scrollIntoView(activeDescendant) effect 已补（依赖对齐 React）。
- ✅ M18 li 不再泄漏 `variant` 属性；仅 danger 输出 data-variant。
- ✅ M19 actionListProps 剥离 className/variant/selectionVariant/showDividers/role/as 后再绑定 ul。
- ✅ M20 listbox spinner 只由 loading 驱动（spinner 与 inactive 警告可同显，对齐源）。
- ✅ M21 vendored 主题 token 按 primitives 11.5.1 修正（`--shadow-floating-*` 透明环色、`--shadow-resting-*`、dark `--controlTrack/Knob-bgColor-rest`），经 `scripts/compare-theme-tokens.mjs` 验证。
- ✅ M22 vendored `themes/base-size.css`、`base-motion.css`、`border.css`、`radius.css`、`typography.css`、`size*.css` + `base-styles.css`（zIndex 除外，见 §6.3-12）。
- ✅ M23 全局 body 字体栈/行高由 `base-styles.css`（BaseStyles 等价物）统一提供；style.css 旧 Segoe UI/Tahoma 栈已移除。
- ✅ M24 TextInputWrapper：状态选择器全部改 `:where()` 包裹（与源同 specificity 策略，error 靠源码顺序获胜），补 error+focus 分支（`--control-borderColor-danger` 边框+outline）与 `[data-trailing-action][data-focused]` 分支。
- ✅ M25 TextInputAction 重写：icon-only+aria-label → SelectPanelButton（IconButton 形态，自带 label 型 TooltipV2）；否则 → 共享 Button，带 aria-label 时包 ConditionalTooltip（TooltipV2 description 型）；补齐 `.TextInputAction` margin/line-height:0、`.Invisible` padding/hover/focus/IconButton 尺寸/`(pointer:coarse)` 44px 触摸命中区；旧自创 fixed tooltip 删除。

**低危（本轮修复）**
- ✅ L2 onPositionChange 仅 `prev.anchorSide===new.anchorSide` 时回调（源怪癖复刻）。
- ✅ L3 监听集合对齐（补 documentElement ResizeObserver；移除超出源的 visualViewport 监听）。
- ✅ L4 modal 变体下保留 JS 定位白算（源怪癖），visibility 时序对齐。
- ✅ L5 滑入动画移除自加的 reduced-motion 守卫（源无）。
- ✅ L7 role 默认 `'none'`。
- ✅ L11 loading+label 型 tooltip 的 `aria-labelledby` 组合为 `${uuid}-label ${tooltipId}`。
- ✅ L13 Backdrop 改组件原位渲染兄弟节点（不再 Teleport 到 body）。
- ✅ L14 `as='a'` 时保留用户传入 type（React `{...rest}` 语义）。
- ✅ L15 children 真值判断对齐（空白字符串算内容；Vue 编译器会合并纯空白节点，见 §6.3-11）。
- ✅ L16 内部 uuid 以用户 id 为种子。
- ✅ L17 AnchoredOverlay：closeButtonProps spread 顺序、`aria-label='Close'` 兜底、id 不强设、data-component 覆盖顺序对齐。
- ✅ L22 roving zone 恒 'previous'/false（源怪癖复刻）。
- ✅ L26 BodyLoader 首帧守卫（scrollContainer ref 已挂载才渲染 loader）；roving 模式源缺陷保留问题见 §6.3-6。
- ✅ L27a 分组内层 ul 补 `filtered-action-list__group-list` class（`FilteredActionList.css` 死规则复活）。
- ✅ L32 手写兜底值对齐 primitives 11.5.1：TextInputWrapper（#d1d9e0/#59636e/#818b98/#818b981a/#1f883d）、Overlay shadow-floating-small 补中间层。
- ✅ L41 Checkbox 自创 reduced-motion 取消块删除 + FAL.css 的 !important 反制块删除（子树内外一致回归源行为）；ValidationAnimationContainer 还原源 `@media (prefers-reduced-motion)` 恒匹配 bug（动画恒禁用）。
- ✅ L47 popover polyfill：`@oddbird/popover-polyfill@^0.5.2` 已接入（TooltipV2 挂载时 `!isSupported() && apply()`）。
- ✅ L49 Group 结构：a) FAL 忽略 group.className（源怪癖）；c) title 非字符串时 ul aria-label 复刻 `[object Object]` 源怪癖；b/d 见 §6.3-7。
- ✅ L50 'Loading' 隐藏文本判定改 `loading === true && !inactive` 严格相等。
- ✅ L54 Selection 开发期 warning（selected 无 selectionVariant）已移植。

**低危（2026-10-04 TextInput 链严格对齐轮修复）**
- ✅ L34 TextInputWrapper 自创 padding/显示补丁链删除：input/select padding 链、`.TextInput-icon` 强制 inline-flex 等全部按源 module CSS 移植；`FilteredActionListInput.vue` 的子树内再修补（icon display、background-position、input flex/padding/line-height、`.text-input-hidden` clip）随之全部移除。子树外 TextInput 消费方（Autocomplete、应用页面）回归源计算值。
- ✅ L35 TextInputWrapper 源规则补齐：small/large size 的 padding 与 `--inner-action-size`、large 用固定 `height`、`[data-size='large']` 嵌套 leading/trailing 12px、base `> textarea` padding 12px、base `outline: none`；`[data-variant='small']` 还原源无效 `font-size` 声明（缺 `var()`，解析期丢弃、字号保持 14px）；variant-large 的 `font-size: var(--text-title-size-medium)` 补回；`@media screen and (--viewportRange-regular)` 展开为 `min-width: 48rem` 补入。UnstyledTextInput/InternalVisuallyHidden 按源移植（`.text-input-native` 去除 flex/min-width/line-height/常置 outline；`.text-input-hidden` 用源的 clip:rect 配方）。
- ✅ L36 `.TextInput-wrapper` 的 `background-repeat: no-repeat; background-position: right 8px center` 回到共享 wrapper（FAL 的 :deep 副本删除）。
- ✅ L37 源 clip:rect 配方回归：TextInput `.text-input-hidden`、Token 与 TextInputWithTokens 的 `.sr-only` 改为源 `_VisuallyHidden` InternalVisuallyHidden 完整规则（padding 0、margin -1px、clip rect(0,0,0,0)、border-width 0）。公共 `VisuallyHidden/` 双实现现状不变（§6.3-19）。
- 同轮附带：Token/TokenBase/RemoveTokenButton/TokenTextContainer 按源 module CSS 对齐（`--borderRadius-full` 用 primitives fallback 624.9375rem；Radio 保留源自带的 100vh 显式兜底）、移除按钮 transform 改内联样式、leading visual 容器还原 div + `line-height: 0`、X 图标内联 octicons-react 原生 12/16px 变体；InputValidation 内联无单位 `--inputValidation-iconSize: 16` 与 `--inputValidation-lineHeight`、图标还原原生 12px octicons-react 输出。验收：`form-control-ui-parity.mjs` 18/18、`select-panel-ui-parity.mjs` 61/61。
- ✅ 全面复核追加（同日，disabled 路径与结构保真）：a) Token 根节点按 React BOOLEAN 属性行为对任意标签渲染 `disabled=""`，删除自加的 `aria-disabled`；b) Token keydown Backspace/Delete 与移除按钮点击删除 disabled 守卫（源无守卫，disabled 仍可移除为源怪癖）；c) 移除按钮不再接收 disabled（源 _RemoveTokenButton 无此 prop）；d) 文本容器不再自加 `type="button"`（源 _TokenTextContainer 不设 type，保留隐式 submit 语义）；e) TIWT `remove()` 删除 disabled 早退守卫、token `tabindex` 恢复源的无条件 0（disabled 时 token 仍可聚焦）；f) FAL 全屏字号类从 header div 的 `:deep(input)` 迁至 TextInput 根 className（源 .FullScreenTextInput 挂 wrapper），并补传源的 `color="fg.default"`（经 inputProps 落在 input 元素）；g) TIWT overflow 计数删除自加 `data-size`，改源的按 size 映射四类；h) TextInputWrapper `::placeholder` 规则补源有的 `select` 选择器（死规则，保真）。新增 `Token/Token.test.ts` 7 项固化上述源行为；改写 TIWT disabled 用例为源怪癖断言。

**审计对齐轮（2026-10-04，4 subagent 批次 + lead 集成；全绿：Select+KBH 21、Button/Tooltip 8、SelectPanel 67 + parity 61/61、Autocomplete 27、FormControl parity 18/18、typecheck 0 错）**

- ✅ **Select/KeybindingHint 批次**：Select/Select.vue CSS 全量重写按 Select.module.css（1px margins、font-size:inherit、color:currentColor、background-color:inherit、border-radius:inherit、outline:none、:disabled 透明背景、forced-colors `-moz-combobox` + 引号 `'FieldText'`/`'GrayText'` 怪癖、死 `.select-disabled svg` 规则、`select-disabled` class 绑定 per Select.tsx:65）；箭头 svg 仅 xmlns 无 viewBox（Select.tsx:18-26 逐字节一致；Select.test.ts:12 注释仍误引已删 viewBox = L60 表面债，按范围未动）；width/minWidth/maxWidth 作原生 attr 落 `<select>`（Select.tsx:37-60，React DOM 直通未知 attr）；`padding-right:32px!important`/`padding-block:5px` 保留并 pin（Select.tsx:52-53 注释"match expected visual snapshot values"）；Chord.vue 补 `:data-kbd-chord="true"`（Chord.tsx:106）；KeybindingHint.vue inheritAttrs:false（源 KeybindingHint.tsx:64-73 丢弃 rest）；Chord.css:19 `#ffffff00`；新增 `usePlatformRef(): ComputedRef`（一次性检测 + computed override??detected，KeybindingHint.tsx:12-15,27-40），`usePlatform()` 保留供 TooltipElement。
- ✅ **Button 批次**：`:type="type"` 恒渲染（Button.tsx:8 anchors 也传 type，原生忽略）；loading 点击抑制（preventDefault+stopImmediatePropagation，ButtonBase.tsx:127-133）；`font-family:inherit`（ButtonBase.module.css:8）；hasContent 改 `nodes.some(n=>n.type!==Comment)`（ButtonBase.tsx:155，纯注释=无内容）；trailingAction 从 content-row 内移至根兄弟 + `data-component="trailingAction"` + loading 且无 leading/trailingVisual 时 spinner 替换 trailingAction（ButtonBase.tsx:181-191）；label 隐藏规则范围 `.button__content:has(>.button__spinner)`（ButtonBase.module.css:276-291）；Tooltip.css `.\:popover-open` 单反斜杠；TooltipElement attr 顺序对齐 Tooltip.tsx:374-388（2 条 vue/attributes-order 为保源顺序而容忍）。
- ✅ **SelectPanel 批次**：Header `data-variant` 补 fullscreen 值（SelectPanel.tsx:1021）；Backdrop Teleport 移除→原位兄弟 div（见 §6.1-L13）；SecondaryActionLink `as` 默认 'a' 且 attrs spread 后解析（SelectPanel.tsx:1074-1080 → LinkButton.tsx:8）；SelectPanelButton `'aria-disabled'` 移至 `...passthrough` 之前（ButtonBase.tsx:101-104，consumer 可覆盖）+ leadingVisual/trailingVisual stamp `data-component="Octicon"`（配合 L12 撤销）；SelectPanelButton.css 删 10× 死 `:not(.select-panel-button__does-not-exist)`（源无此特异度提升片段）；SelectPanel.test radio `aria-hidden` 钉更正（源 Radio.tsx 把 aria-hidden 解构出 rest、仅用于 name 警告门控、从不渲染到 DOM；Selection.tsx:35）。
- ✅ **Autocomplete 批次**（focus-zone.mjs 全量移植）：H-1 suggestion effect 精确 deps/条件（AutocompleteMenu.tsx:317-326）；M-2 shouldIgnoreFocusHandling/getDirection verbatim（focus-zone.mjs:52-126，Home/End 不再移动高亮、Ctrl+Arrow 跳首尾）；M-3 Escape 仅清非空 input（AutocompleteInput.tsx:104-110）；M-4/M-5 高亮 residue + disabled 项可高亮（focus-zone.mjs:255-273、AutocompleteMenu.tsx:292-294）；M-6 zone 生命周期门控；M-7 删自造 max-height:300px；M-9 删 aria-multiselectable + data-dividers="false"/data-variant="inset"（List.tsx:109-127）；M-10 li attrs 镜像 Item.tsx（tabindex/data-has-description/data-size/rest 直通）；M-11 删非源 description slot；M-12 useAnchoredPosition + computedAnchorRef 时序 glue（登记）。27/27 绿（+1 新 pin）。其报告的 7 个 ActionList 侧缺口缓期给 lead（见下 ActionList 轮）。
- ✅ **lead 集成 — FormControl 批**（parity 18/18）：Radio/Checkbox focus-visible `outline-offset:0`+`box-shadow:none`（Radio.module.css:25-27/Checkbox.module.css:82-84）；Checkbox 删无效 `@media (prefers-reduced-motion) focusOutline` 死规则；Radio.vue role 恒 radio + aria-checked 恒渲染（Radio.tsx:133-139）；FormControl attr-passthrough 超集对齐源（deviation 6）；Checkbox aria-checked 程序化点击时序（deviation 11）。详见 §6.3-22–24。
- ✅ **lead 集成 — FocusTrap/Token/composables/theme/inputValue**：FocusTrap #3 怪癖复刻（containerRef null 早退、initialFocusRef 显式优先、document.body 兜底、activeElement 末选——useFocusTrap.ts:88-112）+ 删自加 initialFocusRef??previousFocus 兜底（源无）；IssueLabelToken/_RemoveTokenButton/TokenTextContainer 按指令移植（未用也对齐）；renderNode.ts/documentRegistries.ts/getScrollableAncestors.ts/FormControlCaption.tsx 移植（新文件校验）；theme --fgColor-success #2da44e→#1a7f37（light.css:398）；inputValue.ts null 守卫（DOM 规范 value=null→''）；style.test scale pin 改 '2px'（react-dom 18.3.1 isUnitlessNumber 无 scale，:2540-2604）+ boolean→'' 测试（dangerousStyleValue:2623-2624）。
- ✅ **lead 集成 — FAL.css/focus-outline/typecheck**：FAL.css 删 6× 死 `:not(.filtered-action-list__does-not-exist)`（源 grep=0，ActionList.module.css:291-301 用 `:where()` 无特异度提升）；focus-visible 规则对齐 ActionList.module.css:166-167 `@mixin focusOutline 0`。focus-outline 双跳对齐：源 CSS 从不直写单跳 `var(--focus-outlineColor)`（grep=0），所有 focus outline 经 `@mixin focusOutline`（双跳 `var(--focus-outline-color, var(--focus-outlineColor, #0969da))`，#0969da 由 preset token-fallback 注入、mixin 本身不含）→ 修正确认源自 mixin 的单跳组件 SelectPanelButton×2/Button/ActionListItemBase/Breadcrumbs/BreadcrumbsItem 改双跳（Radio/Checkbox/FAL 本已双跳）。typecheck 0 错（context.ts parentName、AnchoredOverlay effectiveReturnFocusRef、TokenBase props PropType 含 undefined、IssueLabelToken.test get<HTMLElement>）。

- ✅ **ActionList 轮**（ActionListItemBase.vue 全量重写 + ActionList/Item/LinkItem/context.ts + 新建 ActionList.test.ts 15 测试；Autocomplete agent 报告的 7 缺口全部核实为真并修复）：① data-disabled→data-is-disabled（Item.tsx:330）+ 全部 ItemBase CSS 选择器改源形 `[aria-disabled='true'],[data-is-disabled]`；② data-has-description 恒字面 "true"/"false"（Item.tsx:332）；③ Spacer span 补为 content 首子（Item.tsx:348，module CSS:612-616 + `--subitem-depth`）；④ 结构/ARIA 重建（li/button/a 语义 per Item.tsx:279-290：listSemantics→li 携 menuItemProps+内层 div，buttonSemantics→内层 button[type=button]，LinkItem→anchor 组合 onClick；menuItemProps 全镜像 :247-260；inferred option/tab roles :154-160；ids+aria-labelledby/describedby）；⑤ focusableSelector 仅排除 input（disabled 项可高亮，guards 阻激活，iterate-focusable-elements.js:36-45）+ PageUp/PageDown（List.tsx:65）；⑥ 删 ul 的 data-selection-variant（List.tsx:109-127 无）；⑦ data-component 全 stamp（ActionList/Item/Item.Label/Item--DividerContainer/Selection/LeadingVisual/TrailingVisual/Description）。重审附带修复：Spinner 位置反转（无 leading→trailing，Visuals.tsx:59-86）、ConditionalWrapper div-only-with-description、VisuallyHidden "Loading"（Item.tsx:370）、Selection radio/checkmark/empty-div-mask 内部（Selection.tsx:31-52）、mixed-descriptions 布局效果（List.tsx:95-107）、字面 data-dividers、Description 12px/16px（module CSS:674-684，真实计算样式修复）、active-label control-fgColor-rest、li focus-visible outline offset 0、~10 primitives-11.5.1-light token fallback、context.ts +='radio' variant。验证：ActionList 15/15、FAL 19/19、full suite **343/343**、typecheck 0、SP parity 61/61、FC parity 18/18、build ✓。ActionList 侧登记项见 §6.3-28。
- ✅ **FAL data-dividers 对齐**：`FilteredActionList.vue:388` 的 `|| undefined` 改 `? 'true' : 'false'`（源 List.tsx:23 showDividers 默认 false + :119 `data-dividers={showDividers}`，React 对 data-* 字符串化 boolean → 恒渲染 "false"/"true"，省略即偏差）；test:49 `toBeUndefined`→`toBe('false')`（含源引用）。FAL CSS 仅 `[data-dividers="true"]` 选择器（渲染 "false" 无样式差异），parity 不比对属性（SP 61/61 不受影响）。

### 6.2 缓期未修（决策记录）

- ⏸ H3 CSS anchor positioning 分支缺口：`primer_react_css_anchor_positioning` flag 两侧默认 false 且应用无启用点；仅特征检测已对齐。启用该 flag 前需补齐（含 Popover API 路径、双轴翻转、`--anchored-overlay-top-override`、anchor-name 保留防闪烁）。
- ⏸ M15 共享 Button/Button.vue 与 ButtonBase 分叉：全面重做需以 SelectPanelButton 的 ButtonBase 融合实现反哺共享 Button，影响面为全部既有消费者，单独排期。本轮已让 TextInputAction 的 icon 分支直接使用 SelectPanelButton（IconButton 语义），children 分支暂用现状 Button。
- ⏸ M17 IME 组合输入过滤时机：`internal/inputValue.ts` 组合期丢弃 input 为 Vue 移植层全局设计，需产品决策（对齐源=组合期逐键过滤，或保留并公告）。
- ⏸ M26 共享 ActionList/ 自创第二实现：FilteredActionList 不依赖它；删除或按源重写需评估既有消费者，单独排期（连带 L20/L21 的 ActionList 层第二 roving zone）。
- ⏸ M27 列表项 id 生成方案：`${listId}-item-${item.id ?? index}` 为框架适配（Vue 无 useId 逐组件实例流），ARIA 体系内自洽；改为 React `:rN:` 方案无收益，登记为偏差（§6.3-8）。
- 其余低危（L1、L6、L8–L10、L12、L19–L21、L23–L25、L27 余项、L28–L31、L33、L38–L40、L42–L46、L48、L51–L53、L55–L58）维持现状：均为框架适配、子树外共享组件债务或视觉等效项，随后续批次按需处理（L34–L37 已于 2026-10-04 轮修复，见 §6.1）。**注**：L12 的 data-component 子项与 L39 经源核实为**误读、已撤销**（非偏差，见各自 finding：L12 行内、L39 行内）；L12 仅剩 BannerDescription 子项维持低危。

### 6.3 故意偏差登记册（与 React 源有意不一致处）

1. **useAnchoredPosition 设置读取时机**：Vue 每次计算读取最新 settings；React useCallback 闭包存在设置滞留（源缺陷），不保留。
2. **嵌套 overlay 的 escape/outside registry 顺序**：语义对齐（逆序+defaultPrevented 短路），实现按 Vue 生命周期组织，注册时点与 React effect 顺序存在框架性差异。
3. **焦点恢复 previousFocus 兜底**：React 仅恢复 explicitly 记录的焦点；Vue 增加 previousFocus 兜底（增强，防焦点丢 body）。
4. **renderAnchor `children` prop 警告**：`[Vue warn]: Failed setting prop "children"` 来自消费者/demo 自己传的 renderAnchor 返回对象含 children 键，属良性噪声，不在组件内吞掉。
5. **断点单位**：源 `48rem` 在 scoped 样式中写为 `768px`（应用根字号 16px 前提）；全局移植 CSS 保留 rem。根字号≠16px 时两组文件断点宽度不同（原 L42 双轨现状保留）。
6. **L26 roving 模式 BodyLoader**：React 在 flag off 时 loader 因 ref 读取缺陷可能永不出现（源缺陷）；Vue 用内部 shallowRef 使其可用——保留 Vue 行为（用户可见改善），首帧守卫已对齐。
7. **L49b 分组标题 span id**：复核发现 React FAL 场景该 span 实际有生成 id（审计原判断有误）；Vue 保留自有 `${listId}-group-${groupId}` 方案，值不同但体系内自洽。
8. **M27 id 体系**：全部派生 id（item/label/description/…）走 Vue 命名方案，不复刻 React `:rN:`。
9. **Tooltip label 型 aria-labelledby**：公共 `Tooltip.vue` 对已有 aria-labelledby 采取「已有值 + tooltipId」组合而非 React 的整体替换；SelectPanelButton 在 label 型时抑制用户值，净结果与 React 完全一致（组合顺序 `${uuid}-label ${tooltipId}` 亦一致）。
10. **`_privateDisableTooltip` → `privateDisableTooltip`**：Vue 保留 `_` 前缀 prop，改名去下划线。
11. **L15 空白 children**：Vue 模板编译器会合并/剔除纯空白节点，无法逐字节复刻 React「任何 truthy children 都渲染 text span」；组件层按"非注释节点即内容"对齐，模板字面量场景尽力而为。
12. **zIndex token 未 vendored**：`--zIndex-overlay` 等保持未定义，Overlay 基类回落 10001；SelectPanel 场景已用补偿规则归位 auto/100（与 React 净效果一致）。全局 vendored zIndex 会改变应用层叠上下文，影响面超出子树，故缓期。
13. **H2 specificity 策略**：`.select-panel__title` 用普通类选择器 (0,1,0) 替代源 `:where` (0,0,0)，以对抗本应用全局 `h1` 元素规则；在 BaseStyles 收敛全局标题规则之前，此为必要偏离。
14. **Tooltip v1 context 检测未移植**：Vue 侧无旧版 Tooltip v1，`TooltipContext`（v1）互斥检测无对应物。
15. **语义元素警告时机**：React 渲染期 invariant/warn；Vue 移至 onMounted DEV 警告（interactive 触发器 invariant 仍同步抛出）。
16. **Fragment/多子触发器**：React `Children.only` 抛错；Vue 适配为 DEV 警告 + 原样渲染。
17. **测试基建**：React 测试跑真实浏览器（@vitest/browser），popover polyfill 永不 apply；Vue jsdom 测试需 `vitest.setup.ts` 的 adoptedStyleSheets 垫片，且 Escape 需派发在 `document.body`（polyfill 读 `target.ownerDocument`，document 自身为 null 会崩）。
18. **useTooltipController watch 依赖含 `enabled()`**：Vue 无 React 的 Tooltip 子树挂载/卸载时序，以依赖项变化等效触发。
19. **两套 VisuallyHidden**：`VisuallyHidden/`（公共版，clip-path 技术，ButtonBase/CounterLabel/Spinner/FAL 使用）与 `internal/components/VisuallyHidden.vue`（内部 `_VisuallyHidden` 版，clip:rect 技术，Tooltip/KeybindingHint 使用）——忠实映射 React 的双实现现状，不可互换。
20. **Chord.css/移植 CSS 兜底值**：按移植约定为颜色/尺寸 token 增加 fallback（React 构建由主题注入），兜底值一律取 primitives 11.5.1 light 主题实值。
21. **TextInputAction 警告时机**：同 15，React 每次渲染 warn → Vue onMounted DEV warn 一次。

22. **FormControl attr-passthrough 超集**：Vue FormControl 子组件（Caption/Label/Validation 等）相对源透传 attr 超集；LeadingVisual 例外（源特定渲染）。框架适配（Vue attrs fallthrough vs React 显式 spread）。
23. **Checkbox aria-checked 程序化点击 staleness + checked-attr 再同步 glue**：程序化 click 时 Vue Checkbox 的 aria-checked 相对 React 同步更新可短暂陈旧（Vue 响应式 flush 时序）；并加 checked-attr 再同步 glue 调和受控/非受控状态与 DOM 属性（Vue 无 React 受控属性语义）。测试 pin 固化。
24. **FormControl legend/结构近似**：legend bare-0 近似；horizontal 布局下 non-choice input 重复渲染（测试 pin）——React FormControl 结构的 Vue 适配。
25. **style.css 宿主应用全局**：`src/css/style.css`（Tailwind-preflight 式 `*` reset + h1–h6 字号 + code{} 字面量）为宿主应用自有全局，primer parity 范围之外；维持原样（app-specific，非组件偏差）。
26. **focus-outline 单跳 vs 双跳家族**：不在 `@mixin focusOutline` 源列表的组件（Dialog/Blankslate×2/Upload/ImageUpload×3/Banner/Link）渲染单跳 `var(--focus-outlineColor, #0969da)`；外层 `--focus-outline-color` hop 为死 hop（任何主题均未定义）→ 与双跳功能等价。逐组件源核查缓期（其 focus 规则或为端口自加、或源用不同模式；确认源自 mixin 的 Button/SelectPanelButton/ActionListItemBase/Breadcrumbs/Radio/Checkbox/FAL 已双跳）。
27. **其余次要端口适配**：Select ArrowIndicator 双类怪癖未复刻（inline svg 适配）；Button danger-hover `#cf222e` 保留（light.css:693）；`#f6f8fa` control-bgColor-disabled 陈旧 fallback×2 留存（良性，已报告）；UnderlinePanelsTab line-height 1.4285；ImageUpload 字面量；KBH TooltipElement 一次性 platform 检测（usePlatform，残留 override vs 响应式 usePlatformRef）；Select SSR value-attr 产物；FAL 组标题非字符串 → ul aria-label `[object Object]` 源怪癖（L49c）。

28. **ActionList 端口登记（ActionListItemBase 重写后未改/死代码/源怪癖镜像项）**：a) inactiveText/inactive UX 缺失（需 TooltipV2 接线；inactive 分支死代码并带引用 Item.tsx:124,129,215,244,252,329）；b) SubItem/TrailingAction/Heading 子组件缺失（data-has-subitem/data-has-trailing-action/data-trailing-action-loading 恒 undefined per :331,333-334；CSS 保留 [data-has-subitem] 选择器为死但忠实）；c) GroupContext selectionVariant 覆盖（Selection.tsx:19）+ ActionMenu/SelectPanel/FAL 容器 context（Item.tsx:127,150-153）死分支（端口 Group 不提供 context）；d) 手写 always-wrap focus zone 保留（vs 源 useFocusZone 按 listRole∈menu/menubar/listbox 门控 + roving tabindex + focusOutBehavior stop/wrap，List.tsx:58-68——改门控会破坏 in-repo 无 role 消费者；PageUpDown 已补）；e) Selection.tsx:35 Radio 的 aria-hidden 无法达 DOM（端口 Radio 声明 ariaHidden prop 吞掉 kebab attr，同 FAL 先例 FilteredActionList.vue:267，双键 v-bind 镜像）；f) Truncate 简化（data-truncate CSS，无测量/Tooltip，per Description.tsx truncate 路径）。源怪癖镜像非修复：disabled/loading LinkItems 仍可导航（无 preventDefault，Item.tsx:186-192）+ consumer onClick 在 disabled 时仍触发（LinkItem.tsx:49-52，测试 pin）；link items 上 Enter 可双触发 select（native click + keypress，源 :250）；selection-variant 但无 role 的列表无可见选中标记（includeSelectionAttribute 要求 role∈selectableRoles，Item.tsx:223——影响 in-repo demos action-list.vue/action-panel.vue/user-menu.vue，忠实源怪癖）。端口特有 CSS hooks 保留：data-has-selection/data-has-leading-visual/data-has-trailing-visual 驱动 grid-template-areas（源用固定 areas + margins，module CSS:501-529）、data-truncate、data-action-list-control zone 标记、newTab prop、`.action-list-content:focus-visible` offset -2px（端口 control-focus 样式）。

### 6.4 本轮新增/重写组件

- `TooltipV2/`：Tooltip.vue、TooltipElement.vue、useTooltip.ts、TooltipContext.ts、types.ts、Tooltip.css、index.ts、Tooltip.test.ts（8 测试）。
- `KeybindingHint/`：KeybindingHint.vue、Sequence.vue、Chord.vue、Key.vue、key-names.ts、chordUtils.ts、utils.ts、platform.ts、props.ts、两个 CSS、index.ts、KeybindingHint.test.ts（6 测试）。
- `CounterLabel/`：CounterLabel.vue、CounterLabel.css、index.ts、CounterLabel.test.ts（2 测试）。
- `VisuallyHidden/`：VisuallyHidden.vue（公共版）、VisuallyHidden.css、index.ts。
- 重写：`SelectPanel/SelectPanelButton.vue`（+SelectPanelButton.test.ts 13 测试）、`TextInput/TextInputAction.vue`。
- 基建：`vitest.setup.ts`（adoptedStyleSheets 垫片）、`themes/base-size.css`、`base-motion.css`、`border.css`、`radius.css`、`typography.css`、`base-styles.css`（vendor 脚本产出）。
- 删除：`SelectPanel/SelectPanelTooltip.css`（由 TooltipV2/Tooltip.css 取代）。

