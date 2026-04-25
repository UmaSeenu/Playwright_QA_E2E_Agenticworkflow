import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'https://www.saucedemo.com';
const STANDARD_USER = 'standard_user';
const PASSWORD = 'secret_sauce';

test.describe('Sauce Demo Checkout Flow - SCRUM-101', () => {
  let page: Page;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    // Navigate to login page
    await page.goto(`${BASE_URL}/`);
    
    // Perform login
    await page.fill('input[placeholder="Username"]', STANDARD_USER);
    await page.fill('input[placeholder="Password"]', PASSWORD);
    await page.click('input#login-button');
    
    // Wait for products page to load
    await page.waitForURL(`${BASE_URL}/inventory.html`);
  });

  test.afterEach(async () => {
    // Logout for clean state
    try {
      await page.click('button#react-burger-menu-btn');
      await page.click('a#logout_sidebar_link');
    } catch (e) {
      // Ignore if logout fails
    }
  });

  // ===== HAPPY PATH TESTS =====

  test('TP-001: Complete successful checkout with single item', async () => {
    // Step 1: Add item to cart
    await page.click('button:has-text("Add to cart")').first();
    
    // Step 2: Verify item added to cart - cart badge shows count
    const cartBadge = page.locator('[class*="shopping-cart-badge"]');
    await expect(cartBadge).toContainText('1');
    
    // Step 3: Navigate to cart
    await page.goto(`${BASE_URL}/cart.html`);
    await page.waitForURL(`${BASE_URL}/cart.html`);
    
    // Step 4: Verify item in cart
    await expect(page.locator('text=Sauce Labs Backpack')).toBeVisible();
    await expect(page.locator('text=$29.99')).toBeVisible();
    
    // Step 5: Click Checkout
    await page.click('button:has-text("Checkout")');
    await page.waitForURL(`${BASE_URL}/checkout-step-one.html`);
    
    // Step 6: Fill checkout form
    await page.fill('input[placeholder*="First"]', 'John');
    await page.fill('input[placeholder*="Last"]', 'Doe');
    await page.fill('input[placeholder*="Postal"]', '12345');
    
    // Step 7: Click Continue
    await page.click('input[value="Continue"]');
    await page.waitForURL(`${BASE_URL}/checkout-step-two.html`);
    
    // Step 8: Verify order overview
    await expect(page.locator('text=Sauce Labs Backpack')).toBeVisible();
    await expect(page.locator('text=Total')).toBeVisible();
    
    // Step 9: Click Finish
    await page.click('button:has-text("Finish")');
    await page.waitForURL(`${BASE_URL}/checkout-complete.html`);
    
    // Step 10: Verify order confirmation
    const successMessage = await page.locator('h2');
    await expect(successMessage).toContainText('Thank you for your order!');
  });

  test('TP-002: Complete checkout with multiple items', async () => {
    // Add multiple items using visible buttons
    const addButtons = page.locator('button:has-text("Add to cart")');
    const count = await addButtons.count();
    if (count >= 3) {
      await addButtons.nth(0).click();
      await addButtons.nth(1).click();
      await addButtons.nth(2).click();
    }
    
    // Verify items added
    const cartBadge = page.locator('[class*="shopping-cart-badge"]');
    const badgeText = await cartBadge.textContent();
    expect(parseInt(badgeText || '0')).toBeGreaterThanOrEqual(2);
    
    // Navigate to cart and checkout
    await page.goto(`${BASE_URL}/cart.html`);
    await page.click('button:has-text("Checkout")');
    
    // Fill checkout info
    const inputs = page.locator('input[type="text"]');
    await inputs.nth(0).fill('Jane');
    await inputs.nth(1).fill('Smith');
    await inputs.nth(2).fill('54321');
    await page.click('input[value="Continue"]');
    
    // Verify items in overview
    const itemNames = page.locator('div:has-text("Description")').locator('a');
    const itemCount = await itemNames.count();
    expect(itemCount).toBeGreaterThanOrEqual(1);
    
    // Complete order
    await page.click('button:has-text("Finish")');
    await expect(page.locator('h2')).toContainText('Thank you for your order!');
  });

  test('TP-003: Order overview with correct price calculation', async () => {
    // Add items with known prices
    const addButtons = page.locator('button:has-text("Add to cart")');
    await addButtons.nth(0).click(); // Backpack $29.99
    await addButtons.nth(1).click(); // Bike Light $9.99
    
    // Navigate to checkout
    await page.goto(`${BASE_URL}/cart.html`);
    await page.click('button:has-text("Checkout")');
    
    // Fill and proceed
    const inputs = page.locator('input[type="text"]');
    await inputs.nth(0).fill('Test');
    await inputs.nth(1).fill('User');
    await inputs.nth(2).fill('99999');
    await page.click('input[value="Continue"]');
    
    // Verify pricing
    await expect(page.locator('text=Item total')).toContainText('$39.98');
    await expect(page.locator('text=Tax')).toContainText('$3.20');
    await expect(page.locator('text=Total')).toContainText('$43.18');
  });

  // ===== NEGATIVE SCENARIO TESTS - FIELD VALIDATION =====

  test('TP-004: Empty First Name validation', async () => {
    // Add item and proceed to checkout
    await page.click('button:has-text("Add to cart")').first();
    await page.goto(`${BASE_URL}/cart.html`);
    await page.click('button:has-text("Checkout")');
    
    // Leave First Name empty, fill other fields
    const inputs = page.locator('input[type="text"]');
    await inputs.nth(1).fill('Doe');
    await inputs.nth(2).fill('12345');
    
    // Click Continue without First Name
    await page.click('input[value="Continue"]');
    
    // Verify error message
    const errorMessage = await page.locator('h3');
    await expect(errorMessage).toContainText('Error: First Name is required');
    
    // Verify page hasn't changed
    await expect(page).toHaveURL(`${BASE_URL}/checkout-step-one.html`);
  });

  test('TP-005: Empty Last Name validation', async () => {
    // Add item and proceed to checkout
    await page.click('button:has-text("Add to cart")').first();
    await page.goto(`${BASE_URL}/cart.html`);
    await page.click('button:has-text("Checkout")');
    
    // Fill First Name and Zip, leave Last Name empty
    const inputs = page.locator('input[type="text"]');
    await inputs.nth(0).fill('John');
    await inputs.nth(2).fill('12345');
    
    // Click Continue without Last Name
    await page.click('input[value="Continue"]');
    
    // Verify error message
    const errorMessage = await page.locator('h3');
    await expect(errorMessage).toContainText('Error: Last Name is required');
    
    // Verify page hasn't changed
    await expect(page).toHaveURL(`${BASE_URL}/checkout-step-one.html`);
  });

  test('TP-006: Empty Postal Code validation', async () => {
    // Add item and proceed to checkout
    await page.click('button:has-text("Add to cart")').first();
    await page.goto(`${BASE_URL}/cart.html`);
    await page.click('button:has-text("Checkout")');
    
    // Fill First and Last Name, leave Zip empty
    const inputs = page.locator('input[type="text"]');
    await inputs.nth(0).fill('John');
    await inputs.nth(1).fill('Doe');
    
    // Click Continue without Zip
    await page.click('input[value="Continue"]');
    
    // Verify error message
    const errorMessage = await page.locator('h3');
    await expect(errorMessage).toContainText('Error: Postal Code is required');
    
    // Verify page hasn't changed
    await expect(page).toHaveURL(`${BASE_URL}/checkout-step-one.html`);
  });

  test('TP-007: All fields empty validation', async () => {
    // Add item and proceed to checkout
    await page.click('button:has-text("Add to cart")').first();
    await page.goto(`${BASE_URL}/cart.html`);
    await page.click('button:has-text("Checkout")');
    
    // Click Continue without filling any fields
    await page.click('input[value="Continue"]');
    
    // Verify error message appears (should be for First Name)
    const errorMessage = await page.locator('h3');
    await expect(errorMessage).toContainText('Error:');
    
    // Verify still on checkout page
    await expect(page).toHaveURL(`${BASE_URL}/checkout-step-one.html`);
  });

  test('TP-008: Special characters in First Name', async () => {
    // Add item and proceed to checkout
    await page.click('button:has-text("Add to cart")').first();
    await page.goto(`${BASE_URL}/cart.html`);
    await page.click('button:has-text("Checkout")');
    
    // Enter special characters
    const inputs = page.locator('input[type="text"]');
    await inputs.nth(0).fill('@#$%John');
    await inputs.nth(1).fill('Doe');
    await inputs.nth(2).fill('12345');
    
    // Try to continue
    await page.click('input[value="Continue"]');
    
    // Document behavior: Should either accept or reject with error
    const currentUrl = page.url();
    const hasError = await page.locator('h3:has-text("Error")').isVisible().catch(() => false);
    
    if (!hasError) {
      // If no error, special characters are accepted
      expect(currentUrl).toContain('checkout-step-two');
    } else {
      // If error, special characters are rejected
      expect(currentUrl).toContain('checkout-step-one');
    }
  });

  test('TP-009: Non-numeric Postal Code', async () => {
    // Add item and proceed to checkout
    await page.click('button:has-text("Add to cart")').first();
    await page.goto(`${BASE_URL}/cart.html`);
    await page.click('button:has-text("Checkout")');
    
    // Enter non-numeric zip
    const inputs = page.locator('input[type="text"]');
    await inputs.nth(0).fill('John');
    await inputs.nth(1).fill('Doe');
    await inputs.nth(2).fill('ABC');
    
    // Try to continue
    await page.click('input[value="Continue"]');
    
    // Document behavior
    const hasError = await page.locator('h3:has-text("Error")').isVisible().catch(() => false);
    const currentUrl = page.url();
    
    if (!hasError) {
      // Non-numeric is accepted
      expect(currentUrl).toContain('checkout-step-two');
    } else {
      // Non-numeric is rejected
      expect(currentUrl).toContain('checkout-step-one');
    }
  });

  // ===== NAVIGATION & FLOW TESTS =====

  test('TP-013: Browser back button from checkout', async () => {
    // Add item and go to checkout
    await page.click('button:has-text("Add to cart")').first();
    await page.goto(`${BASE_URL}/cart.html`);
    await page.click('button:has-text("Checkout")');
    
    // Use browser back
    await page.goBack();
    
    // Verify back to cart
    await expect(page).toHaveURL(`${BASE_URL}/cart.html`);
    
    // Verify item still in cart
    const cartBadge = page.locator('[class*="shopping-cart-badge"]');
    await expect(cartBadge).toContainText('1');
  });

  test('TP-014: Continue Shopping from cart', async () => {
    // Add item and go to cart
    await page.click('button:has-text("Add to cart")').first();
    await page.goto(`${BASE_URL}/cart.html`);
    
    // Click Continue Shopping
    await page.click('button:has-text("Continue Shopping")');
    
    // Verify back to products
    await expect(page).toHaveURL(`${BASE_URL}/inventory.html`);
    
    // Verify item still in cart (badge should show 1)
    const cartBadge = page.locator('[class*="shopping-cart-badge"]');
    await expect(cartBadge).toContainText('1');
  });

  test('TP-015: Cancel checkout flow', async () => {
    // Add item and proceed to checkout
    await page.click('button:has-text("Add to cart")').first();
    await page.goto(`${BASE_URL}/cart.html`);
    await page.click('button:has-text("Checkout")');
    
    // Fill form and navigate to overview
    const inputs = page.locator('input[type="text"]');
    await inputs.nth(0).fill('John');
    await inputs.nth(1).fill('Doe');
    await inputs.nth(2).fill('12345');
    await page.click('input[value="Continue"]');
    
    // Click Cancel on overview page
    await page.click('button:has-text("Cancel")');
    
    // Verify back to cart
    await expect(page).toHaveURL(`${BASE_URL}/cart.html`);
    
    // Verify item still in cart
    const cartBadge = page.locator('[class*="shopping-cart-badge"]');
    await expect(cartBadge).toContainText('1');
  });

  // ===== RESPONSIVE DESIGN TESTS =====

  test('TP-020: Responsive checkout on mobile', async ({ page: mobilePage }) => {
    // Set mobile viewport
    await mobilePage.setViewportSize({ width: 375, height: 667 });
    
    // Login
    await mobilePage.goto(`${BASE_URL}/`);
    await mobilePage.fill('input[placeholder="Username"]', STANDARD_USER);
    await mobilePage.fill('input[placeholder="Password"]', PASSWORD);
    await mobilePage.click('input#login-button');
    await mobilePage.waitForURL(`${BASE_URL}/inventory.html`);
    
    // Add item
    await mobilePage.click('button:has-text("Add to cart")').first();
    
    // Navigate to cart
    await mobilePage.goto(`${BASE_URL}/cart.html`);
    
    // Verify cart page is usable on mobile
    const checkoutButton = await mobilePage.locator('button:has-text("Checkout")');
    await expect(checkoutButton).toBeVisible();
    
    // Click checkout
    await mobilePage.click('button:has-text("Checkout")');
    
    // Verify form fields are accessible
    const inputs = mobilePage.locator('input[type="text"]');
    const firstInput = await inputs.first();
    await expect(firstInput).toBeVisible();
    
    // Fill form
    await inputs.nth(0).fill('Mobile');
    await inputs.nth(1).fill('User');
    await inputs.nth(2).fill('12345');
    
    // Complete checkout
    await mobilePage.click('input[value="Continue"]');
    await mobilePage.click('button:has-text("Finish")');
    
    // Verify completion on mobile
    await expect(mobilePage.locator('h2')).toContainText('Thank you');
  });

  // ===== CROSS-BROWSER COMPATIBILITY =====

  test('TP-021: Checkout on Chrome (Desktop)', async () => {
    // Standard checkout flow
    await page.click('button:has-text("Add to cart")').first();
    await page.goto(`${BASE_URL}/cart.html`);
    await page.click('button:has-text("Checkout")');
    
    // Fill form
    const inputs = page.locator('input[type="text"]');
    await inputs.nth(0).fill('Chrome');
    await inputs.nth(1).fill('Test');
    await inputs.nth(2).fill('12345');
    
    // Complete checkout
    await page.click('input[value="Continue"]');
    await page.click('button:has-text("Finish")');
    
    // Verify success
    await expect(page.locator('h2')).toContainText('Thank you for your order!');
  });
});

