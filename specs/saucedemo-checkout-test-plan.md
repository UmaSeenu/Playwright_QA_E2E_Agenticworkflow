# Sauce Demo Checkout Test Plan - SCRUM-101

## Test Plan Overview
Comprehensive testing strategy for the Sauce Demo e-commerce checkout process covering happy path, negative scenarios, edge cases, and navigation flows.

**Application**: https://www.saucedemo.com  
**Test Credentials**: standard_user / secret_sauce  
**Scope**: Cart Review → Checkout → Order Confirmation

---

## Test Environment
- **Browsers**: Chrome, Firefox, Safari
- **Devices**: Desktop, Tablet, Mobile
- **Test Data**: Pre-loaded product catalog, multiple payment methods

---

## Test Scenarios

### HAPPY PATH SCENARIOS

#### TP-001: Complete Successful Checkout with Single Item
**Objective**: Verify end-to-end checkout flow with one product

**Steps**:
1. Login with standard_user / secret_sauce
2. Add "Sauce Labs Backpack" to cart
3. Navigate to cart page
4. Verify item details displayed correctly
5. Click "Checkout" button
6. Enter First Name: "John", Last Name: "Doe", Zip: "12345"
7. Click "Continue" button
8. Verify order overview with correct item and total
9. Click "Finish" button
10. Verify success message and "Back Home" button

**Expected Results**:
- All pages load correctly
- Item details match added product
- Total price calculated correctly
- Success confirmation displayed
- Cart cleared after order

**Test Data**:
- Product: Sauce Labs Backpack ($29.99)
- Name: John Doe
- Zip: 12345

---

#### TP-002: Complete Checkout with Multiple Items
**Objective**: Verify checkout with multiple products in cart

**Steps**:
1. Login with credentials
2. Add "Sauce Labs Backpack" to cart
3. Add "Sauce Labs Bike Light" to cart
4. Add "Sauce Labs Bolt T-Shirt" to cart
5. Navigate to cart
6. Verify all 3 items displayed
7. Complete checkout with valid data
8. Verify order total = sum of all items
9. Confirm order completion

**Expected Results**:
- All items visible in cart and checkout
- Correct quantity displayed
- Total price = $29.99 + $9.99 + $15.99 = $55.97
- Order confirmed successfully

**Test Data**:
- Multiple products with varying prices
- Quantity: 1 each
- Valid checkout info

---

#### TP-003: Checkout with Price Verification
**Objective**: Verify correct calculation of subtotal, tax, and total

**Steps**:
1. Add item to cart
2. Review price in cart page
3. Proceed to checkout
4. Verify order overview pricing breakdown
5. Validate: Subtotal + Tax = Total

**Expected Results**:
- Subtotal displayed correctly
- Tax calculated correctly (usually 8%)
- Final total accurate
- No pricing discrepancies

**Test Data**:
- Item price: $29.99
- Expected tax: ~$2.40
- Expected total: ~$32.39

---

### NEGATIVE SCENARIOS

#### TP-004: Empty First Name Field
**Objective**: Verify validation for mandatory First Name field

**Steps**:
1. Login and add item to cart
2. Proceed to checkout
3. Leave First Name field empty
4. Fill Last Name: "Doe", Zip: "12345"
5. Click "Continue"

**Expected Results**:
- Error message displayed: "Error: First Name is required"
- Page remains on checkout info page
- Cannot proceed to overview

**Test Data**:
- First Name: (empty)
- Last Name: Doe
- Zip: 12345

---

#### TP-005: Empty Last Name Field
**Objective**: Verify validation for mandatory Last Name field

**Steps**:
1. Login and add item to cart
2. Proceed to checkout
3. Fill First Name: "John", Leave Last Name empty
4. Fill Zip: "12345"
5. Click "Continue"

**Expected Results**:
- Error message displayed: "Error: Last Name is required"
- Remain on checkout info page
- Cannot proceed

**Test Data**:
- First Name: John
- Last Name: (empty)
- Zip: 12345

---

#### TP-006: Empty Postal Code Field
**Objective**: Verify validation for mandatory Postal Code field

**Steps**:
1. Login and add item to cart
2. Proceed to checkout
3. Fill First Name: "John", Last Name: "Doe"
4. Leave Zip/Postal Code empty
5. Click "Continue"

**Expected Results**:
- Error message displayed: "Error: Postal Code is required"
- Remain on checkout info page
- Cannot proceed

**Test Data**:
- First Name: John
- Last Name: Doe
- Zip: (empty)

---

#### TP-007: All Fields Empty
**Objective**: Verify validation when all fields are empty

**Steps**:
1. Navigate to checkout page
2. Leave all fields empty
3. Click "Continue"

