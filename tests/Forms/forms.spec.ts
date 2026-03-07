import { test, expect } from '@playwright/test';

const URL      = 'https://www.saucedemo.com/';
const USER     = 'standard_user';
const PASSWORD = 'secret_sauce';

async function loginAndOpenCheckout(page: import('@playwright/test').Page) {
  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await page.fill('#user-name', USER);
  await page.fill('#password', PASSWORD);
  await page.click('#login-button');
  await page.waitForURL(/inventory/);
  // Wait for the inventory list to be present before interacting — fixes Firefox flakiness
  await page.waitForSelector('.inventory_list');
  await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
  await page.click('.shopping_cart_link');
  await page.waitForURL(/cart/);
  await page.click('[data-test="checkout"]');
  await page.waitForURL(/checkout-step-one/);
  // Wait for the form to be ready before tests interact with it
  await page.waitForSelector('[data-test="firstName"]');
}

// ─── Login Form ────────────────────────────────────────────────────────────────

test('Login form — input fields accept text and have correct types', async ({ page }) => {
  await page.goto(URL, { waitUntil: 'domcontentloaded' });

  // Verify field types so assistive tech and password managers work correctly
  await expect(page.locator('#user-name')).toHaveAttribute('type', 'text');
  await expect(page.locator('#password')).toHaveAttribute('type', 'password');

  // Fill and verify the typed values are retained — toHaveValue checks the DOM value
  await page.fill('#user-name', 'standard_user');
  await page.fill('#password', 'secret_sauce');
  await expect(page.locator('#user-name')).toHaveValue('standard_user');
  await expect(page.locator('#password')).toHaveValue('secret_sauce');
});

test('Login form — empty submission shows validation error', async ({ page }) => {
  await page.goto(URL, { waitUntil: 'domcontentloaded' });

  // Submit without typing anything — the site should block login and show an error
  await page.click('#login-button');

  const error = page.locator('[data-test="error"]');
  await expect(error).toBeVisible();
  await expect(error).toContainText('Username is required');
});

test('Login form — username only (no password) shows error', async ({ page }) => {
  await page.goto(URL, { waitUntil: 'domcontentloaded' });

  await page.fill('#user-name', 'standard_user');
  await page.click('#login-button');

  const error = page.locator('[data-test="error"]');
  await expect(error).toBeVisible();
  await expect(error).toContainText('Password is required');
});

test('Login form — error can be dismissed with the X button', async ({ page }) => {
  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await page.fill('#user-name', 'bad_user');
  await page.fill('#password', 'bad_pass');
  await page.click('#login-button');

  const error = page.locator('[data-test="error"]');
  await expect(error).toBeVisible();

  // Click the close (X) button on the error banner
  await page.click('[data-test="error-button"]');
  await expect(error).not.toBeVisible();
});

// ─── Checkout Form (Step 1) ────────────────────────────────────────────────────

test('Checkout form — all fields accept input and retain values', async ({ page }) => {
  await loginAndOpenCheckout(page);

  await page.fill('[data-test="firstName"]', 'Jane');
  await page.fill('[data-test="lastName"]', 'Doe');
  await page.fill('[data-test="postalCode"]', '10001');

  // toHaveValue confirms the form fields actually hold what was typed
  await expect(page.locator('[data-test="firstName"]')).toHaveValue('Jane');
  await expect(page.locator('[data-test="lastName"]')).toHaveValue('Doe');
  await expect(page.locator('[data-test="postalCode"]')).toHaveValue('10001');
});

test('Checkout form — submitting empty fields shows error', async ({ page }) => {
  await loginAndOpenCheckout(page);

  // Hit Continue without filling in any field
  await page.click('[data-test="continue"]');

  const error = page.locator('[data-test="error"]');
  await expect(error).toBeVisible();
  await expect(error).toContainText('First Name is required');
});

test('Checkout form — missing last name shows validation error', async ({ page }) => {
  await loginAndOpenCheckout(page);

  await page.fill('[data-test="firstName"]', 'Jane');
  // deliberately skip lastName
  await page.fill('[data-test="postalCode"]', '10001');
  await page.click('[data-test="continue"]');

  const error = page.locator('[data-test="error"]');
  await expect(error).toBeVisible();
  await expect(error).toContainText('Last Name is required');
});

test('Checkout form — missing postal code shows validation error', async ({ page }) => {
  await loginAndOpenCheckout(page);

  await page.fill('[data-test="firstName"]', 'Jane');
  await page.fill('[data-test="lastName"]', 'Doe');
  // deliberately skip postalCode
  await page.click('[data-test="continue"]');

  const error = page.locator('[data-test="error"]');
  await expect(error).toBeVisible();
  await expect(error).toContainText('Postal Code is required');
});

test('Checkout form — valid data proceeds to order summary (step 2)', async ({ page }) => {
  await loginAndOpenCheckout(page);

  await page.fill('[data-test="firstName"]', 'Jane');
  await page.fill('[data-test="lastName"]', 'Doe');
  await page.fill('[data-test="postalCode"]', '10001');
  await page.click('[data-test="continue"]');

  // Successful form submission advances to step 2
  await expect(page).toHaveURL(/checkout-step-two/);
  // The order summary should list the item we added
  await expect(page.locator('.inventory_item_name')).toContainText('Sauce Labs Backpack');
});

test('Checkout form — Cancel button returns to cart without submitting', async ({ page }) => {
  await loginAndOpenCheckout(page);

  // Type something to prove the form is abandoned on cancel
  await page.fill('[data-test="firstName"]', 'Abandoned');
  await page.click('[data-test="cancel"]');

  // Should be back on the cart page, not checkout
  await expect(page).toHaveURL(/cart/);
  await expect(page.locator('.cart_item')).toHaveCount(1);
});
