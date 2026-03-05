import { test, expect } from './fixtures';

test('Locked out user sees an error message', async ({ lockedOutPage }) => {
  const error = lockedOutPage.locator('[data-test="error"]');
  await expect(error).toBeVisible();
});

test('Error message contains the correct text', async ({ lockedOutPage }) => {
  const error = lockedOutPage.locator('[data-test="error"]');
  await expect(error).toContainText('Sorry, this user has been locked out');
});

test('Locked out user stays on the login page', async ({ lockedOutPage }) => {
  await expect(lockedOutPage).toHaveURL('https://www.saucedemo.com/');
});

test('Locked out user does not see the inventory list', async ({ lockedOutPage }) => {
  const inventory = lockedOutPage.locator('.inventory_list');
  await expect(inventory).not.toBeVisible();
});

test('Error message can be dismissed with the close button', async ({ lockedOutPage }) => {
  const closeBtn = lockedOutPage.locator('[data-test="error-button"]');
  await closeBtn.click();

  const error = lockedOutPage.locator('[data-test="error"]');
  await expect(error).not.toBeVisible();
});

test('Login button is still visible and enabled after the error', async ({ lockedOutPage }) => {
  const loginBtn = lockedOutPage.locator('#login-button');
  await expect(loginBtn).toBeVisible();
  await expect(loginBtn).toBeEnabled();
});
