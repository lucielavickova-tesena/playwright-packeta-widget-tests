import { Page, Locator } from "@playwright/test";

export class Widget {
    readonly page: Page;
    readonly url: string;

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
        this.url = '/v6/';

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

    async goto() {
        await this.page.goto(this.url);
    }

    async reload() {
        await this.page.reload();
    }

    async acceptCookies() {
        this.page.locator('button[data-cookiefirst-action="accept"]').click();
    }

    async setGPSLocation(context, latitude, longitude) {
        await context.setGeolocation({ latitude, longitude });
        await this.page.reload();
    }

    async filterZBox() {
        await this.waitForMapToLoad();

        // Open the filter menu 
        await this.filterButton.click();

        // Apply Z-BOX filter
        await this.parcelPointsFilter.click();
        await this.zBoxFilterOption.click();

        // Submit the filter
        await this.submitFilterButton.click();
    }

    async getBranchListRows() {
        return this.branchListRows;
    }

    async waitForMapToLoad() {
        // Wait for the map to load
        await this.mapLoadingSpinner.waitFor({ state: 'detached', timeout: mapDisplayTimeout });
        await this.mapCanvas.waitFor({ state: 'visible' });
    }

}