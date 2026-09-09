# AGENTS.md

本文件面向 Codex / AI 编程助手，约束在 onlikee 前端项目中的读码、修改、验证和交付方式。

## Project Overview

- 本目录是 onlikee 的前端项目：`onlikee/onlikee-frontend`。
- 资料优先级：
  1. 当前仓库真实源码、依赖、配置与既有写法。
  2. 本地设计规范目录：`E:\Desktop\项目文件夹\Obsidian-Doc\onlikee开发设计规范`。
  3. 通用 Vue / Vite 经验。
- 已读取到本地设计规范目录。若后续环境无法读取该目录，必须在答复或文档中明确写出“本地设计规范未读取到”，不得补写未确认的规范。
- 如果设计规范与当前源码冲突，优先以当前源码为准，并保留局部既有风格。

## Tech Stack

- Vue 3（`vue`）、Vue SFC、Composition API。
- Vite 7（`vite`），入口配置在 `vite.config.ts`。
- TypeScript（`typescript`），`tsconfig.app.json` 开启 `strict`、`noUnusedLocals`、`noUnusedParameters` 等检查。
- Tailwind CSS 4（`tailwindcss`），通过 `@tailwindcss/vite` 插件与 `src/css/style.css` 的 `@import "tailwindcss";` 接入。
- Vue Router 4（`vue-router`），路由在 `src/router` 汇总，业务域路由在 `src/modules/*/router`。
- Pinia 3（`pinia`），全局 store 当前主要在 `src/stores/user.ts`。
- Axios（`axios`），请求实例、响应解包和基础 `get/post` 在 `src/api`。
- 其他已确认依赖包括 `monaco-editor`、`shiki`、`gsap`、`canvas-confetti`、`@icon-park/vue-next`。
- 路径别名：`@` 指向 `src`，配置见 `vite.config.ts`、`tsconfig.json`、`tsconfig.app.json`。

## Directory Guide

| 路径 | 职责 |
| --- | --- |
| `src/main.ts` | 创建 Vue app，注册 Pinia、Router，加载全局样式，初始化用户态后挂载。 |
| `src/App.vue` | 应用根组件，控制全局 Header 与 `router-view`。 |
| `src/api` | 全局请求层：环境配置、Axios 实例、响应解包、通用请求类型。 |
| `src/components/primer-vue` | 通用 UI 组件库，组件目录内通常有 `index.ts` 和 `Xxx.vue`，复合组件可有 `context.ts` 与子组件。 |
| `src/components/monaco-editor` | Monaco 编辑器初始化与相关配置。 |
| `src/css` | 全局样式入口、亮色/暗色主题 token。 |
| `src/layout` | 全局布局组件，例如 `Header.vue`。 |
| `src/modules` | 业务域目录，当前包括 `application`、`auth`、`components`、`error`、`index`、`namecard`、`user`。 |
| `src/router` | 根路由创建、滚动行为、页面标题设置、模块路由汇总。 |
| `src/stores` | Pinia 全局共享状态。当前 `user.ts` 管理登录用户信息与 hydration 状态。 |

业务域目录优先按以下结构组织：

```txt
src/modules/<domain>/
  api/          # 当前业务域请求封装与接口类型
  assets/       # 当前业务域专属静态资源
  components/   # 当前业务域内部组件或局部 useXxx 逻辑
  router/       # 当前业务域路由配置与必要守卫
  views/        # 路由页面入口
  composables/  # 如确有跨视图复用需求，再新增
```

## Development Commands

项目使用 npm，`package-lock.json` 已存在。常用命令必须与 `package.json` 保持一致：

| 命令 | 用途 |
| --- | --- |
| `npm install` | 安装依赖。 |
| `npm run dev` | 启动 Vite 开发服务器，默认端口由 `vite.config.ts` 指定为 `5173`。 |
| `npm run build` | 执行 `vue-tsc -b && vite build`，同时做类型检查和生产构建。 |
| `npm run preview` | 预览构建产物。 |
| `npm run lint` | 执行 `eslint .`。 |
| `npm run lint:fix` | 执行 `eslint . --fix`，只在确认格式/规则修复安全时使用。 |

当前项目未在 `package.json` 中确认 test 脚本。

## Coding Conventions

