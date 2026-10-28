import { expect, test } from './fixtures'

test('home exposes basic accessible landmarks and names @a11y', async ({ page }) => {
  await page.goto('/de-de')
  await page.getByRole('button', { name: 'Ablehnen' }).click()

  await expect(page.getByRole('main')).toBeVisible()
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(page.locator('img:not([alt])')).toHaveCount(0)
  const buttonsHaveNames = await page.locator('button').evaluateAll((buttons) =>
    buttons.every((button) =>
      Boolean(button.getAttribute('aria-label')?.trim() || button.textContent?.trim()),
    ),
  )
  expect(buttonsHaveNames).toBe(true)
})

test('home visual baseline is stable @visual', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'Visual baseline is maintained in Chromium.')
  await page.goto('/de-de')
  await page.getByRole('button', { name: 'Ablehnen' }).click()
  await expect(page).toHaveScreenshot('home-de-de.png', {
    animations: 'disabled',
    fullPage: true,
  })
})
