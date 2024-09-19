import { type Locator, type Page, expect } from '@playwright/test';
import dayjs from 'dayjs';

export class BookingPage {
    readonly page: Page;
    readonly bookingButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.bookingButton = page
            .locator('#modalReserva')
            .locator('button')
            .getByText('Reservar');
    }

    async goto(daysAhead: number = 0) {
        const selectedDate = dayjs().add(daysAhead, 'day').format('YYYY-MM-DD');
        await this.page.goto(
            `/ActividadesColectivas/ClasesColectivasTimeLine?fecha=${selectedDate}T00:00:00`
        );
    }

    async waitUntilBookingButtonIsVisible() {
        let isBookingButtonAvailable = false;

        while (!isBookingButtonAvailable) {
            await this.clickBookDesiredClassFromList();
            await this.page.waitForTimeout(1000);
            isBookingButtonAvailable = await this.bookingButton.isVisible();
            if (!isBookingButtonAvailable) {
                await this.page.waitForTimeout(5000);
                await this.page.reload();
            }
        }
    }

    async clickBookDesiredClassFromList() {
        const gymClasses = await this.page.locator('ol.tm-items li').all();
        let indexFound = false;
        let i = 0;
        for (i = 0; i < gymClasses.length && !indexFound; i++) {
            const classItemText = await gymClasses[i].textContent();
            if (
                classItemText !== null &&
                classItemText.includes(process.env.ACTIVITY) &&
                classItemText.includes(process.env.ACTIVITY_TIME)
            )
                indexFound = true;
        }
        await this.page
            .locator('button[class*="vistaContenido"]')
            .nth(i - 1)
            .click();

        await expect(this.page.locator('td.nombreClase')).toHaveText(
            process.env.ACTIVITY
        );
    }
}