- 优先使用 Vue 3 Composition API 与 `<script setup lang="ts">`。
- 编辑现有 SFC 时保持该文件或相邻文件的段落顺序、缩进、分号风格和命名习惯；当前项目 SFC 段落顺序并未完全统一，不要为了统一风格重排无关代码。
- TypeScript 类型应就近放置：接口请求类型放在模块级 `api/`，组件 props/emits 类型放在组件文件内或相邻类型文件中。
- 使用 `import type` 引入纯类型，避免运行时代码被误引入。
- 优先使用 `@/...` 别名导入 `src` 内文件；同目录内部文件可使用相对路径。
- 组合函数使用 `useXxx` 命名。局部表单状态、校验、请求参数构造优先放到相邻 `useXxx`，例如 `useCreateApplicationForm.ts`。
- 页面层只负责拼装页面、触发动作、消费状态和组织布局；不要把大量校验、请求体构造、流程状态机写进单个页面。
- 组件名、类型名使用 `PascalCase`；组件库文件和目录遵循现有 `primer-vue/<kebab-case>/Xxx.vue` 风格；URL path 使用小写或 kebab-case。
- 代码注释、用户可见文案、错误提示语言跟随所在模块现状，不要擅自全局切换语言。
- 不要引入宽泛 `try/catch`、静默 fallback 或防御性分支，除非这是当前失败路径真实需要且符合现有模式。

## UI and Styling Guidelines

- 页面和业务组件优先复用 `src/components/primer-vue` 中已有组件，例如 `Button`、`Input`、`Dropdown`、`Table`、`Banner`、`FormControl`、`ActionList`。
- 样式可使用 Tailwind 工具类，但必须与现有 GitHub Primer 风格的 CSS 变量体系兼容。
- 颜色、背景、边框、阴影、圆角、字号等优先使用 `src/css/themes/light.css`、`src/css/themes/dark.css` 中的 `var(--...)` token，并提供合理 fallback。
- 全局样式入口是 `src/css/style.css`，不要在业务改动中随意重写全局基础样式。
- 组件库组件默认使用 `scoped` 样式；只有在受控组件体系内部需要联动时才使用 `:deep`。
- **组件状态和样式的控制，优先考虑使用 `data-*` 属性来实现**（例如 `data-variant`、`data-size`、`data-loading`、`data-open`），避免繁琐的 CSS class 动态拼接。
- 交互组件必须同步考虑默认、hover、active、focus-visible、disabled、loading 等状态；loading 状态应同时处理禁用、`aria-busy` 和视觉反馈。
- Dropdown / 弹层沿用 `Dropdown` 现有模型：`trigger`、`content` 插槽，`side` 控制方向，外部点击关闭，内容区点击默认不关闭；二级菜单需要调用方显式传入 `side="outside-right"`。
- 组件介绍页位于 `src/modules/components/views/components` 时，遵循既有文档页骨架：`ComponentDocsPage`、`ComponentDocsHeader`、`ComponentDocsSection`、`ComponentDocsDemoBlock`、`Table` API 表格。

## State Management

- Pinia 只用于跨页面、跨模块、需要长期共享或全局感知的状态。
- 当前 `useUserStore` 是登录用户信息、hydration 状态、登录态派生值的全局来源。
- 一次性页面表单、弹层开关、步骤流转、局部 touched 状态，不要提升到全局 store。
- store 不负责接口协议转换；接口字段转换应在模块级 `api/` 或局部 `useXxx` 中完成。
- 如果状态只在当前页面存活，优先使用 `ref`、`computed` 和局部组合函数。

## Routing Guidelines

- 根路由汇总在 `src/router/routes.ts`，不要直接把业务域路由堆进 `src/router/index.ts`。
- 新增业务页面时，在对应 `src/modules/<domain>/router/*.ts` 中声明，并在 `src/router/routes.ts` 中汇总。
- 路由组件使用懒加载：`component: () => import('../views/...vue')`。
- 路由 `name` 使用 `PascalCase`，应表达页面或流程含义，例如 `ApplicationCreateNew`、`OAuthSignupComplete`。
- 路由守卫只处理进入页面前的访问控制或登录态判断；页面内表单校验、提交流程和步骤切换不放进 router。
- 页面标题由 `src/router/index.ts` 根据 `to.meta.title` 设置；新增需要标题的页面可补 `meta.title`，未设置时默认 `onlikee`。

## API Guidelines

