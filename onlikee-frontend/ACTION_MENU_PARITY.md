# ActionMenu 对齐记录

基准：`E:/Desktop/项目文件夹/单项目/2026.9.27 primer-react/react/packages/react/src/ActionMenu`，提交 `09e4c4cf2e2c090036e3eb354d703d4ad0008d76`。对照 ActionMenu 源码、类型、样式、hooks、测试和 stories，未修改 React 仓库。

## 公开能力与行为

- 提供 ActionMenu、Button、Anchor、Overlay、Divider 组合导出和单独导出；Vue 默认插槽对应 React children。触发器在 Overlay 插槽位置渲染，根组件不增加 DOM 包装。
- 支持内部和受控 open；`v-model:open` / `openChange` 对应状态请求，内部状态在受控期间仍记录请求值，解除受控后保留。外部 anchorRef 支持 Vue Ref，外部锚点自行维护事件及 ARIA。
- Anchor 保留调用方处理器、class 和 ref；注入菜单 ID、haspopup、expanded 与键盘事件，支持 Tooltip 和 ActionList.Item 子菜单触发器。
- 普通浮层和全屏浮层均启用焦点陷阱。键盘打开支持首项/末项、方向键、Home/End、快捷字符；Escape / 左箭头逐层关闭，选择叶子项或默认 Tab 关闭菜单链。窄屏受控 open 为 true，以及窄屏 fullscreen，保留源的 Tab 不关闭规则。
- 列表使用 menu；选择项使用 menuitemradio / menuitemcheckbox 和 aria-checked。disabled、loading、inactiveText 和 preventDefault 的选择行为复用 ActionList。
- 响应式 narrow < 768px、regular >= 768px、wide >= 1400px；wide 支持 anchored。保留未命中响应式键时源的对象 fallback。
- Overlay 的尺寸、滚动、显式标签、as、原生属性、焦点引用、关闭回调、命名 Portal 和私有禁用 Portal 属性均可透传。命名容器通过 `Portal/registerPortalRoot` 注册；Dialog 注入上下文，定位默认约束到 viewport，显式属性可覆盖。
- CSS 锚定支持源的方向调整、横向偏移和底部溢出修正。保留已有 anchor-name；关闭返回目标按打开时捕获的元素恢复，替换已打开菜单的锚点不重新设置首焦点。

## 源行为与 Vue 适配

- 默认快捷字符直接读取 textContent 首字符，包含空白；Vue 模板示例显式指定快捷字符以避免插槽空白影响。
- 源中 Anchor 内嵌 Tooltip 会将同一 ID 注入触发器及 Tooltip。对照保留其 ID/标签行为；显式 aria-labelledby 可指定菜单的有效标签。外部锚点不会自动作为菜单的默认 ID，文档为其显式声明标签。
- Vue 生成的 ID、样式类和 scoped CSS 属性由框架负责；比较时解析标签引用的文本，而不比较生成 ID 字面值。
- 浮层使用应用所需的 z-index，以覆盖固定 Header 和组件导航；菜单内容、尺寸、定位与交互按参考实现对照。

## 文档示例

`/component/action-menu` 展示 13 个独立演示及 3 张 API 表。图中七项均有完整可复制的 SFC：With a loading item、With an inactive item、Single-select、Multi-select、With dividers、With submenus、As a context menu。子菜单演示包含三级，右键菜单包含三行独立受控菜单。

## 验证

在 `onlikee-frontend` 中执行：

```powershell
npm.cmd run test:run -- src/components/primer-vue/ActionMenu src/components/primer-vue/ActionList src/components/primer-vue/ActionBar src/components/primer-vue/SelectPanel src/components/primer-vue/Dialog
npm.cmd run typecheck:test
npx.cmd eslint src/components/primer-vue/ActionMenu src/components/primer-vue/Portal src/components/primer-vue/Dialog/context.ts src/components/primer-vue/internal/components/Overlay.vue src/components/primer-vue/internal/components/overlayTypes.ts src/modules/components/views/components/action-menu.vue scripts/action-menu-ui-parity.mjs scripts/action-menu-ui
npm.cmd run build
node scripts/action-menu-ui-parity.mjs --react-root 'E:\Desktop\项目文件夹\单项目\2026.9.27 primer-react\react' --output "$env:TEMP\action-menu-parity-full-final"
```

浏览器对照复用仓库既有 Vite + Playwright 原始 React 源码 / Vue 源码双入口方式，不安装新依赖。20 种场景 × 2 个主题 × 4 种宽度（390、768、1024、1400）：160 组，差异 0。比较开关状态、实际焦点、菜单标签、角色、disabled、checked、标签描述、选择回调、浮层/菜单项几何尺寸及九项计算样式；有限动画结束后采样，Spinner 无限动画暂停在同一时刻。场景包括受控/解除受控、普通/全屏、三级嵌套、加载/不可用、单选/多选/分隔线、右键、自定义/Tooltip 锚点、尺寸/滚动/标签/as、外部锚点替换、CSS 锚定及右下角溢出。

文档真实页面检查：44 项已有交互检查及 30 项新增示例检查通过；13 段可见示例提取后使用当前 `@vue/compiler-sfc` 编译 script 与 template，全部通过。桌面和 390px 下检查菜单层级、全屏覆盖 Header、Tab 焦点循环和代码展开后无页面横向溢出；未出现 Vue warning 或组件运行时错误。后端认证服务未启动的网络提示已关闭，不作为组件失败。

最终测试为 10 个文件、147 项通过，包含 jsdom 行为、Node SSR、受控状态、焦点与嵌套关闭链、标签捕获、命名 Portal、禁用 Portal、自定义浮层组件及锚点提取顺序；同时运行 ActionList、ActionBar、SelectPanel 回归。触发器提取、标签捕获及 Portal 补全后，又运行 390px 下全部 20 类场景，差异 0。typecheck、ESLint、build 均通过；build 的已有大 chunk 提示保留。