**Expected Results**:
- Error message for First Name (first missing field)
- OR Error message listing all required fields
- Remain on checkout page

**Test Data**:
- All fields empty

---

#### TP-008: Invalid Characters in First Name
**Objective**: Verify handling of special characters

**Steps**:
1. Login and add item to cart
2. Proceed to checkout
3. Enter First Name: "@#$%John"
4. Enter Last Name: "Doe"
5. Enter Zip: "12345"
6. Click "Continue"

**Expected Results**:
- Either accept and proceed (if alphanumeric validation not required)
- Or show validation error for invalid characters
- Behavior should be documented

**Test Data**:
- First Name: "@#$%John"
- Last Name: Doe
- Zip: 12345

---

#### TP-009: Invalid Postal Code Format
**Objective**: Verify postal code validation

**Steps**:
1. Login and add item to cart
2. Proceed to checkout
3. Enter First Name: "John", Last Name: "Doe"
4. Enter Zip: "ABC" (non-numeric)
5. Click "Continue"

**Expected Results**:
- Either accept any alphanumeric value
- Or display validation error
- Behavior documented

**Test Data**:
- Zip: ABC (invalid format)

---

### EDGE CASES

#### TP-010: Very Long Name Values
**Objective**: Verify handling of long input strings

**Steps**:
1. Enter First Name with 100+ characters
2. Enter Last Name with 100+ characters
3. Attempt checkout

**Expected Results**:
- Fields accept or truncate gracefully
- No system errors
- Checkout completes or shows validation error

**Test Data**:
- First Name: "JohnJohnJohnJohnJohnJohnJohnJohnJohnJohnJohn..." (100 chars)
- Last Name: "DoeDoeDoeDoeDoeDoeDoeDoeDoeDoeDoe..." (100 chars)
- Zip: "12345"

---

#### TP-011: Single Character Names
**Objective**: Verify minimum character validation

**Steps**:
1. Enter First Name: "J"
2. Enter Last Name: "D"
3. Enter Zip: "1"

**Expected Results**:
- Accept and proceed
- OR show minimum character requirement
- Behavior consistent

**Test Data**:
- First Name: J
- Last Name: D
- Zip: 1

---

#### TP-012: Numbers in Name Fields
**Objective**: Verify alphanumeric handling in name fields

**Steps**:
1. Enter First Name: "John123"
2. Enter Last Name: "Doe456"
3. Enter Zip: "12345"

**Expected Results**:
- Accept and proceed (most sites allow)
- OR show error
- Behavior documented

**Test Data**:
- First Name: John123
- Last Name: Doe456
- Zip: 12345

---

### NAVIGATION & FLOW TESTS

#### TP-013: Back Button from Checkout Information
**Objective**: Verify user can return to cart

**Steps**:
1. Add item to cart
2. Click Checkout
3. Click browser back button
4. Verify returned to cart

**Expected Results**:
- Redirect to cart page
- Item still in cart
- No data loss

**Test Data**:
- Item: Any product

---

#### TP-014: Continue Shopping Link
**Objective**: Verify "Continue Shopping" returns to products

**Steps**:
1. Add item to cart
2. Click "Continue Shopping" on cart page
3. Verify returned to products catalog

**Expected Results**:
- Returned to product listing page
- Cart item still retained
- Can add more items

**Test Data**:
- Cart: 1 item

---

#### TP-015: Cancel Checkout Flow
**Objective**: Verify cancel button functionality

**Steps**:
1. Proceed to checkout overview
2. Click "Cancel" button (if available)
3. Verify returned to cart or product page

**Expected Results**:
- Return to previous page
- Cart/data preserved
- No order created

**Test Data**:
- Item: Any product

---

#### TP-016: Navigation to Checkout from Different Sources
**Objective**: Verify checkout accessible from various entry points

**Steps**:
1. Test checkout access from:
   - Cart page checkout button
   - Product details page
   - Header shopping cart icon
2. Verify consistent checkout experience

**Expected Results**:
- All entry points lead to same checkout flow
- No missing steps
- Consistent UI/UX

**Test Data**:
- Various entry methods

---

### UI & VALIDATION TESTS

#### TP-017: Field Placeholder Text Visibility
**Objective**: Verify form placeholders or labels

**Steps**:
1. Navigate to checkout information page
2. Verify each field has clear label or placeholder:
   - First Name
   - Last Name
   - Zip/Postal Code
3. Verify optional vs. mandatory indicators

**Expected Results**:
- All fields clearly labeled
- Mandatory fields marked (with * or similar)
- Placeholder text helpful

**Test Data**:
- N/A (UI verification)

---

