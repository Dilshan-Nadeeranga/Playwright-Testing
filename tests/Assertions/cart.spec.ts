import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('https://www.saucedemo.com/', { waitUntil: 'domcontentloaded' });
  await page.fill('#user-name', 'standard_user');
  await page.fill('#password', 'secret_sauce');
  await page.click('#login-button');
});

test('Cart badge updates when item is added — toHaveText', async ({ page }) => {
  await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');

  const badge = page.locator('.shopping_cart_badge');
  await expect(badge).toBeVisible();
  await expect(badge).toHaveText('1');
});

test('Cart page shows the added item — toHaveCount + toContainText', async ({ page }) => {
  await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
  await page.click('.shopping_cart_link');

  const cartItem = page.locator('.cart_item');
  await expect(cartItem).toHaveCount(1);
  await expect(cartItem).toContainText('Sauce Labs Backpack');
});

test('Cart is empty after removing item — toHaveCount(0)', async ({ page }) => {
  await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
  await page.click('.shopping_cart_link');
  await page.click('[data-test="remove-sauce-labs-backpack"]');

  const cartItems = page.locator('.cart_item');
  await expect(cartItems).toHaveCount(0);
});

test('Checkout button is visible in the cart — toBeVisible + toBeEnabled', async ({ page }) => {
  await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
  await page.click('.shopping_cart_link');

  const checkoutBtn = page.locator('[data-test="checkout"]');
  await expect(checkoutBtn).toBeVisible();
  await expect(checkoutBtn).toBeEnabled();
});

test('Cart badge disappears after removing all items — not.toBeVisible', async ({ page }) => {
  await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
  await expect(page.locator('.shopping_cart_badge')).toBeVisible();

  await page.click('[data-test="remove-sauce-labs-backpack"]');
  await expect(page.locator('.shopping_cart_badge')).not.toBeVisible();
});
