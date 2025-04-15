// tests/packeta-widget.spec.ts
import { test, expect} from '@playwright/test';
import { Widget } from '../page-objects/widget';

const mapDisplayTimeout = 15000; // used when waiting for the map to be loaded
const locationTestData = JSON.parse(JSON.stringify(require("../test-data/gps-coordinates.json")))
let widget: Widget;

// --- Test Suite ---
test.describe('Packeta Widget Tests', () => {

    test.beforeEach(async ({ page }) => {
        widget = new Widget(page);
        await widget.goto();
        await widget.acceptAllCookiesButton.click();
    })

    // --- Test Case 1: Location Detection (Data Driven) ---
    test.describe('TC1: Location Detection', () => {
        for (const testData of locationTestData) {
            test(`Should detect location and find nearby Z-boxes for ${testData.testName}`, async ({ context }) => {
                
                // Set emulated geolocation for this specific test context
                await widget.setGPSLocation(context, testData.latitude, testData.longitude);

                // filter for ZBoxes
                await widget.filterZBox();

                if (testData.expectedResultNearby) {
                    // Check at least one branch is listed on the left
                    await expect(widget.branchListRows.first()).toBeVisible();

                    // Check at least one marker or pointer is displayed on the map
                    await expect(widget.markers.or(widget.pointers).first()).toBeVisible();

                } else {
                    // Check no branches are displayed
                    await expect(widget.branchListRows).not.toBeVisible();
                    await expect(widget.branchList).toHaveText('The list of pick-up points is not available.');
                    
                    // Check the map does not display any detailed markers, just the ones with total number of branches in that area
                    await expect(widget.markers).not.toBeVisible();
                    await expect(widget.clusterMarkers.first()).toBeVisible();
                }
            });
        }
    });

    // --- Test Case 2: Accessible Z-Box in Prague 9 ---
    test('TC2: Find Accessible 24/7 Z-Box in Prague 9', async ({ page }) => {
        // test data
        const searchedText = 'Praha 9';

        // Wait until map is loaded and some branches appear
        await widget.waitForMapToLoad();
        await widget.branchListRows.first().waitFor({ state: 'visible' });

        // Search for "Praha 9"
        await widget.searchInput.fill(searchedText);
        await widget.searchSuggestionsList.waitFor({ state: 'visible' }); // wait for the autocomplete to appear, otherwise it covers the filter options later
        await widget.searchInput.press('Enter');

        // Open the filter menu 
        await widget.filterButton.click();

        // Apply Z-BOX filter
        await widget.parcelPointsFilter.click();
        await widget.zBoxFilterOption.click();

        // Apply Wheelchair Accessible filter
        await widget.otherServicesFilter.click();
        await widget.wheelchairOption.click();

        // Verify opening hours are 27/4 (Nonstop)
        await expect.soft(widget.openHoursOption.filter({ hasText: 'Nonstop' })).toBeVisible();
        await expect.soft(widget.openHoursOption.filter({ has: page.getByRole('checkbox') })).not.toBeVisible(); // no checkbox, just static information

        // Submit the filter
        await widget.submitFilterButton.click();

        // Verify results contain searched text
        await expect(widget.branchListRows.filter({ hasText: searchedText }).first()).toBeVisible();

        // Verify pointers or markers are displayed on the map
        await expect(widget.markers.or(widget.pointers).first()).toBeVisible(); 

        // TODO: create a loop and check that all found branches are Z-BOXes and are open nonstop (in the detail)
    });

});