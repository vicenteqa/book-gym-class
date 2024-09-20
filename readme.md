# Book Gym Class
This project is a simple tool for personal use to do the reservation of group classes for my gym. The project uses page object model to define the locators and required functions in every page. The actions to get the bookings done are done with a template and I just have to create an yml for each class that I want to book, calling the template with the desired parameters, activity and activity time.


# Problem that this project solves
The main problem that I find when trying to book a class (specially crossfit class) for my gym is that they open the reservation just 48h hours before the class starts and they just allow 14 people to join, so it is easy to miss the shot when I manually try to book a class. What I solve with this code is to automate that (as it is way faster to do the booking with an automation tool) and to forget about the manual process. The jobs are scheduled a few minutes before the 48h hours before a class can be booked and then the code refreshes the page until it's 48h exact hours before the class and the button to do the booking is available and then proceeds with the reservation.


## Tech Stack

- Node.js
- Typescript
- Playwright

