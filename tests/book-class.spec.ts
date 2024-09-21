import { test } from '@playwright/test';
import { LoginPage } from '../page-object/login-po';
import { BookingPage } from '../page-object/booking-po';

test('Book Class', async ({ page }) => {
    test.setTimeout(1200000);
    const loginPage = new LoginPage(page);
    const bookingPage = new BookingPage(page);
    await loginPage.goto();
    await loginPage.login();
    await bookingPage.goto();
    await bookingPage.bookDesiredClass();
    await bookingPage.verifyBookingConfirmationMessage();
});
