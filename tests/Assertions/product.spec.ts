import { test, expect } from '@playwright/test';

// Runs before every test in this file — logs in and lands on the inventory page
test.beforeEach(async ({ page }) => {
  await page.goto('https://www.saucedemo.com/', { waitUntil: 'domcontentloaded' });
  await page.fill('#user-name', 'standard_user');
  await page.fill('#password', 'secret_sauce');
  await page.click('#login-button');
});

test('Product detail page has a visible title — toBeVisible + not.toBeEmpty', async ({ page }) => {
  await page.click('.inventory_item_name >> nth=0'); // >> nth=0 selects the first matching element

  const productName = page.locator('.inventory_details_name');
  await expect(productName).toBeVisible();
  await expect(productName).not.toBeEmpty();
});

test('Product detail page shows a price — toContainText', async ({ page }) => {
  await page.click('.inventory_item_name >> nth=0'); // >> nth=0 selects the first matching element

  const price = page.locator('.inventory_details_price');
  await expect(price).toBeVisible();
  await expect(price).toContainText('$');
});

test('Product detail page has an Add to Cart button — toBeEnabled', async ({ page }) => {
  await page.click('.inventory_item_name >> nth=0'); // >> nth=0 selects the first matching element

  const addToCartBtn = page.locator('button[data-test^="add-to-cart"]');
  await expect(addToCartBtn).toBeVisible();
  await expect(addToCartBtn).toBeEnabled();
});

test('Products are sorted alphabetically (A-Z) by default', async ({ page }) => {
  const names = page.locator('.inventory_item_name');
  const count = await names.count();

  const allNames: string[] = [];
  for (let i = 0; i < count; i++) {
    allNames.push(await names.nth(i).innerText());
  }

  const sorted = [...allNames].sort();
  expect(allNames).toEqual(sorted);
});

test('Product images are visible on the inventory page — toBeVisible', async ({ page }) => {
  const images = page.locator('.inventory_item_img img');
  const count = await images.count();

  for (let i = 0; i < count; i++) {
    await expect(images.nth(i)).toBeVisible();
  }
});
