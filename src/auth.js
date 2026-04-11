import fetch from 'node-fetch';
import fetchCookie from 'fetch-cookie';
import { CookieJar, Cookie } from 'tough-cookie';
import * as cheerio from 'cheerio';
import 'dotenv/config';

const USER_AGENT =
    'Mozilla/5.0 (X11; Linux x86_64; rv:149.0) Gecko/20100101 Firefox/149.0';

export function createAuthClient(baseUrl) {
    const jar = new CookieJar();
    const cookieFetchRaw = fetchCookie(fetch, jar);

    // Add acceptCookies cookie as seen in the curl command
    const domain = new URL(baseUrl).hostname;
    jar.setCookieSync(
        new Cookie({
            key: 'acceptCookies',
            value: 'true',
            domain,
            path: '/',
        }),
        baseUrl
    );

    async function cookieFetch(url, options = {}) {
        const headers = {
            'User-Agent': USER_AGENT,
            Accept:
                'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'same-origin',
            'Sec-Fetch-User': '?1',
            ...options.headers,
        };
        return cookieFetchRaw(url, { ...options, headers });
    }

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
            foo: '',
            RememberMe: 'false',
        });

        const res = await cookieFetch(`${baseUrl}/Login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Origin: baseUrl,
                Referer: `${baseUrl}/Login`,
            },
            body,
        });

        if (!res.ok) throw new Error('Login fallido');
        return true;
    }

    return { cookieFetch, login };
}