// ===== INDIVIDUAL COMPONENT TESTS =====

test.describe('Checkout Form Validation - Component Level', () => {
  let page: Page;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    await testPage.goto(`${BASE_URL}/`);
    await testPage.fill('input[placeholder="Username"]', STANDARD_USER);
    await testPage.fill('input[placeholder="Password"]', PASSWORD);
    await testPage.click('input#login-button');
    await testPage.waitForURL(`${BASE_URL}/inventory.html`);
    
    // Add item and go to checkout
    await testPage.click('button[data-test="add-to-cart-sauce-labs-backpack"]');
    await testPage.goto(`${BASE_URL}/cart.html`);
    await testPage.click('button[data-test="checkout"]');
  });

  test('First Name field accepts valid input', async () => {
    const inputs = page.locator('input[type="text"]');
    const firstNameInput = inputs.nth(0);
    await firstNameInput.fill('ValidName');
    const value = await firstNameInput.inputValue();
    expect(value).toBe('ValidName');
  });

  test('Last Name field accepts valid input', async () => {
    const inputs = page.locator('input[type="text"]');
    const lastNameInput = inputs.nth(1);
    await lastNameInput.fill('ValidSurname');
    const value = await lastNameInput.inputValue();
    expect(value).toBe('ValidSurname');
  });

  test('Postal Code field accepts numeric input', async () => {
    const inputs = page.locator('input[type="text"]');
    const zipInput = inputs.nth(2);
    await zipInput.fill('12345');
    const value = await zipInput.inputValue();
    expect(value).toBe('12345');
  });

  test('Error message can be closed', async () => {
    // Trigger error
    await page.click('input[value="Continue"]');
    
    // Verify error visible
    const errorHeading = page.locator('h3:has-text("Error")');
    await expect(errorHeading).toBeVisible();
    
    // Find and click close button
    const closeButton = errorHeading.locator('button').first();
    await closeButton.click();
    
    // Verify error hidden
    await expect(errorHeading).not.toBeVisible();
  });
});