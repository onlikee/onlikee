import { test, expect, type Page, type TestInfo } from '@playwright/test'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'

async function visit(page: Page, port: number, theme = 'light', mode = 'body') {
  // No application login, API, production service or remote font is needed.
  await page.route('**/*', (route) => {
    const host = new URL(route.request().url()).hostname
    return host === '127.0.0.1' ? route.continue() : route.abort()
  })
  await page.goto(`http://127.0.0.1:${port}/e2e/spinner/?theme=${theme}&mode=${mode}`)
  await expect(page.locator('#state')).toHaveText('loading')
  await expect(page.locator('#delay [data-component="Spinner"]')).toBeVisible()
  await page.evaluate(() => document.fonts.ready)
}
async function capture(page: Page, clearFocus = true) {
  // Freeze only for image comparison, not while checking real motion behavior.
  await page.addStyleTag({
    content:
      '[data-component="Spinner"] svg { animation-delay: 0ms !important; animation-play-state: paused !important; } * { caret-color: transparent !important; }',
  })
  if (clearFocus) await page.locator('h1').click()
  let previous = await page.screenshot({ fullPage: true, animations: 'disabled' })
  // Wait for asynchronous overlay focus/scroll/layout work to settle. Never accept a
  // head/base mismatch: this only establishes that each page is stable on its own.
  for (let attempt = 0; attempt < 10; attempt++) {
    await page.evaluate(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        ),
    )
    const current = await page.screenshot({ fullPage: true, animations: 'disabled' })
    if (current.equals(previous)) return current
    previous = current
  }
  throw new Error('Screenshot did not stabilize in 10 consecutive captures')
}
async function compare(base: Page, head: Page, info: TestInfo, name: string, clearFocus = true) {
  const expected = await capture(base, clearFocus)
  const actual = await capture(head, clearFocus)
  const file = info.snapshotPath(`${name}.png`)
  await mkdir(dirname(file), { recursive: true })
  // The reference is always rendered from the separately checked-out PR base.
  await writeFile(file, expected)
  await info.attach(`${name}-base`, { body: expected, contentType: 'image/png' })
  await info.attach(`${name}-head`, { body: actual, contentType: 'image/png' })
  expect(actual).toMatchSnapshot(`${name}.png`, { maxDiffPixels: 0 })
}
for (const theme of ['light', 'dark']) {
  for (const motion of ['no-preference', 'reduce'] as const) {
    for (const mode of ['body', 'input']) {
      test(`visual ${theme} ${motion} ${mode}`, async ({ page, context }, info) => {
        const base = await context.newPage()
        const errors: string[] = []
        for (const p of [base, page]) {
          p.on('pageerror', (error) => errors.push(error.message))
          await p.emulateMedia({ reducedMotion: motion })
        }
        await visit(base, 5175, theme, mode)
        await visit(page, 5174, theme, mode)
        await compare(base, page, info, 'loading')
        for (const p of [base, page]) {
          await p.locator('#toggle').click()
          await expect(p.locator('#state')).toHaveText('ready')
        }
        await compare(base, page, info, 'ready')
        for (const p of [base, page]) await p.locator('#panel button').click()
        await expect(page.getByRole('dialog')).toBeVisible()
        await expect(base.getByRole('dialog')).toBeVisible()
        await compare(base, page, info, 'panel-ready', false)
        for (const p of [base, page]) {
          await p.keyboard.press('Alt+l')
          await expect(p.locator('#state')).toHaveText('loading')
        }
        await compare(base, page, info, 'panel-loading', false)
        expect(errors).toEqual([])
        await base.close()
      })
    }
  }
}

test('sizes, transform geometry and accessible names', async ({ page }) => {
  await visit(page, 5174)
  for (const [size, pixels] of [
    ['small', 16],
    ['medium', 32],
    ['large', 64],
  ] as const) {
    const dimensions = await page
      .locator(`#standalone [data-size="${size}"] svg`)
      .evaluate((svg) => {
        const style = getComputedStyle(svg)
        const wrapper = svg.parentElement!.getBoundingClientRect()
        const rotated = svg.getBoundingClientRect()
        const matrix = new DOMMatrix(style.transform)
        return {
          width: parseFloat(style.width),
          height: parseFloat(style.height),
          wrapperWidth: wrapper.width,
          wrapperHeight: wrapper.height,
          rotatedWidth: rotated.width,
          projectedWidth:
            Math.abs(matrix.a) * parseFloat(style.width) +
            Math.abs(matrix.c) * parseFloat(style.height),
        }
      })
    expect(dimensions.width).toBe(pixels)
    expect(dimensions.height).toBe(pixels)
    expect(dimensions.wrapperWidth).toBe(pixels)
    expect(dimensions.wrapperHeight).toBe(pixels)
    // Confirm the earlier AABB measurement reflects rotation rather than layout growth.
    expect(dimensions.rotatedWidth).toBeCloseTo(dimensions.projectedWidth, 1)
  }
  await expect(page.locator('#standalone')).toContainText('Saving changes')
  await expect(page.locator('#save')).toHaveAccessibleName('Save')
  await expect(page.locator('#add')).toHaveAccessibleName('Add item')
  await expect(page.locator('#save')).toHaveAttribute('aria-disabled', 'true')
})

