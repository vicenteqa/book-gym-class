/**
 * Espera hasta la hora objetivo en la zona de Madrid (Europe/Madrid)
 * @param {string} targetTimeStr - hora en formato "HH:MM"
 */
export async function waitUntil(_targetTimeStr = process.env.ACTIVITY_TIME) {
    const targetTimeStr = _targetTimeStr;
    const [hours, minutes] = targetTimeStr.split(':').map(Number);

    const now = new Date();
    const nowMadrid = new Date(
        now.toLocaleString('en-US', { timeZone: 'Europe/Madrid' })
    );

    const targetDate = new Date(
        nowMadrid.getFullYear(),
        nowMadrid.getMonth(),
        nowMadrid.getDate(),
        hours,
        minutes,
        0
    );

    const sleepTime = targetDate.getTime() - nowMadrid.getTime();

    if (sleepTime > 0) {
        console.log(
            `Sleeping for ${Math.round(sleepTime / 1000)} seconds until ${targetTimeStr} Madrid time...`
        );
        await new Promise((resolve) => setTimeout(resolve, sleepTime));
        console.log('Reached the target timestamp. Continuing execution...');
    } else {
        console.log('Target time has already passed for today.');
    }
}
