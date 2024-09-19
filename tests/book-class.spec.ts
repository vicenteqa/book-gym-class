import { test, expect } from '@playwright/test';
import 'dotenv/config';
import { LoginPage } from '../page-object/login-po';
import { BookingPage } from '../page-object/booking-po';

test('Book Class', async ({ page }) => {
    test.setTimeout(1200000);

    const loginPage = new LoginPage(page);
    const bookingPage = new BookingPage(page);
    await loginPage.goto();
    await loginPage.login();
    await bookingPage.goto();

    await bookingPage.waitUntilBookingButtonIsVisible();
    await bookingPage.bookingButton.click();

    await page.waitForTimeout(1000);
    await expect(page.getByText('Reserva correctament')).toBeVisible();
});
