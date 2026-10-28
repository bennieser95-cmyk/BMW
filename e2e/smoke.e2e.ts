import { randomUUID } from 'node:crypto'

import { expect, test } from './fixtures'

import type { Page } from '@playwright/test'

async function rejectConsent(page: Page) {
  await page.getByRole('button', { name: 'Ablehnen' }).click()
}

test('home navigation opens and a model can be selected @smoke', async ({ page }) => {
  await page.goto('/de-de')
  await rejectConsent(page)

  const navigation = page.getByRole('navigation', { name: 'Hauptnavigation' })
  await navigation.getByText('Modelle', { exact: true }).click()
  await navigation.getByRole('link', { name: 'Fahrzeuge entdecken' }).click()
  await expect(page.getByRole('heading', { name: 'Fahrzeuge entdecken' })).toBeVisible()

  await page.getByRole('link', { name: /Aurelia One/ }).click()
  await expect(page.getByRole('heading', { name: 'Aurelia One' })).toBeVisible()
})

test('model filters and sort state survive a shared URL reload @smoke', async ({ page }) => {
  await page.goto('/de-de/modelle')
  await rejectConsent(page)

  await page.getByLabel('Antrieb').selectOption('elektro')
  await expect(page).toHaveURL(/antrieb=elektro/)
  await expect(page.getByRole('link', { name: /Aurelia One/ })).toBeVisible()
  await expect(page.getByRole('link', { name: /Montara/ })).toHaveCount(0)

  await page.getByLabel('Sortieren nach').selectOption('priceAsc')
  await expect(page).toHaveURL(/sort=priceAsc/)
  const sharedUrl = page.url()
  const sharedPage = await page.context().newPage()
  await sharedPage.goto(sharedUrl)

  await expect(sharedPage.getByLabel('Antrieb')).toHaveValue('elektro')
  await expect(sharedPage.getByLabel('Sortieren nach')).toHaveValue('priceAsc')
  await expect(sharedPage.getByRole('link', { name: /Aurelia One/ })).toBeVisible()
})

test('vehicle configuration updates price and can be shared @smoke', async ({
  page,
  browserName,
}) => {
  await page.goto('/de-de/konfigurator/aurelia')
  await rejectConsent(page)

  const totalPrice = page.locator('.config-price strong')
  const startingPrice = await totalPrice.textContent()
  await page.getByRole('button', { name: /Brooklyn Grey/ }).click()
  await page.getByRole('button', { name: 'Weiter' }).click()
  await page.getByRole('button', { name: /Sport 20 Zoll/ }).click()
  await expect(totalPrice).not.toHaveText(startingPrice ?? '')

  for (let step = 0; step < 3; step += 1) {
    await page.getByRole('button', { name: 'Weiter' }).click()
  }
  await expect(page.getByText('Konfigurationscode')).toBeVisible()

  if (browserName === 'chromium') {
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write'])
    await page.getByRole('button', { name: 'Konfiguration teilen' }).click()
    await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toContain('cfg=')
  }
})

test('guest account access redirects to sign-in and preserves configuration @smoke', async ({
  page,
}) => {
  await page.goto('/de-de/konto?model=aurelia&cfg=sample-code')

  await expect(page).toHaveURL(/\/auth\/sign-in\?returnTo=/)
  await expect(page.getByText(/cfg=sample-code/)).toBeVisible()
})

test('dealer search and test-drive lead include validation and success paths @smoke', async ({
  page,
}) => {
  await page.goto('/de-de/haendler')
  await rejectConsent(page)
  await page.getByLabel('PLZ oder Ort').fill('München')
  await page.getByRole('button', { name: 'Händler suchen' }).click()
  await expect(page).toHaveURL(/q=M%C3%BCnchen/)
  await expect(page.getByRole('heading', { name: 'BAVARIA Studio München' })).toBeVisible()

  await page.goto('/de-de/probefahrt')
  await page.getByRole('button', { name: 'Weiter' }).click()
  await expect(page.getByRole('alert')).toBeVisible()

  await page.getByLabel('Modell').selectOption('aurelia')
  await page.getByRole('button', { name: 'Weiter' }).click()
  await page
    .getByLabel('Wunschtermin')
    .fill(new Date(Date.now() + 86_400_000).toISOString().slice(0, 10))
  await page.getByLabel('Händler').selectOption('dealer-munich')
  await page.getByRole('button', { name: 'Weiter' }).click()

  await page.getByLabel('Vorname').fill('E2E')
  await page.getByLabel('Nachname').fill(`Run-${randomUUID().slice(0, 8)}`)
  await page.getByLabel('E-Mail-Adresse').fill(`e2e-${randomUUID()}@example.test`)
  await page
    .getByRole('checkbox', {
      name: 'Ich stimme der Verarbeitung meiner Angaben zur Bearbeitung der Anfrage zu.',
    })
    .check()
  await page.getByRole('button', { name: 'Anfrage senden' }).click()
  await expect(page.getByRole('status')).toContainText('Ihre Anfrage wurde vorgemerkt')
})

test('rejecting optional consent prevents tracking requests @smoke', async ({ page }) => {
  const trackingRequests: string[] = []
  page.on('request', (request) => {
    if (
      /google-analytics|googletagmanager|segment\.io|mixpanel|amplitude|hotjar|doubleclick|facebook\.net/i.test(
        request.url(),
      )
    ) {
      trackingRequests.push(request.url())
    }
  })

  await page.goto('/de-de')
  await rejectConsent(page)
  await expect
    .poll(() =>
      page.evaluate(() => {
        const consent = JSON.parse(window.localStorage.getItem('bavaria-consent') ?? '{}')
        return consent.statistics === false && consent.marketing === false
      }),
    )
    .toBe(true)

  await page.goto('/de-de/modelle')
  await page.getByLabel('Antrieb').selectOption('elektro')
  await expect(page).toHaveURL(/antrieb=elektro/)
  expect(trackingRequests).toEqual([])
})

test('locale switch updates language, hreflang, and canonical @smoke', async ({ page }) => {
  await page.goto('/de-de/modelle/aurelia')
  await rejectConsent(page)

  await expect(page.locator('html')).toHaveAttribute('lang', 'de-DE')
  await page.getByRole('link', { name: 'Sprache' }).click()
  await expect(page).toHaveURL(/\/en-gb\/modelle\/aurelia/)
  await expect(page.locator('html')).toHaveAttribute('lang', 'en-GB')
  await expect(page.locator('link[rel="alternate"][hreflang="de-DE"]')).toHaveAttribute(
    'href',
    /\/de-de$/,
  )
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    /\/en-gb\/modelle\/aurelia$/,
  )
})
