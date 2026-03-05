import { test, expect } from '@playwright/test';

const URL      = 'https://www.saucedemo.com/';
const USER     = 'standard_user';
const PASSWORD = 'secret_sauce';

test('Full purchase workflow with named steps', async ({ page }) => {
  // test.step() groups actions into named blocks visible in the HTML report
  await test.step('Navigate to Saucedemo', async () => {
    await page.goto(URL, { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveTitle(/Swag Labs/);
  });

  await test.step('Login with standard_user', async () => {
    await page.fill('#user-name', USER);
    await page.fill('#password', PASSWORD);
    await page.click('#login-button');
    await expect(page).toHaveURL(/inventory/);
  });

  await test.step('Add Sauce Labs Backpack to cart', async () => {
    await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
    await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
  });

  await test.step('Navigate to cart', async () => {
    await page.click('.shopping_cart_link');
    await expect(page).toHaveURL(/cart/);
    await expect(page.locator('.cart_item')).toHaveCount(1);
  });

  await test.step('Start checkout', async () => {
    await page.click('[data-test="checkout"]');
    await expect(page).toHaveURL(/checkout-step-one/);
  });

  await test.step('Fill in personal information', async () => {
    await page.fill('[data-test="firstName"]', 'Jane');
    await page.fill('[data-test="lastName"]', 'Doe');
    await page.fill('[data-test="postalCode"]', '10001');
    await page.click('[data-test="continue"]');
    await expect(page).toHaveURL(/checkout-step-two/);
  });

  await test.step('Review order and complete purchase', async () => {
    await expect(page.locator('.inventory_item_name')).toContainText('Sauce Labs Backpack');
    await page.click('[data-test="finish"]');
    await expect(page).toHaveURL(/checkout-complete/);
  });

  await test.step('Verify thank-you confirmation', async () => {
    const header = page.locator('.complete-header');
    await expect(header).toHaveText('Thank you for your order!');
  });
});

test('Annotations — link test to issue and feature', async ({ page }) => {
  // test.info().annotations attaches metadata visible in the HTML report detail panel
  test.info().annotations.push(
    { type: 'issue',   description: 'https://github.com/example/repo/issues/12' },
    { type: 'feature', description: 'Shopping cart — add/remove items' },
    { type: 'env',     description: `Browser: ${test.info().project.name}` },
  );

  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await page.fill('#user-name', USER);
  await page.fill('#password', PASSWORD);
  await page.click('#login-button');

  await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
  await page.click('[data-test="add-to-cart-sauce-labs-bike-light"]');

  const count = await page.locator('.shopping_cart_badge').textContent();
  test.info().annotations.push({
    type: 'info',
    description: `Cart badge value observed: ${count}`,
  });

  await expect(page.locator('.shopping_cart_badge')).toHaveText('2');
});

test('Manual screenshot attachments at key moments', async ({ page }) => {
  await page.goto(URL, { waitUntil: 'domcontentloaded' });

  // test.info().attach() embeds the screenshot in the HTML report as a clickable attachment
  const loginScreenshot = await page.screenshot();
  await test.info().attach('01 — Login page', {
    body: loginScreenshot,
    contentType: 'image/png',
  });

  await page.fill('#user-name', USER);
  await page.fill('#password', PASSWORD);
  await page.click('#login-button');
  await expect(page).toHaveURL(/inventory/);

  const inventoryScreenshot = await page.screenshot();
  await test.info().attach('02 — Inventory page after login', {
    body: inventoryScreenshot,
    contentType: 'image/png',
  });

  await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');

  const cartScreenshot = await page.screenshot();
  await test.info().attach('03 — Item added to cart', {
    body: cartScreenshot,
    contentType: 'image/png',
  });

  await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
});

test('Expected failure — automatic screenshot on failure', async ({ page }) => {
  // test.fail() marks this as an expected failure — stays green in CI while showing a failure screenshot
  test.fail(true, 'Intentionally failing to demonstrate automatic failure screenshot');

  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await page.fill('#user-name', USER);
  await page.fill('#password', PASSWORD);
  await page.click('#login-button');

  await expect(page.locator('.inventory_item')).toHaveCount(999);
});

test('Boxed steps — cleaner error attribution in reports', async ({ page }) => {
  async function verifyProductVisible(name: string) {
    // { box: true } makes errors point to this step call, not the inner assertion line
    await test.step(`Verify "${name}" is visible on inventory page`, async () => {
      await expect(page.locator('.inventory_item_name').filter({ hasText: name })).toBeVisible();
    }, { box: true });
  }

  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await page.fill('#user-name', USER);
  await page.fill('#password', PASSWORD);
  await page.click('#login-button');

  await verifyProductVisible('Sauce Labs Backpack');
  await verifyProductVisible('Sauce Labs Bike Light');
  await verifyProductVisible('Sauce Labs Bolt T-Shirt');
});

test('Reporting summary — how to view each reporter output', async ({ page }) => {
  test.info().annotations.push({
    type: 'reporters',
    description: 'list (terminal) | html (playwright-report/) | json (test-results.json)',
  });

  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveTitle(/Swag Labs/);
});
