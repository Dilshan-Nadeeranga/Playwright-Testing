import { test as base, type Page } from '@playwright/test';

const URL      = 'https://www.saucedemo.com/';
const USER     = 'standard_user';
const PASSWORD = 'secret_sauce';

// Logs in as standard_user and waits until the inventory page is loaded.
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

  // Logs in as standard_user and navigates to the inventory page.
  loggedInPage: async ({ page }, use) => {
    await login(page);
    await use(page);
  },

  // Logs in, adds Sauce Labs Backpack to cart, and opens the cart page.
  cartPage: async ({ page }, use) => {
    await login(page);
    await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
    await page.click('.shopping_cart_link');
    await use(page);
  },

  // Logs in, adds an item to cart, opens cart, and navigates to checkout.
  checkoutPage: async ({ page }, use) => {
    await login(page);
    await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
    await page.click('.shopping_cart_link');
    await page.click('[data-test="checkout"]');
    await use(page);
  },

  // Logs in and opens the first product's detail page.
  productDetailPage: async ({ page }, use) => {
    await login(page);
    await page.click('.inventory_item_name >> nth=0');
    await use(page);
  },

  // Attempts login as locked_out_user; login fails and page stays on login screen.
  lockedOutPage: async ({ page }, use) => {
    await page.goto(URL, { waitUntil: 'domcontentloaded' });
    await page.fill('#user-name', 'locked_out_user');
    await page.fill('#password', PASSWORD);
    await page.click('#login-button');
    await use(page);
  },

  // Logs in and adds three products to cart (Backpack, Bike Light, Bolt T-Shirt).
  multiCartPage: async ({ page }, use) => {
    await login(page);
    await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
    await page.click('[data-test="add-to-cart-sauce-labs-bike-light"]');
    await page.click('[data-test="add-to-cart-sauce-labs-bolt-t-shirt"]');
    await use(page);
  },
});

export { expect } from '@playwright/test';
