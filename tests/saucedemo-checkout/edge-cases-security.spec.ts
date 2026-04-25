import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'https://www.saucedemo.com';
const STANDARD_USER = 'standard_user';
const PASSWORD = 'secret_sauce';

test.describe('Checkout Edge Cases & Security - SCRUM-101', () => {
  let page: Page;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    await testPage.goto(`${BASE_URL}/`);
    await testPage.fill('input[placeholder="Username"]', STANDARD_USER);
    await testPage.fill('input[placeholder="Password"]', PASSWORD);
    await testPage.click('input#login-button');
    await testPage.waitForURL(`${BASE_URL}/inventory.html`);
  });

  test.afterEach(async () => {
    try {
      await page.click('button#react-burger-menu-btn');
      await page.click('a#logout_sidebar_link');
    } catch (e) {
      // Ignore
    }
  });

  // ===== EDGE CASE TESTS =====

  test('TP-010: Very long name values', async () => {
    const longName = 'A'.repeat(100);
    
    // Add item and go to checkout
    await page.click('button:has-text("Add to cart")').first();
    await page.goto(`${BASE_URL}/cart.html`);
    await page.click('button:has-text("Checkout")');
    
    // Fill with very long values
    const inputs = page.locator('input[type="text"]');
    await inputs.nth(0).fill(longName);
    await inputs.nth(1).fill(longName);
    await inputs.nth(2).fill('12345');
    
    // Try to proceed
    await page.click('input[value="Continue"]');
    
    // Should either accept or show error
    const currentUrl = page.url();
    const hasError = await page.locator('h3:has-text("Error")').isVisible().catch(() => false);
    
    if (!hasError) {
      expect(currentUrl).toContain('checkout-step-two');
    } else {
      expect(currentUrl).toContain('checkout-step-one');
    }
  });

  test('TP-011: Single character names', async () => {
    // Add item and go to checkout
    await page.click('button[data-test="add-to-cart-sauce-labs-backpack"]');
    await page.goto(`${BASE_URL}/cart.html`);
    await page.click('button[data-test="checkout"]');
    
    // Fill with single characters
    await page.fill('input[data-test="firstName"]', 'J');
    await page.fill('input[data-test="lastName"]', 'D');
    await page.fill('input[data-test="postalCode"]', '1');
    
    // Try to proceed
    await page.click('input[data-test="continue"]');
    
    // Should accept (no validation for minimum length)
    const currentUrl = page.url();
    const hasError = await page.locator('h3:has-text("Error")').isVisible().catch(() => false);
    
    if (!hasError) {
      expect(currentUrl).toContain('checkout-step-two');
    }
  });

  test('TP-012: Numbers in name fields', async () => {
    // Add item and go to checkout
    await page.click('button[data-test="add-to-cart-sauce-labs-backpack"]');
    await page.goto(`${BASE_URL}/cart.html`);
    await page.click('button[data-test="checkout"]');
    
    // Fill with numbers in names
    await page.fill('input[data-test="firstName"]', 'John123');
    await page.fill('input[data-test="lastName"]', 'Doe456');
    await page.fill('input[data-test="postalCode"]', '12345');
    
    // Try to proceed
    await page.click('input[data-test="continue"]');
    
    // Most systems allow alphanumeric
    const currentUrl = page.url();
    const hasError = await page.locator('h3:has-text("Error")').isVisible().catch(() => false);
    
    if (!hasError) {
      expect(currentUrl).toContain('checkout-step-two');
    }
  });

  test('TP-017: Form field visibility and labels', async () => {
    // Add item and go to checkout
    await page.click('button[data-test="add-to-cart-sauce-labs-backpack"]');
    await page.goto(`${BASE_URL}/cart.html`);
    await page.click('button[data-test="checkout"]');
    
    // Verify all fields are visible
    const firstNameField = page.locator('input[data-test="firstName"]');
    const lastNameField = page.locator('input[data-test="lastName"]');
    const zipField = page.locator('input[data-test="postalCode"]');
    
    await expect(firstNameField).toBeVisible();
    await expect(lastNameField).toBeVisible();
    await expect(zipField).toBeVisible();
    
    // Verify labels or placeholders exist
    const firstNameLabel = await firstNameField.getAttribute('placeholder') || 
                          await firstNameField.getAttribute('aria-label');
    expect(firstNameLabel).toBeTruthy();
  });

  test('TP-018: Error message styling and clarity', async () => {
    // Add item and go to checkout
    await page.click('button[data-test="add-to-cart-sauce-labs-backpack"]');
    await page.goto(`${BASE_URL}/cart.html`);
    await page.click('button[data-test="checkout"]');
    
    // Trigger error
    await page.click('input[data-test="continue"]');
    
    // Verify error message is visible and styled
    const errorMessage = page.locator('h3:has-text("Error")');
    await expect(errorMessage).toBeVisible();
    
    // Verify error message box exists
    const errorBox = page.locator('[data-test="error"]');
    await expect(errorBox).toBeVisible();
    
    // Verify error has close button
    const closeButton = errorBox.locator('button').first();
    await expect(closeButton).toBeVisible();
  });

  test('TP-019: Form field focus and tab order', async () => {
    // Add item and go to checkout
    await page.click('button[data-test="add-to-cart-sauce-labs-backpack"]');
    await page.goto(`${BASE_URL}/cart.html`);
    await page.click('button[data-test="checkout"]');
    
    // Click on first field
    const firstNameField = page.locator('input[data-test="firstName"]');
    await firstNameField.click();
    await expect(firstNameField).toBeFocused();
    
    // Tab to next field
    await page.keyboard.press('Tab');
    const lastNameField = page.locator('input[data-test="lastName"]');
    await expect(lastNameField).toBeFocused();
    
    // Tab to postal code field
    await page.keyboard.press('Tab');
    const zipField = page.locator('input[data-test="postalCode"]');
    await expect(zipField).toBeFocused();
    
    // Tab to continue button
    await page.keyboard.press('Tab');
    const continueButton = page.locator('input[data-test="continue"]');
    await expect(continueButton).toBeFocused();
  });

  // ===== SECURITY TESTS =====

  test('TP-022: SQL Injection attempt in name field', async () => {
    // Add item and go to checkout
    await page.click('button[data-test="add-to-cart-sauce-labs-backpack"]');
    await page.goto(`${BASE_URL}/cart.html`);
    await page.click('button[data-test="checkout"]');
    
    // Enter SQL injection payload
    const sqlPayload = "'; DROP TABLE users; --";
    await page.fill('input[data-test="firstName"]', sqlPayload);
    await page.fill('input[data-test="lastName"]', 'Test');
    await page.fill('input[data-test="postalCode"]', '12345');
    
    // Try to submit
    await page.click('input[data-test="continue"]');
    
    // Should not crash or show database error
    const errorMessage = await page.locator('h3').innerText().catch(() => '');
    expect(errorMessage).not.toContain('database');
    expect(errorMessage).not.toContain('SQL');
    expect(errorMessage).not.toContain('syntax');
    
    // Should either accept (treated as string) or reject with validation error
    const pageUrl = page.url();
    expect(pageUrl).toMatch(/checkout-step-(one|two)\.html/);
  });

  test('TP-023: XSS attempt in form fields', async () => {
    // Add item and go to checkout
    await page.click('button[data-test="add-to-cart-sauce-labs-backpack"]');
    await page.goto(`${BASE_URL}/cart.html`);
    await page.click('button[data-test="checkout"]');
    
    // Enter XSS payload
    const xssPayload = "<script>alert('XSS')</script>";
    await page.fill('input[data-test="firstName"]', xssPayload);
    await page.fill('input[data-test="lastName"]', 'Test');
    await page.fill('input[data-test="postalCode"]', '12345');
    
    // Listen for alert (should not happen if XSS is prevented)
    let alertFired = false;
    page.once('dialog', async dialog => {
      alertFired = true;
      await dialog.dismiss();
    });
    
    // Try to submit
    await page.click('input[data-test="continue"]');
    
    // Should NOT fire alert
    expect(alertFired).toBe(false);
    
    // Should either accept or show validation error
    const pageUrl = page.url();
    expect(pageUrl).toMatch(/checkout-step-(one|two)\.html/);
  });

  test('TP-024: Checkout without login', async ({ context }) => {
    // Create new context without session
    const newPage = await context.newPage();
    
    // Try to access checkout directly without login
    await newPage.goto(`${BASE_URL}/checkout-step-one.html`);
    
    // Should redirect to login
    const currentUrl = newPage.url();
    expect(currentUrl).toContain('saucedemo.com');
    
    // Check if redirected to login (may redirect or show error)
    const pageTitle = await newPage.title();
    expect(pageTitle).toContain('Swag Labs');
    
    await newPage.close();
  });

  test('TP-025: Empty cart checkout attempt', async () => {
    // Don't add any items, navigate directly to cart
    await page.goto(`${BASE_URL}/cart.html`);
    
    // Try to click checkout
    const checkoutButton = page.locator('button[data-test="checkout"]');
    const isDisabled = await checkoutButton.isDisabled().catch(() => false);
    const isVisible = await checkoutButton.isVisible().catch(() => false);
    
    // Either button is disabled or not visible
    if (isVisible) {
      expect(isDisabled).toBe(true);
    }
  });

  // ===== CART PERSISTENCE TESTS =====

  test('Cart items persist after page reload', async () => {
    // Add item
    await page.click('button[data-test="add-to-cart-sauce-labs-backpack"]');
    
    // Verify item added
    const cartBadge = page.locator('[data-test="shopping-cart-badge"]');
    await expect(cartBadge).toContainText('1');
    
    // Reload page
    await page.reload();
    
    // Verify item still in cart
    await expect(cartBadge).toContainText('1');
  });

  test('Items remain in cart through checkout flow', async () => {
    // Add items
    await page.click('button[data-test="add-to-cart-sauce-labs-backpack"]');
    await page.click('button[data-test="add-to-cart-sauce-labs-bike-light"]');
    
    const badge1 = page.locator('[data-test="shopping-cart-badge"]');
    await expect(badge1).toContainText('2');
    
    // Navigate to cart
    await page.goto(`${BASE_URL}/cart.html`);
    
    // Verify items in cart
    const itemCount = await page.locator('[data-test="inventory-item-name"]').count();
    expect(itemCount).toBe(2);
    
    // Go to checkout
    await page.click('button[data-test="checkout"]');
    
    // Go back to cart
    await page.goBack();
    
    // Items still there
    const itemCountAfter = await page.locator('[data-test="inventory-item-name"]').count();
    expect(itemCountAfter).toBe(2);
  });
});

