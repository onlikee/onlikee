// 比对 vendored 主题 token 与 @primer/primitives 11.5.1 权威值
// 用法: node scripts/compare-theme-tokens.mjs
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const PRIMITIVES = 'C:/Users/25336/Desktop/project/react/node_modules/@primer/primitives/dist/css/functional/themes'
const VENDORED = fileURLToPath(new URL('../src/css/themes', import.meta.url))

function parseTokens(css) {
  const tokens = new Map()
  // 只取声明，忽略选择器上下文（同名 token 多处定义应一致）
  const re = /(--[\w-]+)\s*:\s*([^;]+);/g
  let m
  while ((m = re.exec(css))) {
    const name = m[1]
    const value = m[2].replace(/\/\*[\s\S]*?\*\//g, '').trim().replace(/\s+/g, ' ')
    const prev = tokens.get(name)
    if (prev !== undefined && prev !== value) {
      console.log(`  [warn] ${name} 在文件内多处定义且值不同:\n    A: ${prev}\n    B: ${value}`)
    }
    tokens.set(name, value)
  }
  return tokens
}

function normalize(v) {
  // 0px → 0；小写；压缩空白；#abcDEF 小写
  return v
    .toLowerCase()
    .replace(/\b0px\b/g, '0')
    .replace(/,\s*/g, ', ')
    .trim()
}

let driftCount = 0
for (const theme of ['light', 'dark']) {
  const canon = parseTokens(readFileSync(`${PRIMITIVES}/${theme}.css`, 'utf8'))
  const vend = parseTokens(readFileSync(`${VENDORED}/${theme}.css`, 'utf8'))
  console.log(`\n===== ${theme}.css : canon=${canon.size} vendored=${vend.size} =====`)
  const missing = []
  const drifted = []
  for (const [name, value] of canon) {
    if (!vend.has(name)) missing.push(name)
    else if (normalize(vend.get(name)) !== normalize(value)) {
      drifted.push(`  ${name}\n    vendored: ${vend.get(name)}\n    canon   : ${value}`)
    }
  }
  const extra = [...vend.keys()].filter((n) => !canon.has(n))
  if (missing.length) console.log(`MISSING (${missing.length}): ${missing.join(', ')}`)
  if (drifted.length) {
    console.log(`DRIFTED (${drifted.length}):`)
    for (const d of drifted) console.log(d)
  }
  if (extra.length) console.log(`EXTRA/别名 (${extra.length}): ${extra.join(', ')}`)
  driftCount += missing.length + drifted.length
}
console.log(`\n合计需修复: ${driftCount}`)
