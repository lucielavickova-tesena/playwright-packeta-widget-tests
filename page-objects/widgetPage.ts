import { Page, Locator, BrowserContext } from "@playwright/test";

export class WidgetPage {
    readonly page: Page;
    readonly url: string;

    // Accept cookies modal
    readonly acceptAllCookiesButton: Locator;

    // Map related locators
    readonly mapCanvas: Locator;
    readonly mapLoadingSpinner: Locator;
    readonly markers: Locator;
    readonly pointers: Locator;
    readonly clusterMarkers: Locator;

    // Search related locators
    readonly searchInput: Locator;
    readonly searchSuggestionsList: Locator;
    readonly branchList: Locator;
    readonly branchListRows: Locator;

    // Filter related locators
    readonly filterButton: Locator;
    readonly parcelPointsFilter: Locator;
    readonly zBoxFilterOption: Locator;
    readonly otherServicesFilter: Locator;
    readonly wheelchairOption: Locator;
    readonly openHoursOption: Locator;
    readonly submitFilterButton: Locator;

    constructor(page: Page) {

        this.page = page;

        // Accept cookies
        this.acceptAllCookiesButton = page.locator('button[data-cookiefirst-action="accept"]');

        // Map related locators
        this.mapCanvas = page.locator('#map canvas');
        this.mapLoadingSpinner = page.locator('.spinnerWrapper-0-1-194'); // TODO: ask developers to add test-dataid
        this.markers = page.locator('.marker');
        this.pointers = page.locator('.pointer');
        this.clusterMarkers = page.locator('.maplibregl-marker');

        // Search related locators
        this.searchInput = page.getByTestId('input_search_filed');
        this.searchSuggestionsList = page.getByTestId('autocomplete_list');
        this.branchList = page.locator('.branch-list');
        this.branchListRows = page.locator('.branch-list-row');

        // Filter related locators
        this.filterButton = page.getByTestId('filter_button');
        this.parcelPointsFilter = page.getByTestId('parcel_points_section');
        this.zBoxFilterOption = page.getByTestId('CZ-JGUZHA');
        this.otherServicesFilter = page.getByTestId('filter_other_section');
        this.wheelchairOption = page.getByTestId('wheelChair');
        this.openHoursOption = page.getByTestId('open_hours_section');
        this.submitFilterButton = page.getByTestId('filter_submit');

    }

    /**
     * Set emulated GPS location to simulate user is located on some latitude and longitude
     * @param context browser context
     * @param latitude latitude of user's emulated GPS location
     * @param longitude longitude of user's emulated GPS location
     */
    async setGPSLocation(context: BrowserContext, latitude: number, longitude: number) {
        await context.setGeolocation({ latitude, longitude });
        await this.page.reload();
        this.waitForMapToLoad();
    }

    /**
     * Select Z-Box from the filter menu and submit
     */
    async filterZBox() {
        // Open the filter menu 
        await this.filterButton.click();

        // Apply Z-BOX filter
        await this.parcelPointsFilter.click();
        await this.zBoxFilterOption.click();

        // Submit the filter
        await this.submitFilterButton.click();
    }

    /**
     * Wait for the map to be fully loaded - first, the loading animation needs to disappear (15sec)
     * and then the map canvas becomes visible (5sec), then the test can continue. 
     */
    async waitForMapToLoad() {
        await this.mapLoadingSpinner.waitFor({ state: 'detached', timeout: 15000 });
        await this.mapCanvas.waitFor({ state: 'visible', timeout: 5000 });
    }

}