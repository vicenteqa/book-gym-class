import { test, expect } from '@playwright/test';
const dayjs = require('dayjs');
import 'dotenv/config';

test('Book Class', async ({ page }) => {
    test.setTimeout(1200000);
    const activity = process.env.ACTIVITY.toString();
    const activityTime = process.env.ACTIVITY_TIME.toString();
    const username = process.env.GYMUSERNAME.toString();
    const password = process.env.PASSWORD.toString();

    await page.goto('/');
    await expect(page).toHaveTitle(/Esportiu/);
    await page.getByLabel('Usuari').fill(username);
    await page.getByLabel('Contrasenya').fill(password);

    await page.getByRole('button', { name: 'Iniciar sessió' }).click();
    const twoDaysAfter = dayjs().add(0, 'day').format('YYYY-MM-DD');

    await page.goto(
        `https://esportiulapiscina.provis.es/ActividadesColectivas/ClasesColectivasTimeLine?fecha=${twoDaysAfter}T00:00:00`
    );

    await page.waitForTimeout(1000);

    const bookingButton = page
        .locator('#modalReserva')
        .locator('button')
        .getByText('Reservar');

    let isBookingButtonAvailable = false;

    while (!isBookingButtonAvailable) {
        await clickBookDesiredClassFromList(page, activity, activityTime);
        await page.waitForTimeout(1000);
        isBookingButtonAvailable = await bookingButton.isVisible();
        if (!isBookingButtonAvailable) {
            await page.waitForTimeout(20000);
            await page.reload();
        }
    }

    await bookingButton.click();

    await page.waitForTimeout(1000);
    await expect(page.getByText('Reserva correctament')).toBeVisible();
});

async function clickBookDesiredClassFromList(page, activity, activityTime) {
    const gymClasses = await page.locator('ol.tm-items li').all();
    let indexFound = false;
    let i = 0;
    for (i = 0; i < gymClasses.length && !indexFound; i++) {
        const classItemText = await gymClasses[i].textContent();
        if (
            classItemText !== null &&
            classItemText.includes(activity) &&
            classItemText.includes(activityTime)
        )
            indexFound = true;
    }

    await page
        .locator('button[class*="vistaContenido"]')
        .nth(i - 1)
        .click();

    await expect(page.locator('td.nombreClase')).toHaveText(activity);
}
