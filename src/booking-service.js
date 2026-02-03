import * as cheerio from 'cheerio';
import { waitUntil } from './wait.js';
import { createAuthClient } from './auth.js';

export function createBookingService(baseUrl, instalacionId = null) {
    const { cookieFetch, login } = createAuthClient(baseUrl);

    async function cambiarInstalacion() {
        if (!instalacionId) return;

        const res = await cookieFetch(
            `${baseUrl}/Layout/CambiarInstalacion?idmultiinstalacion=${instalacionId}&returnUrl=/`,
            { method: 'GET' }
        );

        if (!res.ok) throw new Error('Error al cambiar de instalación');
    }

    async function getClases(offset) {
        const date = new Date();
        date.setDate(date.getDate() + Number(offset));
        const formattedDate = date.toISOString().split('T')[0] + 'T00:00:00';
        const res = await cookieFetch(
            `${baseUrl}/ActividadesColectivas/ClasesColectivasTimeLine?fecha=${formattedDate}`,
            {
                method: 'GET',
            }
        );

        if (!res.ok) throw new Error('Error al obtener clases');

        return await res.text();
    }

    function extractClasses(html) {
        const $ = cheerio.load(html);
        const clases = [];

        $('li').each((_, el) => {
            const name = $(el).find('h2 b').text().trim();
            const time = $(el).find('time .tm-datetime-time').text().trim();
            const id = $(el).find('button').attr('id');

            if (name && time && id) clases.push({ name, time, id });
        });

        return clases;
    }

    function findClassId(clases, activity, activityTime) {
        if (!Array.isArray(clases)) return null;
        const clase = clases.find((c) => {
            return c && c.name === activity && c.time === activityTime;
        });
        return clase ? clase.id : null;
    }

    async function reservarClase(idClase, idPlaza = null, idBonoPersona = null) {
        const body = {
            idClaseColectiva: idClase,
            idPlaza,
            idBonoPersona,
        };

        const res = await cookieFetch(
            `${baseUrl}/ActividadesColectivas/ReservarClaseColectiva`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                    Accept: 'application/json, text/javascript, */*; q=0.01',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify(body),
            }
        );

        if (!res.ok) {
            throw new Error(`Reserva fallida: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();
        const response = JSON.parse(data);
        return response.status === 'OK';
    }

    async function bookClass({ activity, activityTime, daysAhead }) {
        await login();
        await cambiarInstalacion();
        const html = await getClases(daysAhead);
        const classes = extractClasses(html);
        const classId = findClassId(classes, activity, activityTime);

        if (classId) {
            console.log(
                `I will book class ${activity} at ${activityTime} with id ${classId}`
            );
            await waitUntil();
            const resultado = await reservarClase(classId);
            if (resultado) {
                console.log('Booking succeeded');
                return true;
            } else {
                throw new Error('Booking failed');
            }
        } else {
            throw new Error('Class not found');
        }
    }

    return {
        login,
        getClases,
        extractClasses,
        findClassId,
        reservarClase,
        bookClass,
    };
}
