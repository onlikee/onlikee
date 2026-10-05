# 测试

使用 Node 22.18 或兼容的更新版本，在当前目录运行 `npm ci` 安装依赖。
Vue Test Utils 的间接格式化依赖 `js-beautify` 通过 npm overrides 固定为 1.15.4，避免其新版依赖要求 Node 22.22.2；升级时需重新验证 Node 兼容性。

```sh
npm test                  # 监听模式，修改测试或相关源码后重跑
npm run test:run          # 一次性运行所有测试
npm run typecheck:test    # 严格检查测试及其导入的源码
npm run lint
npm run build
```

运行单个文件或筛选用例：

```sh
npm run test:run -- src/components/primer-vue/RadioGroup/RadioGroup.test.ts
npm run test:run -- -t "controlled"
```

测试就近放在源码旁，使用 `.test.ts` 后缀并显式从 `vitest` 导入 API。
默认使用 Node 环境，SSR 测试保留 `renderToString()`；需要 DOM 的交互测试在文件首行声明 `// @vitest-environment jsdom`。
焦点、标签点击和原生单选行为需要挂载到 document，并在测试后卸载和移除挂载容器。
mock、环境变量和全局变量在每个用例后恢复；修改这些状态的用例不要并发运行。

测试由独立的 `tsconfig.test.json` 检查，不参与应用构建。运行 Vitest 本身不会替代类型检查。

FormControl 及依赖控件的迁移基准为 Primer React `8c0b708`；接口映射见 [FORM_CONTROL_MIGRATION.md](./FORM_CONTROL_MIGRATION.md)。SelectPanel 及直接依赖严格保留源行为，包括源缺陷，具体分支见 [SELECT_PANEL_PARITY.md](./SELECT_PANEL_PARITY.md)。