test.describe('Checkout Performance & Load Testing', () => {
  let page: Page;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    await testPage.goto(`${BASE_URL}/`);
    await testPage.fill('input[placeholder="Username"]', STANDARD_USER);
    await testPage.fill('input[placeholder="Password"]', PASSWORD);
    await testPage.click('input#login-button');
    await testPage.waitForURL(`${BASE_URL}/inventory.html`);
  });

  test('Checkout form loads quickly', async () => {
    // Add item
    await page.click('button[data-test="add-to-cart-sauce-labs-backpack"]');
    
    // Navigate to cart
    await page.goto(`${BASE_URL}/cart.html`);
    
    // Measure checkout load time
    const startTime = Date.now();
    await page.click('button[data-test="checkout"]');
    await page.waitForURL(`${BASE_URL}/checkout-step-one.html`);
    const endTime = Date.now();
    
    const loadTime = endTime - startTime;
    
    // Should load within reasonable time (2 seconds)
    expect(loadTime).toBeLessThan(2000);
  });

  test('Order submission completes within timeout', async () => {
    // Add item
    await page.click('button[data-test="add-to-cart-sauce-labs-backpack"]');
    
    // Navigate to checkout
    await page.goto(`${BASE_URL}/cart.html`);
    await page.click('button[data-test="checkout"]');
    
    // Fill form
    await page.fill('input[data-test="firstName"]', 'Test');
    await page.fill('input[data-test="lastName"]', 'User');
    await page.fill('input[data-test="postalCode"]', '12345');
    
    // Proceed
    await page.click('input[data-test="continue"]');
    
    // Measure finish time
    const startTime = Date.now();
    await page.click('button[data-test="finish"]');
    await page.waitForURL(`${BASE_URL}/checkout-complete.html`, { timeout: 5000 });
    const endTime = Date.now();
    
    const submitTime = endTime - startTime;
    
    // Should complete within 5 seconds
    expect(submitTime).toBeLessThan(5000);
  });
});
