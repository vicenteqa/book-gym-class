import fetch from 'node-fetch';
import fetchCookie from 'fetch-cookie';
import * as cheerio from 'cheerio';
import 'dotenv/config';

export function createAuthClient(baseUrl) {
    const cookieFetch = fetchCookie(fetch);

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

    return { cookieFetch, login };
}
