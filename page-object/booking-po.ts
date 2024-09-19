import { type Locator, type Page, expect } from '@playwright/test';
import dayjs from 'dayjs';
import 'dotenv/config';

export class BookingPage {
    readonly page: Page;
    readonly modalBookingButton: Locator;
    readonly modalClassNameLabel: Locator;
    readonly listOfClasses: Locator;
    readonly listOfButtonsToBookClass: Locator;
    readonly bookingConfirmationMessage: Locator;

    constructor(page: Page) {
        this.page = page;
        this.bookingConfirmationMessage = page.getByText(
            'Reserva correctament'
        );
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

    async goto(daysAhead: number = 0) {
        const selectedDate = dayjs().add(daysAhead, 'day').format('YYYY-MM-DD');
        await this.page.goto(
            `/ActividadesColectivas/ClasesColectivasTimeLine?fecha=${selectedDate}T00:00:00`
        );
    }

    async verifyBookingConfirmationMessage() {
        await expect(this.bookingConfirmationMessage).toBeVisible({
            timeout: 3000,
        });
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

    async waitUntilBookingButtonIsAvailable() {
        let isBookingButtonAvailable = false;

        while (!isBookingButtonAvailable) {
            const desiredClassIndex = await this.findDesiredClassIndex();
            await this.clickBookDesiredClassFromList(desiredClassIndex);
            await this.page.waitForTimeout(1000);
            await this.validateActivityName();

            isBookingButtonAvailable =
                await this.modalBookingButton.isVisible();
            if (!isBookingButtonAvailable) {
                await this.page.waitForTimeout(5000);
                await this.page.reload();
            }
        }
    }

    async findDesiredClassIndex() {
        if (process.env.ACTIVITY && process.env.ACTIVITY_TIME) {
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

    async clickBookDesiredClassFromList(desiredClassIndex: number) {
        await this.listOfButtonsToBookClass.nth(desiredClassIndex).click();
    }
}
