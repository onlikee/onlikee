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
  return page.screenshot({ fullPage: true, animations: 'disabled' })
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

test('sizes, labels, repeated loading, focus and keyboard compositions', async ({ page }) => {
  await visit(page, 5174)
  for (const [size, pixels] of [
    ['small', 16],
    ['medium', 32],
    ['large', 64],
  ] as const) {
    const box = await page.locator(`[data-size="${size}"] svg`).boundingBox()
    expect(box?.width).toBe(pixels)
    expect(box?.height).toBe(pixels)
  }
  await expect(page.locator('#standalone')).toContainText('Saving changes')
  await expect(page.locator('#save')).toHaveAccessibleName('Save')
  await expect(page.locator('#add')).toHaveAccessibleName('Add item')
  await expect(page.locator('#save')).toHaveAttribute('aria-disabled', 'true')
  const buttonBox = await page.locator('#save').boundingBox()
  await page.locator('#save').focus()
  for (let i = 0; i < 3; i++) {
    await page.keyboard.press('Alt+l')
    await expect(page.locator('#state')).toHaveText('ready')
    await expect(page.locator('#save')).toBeFocused()
    await expect(page.locator('#save')).toHaveAccessibleName('Save')
    expect(await page.locator('#save').boundingBox()).toEqual(buttonBox)
    await page.keyboard.press('Alt+l')
    await expect(page.locator('#save')).toHaveAttribute('aria-disabled', 'true')
    await expect(page.locator('#save')).toBeFocused()
  }
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
  const svg = page.locator('[data-size="small"] svg')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(svg).not.toHaveAttribute('style', /animation-delay/)
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await expect(svg).toHaveAttribute('style', /animation-delay/)
  // Upstream retains rotation under reduced motion; check actual CSS, not an invented contract.
  expect(await svg.evaluate((node) => getComputedStyle(node).animationName)).not.toBe('none')
})
