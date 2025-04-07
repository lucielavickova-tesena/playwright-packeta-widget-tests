# Packeta Widget Playwright Tests

This project contains automated tests for the Packeta Widget (v6) using Playwright.

## Prerequisites

*   [Node.js](https://nodejs.org/) (LTS version recommended)
*   npm (usually comes with Node.js) 

## Setup

1.  **Clone/Download:** Get the project files onto your local machine.
    ```bash
    git clone https://github.com/lucielavickova-tesena/playwright-packeta-widget-tests.git
    ```
2.  **Navigate to Project Directory:**
    ```bash
    cd playwright-packeta-widget-tests
    ```
3.  **Install Dependencies:**
    ```bash
    npm install
    ```
    This command installs Playwright and other necessary packages defined in `package.json`.
4.  **Install Browser Binaries:** (Run this if it's your first time using Playwright or if browsers are missing)
    ```bash
    npx playwright install
    ```

## Running Tests

1.  **Run All Tests (Headless Mode):**
    ```bash
    npx playwright test
    ```
    Tests will run in the background using the default browser configured in `playwright.config.ts` (Chromium).

2.  **Run Tests in Headed Mode (Visible Browser):**
    ```bash
    npx playwright test --headed
    ```
    This is useful for debugging and observing the test execution.

3.  **Run Tests for a Specific Browser:**
    ```bash
    # Run Chromium tests
    npx playwright test --project=chromium

    # Run Firefox tests 
    npx playwright test --project=firefox

    # Run Webkit (Safari) tests 
    npx playwright test --project=webkit
    ```

5.  **Run a Specific Test Case (by title):**
    ```bash
    # Run only location detection tests
    npx playwright test -g "TC1: Location Detection"

    # Run only the accessibility test
    npx playwright test -g "TC2: Find Accessible 24/7 Z-Box in Prague 9" 
    ```
    
6.  **Run tests 5 times in Chrome browser, with trace mode on:**
    ```bash
    npx playwright test --project=chromium --repeat-each=5 --trace=on
    ```

## Test Results

After running the tests, an HTML report will be generated in the `playwright-report` directory. You can open the `index.html` file in your browser to view detailed results:

```bash
npx playwright show-report
```

## Other Test Ideas
Ideas on other tests to implement:
- mobile browser viewports
- search
- suggestions when searching
- remove searched term
- location button in the search bar
- various filters combination
- branch detail
- map zoom + -
- markers clustering
- map fullscreen mode
- geolocate button in the map (move somewhere else and then return to the original location by clicking this icon)
- language mutations
- FAQ link
- accessibility (testing with screen reader, color contrast etc.)
- visual layout checks
