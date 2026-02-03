import 'dotenv/config';
import { createAuthClient } from './auth.js';

const baseUrl = process.env.BASE_URL;
const { cookieFetch, login } = createAuthClient(baseUrl);

async function getReservas() {
    const now = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    const params = new URLSearchParams({
        anio: now.getFullYear(),
        mes: now.getMonth() + 1,
        dia: now.getDate(),
        hastaAnio: endDate.getFullYear(),
        hastaMes: endDate.getMonth() + 1,
        hastaDia: endDate.getDate(),
        _: Date.now(),
    });

    const res = await cookieFetch(
        `${baseUrl}/ActividadesColectivas/GetReservas?${params}`,
        {
            method: 'GET',
            headers: {
                Accept: 'application/json, text/javascript, */*; q=0.01',
                'X-Requested-With': 'XMLHttpRequest',
            },
        }
    );

    if (!res.ok) throw new Error('Error al obtener reservas');

    const data = await res.json();
    return data.data;
}

function findClosestReserva(reservas) {
    if (!reservas || reservas.length === 0) return null;

    const now = new Date();

    const futureReservas = reservas.filter(
        (r) => new Date(r.HoraDeInicio) > now
    );

    if (futureReservas.length === 0) return null;

    futureReservas.sort(
        (a, b) => new Date(a.HoraDeInicio) - new Date(b.HoraDeInicio)
    );

    return futureReservas[0];
}

async function cancelarClase(idClaseColectiva, idInstalacion) {
    const body = {
        idClaseColectiva,
        idInstalacion,
    };

    const res = await cookieFetch(
        `${baseUrl}/ActividadesColectivas/AnularActividadColectiva`,
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
        throw new Error(`Cancelación fallida: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    return data.reservaRealizada === true;
}

const dryRun = process.env.DRY_RUN !== 'false';

(async () => {
    await login();
    const reservas = await getReservas();
    const closest = findClosestReserva(reservas);

    if (closest) {
        console.log(
            `Class to cancel: "${closest.NombreActividadColectiva.trim()}" at ${closest.HoraDeInicio}`
        );

        if (dryRun) {
            console.log('[DRY RUN] Not actually cancelling. Set DRY_RUN=false to cancel.');
        } else {
            const result = await cancelarClase(
                closest.IDClaseColectiva,
                closest.IDInstalacion
            );
            if (result) {
                console.log('Cancellation succeeded');
            } else {
                throw new Error('Cancellation failed');
            }
        }
    } else {
        console.log('No upcoming reservations found');
    }
})();