test('Button and IconButton repeated loading preserves names and focus', async ({ page }) => {
  await visit(page, 5174)
  for (const [id, name] of [
    ['save', 'Save'],
    ['add', 'Add item'],
  ] as const) {
    const button = page.locator(`#${id}`)
    await button.focus()
    const initial = await button.boundingBox()
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('Alt+l')
      await expect(page.locator('#state')).toHaveText('ready')
      await expect(button).toBeFocused()
      await expect(button).toHaveAccessibleName(name)
      const ready = await button.boundingBox()
      expect(ready?.width).toBe(initial?.width)
      expect(ready?.height).toBe(initial?.height)
      await page.keyboard.press('Alt+l')
      await expect(button).toHaveAttribute('aria-disabled', 'true')
      await expect(button).toHaveAccessibleName(name)
      await expect(button).toBeFocused()
    }
  }
})

test('input and token loading preserves focus and typed values', async ({ page }) => {
  await visit(page, 5174)
  for (const id of [
    'input-auto',
    'input-leading',
    'input-trailing',
    'plain',
    'tokens-auto',
    'tokens-leading',
    'tokens-trailing',
  ]) {
    const input = page.locator(`#${id}`)
    await input.fill('Preserved')
    for (let i = 0; i < 2; i++) {
      await page.keyboard.press('Alt+l')
      await expect(input).toBeFocused()
      await expect(input).toHaveValue('Preserved')
      await page.keyboard.press('Alt+l')
      await expect(input).toBeFocused()
      await expect(input).toHaveValue('Preserved')
    }
  }
})

test('list keyboard navigation and panel loading/reopen restores focus', async ({ page }) => {
  await visit(page, 5174)
  await page.keyboard.press('Alt+l')
  await expect(page.locator('#state')).toHaveText('ready')
  const autocomplete = page.locator('#auto-input')
  await autocomplete.focus()
  await autocomplete.press('ArrowDown')
  await expect(autocomplete).toBeFocused()
  await expect(autocomplete).toHaveAttribute('aria-activedescendant', /.+/)
  const filtered = page.locator('#filtered input')
  await filtered.focus()
  await filtered.press('ArrowDown')
  await expect(filtered).toBeFocused()
  await expect(filtered).toHaveAttribute('aria-activedescendant', /.+/)
  const anchor = page.locator('#panel button')
  for (let i = 0; i < 2; i++) {
    await anchor.click()
    await expect(page.getByRole('dialog')).toBeVisible()
    const input = page.getByRole('dialog').locator('input')
    await input.fill('Al')
    await page.keyboard.press('Alt+l')
    await expect(input).toBeFocused()
    await page.keyboard.press('Alt+l')
    await expect(input).toBeFocused()
    await input.press('Escape')
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await expect(anchor).toBeFocused()
  }
})

test('delayed remount and live reduced-motion preference', async ({ page }) => {
  await visit(page, 5174)
  await page.clock.install()
  await page.clock.pauseAt(new Date())
  await page.locator('#restart').click()
  await expect(page.locator('#delay [data-component="Spinner"]')).toHaveCount(0)
  await page.clock.runFor(499)
  await expect(page.locator('#delay [data-component="Spinner"]')).toHaveCount(0)
  await page.clock.runFor(1)
  await expect(page.locator('#delay [data-component="Spinner"]')).toBeVisible()
  const svg = page.locator('#standalone [data-size="small"] svg')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(svg).not.toHaveAttribute('style', /animation-delay/)
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await expect(svg).toHaveAttribute('style', /animation-delay/)
  // Upstream retains rotation under reduced motion; check actual CSS, not an invented contract.
  expect(await svg.evaluate((node) => getComputedStyle(node).animationName)).not.toBe('none')
})
