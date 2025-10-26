# Book Gym Class

This project is a personal tool designed to automate the reservation of group classes at my gym. By using a template, I can easily create a YAML file for each class I want to book, calling the template with the desired parameters: activity and activity time.

## Challenges

-   Github actions are not always triggered at the exact time that the scheduled workflow cron defines, it could take a bit of time to have a machine ready to execute the workflow. To solve this and be sure that I do the reservation at the exact time is available, I decided to start the workflow 10 min earlier and make it wait with a shell script until the target time is met.
