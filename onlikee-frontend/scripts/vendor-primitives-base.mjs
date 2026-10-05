// 从 @primer/primitives 11.5.1（React 参照仓库 node_modules）verbatim 拷贝 token CSS，
// 重新生成 src/css/themes/ 下的 vendored 文件。运行: node scripts/vendor-primitives-base.mjs
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const PR = 'C:/Users/25336/Desktop/project/react/node_modules/@primer/primitives/dist/css'
const OUT = fileURLToPath(new URL('../src/css/themes', import.meta.url))
const VERSION = JSON.parse(readFileSync('C:/Users/25336/Desktop/project/react/node_modules/@primer/primitives/package.json', 'utf8')).version

const HEADER = (src) =>
  `/* Vendored verbatim from @primer/primitives@${VERSION} — ${src}\n` +
  ` * 源文件: ${PR}/${src}\n` +
  ` * 不要手工编辑；如需更新请重跑 scripts/vendor-primitives-base.mjs 并核对 diff。 */\n`

// [源相对路径, 输出文件名, 是否追加说明]
const FILES = [
  ['base/size/size.css', 'base-size.css'],
  ['base/motion/motion.css', 'base-motion.css'],
  ['functional/size/border.css', 'border.css'],
  ['functional/size/radius.css', 'radius.css'],
  ['functional/size/size.css', 'size.css'],
  ['functional/size/size-fine.css', 'size-fine.css'],
  ['functional/size/size-coarse.css', 'size-coarse.css'],
  ['functional/themes/light.css', 'light.css'],
  ['functional/themes/dark.css', 'dark.css']
]
// typography.css 单独处理（base + functional 拼接，见文件末尾）
// 有意不 vendor：functional/size/z-index.css（--zIndex-overlay:300 会被应用 chrome 的 9999/10000 压住，
// 见 SELECT_PANEL_AUDIT_ISSUES.md M3 决策）、viewport.css/breakpoints.css（@custom-media 需构建插件）。

for (const [src, out] of FILES) {
  const css = readFileSync(`${PR}/${src}`, 'utf8')
  writeFileSync(`${OUT}/${out}`, HEADER(src) + css)
  // 打印选择器结构供核对
  const selectors = [...css.matchAll(/^([^@\s/][^{]*)\{|^(@media[^{]*)\{|^\s{0,2}(\[[^{]*|:root[^{]*)\{/gm)]
    .map((m) => (m[1] || m[2] || m[3]).trim())
    .filter(Boolean)
  console.log(`${out} <- ${src} (${css.length}B) selectors: ${[...new Set(selectors)].slice(0, 6).join(' | ')}`)
}

// typography.css 需要 base + functional 两个块拼接（base 提供 --base-text-*，functional 提供别名）
const baseTypo = readFileSync(`${PR}/base/typography/typography.css`, 'utf8')
const funcTypo = readFileSync(`${PR}/functional/typography/typography.css`, 'utf8')
writeFileSync(
  `${OUT}/typography.css`,
  HEADER('base/typography/typography.css') + baseTypo + '\n' + HEADER('functional/typography/typography.css') + funcTypo
)
console.log('typography.css <- base + functional 拼接完成')
