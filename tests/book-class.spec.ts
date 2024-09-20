import { test } from '@playwright/test';
import { LoginPage } from '../page-object/login-po';
import { BookingPage } from '../page-object/booking-po';

test('Book Class', async ({ page }) => {
    // test.setTimeout(1200000);
    console.log(process.env.ACTIVITY);
    console.log(process.env.ACTIVITY_TIME);
    console.log(process.env.GYMUSERNAME);
    console.log(process.env.PASSWORD);
    console.log(process.env.BASE_URL);
    const loginPage = new LoginPage(page);
    const bookingPage = new BookingPage(page);
    await loginPage.goto();
    await loginPage.login();
    await bookingPage.goto();
    await bookingPage.waitUntilBookingButtonIsAvailable();
    await bookingPage.modalBookingButton.click();
    await bookingPage.verifyBookingConfirmationMessage();
});