#### TP-018: Error Message Styling and Clarity
**Objective**: Verify error messages are clear and prominent

**Steps**:
1. Submit form with empty fields
2. Verify error message styling:
   - Color (typically red)
   - Font size
   - Visibility
   - Clear text explanation

**Expected Results**:
- Error messages highly visible
- Clear explanation of error
- Proper color contrast
- Accessibility compliant

**Test Data**:
- Empty fields

---

#### TP-019: Form Field Focus and Tab Order
**Objective**: Verify keyboard navigation

**Steps**:
1. Navigate to checkout form
2. Test Tab key navigation through fields
3. Verify correct tab order:
   - First Name → Last Name → Zip → Continue button
4. Test Shift+Tab backwards

**Expected Results**:
- Logical tab order maintained
- All fields accessible via keyboard
- Focus indicators visible

**Test Data**:
- Keyboard navigation

---

#### TP-020: Responsive Design - Mobile Checkout
**Objective**: Verify checkout works on mobile devices

**Steps**:
1. Access https://www.saucedemo.com on mobile (375px width)
2. Navigate through entire checkout flow
3. Verify:
   - Form fields properly sized
   - Buttons clickable
   - Text readable
   - No horizontal scrolling

**Expected Results**:
- Full checkout functionality on mobile
- No layout issues
- Touch-friendly buttons
- Proper spacing

**Test Data**:
- Mobile viewport: 375x667px

---

#### TP-021: Responsive Design - Tablet Checkout
**Objective**: Verify checkout on tablet

**Steps**:
1. Access on tablet (768px width)
2. Complete checkout flow
3. Verify proper layout and functionality

**Expected Results**:
- Optimized for tablet view
- All elements visible and usable
- Good readability

**Test Data**:
- Tablet viewport: 768x1024px

---

### SECURITY & EDGE CASES

#### TP-022: SQL Injection Attempt in Name Field
**Objective**: Verify input sanitization

**Steps**:
1. Enter First Name: "'; DROP TABLE users; --"
2. Complete checkout
3. Verify:
   - System doesn't crash
   - Data properly sanitized
   - Order completes normally

**Expected Results**:
- Input treated as literal string
- No database errors
- No injection vulnerability

**Test Data**:
- Malicious input: "'; DROP TABLE users; --"

---

#### TP-023: XSS Attempt in Form Fields
**Objective**: Verify XSS protection

**Steps**:
1. Enter First Name: "<script>alert('XSS')</script>"
2. Complete checkout
3. Verify no JavaScript execution

**Expected Results**:
- Input treated as text
- No script execution
- No alert popup
- XSS protected

**Test Data**:
- XSS payload: "<script>alert('XSS')</script>"

---

#### TP-024: Checkout Without Login
**Objective**: Verify checkout requires authentication

**Steps**:
1. Clear session/logout
2. Try to access checkout page directly
3. Verify redirect to login

**Expected Results**:
- Cannot access checkout without login
- Redirect to login page
- Security maintained

**Test Data**:
- No authentication

---

#### TP-025: Empty Cart Checkout Attempt
**Objective**: Verify cart must have items

**Steps**:
1. Clear cart completely
2. Try to access checkout
3. Verify prevention or redirect

**Expected Results**:
- Cannot proceed with empty cart
- Error message or redirect to products
- Business rule enforced

**Test Data**:
- Empty cart

---

## Cross-Browser Scenarios

For each critical test case, execute on:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)

**Critical Cases**: TP-001, TP-002, TP-004, TP-005, TP-006

---

## Test Data Summary

| Scenario | First Name | Last Name | Zip     | Expected Result |
|----------|-----------|-----------|---------|----------|
| Valid    | John      | Doe       | 12345   | Success         |
| Missing FN| (empty)   | Doe       | 12345   | Error           |
| Missing LN| John      | (empty)   | 12345   | Error           |
| Missing Zip| John     | Doe       | (empty) | Error           |
| All Empty | (empty)   | (empty)   | (empty) | Error           |

---

## Acceptance Criteria Mapping

| Acceptance Criterion | Test Cases |
|---------------------|----------|
| AC1: Cart Review | TP-001, TP-002, TP-017 |
| AC2: Checkout Info | TP-004, TP-005, TP-006, TP-007, TP-008, TP-009 |
| AC3: Order Overview | TP-003, TP-018, TP-019 |
| AC4: Order Completion | TP-001, TP-002 |
| AC5: Error Handling | TP-004 through TP-009, TP-018 |

---

## Notes
- Tests should be executed sequentially to maintain cart state
- Screenshots recommended for any failures
- Performance not explicitly tested but document load times
- Accessibility compliance recommended (WCAG 2.1 AA)