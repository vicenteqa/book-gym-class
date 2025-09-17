import { type Locator, type Page, expect } from '@playwright/test';
import dayjs from 'dayjs';
import 'dotenv/config';

export class BookingPage {
    readonly page: Page;
    readonly modalBookingButton: Locator;
    readonly modalClassNameLabel: Locator;
    readonly listOfClasses: Locator;
    readonly listOfButtonsToBookClass: Locator;

    constructor(page: Page) {
        this.page = page;
        this.modalClassNameLabel = page.locator('td.nombreClase');
        this.listOfClasses = page.locator('ol.tm-items li');
        this.listOfButtonsToBookClass = page.locator(
            'button[class*="vistaContenido"]'
        );
        this.modalBookingButton = page
            .locator('#modalReserva')
            .locator('button')
            .getByText('Reservar');
    }

    async goto() {
        const daysAhead = parseInt(process.env.DAYS_AHEAD ?? '2');
        const selectedDate = dayjs().add(daysAhead, 'day').format('YYYY-MM-DD');
        await this.page.goto(
            `/ActividadesColectivas/ClasesColectivasTimeLine?fecha=${selectedDate}T00:00:00`
        );
    }

    async waitForBookingClassEndpoint() {
        await this.page.waitForResponse(
            (response) =>
                response
                    .url()
                    .includes(
                        '/ActividadesColectivas/ReservarClaseColectiva'
                    ) && response.status() === 200
        );
    }

    async validateActivityName() {
        if (process.env.ACTIVITY)
            await expect(this.modalClassNameLabel).toHaveText(
                process.env.ACTIVITY
            );
        else {
            throw new Error('ACTIVITY env variable should be defined.');
        }
    }

    async bookDesiredClass() {
        const desiredClassIndex = await this.findDesiredClassIndex();
        console.log(desiredClassIndex);
        await this.listOfButtonsToBookClass.nth(desiredClassIndex).click();
        await this.page.waitForTimeout(1000);
        await this.validateActivityName();
        await this.modalBookingButton.click();
        await this.waitForBookingClassEndpoint();
    }

    async findDesiredClassIndex() {
        if (process.env.ACTIVITY && process.env.ACTIVITY_TIME) {
            console.log(process.env.ACTIVITY);
            console.log(process.env.ACTIVITY_TIME);
            const activity = process.env.ACTIVITY;
            const activityTime = process.env.ACTIVITY_TIME;
            const gymClasses = await this.listOfClasses.all();
            let indexFound = -1;
            for (let i = 0; i < gymClasses.length; i++) {
                const classItemText = await gymClasses[i].textContent();
                if (
                    classItemText !== null &&
                    classItemText.includes(activity) &&
                    classItemText.includes(activityTime)
                ) {
                    indexFound = i;
                    break;
                }
            }
            return indexFound;
        } else {
            throw new Error(
                'ACTIVITY & ACTIVITY_TIME env variables should be defined.'
            );
        }
    }
}