- 全局请求入口是 `src/api/request.ts`，业务代码优先通过 `src/api/index.ts` 暴露的 `get`、`post` 调用。
- `API_BASE_URL` 来自 `import.meta.env.VITE_API_BASE_URL`，定义在 `src/api/config.ts`。
- 后端响应结构已确认是 `{ code, message, data }`，类型定义在 `src/api/types.ts`。
- `unwrapApiResponse` 会在 `code !== 'OK'` 时抛出 `Error(message)`，成功时返回 `data`。
- 需要携带登录态 cookie 的请求显式传入 `{ withCredentials: true }`，例如 `/auth/me`、OAuth callback、创建应用。
- 模块级 `api/` 应暴露业务语义函数，例如 `applicationCreateNew`、`loginWithOAuthCallback`，不要在页面中散落裸路径和请求体转换。
- OAuth/JWT/登录态相关逻辑改动必须先读 `src/modules/auth`、`src/stores/user.ts`、`src/api/request.ts`，不得只改调用点。
- 网络错误 banner 当前在 `src/api/request.ts` 统一处理；不要在页面 catch 中重复弹同一类全局网络错误。

## Environment Variables

- 本地默认环境文件是 `.env`，当前已确认：`VITE_API_BASE_URL=http://localhost:8080`。
- `.env.local` 可用于本机覆盖，禁止提交真实密钥、Token、账号密码或个人环境配置。
- 新增前端可读环境变量必须以 `VITE_` 开头，否则 Vite 客户端代码无法读取。
- 环境变量只放非敏感前端配置；OAuth secret、JWT secret、数据库凭据等只能在后端或部署平台配置。
- 如果某环境变量的用途未在当前项目中确认，应在文档或回复中写“未在当前项目中确认”。

## Quality Checks

- 修改代码后优先运行与改动最相关的检查；常规前端改动至少考虑：

```bash
npm run lint
npm run build
```

- 只改文档时，不必强制运行构建，但应检查 Markdown 内容、命令是否与 `package.json` 一致、技术栈是否与依赖一致。
- 如果无法运行 lint/build，最终回复必须说明原因、已完成的替代检查和剩余风险。
- 不要把已有构建失败误判为本次改动引入；需要先对比错误是否与本次修改相关。

## Security and Safety

- 不得提交密钥、Token、账号密码、真实 OAuth secret、JWT secret 或私有环境配置。
- 不得破坏 OAuth、JWT、登录态 hydration、`withCredentials`、鉴权 Header 或用户跳转回跳逻辑。
- 不得绕过 `src/api/request.ts` 的统一响应解包和错误处理，除非已有代码模式明确需要直接使用 Axios 实例。
- 不得在组件库组件中加入业务请求、路由跳转或认证判断。
- 处理用户输入、Markdown、HTML、URL、文件上传时，必须先查当前模块已有校验和展示方式；不要默认信任外部输入。

## AI Agent Workflow

- 修改前先阅读相关文件和 1 至 2 个相邻实现，确认真实结构、命名、状态流和请求流。
- 优先做最小可用改动，只动完成任务所必需的文件与行。
- 对已有未改动代码只做必要理解，不做顺手重构、格式化、重排、抽象或迁移。
- 设计规范提供方向，当前源码提供事实；冲突时按当前源码实现，并在回复中说明取舍。
- 新增功能按数据流定位落点：`view -> useXxx -> modules/*/api -> src/api -> store/view`。
- 修改 UI 时先找 `primer-vue` 是否已有组件；只有现有组件不能表达需求时才新增组件。
- 修改请求、登录、路由守卫、全局 store 时，必须说明影响范围并运行更完整的检查。
- 最终回复列出变更摘要、受影响文件、验证命令和结果、未解决事项。

## Do Not

- 不要生成通用 Vue 模板式代码，必须贴合当前 `src/modules`、`primer-vue`、`src/api` 结构。
- 不要大规模重构、批量格式化、移动目录或重命名公共组件。
- 不要随意更换依赖、升级框架、改构建工具或引入新状态库。
- 不要改变公共接口、路由 path、响应结构、组件公开 props/emits/slots，除非任务明确要求。
- 不要删除现有功能、页面、路由、组件导出或主题 token。
- 不要绕开 `@` alias 配置改成不可维护的深层相对路径。
- 不要把页面临时状态塞进 Pinia。
- 不要在 `src/components/primer-vue` 中写业务逻辑、接口请求或业务文案。
- 不要伪造未读取到的设计规范、依赖版本、命令或测试结果。
- 不要把无法确认的约定写成确定规则；应写“未在当前项目中确认”。
