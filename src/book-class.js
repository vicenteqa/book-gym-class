import fetch from 'node-fetch';
import fetchCookie from 'fetch-cookie';
import * as cheerio from 'cheerio';
import 'dotenv/config';
import { waitUntil } from './wait.js';

const cookieFetch = fetchCookie(fetch);
const baseUrl = process.env.BASE_URL;

async function getRequestVerificationToken() {
    const res = await cookieFetch(`${baseUrl}/Login`);
    const html = await res.text();

    const $ = cheerio.load(html);
    const token = $('input[name="__RequestVerificationToken"]').val();

    if (!token) throw new Error('No se pudo extraer el token');
    return token;
}

async function login() {
    const token = await getRequestVerificationToken();

    const body = new URLSearchParams({
        __RequestVerificationToken: token,
        Username: process.env.GYMUSERNAME,
        Password: process.env.PASSWORD,
        RememberMe: 'false',
    });

    const res = await cookieFetch(`${baseUrl}/Login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body,
    });

    if (!res.ok) throw new Error('Login fallido');
    return true;
}

async function getClases(offset = process.env.DAYS_AHEAD) {
    const date = new Date();
    date.setDate(date.getDate() + offset);
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

function findClassId(clases) {
    if (!Array.isArray(clases)) return null;
    const clase = clases.find((c) => {
        return (
            c &&
            c.name === process.env.ACTIVITY &&
            c.time === process.env.ACTIVITY_TIME
        );
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
    return JSON.parse(data).status === 'OK';
}

(async () => {
    await login();
    const html = await getClases(0);
    const classes = extractClasses(html);
    const classId = findClassId(classes);
    await waitUntil();
    const resultado = await reservarClase(classId);
    console.log(resultado ? 'Reserva exitosa' : 'Reserva fallida');
    return resultado;
})();
