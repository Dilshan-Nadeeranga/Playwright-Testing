import { test, expect } from './fixtures';

// Uses lockedOutPage fixture — login attempted as locked_out_user, stays on login page.
// Verifies the error message is visible when locked out user attempts login.
test('Locked out user sees an error message', async ({ lockedOutPage }) => {
  const error = lockedOutPage.locator('[data-test="error"]');
  await expect(error).toBeVisible();
});

// Verifies the error message text is "Sorry, this user has been locked out".
test('Error message contains the correct text', async ({ lockedOutPage }) => {
  const error = lockedOutPage.locator('[data-test="error"]');
  await expect(error).toContainText('Sorry, this user has been locked out');
});

// Verifies the URL remains on the login page after failed login.
test('Locked out user stays on the login page', async ({ lockedOutPage }) => {
  await expect(lockedOutPage).toHaveURL('https://www.saucedemo.com/');
});

// Verifies the inventory list is not visible on the login page.
test('Locked out user does not see the inventory list', async ({ lockedOutPage }) => {
  const inventory = lockedOutPage.locator('.inventory_list');
  await expect(inventory).not.toBeVisible();
});

// Clicks the error close button and verifies the error message is hidden.
test('Error message can be dismissed with the close button', async ({ lockedOutPage }) => {
  const closeBtn = lockedOutPage.locator('[data-test="error-button"]');
  await closeBtn.click();

  const error = lockedOutPage.locator('[data-test="error"]');
  await expect(error).not.toBeVisible();
});

// Verifies the login button remains visible and enabled after the error is shown.
test('Login button is still visible and enabled after the error', async ({ lockedOutPage }) => {
  const loginBtn = lockedOutPage.locator('#login-button');
  await expect(loginBtn).toBeVisible();
  await expect(loginBtn).toBeEnabled();
});
