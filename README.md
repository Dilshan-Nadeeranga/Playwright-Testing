# Playwright Testing Demonstration

A group demonstration project covering four key Playwright features, tested against **[Saucedemo](https://www.saucedemo.com)** — a realistic e-commerce practice site with login, products, cart, and checkout.

---

## Group Members & Features

| # | Feature | Files |
|---|---------|-------|
| Member 1 | **Assertions** — `expect()` API | `tests/Assertions/` |
| Member 2 | **Fixtures & Setup/Teardown** — `test.extend()`, hooks | `tests/Fixtures/` |
| Member 3 | **Mocking/Stubbing** — `page.route()` | `tests/Mocking/` |
| Member 4 | **Test Reporting** — steps, annotations, HTML/JSON | `tests/Reporting/` |

---

## Project Structure

```
Playwright-Testing/
├── playwright.config.ts          ← reporters, timeout, browser config
├── package.json
├── tsconfig.json
└── tests/
    ├── Assertions/
    │   ├── login.spec.ts         ← Member 1: login page assertions
    │   ├── product.spec.ts       ← Member 1: product page assertions
    │   └── cart.spec.ts          ← Member 1: cart assertions
    ├── Fixtures/
    │   ├── fixtures.ts           ← custom test.extend() fixture definitions
    │   ├── cart.spec.ts          ← Member 2: loggedInPage, cartPage, etc.
    │   └── locked-out.spec.ts    ← Member 2: lockedOutPage fixture
    ├── Mocking/
    │   └── mocking.spec.ts       ← Member 3: network interception
    └── Reporting/
        └── reporting.spec.ts     ← Member 4: steps, annotations, screenshots
```

---

## Test Credentials (Saucedemo)

| Username | Password | Notes |
|----------|----------|-------|
| `standard_user` | `secret_sauce` | Normal user — used by most tests |
| `locked_out_user` | `secret_sauce` | Login is blocked — used by locked-out fixture |

---

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Install Playwright browsers (first time only)
npx playwright install
```

---

## Running Tests

```bash
# Run the full suite (all browsers)
npm test

# Run just one member's section
npx playwright test tests/Assertions/
npx playwright test tests/Fixtures/
npx playwright test tests/Mocking/
npx playwright test tests/Reporting/

# Chromium only (faster for demos)
npx playwright test --project=chromium

# Open the interactive HTML report
npx playwright show-report

# Interactive UI mode (great for live demos)
npx playwright test --ui

# Headed mode — browser window is visible
npx playwright test --headed
```

---

## Feature Breakdown

### Member 1 — Assertions (`tests/Assertions/`)

Playwright's `expect()` API automatically waits for conditions to be true (no manual `sleep()`):

| Assertion | What it checks |
|-----------|---------------|
| `toHaveURL(/inventory/)` | URL changed after login |
| `toHaveCount(6)` | 6 products on the page |
| `toBeVisible()` | Element is rendered and not hidden |
| `toContainText('$')` | Element text includes a substring |
| `toHaveAttribute('placeholder', ...)` | Input has correct placeholder |
| `toBeEnabled()` / `toBeEditable()` | Element is interactive |
| `not.toBeVisible()` | Element is absent or hidden |
| `expect.soft()` | Collect multiple failures without stopping |

### Member 2 — Fixtures & Setup/Teardown (`tests/Fixtures/`)

`test.extend()` in `fixtures.ts` creates reusable pre-configured page states:

| Fixture | State provided to the test |
|---------|---------------------------|
| `loggedInPage` | Logged in, on the inventory page |
| `cartPage` | Backpack in cart, on the cart page |
| `checkoutPage` | At checkout step 1 (info form) |
| `productDetailPage` | First product's detail page |
| `lockedOutPage` | `locked_out_user` login attempted |
| `multiCartPage` | 3 items added to the cart |

Each fixture handles SETUP (login + navigation) before the test and lets Playwright's built-in teardown reset the browser context automatically.

### Member 3 — Mocking (`tests/Mocking/`)

`page.route(pattern, handler)` intercepts requests before they reach the network:

| Method | Behaviour |
|--------|-----------|
| `route.fulfill({ body })` | Return a custom response — server never contacted |
| `route.abort()` | Drop the request — browser gets a network error |
| `route.fetch()` + `route.fulfill()` | Forward to server, modify the response |
| `route.continue()` | Pass through unchanged (used here with a delay) |

### Member 4 — Test Reporting (`tests/Reporting/`)

Three reporters run simultaneously (configured in `playwright.config.ts`):

| Reporter | Output | View |
|----------|--------|------|
| `list` | Terminal — live per-test status | `npx playwright test` |
| `html` | Interactive report with steps, screenshots | `npx playwright show-report` |
| `json` | Machine-readable file for CI | `test-results.json` |

Test-level reporting APIs:
- `test.step(name, fn)` — named collapsible steps with timing in the HTML report
- `test.info().annotations.push(...)` — attach issue links, feature labels, or notes
- `test.info().attach(name, { body })` — embed screenshots at specific moments
- `screenshot: 'only-on-failure'` — automatic failure screenshot (zero test code)
- `test.fail()` — expected failure: stays green in CI, shows failure screenshot
- `test.step({ box: true })` — errors point to the step call site for clean traces

---

## .gitignore

```
node_modules/
playwright-report/
test-results/
test-results.json
```
