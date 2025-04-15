// tests/packeta-widget.spec.ts
//import { test, expect} from '@playwright/test';
//import { WidgetPage } from '../page-objects/widgetPage';
import { test, expect } from '../fixtures/fixture';

const mapDisplayTimeout = 15000; // used when waiting for the map to be loaded
const locationTestData = JSON.parse(JSON.stringify(require("../test-data/gps-coordinates.json")))

// --- Test Suite ---
test.describe('Packeta Widget Tests', () => {

    // --- Test Case 1: Location Detection (Data Driven) ---
    test.describe('TC1: Location Detection', () => {
        for (const testData of locationTestData) {
            test(`Should detect location and find nearby Z-boxes for ${testData.testName}`, async ({ widgetPage, context }) => {
                
                // Set emulated geolocation for this specific test context
                await widgetPage.setGPSLocation(context, testData.latitude, testData.longitude);

                // filter for ZBoxes
                await widgetPage.filterZBox();

                if (testData.expectedResultNearby) {
                    // Check at least one branch is listed on the left
                    await expect(widgetPage.branchListRows.first()).toBeVisible();

                    // Check at least one marker or pointer is displayed on the map
                    await expect(widgetPage.markers.or(widgetPage.pointers).first()).toBeVisible();

                } else {
                    // Check no branches are displayed
                    await expect(widgetPage.branchListRows).not.toBeVisible();
                    await expect(widgetPage.branchList).toHaveText('The list of pick-up points is not available.');
                    
                    // Check the map does not display any detailed markers, just the ones with total number of branches in that area
                    await expect(widgetPage.markers).not.toBeVisible();
                    await expect(widgetPage.clusterMarkers.first()).toBeVisible();
                }
            });
        }
    });

    // --- Test Case 2: Accessible Z-Box in Prague 9 ---
    test('TC2: Find Accessible 24/7 Z-Box in Prague 9', async ({ widgetPage, page }) => {
        // test data
        const searchedText = 'Praha 9';

        // Wait until map is loaded and some branches appear
        await widgetPage.waitForMapToLoad();
        await widgetPage.branchListRows.first().waitFor({ state: 'visible' });

        // Search for "Praha 9"
        await widgetPage.searchInput.fill(searchedText);
        await widgetPage.searchSuggestionsList.waitFor({ state: 'visible' }); // wait for the autocomplete to appear, otherwise it covers the filter options later
        await widgetPage.searchInput.press('Enter');

        // Open the filter menu 
        await widgetPage.filterButton.click();

        // Apply Z-BOX filter
        await widgetPage.parcelPointsFilter.click();
        await widgetPage.zBoxFilterOption.click();

        // Apply Wheelchair Accessible filter
        await widgetPage.otherServicesFilter.click();
        await widgetPage.wheelchairOption.click();

        // Verify opening hours are 27/4 (Nonstop)
        await expect.soft(widgetPage.openHoursOption.filter({ hasText: 'Nonstop' })).toBeVisible();
        await expect.soft(widgetPage.openHoursOption.filter({ has: page.getByRole('checkbox') })).not.toBeVisible(); // no checkbox, just static information

        // Submit the filter
        await widgetPage.submitFilterButton.click();

        // Verify results contain searched text
        await expect(widgetPage.branchListRows.filter({ hasText: searchedText }).first()).toBeVisible();

        // Verify pointers or markers are displayed on the map
        await expect(widgetPage.markers.or(widgetPage.pointers).first()).toBeVisible(); 

        // TODO: create a loop and check that all found branches are Z-BOXes and are open nonstop (in the detail)
    });

});