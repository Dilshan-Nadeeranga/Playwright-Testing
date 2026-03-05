import { test as base, type Page } from '@playwright/test';

const URL      = 'https://www.saucedemo.com/';
const USER     = 'standard_user';
const PASSWORD = 'secret_sauce';

async function login(page: Page) {
  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await page.fill('#user-name', USER);
  await page.fill('#password', PASSWORD);
  await page.click('#login-button');
  await page.waitForURL(/inventory/);
  await page.waitForLoadState('domcontentloaded');
}

type MyFixtures = {
  loggedInPage: Page;
  cartPage: Page;
  checkoutPage: Page;
  productDetailPage: Page;
  lockedOutPage: Page;
  multiCartPage: Page;
};

// test.extend() adds custom fixtures to Playwright's built-in ones.
// Each fixture runs setup code, calls use(page) to hand the page to the test,
// then Playwright automatically resets the browser context after each test.
export const test = base.extend<MyFixtures>({

  loggedInPage: async ({ page }, use) => {
    await login(page);
    await use(page);
  },

  cartPage: async ({ page }, use) => {
    await login(page);
    await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
    await page.click('.shopping_cart_link');
    await use(page);
  },

  checkoutPage: async ({ page }, use) => {
    await login(page);
    await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
    await page.click('.shopping_cart_link');
    await page.click('[data-test="checkout"]');
    await use(page);
  },

  productDetailPage: async ({ page }, use) => {
    await login(page);
    await page.click('.inventory_item_name >> nth=0');
    await use(page);
  },

  lockedOutPage: async ({ page }, use) => {
    // locked_out_user login fails — page stays on the login screen
    await page.goto(URL, { waitUntil: 'domcontentloaded' });
    await page.fill('#user-name', 'locked_out_user');
    await page.fill('#password', PASSWORD);
    await page.click('#login-button');
    await use(page);
  },

  multiCartPage: async ({ page }, use) => {
    await login(page);
    await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
    await page.click('[data-test="add-to-cart-sauce-labs-bike-light"]');
    await page.click('[data-test="add-to-cart-sauce-labs-bolt-t-shirt"]');
    await use(page);
  },
});

export { expect } from '@playwright/test';
