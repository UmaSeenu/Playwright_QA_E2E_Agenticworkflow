# End-to-End QA Workflow with Natural Language

## Workflow Overview
This guide facilitates a complete 7-step QA lifecycle using MCP servers and AI agents. It transitions from User Story to Test Design, Manual Exploration, Automation, Self-Healing, Reporting, and Git Integration.

---

## STEP 1: Read User Story

### Prompt
I need to start a new testing workflow. Please read the user story from the file:
user-stories/SCRUM-101-ecommerce-checkout.md

Summarize the key requirements, acceptance criteria, and testing scope.

### Expected Output
- Summary of the user story
- List of acceptance criteria
- Application URL and test credentials

---

## STEP 2: Create Test Plan

### Prompt
Based on the user story SCRUM-101, use the playwright-test-planner agent to:

1. Read application URL and test credentials.
2. Explore workflows from acceptance criteria.
3. Create a comprehensive test plan covering:
- Happy path scenarios
- Negative scenarios (validation errors, empty fields, invalid data)
- Edge cases and boundary conditions
- Navigation flow tests
- UI validation
4. Save as: specs/saucedemo-checkout-test-plan.md

Ensure each test includes: Clear title, step-by-step instructions, expected results, and test data.

### Expected Output
- Test plan saved in specs/
- Well-structured scenarios and exploration screenshots (if needed)

---

## STEP 3: Perform Exploratory Testing

### Prompt
Use Playwright MCP browser tools for manual testing. Read the plan from:
specs/saucedemo-checkout-test-plan.md

Execute Scenarios:
1. Run each test manually using the browser tool.
2. Validate expected vs. actual results.
3. Capture screenshots at key steps.
4. Document: Execution results, UI inconsistencies, bugs, and evidence.

### Expected Output
- Manual execution results
- Annotated screenshots and list of discovered issues

---

## STEP 4: Generate Automation Scripts

### Prompt
Use the playwright-test-generator agent using the Test Plan (Step 2) and Exploratory Insights (Step 3) as inputs.

Guidelines:
- Use stable selectors (IDs, roles, data attributes).
- Apply real wait strategies and handle UI quirks found in Step 3.

Generate Scripts:
1. Create tests for each scenario in: tests/saucedemo-checkout/.
2. Follow Playwright best practices (assertions, hooks, multi-browser support).

Run tests after generation to verify initial stability.

### Expected Output
- Complete test suite in tests/saucedemo-checkout/
- Scripts following best practices with robust selectors

---

## STEP 5: Execute and Heal Automation Tests

### Prompt
Use the playwright-test-healer agent to:
1. Run all tests from tests/saucedemo-checkout/.
2. Identify failures and analyze (selectors, timing, or assertions).
3. Auto-fix issues and update the scripts.
4. Repeat until all tests are stable and passing.
5. Document: Initial results, fixes applied, and final pass/fail status.

### Expected Output
- A stable, passing test suite
- Detailed healing logs explaining what was fixed

---