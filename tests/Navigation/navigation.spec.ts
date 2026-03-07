import { test, expect } from '@playwright/test';

const URL      = 'https://www.saucedemo.com/';
const USER     = 'standard_user';
const PASSWORD = 'secret_sauce';

async function login(page: import('@playwright/test').Page) {
  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await page.fill('#user-name', USER);
  await page.fill('#password', PASSWORD);
  await page.click('#login-button');
  await page.waitForURL(/inventory/);
  await page.waitForLoadState('domcontentloaded');
}

// ─── Page-to-page Navigation ───────────────────────────────────────────────────

test('Navigation — login redirects to inventory page', async ({ page }) => {
  await page.goto(URL, { waitUntil: 'domcontentloaded' });

  await page.fill('#user-name', USER);
  await page.fill('#password', PASSWORD);
  await page.click('#login-button');

  // After login the URL must include /inventory and the page title must update
  await expect(page).toHaveURL(/inventory/);
  await expect(page.locator('.title')).toHaveText('Products');
});

test('Navigation — cart icon navigates to cart page', async ({ page }) => {
  await login(page);

  await page.click('.shopping_cart_link');

  await expect(page).toHaveURL(/cart/);
  await expect(page.locator('.title')).toHaveText('Your Cart');
});

test('Navigation — Checkout button from cart goes to checkout step 1', async ({ page }) => {
  await login(page);
  await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
  await page.click('.shopping_cart_link');

  await page.click('[data-test="checkout"]');

  await expect(page).toHaveURL(/checkout-step-one/);
  await expect(page.locator('.title')).toHaveText('Checkout: Your Information');
});

test('Navigation — Continue button goes from step 1 to step 2', async ({ page }) => {
  await login(page);
  await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
  await page.click('.shopping_cart_link');
  await page.click('[data-test="checkout"]');

  await page.fill('[data-test="firstName"]', 'Jane');
  await page.fill('[data-test="lastName"]', 'Doe');
  await page.fill('[data-test="postalCode"]', '10001');
  await page.click('[data-test="continue"]');

  await expect(page).toHaveURL(/checkout-step-two/);
  await expect(page.locator('.title')).toHaveText('Checkout: Overview');
});

test('Navigation — Finish button goes to order-complete page', async ({ page }) => {
  await login(page);
  await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
  await page.click('.shopping_cart_link');
  await page.click('[data-test="checkout"]');
  await page.fill('[data-test="firstName"]', 'Jane');
  await page.fill('[data-test="lastName"]', 'Doe');
  await page.fill('[data-test="postalCode"]', '10001');
  await page.click('[data-test="continue"]');

  await page.click('[data-test="finish"]');

  await expect(page).toHaveURL(/checkout-complete/);
  await expect(page.locator('.complete-header')).toHaveText('Thank you for your order!');
});

test('Navigation — product name click opens product detail page', async ({ page }) => {
  await login(page);

  // Click the first product name — should navigate to the detail page
  const firstProductName = await page.locator('.inventory_item_name').first().textContent();
  await page.locator('.inventory_item_name').first().click();

  await expect(page).toHaveURL(/inventory-item/);
  // The detail page shows the same product name we clicked
  await expect(page.locator('.inventory_details_name')).toHaveText(firstProductName!.trim());
});

test('Navigation — "Back to products" link returns to inventory', async ({ page }) => {
  await login(page);
  await page.locator('.inventory_item_name').first().click();
  await page.waitForURL(/inventory-item/);

  // The back button on the product detail page
  await page.click('[data-test="back-to-products"]');

  await expect(page).toHaveURL(/inventory/);
  await expect(page.locator('.title')).toHaveText('Products');
});

// ─── Sidebar / Hamburger Menu Navigation ──────────────────────────────────────

test('Navigation — hamburger menu opens the sidebar', async ({ page }) => {
  await login(page);

  await page.click('#react-burger-menu-btn');

  // The sidebar should become visible with the nav links
  await expect(page.locator('.bm-menu-wrap')).toBeVisible();
  await expect(page.locator('#inventory_sidebar_link')).toBeVisible();
  await expect(page.locator('#logout_sidebar_link')).toBeVisible();
});

test('Navigation — "All Items" sidebar link stays on inventory page', async ({ page }) => {
  await login(page);
  // Navigate away first, then use the sidebar to go back to All Items
  await page.click('.shopping_cart_link');
  await expect(page).toHaveURL(/cart/);

  await page.click('#react-burger-menu-btn');
  await page.click('#inventory_sidebar_link');

  await expect(page).toHaveURL(/inventory/);
  await expect(page.locator('.inventory_list')).toBeVisible();
});

test('Navigation — Logout via sidebar returns to login page', async ({ page }) => {
  await login(page);

  await page.click('#react-burger-menu-btn');
  await page.click('#logout_sidebar_link');

  // After logout the URL returns to the root login page
  await expect(page).toHaveURL(URL);
  await expect(page.locator('#login-button')).toBeVisible();
});

// ─── Browser History Navigation ───────────────────────────────────────────────

test('Navigation — browser Back button works from inventory to login', async ({ page }) => {
  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await page.fill('#user-name', USER);
  await page.fill('#password', PASSWORD);
  await page.click('#login-button');
  await page.waitForURL(/inventory/);

  // Browser back — site may redirect back to login or show inventory without session;
  // either way the URL should change away from inventory
  await page.goBack();

  // After going back, the user should not remain authenticated on the inventory page
  await expect(page).not.toHaveURL(/inventory/);
});

test('Navigation — full checkout flow URL sequence is correct', async ({ page }) => {
  await login(page);

  // Collect URL at each step of the checkout funnel
  await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');

  await page.click('.shopping_cart_link');
  await expect(page).toHaveURL(/cart/);

  await page.click('[data-test="checkout"]');
  await expect(page).toHaveURL(/checkout-step-one/);

  await page.fill('[data-test="firstName"]', 'Jane');
  await page.fill('[data-test="lastName"]', 'Doe');
  await page.fill('[data-test="postalCode"]', '10001');
  await page.click('[data-test="continue"]');
  await expect(page).toHaveURL(/checkout-step-two/);

  await page.click('[data-test="finish"]');
  await expect(page).toHaveURL(/checkout-complete/);
});
