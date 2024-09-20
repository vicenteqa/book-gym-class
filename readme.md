# Book Gym Class

This project is a personal tool designed to automate the reservation of group classes at my gym. It utilizes the Page Object Model to define locators and required functions for each page. By using a template, I can easily create a YAML file for each class I want to book, calling the template with the desired parameters: activity and activity time.

## Problem that this project solves

One of the main challenges I face when trying to book a class (especially CrossFit classes) at my gym is that reservations open only 48 hours before the class starts, and only 14 spots are available. This makes it easy to miss out on booking manually. This project automates the process, allowing for much faster bookings. The jobs are scheduled a few minutes before the 48-hour window (this is because GitHub actions can start a few minutes later than the time they are scheduled), refreshing the page until the exact time arrives when the booking button becomes available. Once the button is active, the code proceeds with the reservation.

## Tech Stack

-   Node.js
-   Typescript
-   Playwright

## Future improvements to do

-   Wait until the specific timestamp where the reservation button should be available and then go for it, instead of keeping refreshing the page with unnecessary requests until the button is present.
