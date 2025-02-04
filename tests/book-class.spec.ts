import { test } from '@playwright/test';
import { LoginPage } from '../page-object/login-po';
import { BookingPage } from '../page-object/booking-po';

test('Book Class', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const bookingPage = new BookingPage(page);
    await loginPage.goto();
    await loginPage.acceptCookies();
    await loginPage.login();
    await bookingPage.goto();
    await bookingPage.bookDesiredClass();
});
