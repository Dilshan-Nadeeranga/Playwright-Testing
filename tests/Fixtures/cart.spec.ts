import { test, expect } from './fixtures';

// Uses loggedInPage fixture — already logged in, on the inventory page.
// Verifies the inventory page displays the "Products" heading.
test('Inventory page shows "Products" header', async ({ loggedInPage }) => {
  const header = loggedInPage.locator('.title');
  await expect(header).toHaveText('Products');
});

// Adds an item from inventory and verifies exactly one item appears in the cart.
test('Add item to cart via fixture — no login code needed', async ({ loggedInPage }) => {
  await loggedInPage.click('.inventory_item button');
  await loggedInPage.click('.shopping_cart_link');

  const cartItems = loggedInPage.locator('.cart_item');
  await expect(cartItems).toHaveCount(1);
});

// Adds two items to cart and verifies the cart badge shows count of 2.
test('Multiple items can be added to cart', async ({ loggedInPage }) => {
  const buttons = loggedInPage.locator('.inventory_item button');
  await buttons.nth(0).click();
  await buttons.nth(1).click();

  const badge = loggedInPage.locator('.shopping_cart_badge');
  await expect(badge).toHaveText('2');
});

// Uses cartPage fixture — logged in, backpack already in cart, on the cart page.
// Verifies the cart page shows "Sauce Labs Backpack" as the item name.
test('Cart page displays the added item name', async ({ cartPage }) => {
  const itemName = cartPage.locator('.inventory_item_name');
  await expect(itemName).toContainText('Sauce Labs Backpack');
});

// Verifies the cart displays quantity as 1 for the added item.
test('Cart page shows correct item quantity', async ({ cartPage }) => {
  const quantity = cartPage.locator('.cart_quantity');
  await expect(quantity).toHaveText('1');
});

// Uses checkoutPage fixture — logged in, backpack in cart, on checkout step 1.
// Verifies the first name input is visible and editable on checkout step 1.
test('Checkout step 1 — first name field is editable', async ({ checkoutPage }) => {
  const firstNameField = checkoutPage.locator('[data-test="firstName"]');
  await expect(firstNameField).toBeVisible();
  await expect(firstNameField).toBeEditable();
});

// Submits empty checkout form and verifies "First Name is required" error appears.
test('Checkout step 1 — empty form submission shows error', async ({ checkoutPage }) => {
  await checkoutPage.click('[data-test="continue"]');

  const error = checkoutPage.locator('[data-test="error"]');
  await expect(error).toBeVisible();
  await expect(error).toContainText('First Name is required');
});

// Uses productDetailPage fixture — logged in, on the first product's detail page.
// Verifies the product detail page shows a non-empty description.
test('Product detail page has a description', async ({ productDetailPage }) => {
  const description = productDetailPage.locator('.inventory_details_desc');
  await expect(description).toBeVisible();
  await expect(description).not.toBeEmpty();
});

// Clicks back button and verifies navigation returns to the inventory URL.
test('Back button returns to inventory page', async ({ productDetailPage }) => {
  await productDetailPage.click('[data-test="back-to-products"]');
  await expect(productDetailPage).toHaveURL(/inventory/);
});

// multiCartPage — logged in, 3 items already added to the cart.
// Verifies the cart badge displays "3" when three items are in the cart.
test('Cart badge shows 3 after adding 3 items', async ({ multiCartPage }) => {
  const badge = multiCartPage.locator('.shopping_cart_badge');
  await expect(badge).toHaveText('3');
});

// Opens cart and verifies all three added items are listed.
test('Cart page lists all 3 added items', async ({ multiCartPage }) => {
  await multiCartPage.click('.shopping_cart_link');

  const cartItems = multiCartPage.locator('.cart_item');
  await expect(cartItems).toHaveCount(3);
});

// Intentionally failing test — asserts wrong header to verify failure reporting.
test('Intentional failure — inventory header should be Products', async ({ loggedInPage }) => {
  const header = loggedInPage.locator('.title');
  await expect(header).toHaveText('Inventories');
});

// Intentionally skipped test — not run, useful for work-in-progress or disabled features.
test.skip('Skipped — checkout step 2 validation', async ({ checkoutPage }) => {
  await checkoutPage.fill('[data-test="firstName"]', 'Test');
  await checkoutPage.fill('[data-test="lastName"]', 'User');
  await checkoutPage.fill('[data-test="postalCode"]', '12345');
  await checkoutPage.click('[data-test="continue"]');
  await expect(checkoutPage).toHaveURL(/checkout-step-two/);
});
