import { type Locator, type Page } from '@playwright/test';

export class LoginPage {
    readonly page: Page;
    readonly usernameInputField: Locator;
    readonly userPasswordInputField: Locator;
    readonly submitLoginButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.usernameInputField = page.getByLabel('Usuari');
        this.userPasswordInputField = page.getByLabel('Contrasenya');
        this.submitLoginButton = page.getByRole('button', {
            name: 'Iniciar sessió',
        });
    }

    async goto() {
        await this.page.goto('/');
    }

    async login(username, password) {
        await this.usernameInputField.fill(username);
        await this.userPasswordInputField.fill(password);
        return this.submitLoginButton.click();
    }
}
