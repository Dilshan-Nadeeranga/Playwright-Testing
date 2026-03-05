import { test, expect } from '@playwright/test';

const URL = 'https://www.saucedemo.com/';

test('User can login successfully — toHaveURL', async ({ page }) => {
  await page.goto(URL, { waitUntil: 'domcontentloaded' });

  await page.fill('#user-name', 'standard_user');
  await page.fill('#password', 'secret_sauce');
  await page.click('#login-button');

  await expect(page).toHaveURL(/inventory/);
});

test('User sees 6 products after login — toHaveCount', async ({ page }) => {
  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await page.fill('#user-name', 'standard_user');
  await page.fill('#password', 'secret_sauce');
  await page.click('#login-button');

  const products = page.locator('.inventory_item');
  await expect(products).toHaveCount(6);
});

test('Wrong password shows error message — toBeVisible + toContainText', async ({ page }) => {
  await page.goto(URL, { waitUntil: 'domcontentloaded' });

  await page.fill('#user-name', 'standard_user');
  await page.fill('#password', 'wrong_password');
  await page.click('#login-button');

  const error = page.locator('[data-test="error"]');
  await expect(error).toBeVisible();
  await expect(error).toContainText('Username and password do not match');
});

test('Login inputs have correct placeholder text — toHaveAttribute', async ({ page }) => {
  await page.goto(URL, { waitUntil: 'domcontentloaded' });

  await expect(page.locator('#user-name')).toHaveAttribute('placeholder', 'Username');
  await expect(page.locator('#password')).toHaveAttribute('placeholder', 'Password');
});

test('Login button is visible and enabled — toBeEnabled', async ({ page }) => {
  await page.goto(URL, { waitUntil: 'domcontentloaded' });

  const loginBtn = page.locator('#login-button');
  await expect(loginBtn).toBeVisible();
  await expect(loginBtn).toBeEnabled();
});

test('Soft assertions — check multiple login-page states at once', async ({ page }) => {
  await page.goto(URL, { waitUntil: 'domcontentloaded' });

  // expect.soft() records a failure but does NOT stop the test — all checks run
  await expect.soft(page.locator('#user-name')).toBeVisible();
  await expect.soft(page.locator('#password')).toBeVisible();
  await expect.soft(page.locator('#login-button')).toBeEnabled();
  await expect.soft(page).toHaveTitle(/Swag Labs/);

  await expect(page.locator('.login_logo')).toBeVisible();
});
