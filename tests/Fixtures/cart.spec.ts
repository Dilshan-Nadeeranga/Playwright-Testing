import { test, expect } from './fixtures';

// loggedInPage — already logged in, on the inventory page
test('Inventory page shows "Products" header', async ({ loggedInPage }) => {
  const header = loggedInPage.locator('.title');
  await expect(header).toHaveText('Products');
});

test('Add item to cart via fixture — no login code needed', async ({ loggedInPage }) => {
  await loggedInPage.click('.inventory_item button');
  await loggedInPage.click('.shopping_cart_link');

  const cartItems = loggedInPage.locator('.cart_item');
  await expect(cartItems).toHaveCount(1);
});

test('Multiple items can be added to cart', async ({ loggedInPage }) => {
  const buttons = loggedInPage.locator('.inventory_item button');
  await buttons.nth(0).click();
  await buttons.nth(1).click();

  const badge = loggedInPage.locator('.shopping_cart_badge');
  await expect(badge).toHaveText('2');
});

// cartPage — logged in, backpack already in cart, on the cart page
test('Cart page displays the added item name', async ({ cartPage }) => {
  const itemName = cartPage.locator('.inventory_item_name');
  await expect(itemName).toContainText('Sauce Labs Backpack');
});

test('Cart page shows correct item quantity', async ({ cartPage }) => {
  const quantity = cartPage.locator('.cart_quantity');
  await expect(quantity).toHaveText('1');
});

// checkoutPage — logged in, backpack in cart, on checkout step 1
test('Checkout step 1 — first name field is editable', async ({ checkoutPage }) => {
  const firstNameField = checkoutPage.locator('[data-test="firstName"]');
  await expect(firstNameField).toBeVisible();
  await expect(firstNameField).toBeEditable();
});

test('Checkout step 1 — empty form submission shows error', async ({ checkoutPage }) => {
  await checkoutPage.click('[data-test="continue"]');

  const error = checkoutPage.locator('[data-test="error"]');
  await expect(error).toBeVisible();
  await expect(error).toContainText('First Name is required');
});

// productDetailPage — logged in, on the first product's detail page
test('Product detail page has a description', async ({ productDetailPage }) => {
  const description = productDetailPage.locator('.inventory_details_desc');
  await expect(description).toBeVisible();
  await expect(description).not.toBeEmpty();
});

test('Back button returns to inventory page', async ({ productDetailPage }) => {
  await productDetailPage.click('[data-test="back-to-products"]');
  await expect(productDetailPage).toHaveURL(/inventory/);
});

// multiCartPage — logged in, 3 items already added to the cart
test('Cart badge shows 3 after adding 3 items', async ({ multiCartPage }) => {
  const badge = multiCartPage.locator('.shopping_cart_badge');
  await expect(badge).toHaveText('3');
});

test('Cart page lists all 3 added items', async ({ multiCartPage }) => {
  await multiCartPage.click('.shopping_cart_link');

  const cartItems = multiCartPage.locator('.cart_item');
  await expect(cartItems).toHaveCount(3);
});
