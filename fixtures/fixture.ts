import { test as base, expect } from "@playwright/test"
import { WidgetPage } from "../page-objects/widgetPage"

export type MyFixtures = {
    widgetPage: WidgetPage;
}

export const test = base.extend<MyFixtures>({
    widgetPage: async ({page}, use) => {
        const widget = new WidgetPage(page);
        await page.goto('/');
        await widget.acceptAllCookiesButton.click();
        await use(widget);
    }
})

export { expect };
