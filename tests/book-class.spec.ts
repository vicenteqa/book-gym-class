import { test, expect } from '@playwright/test';
const dayjs = require('dayjs');

test('has title', async ({ page }) => {
    const activity = process.env.ACTIVITY.toString();
    const activityTime = process.env.ACTIVITY_TIME.toString();
    const username = process.env.GYMUSERNAME.toString();
    const password = process.env.PASSWORD.toString();
    await page.goto('/');
    await expect(page).toHaveTitle(/Esportiu/);
    await page.getByLabel('Usuari').fill(username);
    await page.getByLabel('Contrasenya').fill(password);

    await page.getByRole('button', { name: 'Iniciar sessió' }).click();
    const twoDaysAfter = dayjs().add(2, 'day').format('YYYY-MM-DD');

    await page.goto(
        `https://esportiulapiscina.provis.es/ActividadesColectivas/ClasesColectivasTimeLine?fecha=${twoDaysAfter}T00:00:00`
    );
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
        .locator('button[class*="vistaContenido"]')
        .nth(i - 1)
        .click();
    await expect(page.locator('td[class="nombreClase"]')).toHaveText(activity);
    await page.locator('#btnReserva').click();
    await page.waitForTimeout(800);
    await expect(page.getByText('Reserva correctament')).toBeVisible();
});
