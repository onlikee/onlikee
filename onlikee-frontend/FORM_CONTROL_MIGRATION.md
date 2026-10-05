# FormControl Vue 迁移记录

对照本地 Primer React 仓库提交 `8c0b708fc43a3535b643cadc5a7ba97e937555c8` 的源码、公开类型和测试迁移。React 仓库保持不变。

## 已迁移范围

FormControl、Label、Caption、Validation、LeadingVisual，以及它识别的八类输入：Autocomplete、Checkbox、Radio、Select、TextInput、TextInputWithTokens、Textarea、SelectPanel。包含 CheckboxGroup、RadioGroup、Token、FilteredActionList、FeatureFlags 和输入容器、字符计数、播报、焦点管理、定位、弹层及校验动画。

底层 DOM 行为固定为 `@primer/behaviors@1.10.3`；虚拟列表使用 `@tanstack/vue-virtual@3.13.18`；实时播报使用源仓库对应的 `@primer/live-region-element@0.8.0`。

## Vue 接口

- 保留状态属性名：TextInput、Textarea、Select、Autocomplete.Input、TextInputWithTokens 使用 `v-model:value`；Checkbox 和 Radio 使用 `v-model:checked`；SelectPanel 使用 `v-model:selected`、`v-model:open`、`v-model:filterValue`；Autocomplete.Menu 使用 `v-model:selectedItemIds`。
- 源回调映射为 Vue 事件，例如 `@change`、`@selected-change`、`@open-change`、`@token-remove`、`@cancel` 和 `@save`。事件参数使用原生事件。文本输入的 `change` 对应源 React 的输入更新时机；Select 对应原生选择事件。
- 节点属性接受 Vue 节点或组件，并支持对应具名插槽；显式属性优先。组合子组件通过组件导出上的成员使用，例如 `FormControl.Label`、`Select.Option`、`Autocomplete.Menu`、`SelectPanel.Message`。
- 自定义输入包装组件使用 `asSlot(WrappedInput, TextInput)` 标记，再在包装组件的 setup 中调用 `useFormControlForwardedProps(() => externalProps)`。返回值为响应式 `ComputedRef`；外部属性优先；脱离 FormControl 使用时保留原对象，不添加表单属性。识别仅检查直接子节点，保持源 Fragment 的识别边界。
- ID 使用 Vue `useId`，保证 Vue SSR 与水合期间稳定。输入实例暴露底层输入、根元素及适用的 `focus`、`blur` 方法；FormControl 暴露根元素。
- 私有适配样式使用 `<style scoped>`，共享样式及 SelectPanel 对齐的源样式使用带组件前缀的普通 CSS，不使用 CSS Modules。SelectPanel 的源 mixin/custom media 提前展开，变量与兜底值保留源定义；数字样式保留源 React 的尺寸转换行为，并支持 Vue 的字符串和数组样式。

旧 Input 组件、导入和调用已移除。新文档路由为 `/component/text-input`；`/component/input` 重定向到新页面。Select 的 options 数组改为原生 `Select.Option`、`Select.OptGroup` 子组件，键盘操作遵循浏览器原生 select。

## 特意保留的源行为

- 纵向普通输入允许显式子组件属性覆盖 FormControl 默认属性；选择控件和横向分支由 FormControl 覆盖 ID、disabled、required 和说明关联。
- Radio 不添加单项 required。选择控件的校验消息放在组级组件，组级 fieldset/legend 保持原生禁用和无障碍说明行为。
- 横向普通输入不渲染 Validation，不注入 validationStatus，只关联 Caption。
- SelectPanel 标签通过 aria-labelledby 同时关联标签和选中值，不使用 label 的 for。
- Autocomplete 根组件只接收源公开的 id/子节点接口；FormControl 给根组件的 validationStatus 不额外传入 Autocomplete.Input。输入仍通过转发 composable 获得 ID、disabled、required 和说明关联。
- FeatureFlags 默认值和嵌套覆盖与源一致。DOM 有关分支保留；React 的合并 ref 分支由 Vue 实例暴露实现等价的元素访问。
- InputValidation 保留源内联自定义属性的无单位行为：React 以数字写入 `--inputValidation-iconSize: 16`，自定义属性不追加 px，`min-height: 16` 解析失败按 IACVT 计算为 auto；`var()` 均不带兜底。校验图标按 @primer/octicons-react 的原生 12px 变体内联还原（viewBox 0 0 12 12、`display`/`overflow` 表现属性、`vertical-align: text-bottom` 内联样式）。
- TextInputWrapper 保留源缺陷：`[data-variant='small']` 的 `font-size: (--text-body-size-small)` 缺 `var()`，解析期即被丢弃，该分支字号保持 14px；`[data-size='large']` 使用固定 `height` 而非 `min-height`。input/select 的 padding 链、`background-position: right 8px center` 与 `@media screen and (--viewportRange-regular)`（展开为 `min-width: 48rem`）按源移植。
- Radio 的 `border-radius: var(--borderRadius-full, 100vh)` 为源文件自带的显式兜底（postcss-custom-properties-fallback 不覆盖已有兜底），按源保留；Token 等源未写兜底处使用 primitives fallback 值 `624.9375rem`。

