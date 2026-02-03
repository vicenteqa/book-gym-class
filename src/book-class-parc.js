import 'dotenv/config';
import { createBookingService } from './booking-service.js';

const PARC_INSTALACION_ID = '5759';

const bookingService = createBookingService(process.env.BASE_URL, PARC_INSTALACION_ID);

(async () => {
    await bookingService.bookClass({
        activity: process.env.ACTIVITY,
        activityTime: process.env.ACTIVITY_TIME,
        daysAhead: process.env.DAYS_AHEAD,
    });
})();
