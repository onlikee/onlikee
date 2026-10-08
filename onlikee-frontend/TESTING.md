# 测试

使用 Node 22.18 或兼容的更新版本，在当前目录运行 `npm ci` 安装依赖。
Vue Test Utils 的间接格式化依赖 `js-beautify` 通过 npm overrides 固定为 1.15.4，避免其新版依赖要求 Node 22.22.2；升级时需重新验证 Node 兼容性。

```sh
npm test                  # 监听模式，修改测试或相关源码后重跑
npm run test:run          # 一次性运行所有测试
npm run typecheck:test    # 严格检查测试及其导入的源码
npm run lint
npm run lint:fix          # 自动修复 ESLint 和 Prettier 问题
npm run format:check      # 检查 Vue/TS/CSS/JSON/Markdown 等文件格式
npm run format            # 按 Prettier 规则格式化文件
npm run build
```

ESLint 通过 `eslint-plugin-prettier/recommended` 启用 Prettier 格式检查并关闭冲突的格式规则，统一读取 `.prettierrc.json`。Prettier 命令还会覆盖 ESLint 未检查的 CSS、JSON 和 Markdown 等文件，忽略目录见 `.prettierignore`。
现有文件可能不符合新增的格式规则；首次自动修复会产生较多格式变化，运行后应检查 Git diff。格式规则要求 LF 换行。

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

实时播报的 DOM 测试使用 live-region 包的浏览器入口，由 `vitest.config.ts` 配置；Node SSR 测试不依赖 DOM 全局。`vitest.setup.ts` 为 jsdom 补充 adoptedStyleSheets，以支持 Popover polyfill。