2026-10-03 本次验证：25 个文件、258 项测试通过，`typecheck:test`、lint 和 build 均通过。lint 仅保留原有 `src/modules/error/views/playground.vue` 第一行格式警告，构建保留原有大分块提示。
2026-10-04 TextInput 链严格对齐轮验证：31 个文件、300 项测试通过，`typecheck:test`、lint 和 build 均通过；既有 lint/构建提示不变。
2026-10-05 审计对齐轮验证（4 subagent 批次 Select+KBH / Button / SelectPanel / Autocomplete + lead 集成 FormControl/FocusTrap/Token/composables/theme/focus-outline + ActionList 的 ActionListItemBase 全量重写）：**33 个文件、343 项测试通过**，`typecheck:test` 0 错，lint 0 错（14 条风格警告容忍：TooltipElement/CharacterCounter/TextInput/Textarea 的 attributes-order 与 singleline/multiline-newline 格式、SelectPanelButton.test.ts 多组件、playground.vue 既有），build 通过。SelectPanel parity **61/61**、FormControl parity **18/18**（scripts/*/last-report.json 已刷新）。同轮更正三条误读 finding：M8（React 关闭时并不清 position，Vue 一致，真实缺口仅 onPositionChange API）、L12（octicons-react v19.28.1 确实 stamp `data-component="Octicon"`，Vue 调用点 stamp 为必需非多余）、L39（源 Stack `justify` 默认 `'start'`，`data-justify="start"` 与源一致非多加）——详见 SELECT_PANEL_AUDIT_ISSUES.md §6.1/§6.2。
回归包括八类输入与 FormControl 的组合、属性覆盖、动态 ID/ARIA、组级禁用、受控拒绝、默认值与原生 form reset、组合输入、Token 焦点、弹层保存取消及关闭原因、SSR 和监听器清理。
新增严格对齐用例覆盖同引用/同 ID 不同引用/无 ID、继承的 `selected: undefined`、回调覆盖与动态替换、事件顺序、排序快照、首次请求及 loading 模式切换、关闭保留计时器和卸载清理、Notice 延迟、数字键传播、样式覆盖、FormControl 标签以及移动视口高度保留。
2026-10-04 新增 `internal/components/InputValidation.test.ts`：固化 octicons-react 原生 12px 校验图标结构（viewBox、`octicon octicon-*` 类、`display`/`overflow` 表现属性、`vertical-align: text-bottom`）、无单位内联自定义属性（`--inputValidation-iconSize: 16`、`--inputValidation-lineHeight: 1.3333333333333333`）与无状态时不渲染图标。
同日复核轮新增 `Token/Token.test.ts`（7 项）：固化 disabled 路径源怪癖（span 根渲染 `disabled=""`、无 `aria-disabled`；disabled 时 Backspace/Delete 与移除按钮点击仍触发移除）、交互形态分支（span/button 移除按钮的 tabindex 与 aria-hidden）、文本容器不设 `type`、内联 X 图标的 12/16px 变体与内联 transform；TIWT 的 disabled 用例改写为断言源的"disabled 仍可键盘移除 + tabindex 恒 0"怪癖。

实时播报测试使用真实的 live-region 自定义元素。SelectPanel/FilteredActionList 按源分支检查清空、延迟及重复触发；其他使用共享 AriaStatus 的控件继续检查其去重与取消行为。Vitest 将该包映射到浏览器入口，避免 Node 条件导出的 SSR 空实现被误用在 jsdom 中；组件在挂载后加载该实现，Node SSR 测试仍不依赖 HTMLElement。

本次使用本机 Chrome 执行本地 React SelectPanel 原有 152 项浏览器测试，并另加同场景临时用例验证关键边界。严格 UI 对照使用下述独立脚本，此前 40 组视觉对照属于历史验收，范围和实际结果见 [SELECT_PANEL_PARITY.md](./SELECT_PANEL_PARITY.md)。虚拟列表恢复源 active-descendant 的纵向/Page 键、渲染窗口边界 stop 和滚动策略，以及 roving 模式的循环行为；测试控制 rAF 队列隔离源 virtual-core 卸载后重试问题。移动视口缩放、软键盘高度变化和监听器清理使用模拟 visualViewport 的测试验证。

SelectPanel 的真实浏览器 UI 对照需要本机 Chrome，以及已安装依赖的本地 Primer React `8c0b708` 仓库。脚本复用该仓库的 Playwright、pngjs 和 PostCSS preset，不增加前端运行依赖，也不修改 React 工作树。

```sh
npm run test:ui:select-panel -- --react-root C:/Users/25336/Desktop/project/react
# 可选：--scenario advanced、--state tooltip、--channel chrome、--output <报告目录>
```

默认比较 61 组场景，逐组检查 DOM 层级、Chrome 全部标准计算属性、几何坐标和截图像素，差异导致非零退出码。只归一化框架生成的锚点 ID 和关闭 Tooltip 留下的临时坐标，Tooltip 打开后的坐标仍参加比较；方法细节见对齐记录。未指定 output 时，report.json 和双侧截图保存在系统临时目录并打印路径。验证页固定静止帧，组件动画保持源样式。新增单元回归验证 Banner/ActionList/按钮结构、merged-ref flag 对混合说明字重的源分支，以及完整 CSS anchor 默认 fallback 列表。

2026-10-03 严格 UI 验证：61/61 组通过，DOM/计算样式差异 0、不同像素 0；记录见 [last-report.json](./scripts/select-panel-ui/last-report.json)。

FormControl 及输入链（TextInput/Textarea/TextInputWithTokens/Token/InputValidation）的真实浏览器 UI 对照使用同方法的独立脚本，比较根节点 `[data-component="FormControl"]` 整棵子树：

```sh
npm run test:ui:form-control -- --react-root C:/Users/25336/Desktop/project/react
# 可选：--scenario tokens、--channel chrome、--output <报告目录>
```

矩阵为 9 类场景（error、success、required、plain、disabled、checkbox、hidden-label、textarea、tokens）× 浅/深色共 18 组，视口 1024×768，比较 DOM 层级、Chrome 全部标准计算属性、几何坐标（容差 0.02px）和截图像素（无容差）。2026-10-04 实际执行结果：18/18 组通过，差异 0、不同像素 0；记录见 [last-report.json](./scripts/form-control-ui/last-report.json)，fixtures 位于 `scripts/form-control-ui/`。

2026-10-04 TextInput 链严格对齐后复跑 SelectPanel 61 组：61/61 通过（FilteredActionList 输入区的历史 `:deep` 补偿已随源移植移除）。复跑中出现过一次 `modal-dark-390` 的 146 个 ±1 通道像素差（Save 按钮圆角抗锯齿，节点/样式/几何差异均为 0），重跑同场景即恢复一致；此类无样式差异的边缘抗锯齿抖动按光栅化非确定性处理，复跑确认即可。

其他控件仍需分别完成真实浏览器的视觉验收；jsdom 和构建通过不等于截图验收通过。
