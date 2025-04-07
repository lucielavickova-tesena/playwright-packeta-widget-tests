// tests/packeta-widget.spec.ts
import { test, expect, Page } from '@playwright/test';
import { Widget } from '../page-objects/widget';

const mapDisplayTimeout = 15000; // used when waiting for the map to be loaded
const locationTestData = JSON.parse(JSON.stringify(require("../test-data/gps-coordinates.json")))
let widget: Widget;

// --- Test Suite ---
test.describe('Packeta Widget Tests', () => {

    test.beforeEach(async ({ page }) => {
        widget = new Widget(page);
        widget.goto();
        widget.acceptCookies();
    })

    // --- Test Case 1: Location Detection (Data Driven) ---
    test.describe('TC1: Location Detection', () => {
        for (const testData of locationTestData) {
            test(`should detect location and find nearby points for ${testData.testName}`, async ({ page, context }) => {
                
                // Set emulated geolocation for this specific test context and reload the page
                await widget.setGPSLocation(context, testData.latitude, testData.longitude);
                await widget.filterZBox();

                if (testData.expectedResultNearby) {
                    // Check at least one branch is listed on the left
                    expect(await widget.getBranchListRows.count()).toBeGreaterThan(0);

                    // Check at least one marker or pointer is displayed on the map
                    expect(await markers.or(pointers).count()).toBeGreaterThan(0);

                } else {
                    // Check no branches are displayed
                    expect(await branchListRows.count()).toEqual(0);
                    expect(await branchList.textContent()).toEqual('The list of pick-up points is not available.');
                    
                    // Check the map does not display any detailed markers, just the ones with total number of branches in that area
                    expect(await markers.count()).toEqual(0);
                    expect(await clusterMarkers.count()).toBeGreaterThan(0);
                }
            });
        }
    });

    // --- Test Case 2: Accessible Z-Box in Prague 9 ---
    test('TC2: Find Accessible 24/7 Z-Box in Prague 9', async ({ page }) => {
        // TODO: create page object and move locators to the page object class


        // test data
        const searchedText = 'Praha 9';

        // constants
        const nonstopOpenHoursText = 'Nonstop';

        // Wait until some branches appear
        await mapLoadingSpinner.waitFor({ state: 'detached', timeout: mapDisplayTimeout });
        await mapCanvas.waitFor({ state: 'visible'});
        await branchListRows.first().waitFor({ state: 'visible' });

        // Search for "Praha 9"
        await searchInput.fill(searchedText);
        await searchSuggestionsList.waitFor({ state: 'visible' }); // wait for the autocomplete to appear, otherwise it covers the filter options later
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
        expect(await branchListRows.filter({ hasText: searchedText }).count()).toBeGreaterThan(0);

        // Verify pointers or markers are displayed on the map
        const numberOfPointerOrMarkerDisplayed = await markers.count() + await pointers.count();
        expect(numberOfPointerOrMarkerDisplayed).toBeGreaterThan(0); // there is at least one marker or pointer on the map

        // TODO: create a loop and check that all found branches are Z-BOXes and are open nonstop (in the detail)
    });

});