## 修正的缺陷与适配

- 修正源 FormControl 横向普通输入重复渲染，保留上述校验行为。
- Autocomplete 单选用新选项替换旧选项 ID，避免源实现累计多个单选值。
- Autocomplete 保留非受控 defaultValue，修正源初始化 effect 清空默认输入的问题；空选项数组的默认回调安全处理。
- SelectPanel 后续按严格对齐要求恢复源行为：锚定单选切换按引用、模态单选切换按 ID，选中展示和多选按源各自规则判断；全选恢复固定 ID，overlay 样式按源覆盖。Vue 代理使用 toRaw 保持底层对象引用语义。细节见 [SELECT_PANEL_PARITY.md](./SELECT_PANEL_PARITY.md)。
- Select 占位符初始化到空值选项，修正源默认值与占位符 option 值不一致的情况。
- 组合输入提交完成后去重浏览器随后产生的同值 input；组合输入期间阻止 Token 删除。受控更新被父组件拒绝时恢复原值；原生 form reset 恢复默认值，卸载时清理监听器。
- Textarea 为不支持 field-sizing 的浏览器提供自动高度实现，并保留调用方显式高度；其样式按源 TextArea.module.css 移植，12px 内边距由输入容器 `> textarea` 规则提供。Select 外层样式沿用本项目已有外观（含本地钉住的 `padding-block: 5px`，因共享容器的 padding 链已按源移植），内部选择、提交和键盘交互使用原生 select。
- FilteredActionList 虚拟导航后续恢复源焦点区域及 scrollToIndex，不保留屏外 Home/End、循环或滚动清理修正。相关源边界行为和验证限制见 SelectPanel 对齐记录。
- 实时播报仅在客户端加载浏览器自定义元素实现，使 SSR 不依赖 DOM 全局；共享 AriaStatus 仍取消尚未完成的播报。SelectPanel/FilteredActionList 按源直接播报，关闭不额外取消延时消息，Notice 不额外去重。

## 验证

运行方式和回归范围见 [TESTING.md](./TESTING.md)。自动化验证覆盖公开行为、属性优先级、八类输入与 FormControl 组合、受控及非受控状态、原生选择、组合输入、Token、弹层、虚拟导航、SSR、监听清理和公开类型。

初次迁移验证为 24 个测试文件、231 项用例通过。SelectPanel 严格对齐后的全量检查结果见 [TESTING.md](./TESTING.md)；保留 error/playground 页既有格式提示及构建提示。

2026-10-04 严格 UI 对齐轮：InputValidation、TextInput/UnstyledTextInput、TextInputWrapper、Textarea、TextInputWithTokens 与 Token 按源 CSS 逐条移植，FilteredActionList 输入区的历史 `:deep` 补偿全部移除。新增可复现对照脚本 [scripts/form-control-ui-parity.mjs](./scripts/form-control-ui-parity.mjs)（`npm run test:ui:form-control -- --react-root <本地 React 仓库>`），以本机 Chrome 对 9 类场景 × 浅/深色共 18 组比较 DOM 层级、全部标准计算属性、几何与截图像素：18/18 一致、0 不同像素，记录见 [last-report.json](./scripts/form-control-ui/last-report.json)。回归测试新增 `internal/components/InputValidation.test.ts` 固化图标结构、内联自定义属性与无兜底 `var()` 行为。

同日全面复核轮（disabled 路径与结构保真，行为对齐源怪癖）：Token 根节点对任意标签渲染 React 的 `disabled=""`（不再输出自加的 `aria-disabled`）；Token 的 Backspace/Delete 移除、移除按钮点击与 TIWT 的 `remove()` 均按源删除 disabled 守卫（disabled 的 token 仍可聚焦并被键盘移除，源怪癖保留）；TIWT token 的 `tabindex` 恢复源的无条件 `0`；文本容器不再自加 `type="button"`；FAL 全屏字号类迁回 TextInput 根（源 `.FullScreenTextInput` 位置）并补传 `color="fg.default"`（随 inputProps 落在 input 元素）；TIWT overflow 计数改源的按 size 映射四类、删除自加 `data-size`；共享容器 `::placeholder` 规则补齐源有的 `select` 选择器。新增 `Token/Token.test.ts`（7 项）固化上述行为，TIWT 的 disabled 用例改写为源怪癖断言。

SelectPanel 的后续核对使用本机 Chrome 对照 React 实际渲染。严格 UI 对齐恢复 Banner、ActionList、按钮、Tooltip、TextInput visual 和 Skeleton 的源标签层级，复制并展开对应源 CSS，通过独立脚本比较 DOM、计算样式及截图像素；详细范围见 [SELECT_PANEL_PARITY.md](./SELECT_PANEL_PARITY.md)。其他控件的完整视觉验收尚未包含在此次核对中。
