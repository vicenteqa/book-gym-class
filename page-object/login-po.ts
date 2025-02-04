import { type Locator, type Page } from '@playwright/test';
import 'dotenv/config';

export class LoginPage {
    readonly page: Page;
    readonly usernameInputField: Locator;
    readonly userPasswordInputField: Locator;
    readonly submitLoginButton: Locator;
    readonly acceptAllCookiesButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.usernameInputField = page.getByLabel('Usuari');
        this.userPasswordInputField = page.getByLabel('Contrasenya');
        this.submitLoginButton = page.getByRole('button', {
            name: 'Iniciar sessió',
        });
        this.acceptAllCookiesButton = page.locator('#btnCookiesTodas');
    }

    async goto() {
        await this.page.goto('/');
    }

    async acceptCookies() {
        return this.acceptAllCookiesButton.click();
    }

    async login() {
        if (process.env.GYMUSERNAME && process.env.PASSWORD) {
            await this.usernameInputField.fill(process.env.GYMUSERNAME);
            await this.userPasswordInputField.fill(process.env.PASSWORD);
        } else {
            throw new Error(
                'GYMUSERNAME & PASSWORD env variables should be defined.'
            );
        }
        return this.submitLoginButton.click();
    }
}
