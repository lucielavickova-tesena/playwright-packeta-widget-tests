// tests/packeta-widget.spec.ts
import { test, expect, Page } from '@playwright/test';

const WIDGET_URL = '/v6/';
const extendedTimeout = 15000; 

// --- Test Case 1 Data ---
// Note: Finding the *exact* nearest Z-Box name is brittle as data changes.
// The test will verify that *a* Z-Box is found near the emulated location.
// TODO: use AI to generate test data dynamically?
const locationTestData = [
    {
        testName: 'Prague Center',
        latitude: 50.0833, // Near Wenceslas Square
        longitude: 14.4333,
        expectedResultNearby: true // Expect to find at least one nearby pickup point
    },
    {
        testName: 'Brno Center',
        latitude: 49.1951, // Near Freedom Square
        longitude: 16.6068,
        expectedResultNearby: true
    },
    {
        testName: 'Ostrava Center',
        latitude: 49.8356, // Near Masaryk Square
        longitude: 18.2925,
        expectedResultNearby: true
    },
    {
        testName: 'Pilsen Center',
        latitude: 49.7475, // Near Republic Square
        longitude: 13.3775,
        expectedResultNearby: true
    },
    {
        testName: 'Remote Area (Test No Results)', // Choose coordinates with likely no nearby points
        latitude: -21.2460, 
        longitude: 133.2200,
        expectedResultNearby: false 
    }
];

// --- Test Suite ---

test.describe('Packeta Widget Tests', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto(WIDGET_URL);
        await page.getByRole('button', { name: 'Accept all cookies' }).click(); //TODO: pre-set in local storage of the browser
        })

    // --- Test Case 1: Location Detection (Data Driven) ---
    test.describe('TC1: Location Detection', () => {
        for (const testData of locationTestData) {
            test(`should detect location and find nearby points for ${testData.testName}`, async ({ page, context }) => {
                // TODO: move locators to a central place
                const mapCanvas = page.locator('#map canvas');
                const markers = page.locator('.marker');
                const clusterMarker = page.locator('.maplibregl-marker');
                const branchListRows = page.locator('.branch-list-row');

                // Set emulated geolocation for this specific test context and reload the page
                await context.setGeolocation({ latitude: testData.latitude, longitude: testData.longitude });
                await page.reload();

                // Expect the map to be loaded
                await mapCanvas.waitFor({state: 'visible', timeout: extendedTimeout});
                                
                if (testData.expectedResultNearby) {
                    // Check that there is at least one branch listed on the left
                    expect(await branchListRows.count()).toBeGreaterThan(0); // at least one branch is displayed

                    // Check at least one marker is displayed on the map
                    expect(await markers.count()).toBeGreaterThan(0);
                    
                } else {
                    // Check the map does not display any detailed markers, just the ones with total number of branches in that area
                    expect(await markers.count()).toEqual(0);
                    expect(await clusterMarker.count()).toBeGreaterThan(0);
                }
            });
        }
    });

    // --- Test Case 2: Accessible Z-Box in Prague 9 ---
    test.only('TC2: Find Accessible 24/7 Z-Box in Prague 9', async ({ page }) => {
        // TODO: move locators to a central place
        const mapCanvas = page.locator('#map canvas');
        const searchInput = page.getByTestId('input_search_filed');
        const autocompleteList = page.getByTestId('autocomplete_list');
        const filterButton = page.getByTestId('filter_button');
        const parcelPointsFilter = page.getByTestId('parcel_points_section');
        const zBoxFilterOption = page.getByTestId('CZ-JGUZHA');
        const otherServicesFilter = page.getByTestId('filter_other_section');
        const wheelchairOption = page.getByTestId('wheelChair');
        const openHoursOption = page.getByTestId('open_hours_section');
        const submitFilterButton = page.getByTestId('filter_submit');
        const branchListRow = page.locator('.branch-list-row');

        // test data
        const searchedText = 'Praha 9';

        // constants
        const nonstopOpenHoursText = 'Nonstop';

        // Wait until some branches appear
        await mapCanvas.waitFor({state: 'visible', timeout: extendedTimeout});
        await branchListRow.first().waitFor({state: 'visible'});
        
        // Search for "Praha 9"
        await searchInput.fill(searchedText);
        await autocompleteList.waitFor({ state: 'visible' }); // wait for the autocomplete to appear, otherwise it covers the filter options later
        await searchInput.press('Enter');

        // Open the filter menu 
        await filterButton.click();

        // Apply Z-BOX filter
        await parcelPointsFilter.click();
        await zBoxFilterOption.click();

        // Apply Wheelchair Accessible filter
        await otherServicesFilter.click();
        await wheelchairOption.click();

        // Verify opening hours are 27/4 (Nonstop)
        await expect.soft(openHoursOption.filter({ hasText: nonstopOpenHoursText })).toBeVisible();
        await expect.soft(openHoursOption.filter({ has: page.getByRole('checkbox') })).toHaveCount(0); // no checkbox, just static information

        // Submit the filter
        await submitFilterButton.click();

        // Verify results contain searched text
        expect(await branchListRow.filter({ hasText: searchedText }).count()).toBeGreaterThan(0);
        // TODO: create a loop and check that all found branches are Z-BOXes and are open nonstop (in the detail)
        // TODO: verify markers are displayed on the map
    });



});