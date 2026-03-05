import { test, expect } from '@playwright/test';

test('Mock inventory page — replace with custom HTML', async ({ page }) => {
  // route.fulfill() intercepts the request and returns our response — the real server is never hit
  await page.route('**/inventory.html', route => {
    route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: `
        <html><body>
          <div class="inventory_item">Mock Product A</div>
          <div class="inventory_item">Mock Product B</div>
          <div class="inventory_item">Mock Product C</div>
        </body></html>
      `,
    });
  });

  await page.goto('https://www.saucedemo.com/inventory.html', { waitUntil: 'domcontentloaded' });

  const items = page.locator('.inventory_item');
  await expect(items).toHaveCount(3);
  await expect(items.nth(0)).toHaveText('Mock Product A');
  await expect(items.nth(1)).toHaveText('Mock Product B');
});

test('Mock inventory page — verify mocked h1 text', async ({ page }) => {
  await page.route('**/inventory.html', route => {
    route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: '<h1>Mocked Inventory Page</h1>',
    });
  });

  await page.goto('https://www.saucedemo.com/inventory.html', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('h1')).toHaveText('Mocked Inventory Page');
});

test('Abort image requests — page structure still loads correctly', async ({ page }) => {
  // route.abort() drops the request entirely — the browser gets a network error for that resource
  await page.route('**/*.png', route => route.abort());
  await page.route('**/*.jpg', route => route.abort());

  await page.goto('https://www.saucedemo.com/', { waitUntil: 'domcontentloaded' });
  await page.fill('#user-name', 'standard_user');
  await page.fill('#password', 'secret_sauce');
  await page.click('#login-button');

  await expect(page.locator('.inventory_list')).toBeVisible();
  await expect(page.locator('.inventory_item')).toHaveCount(6);
});

test('Intercept and modify response headers in-flight', async ({ page }) => {
  await page.goto('https://www.saucedemo.com/', { waitUntil: 'domcontentloaded' });
  await page.fill('#user-name', 'standard_user');
  await page.fill('#password', 'secret_sauce');
  await page.click('#login-button');
  await page.waitForURL(/inventory/);

  await page.route('**/inventory.html', async route => {
    // route.fetch() forwards to the real server; we modify the response before fulfilling
    const response = await route.fetch();
    await route.fulfill({
      response,
      headers: {
        ...response.headers(),
        'x-custom-header': 'playwright-test',
      },
    });
  });

  await page.goto('https://www.saucedemo.com/inventory.html', { waitUntil: 'domcontentloaded' });

  await expect(page).toHaveURL(/inventory/);
  await expect(page.locator('.inventory_list')).toBeVisible();
});

test('Simulate slow network — route.continue() with delay', async ({ page }) => {
  await page.route('**/inventory.html', async route => {
    // route.continue() passes the request through unchanged; the delay simulates network latency
    await new Promise(resolve => setTimeout(resolve, 500));
    await route.continue();
  });

  await page.goto('https://www.saucedemo.com/', { waitUntil: 'domcontentloaded' });
  await page.fill('#user-name', 'standard_user');
  await page.fill('#password', 'secret_sauce');
  await page.click('#login-button');

  await expect(page).toHaveURL(/inventory/);
});
