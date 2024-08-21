import { test, expect } from '@playwright/test';
const dayjs = require('dayjs');

test('has title', async ({ page }) => {
    const activity = 'AQUASALUT';
    const activityTime = '08:15';
    await page.goto('/');
    await expect(page).toHaveTitle(/Esportiu/);
    await page.getByLabel('Usuari').fill('');
    await page.getByLabel('Contrasenya').fill('');
    await page.getByRole('button', { name: 'Iniciar sessió' }).click();
    await page
        .locator('a')
        .filter({ hasText: 'Activitats Col·lectives' })
        .first()
        .click();
    await page.getByRole('link', { name: 'Reservar Activitats Col·' }).click();
    await page.waitForTimeout(800);
    await page.locator('input[id="dateAACC"]').click();

    const todayDay = dayjs().format('DD');
    const dayToBook = parseInt(todayDay) + 2;
    await page.getByRole('cell', { name: dayToBook.toString() }).click();
    const gymClasses = await page.locator('ol[class="tm-items"] li').all();
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
        .locator('button[data-target="#modalReserva"]')
        .nth(i - 1)
        .click();
    await expect(page.locator('td[class="nombreClase"]')).toHaveText(activity);
    await page.locator('#btnReserva').click();
    await expect(page.locator('div[class="swal-modal"]')).toBeVisible();
});
