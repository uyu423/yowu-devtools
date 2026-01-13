import { test, expect } from '@playwright/test';

test.describe('Password Generator', () => {
  test('generates a password with default length', async ({ page }) => {
    await page.goto('/password?locale=en-US');
    await expect(page.getByRole('heading', { level: 2 })).toContainText('Password');

    const outputEditor = page.locator('[data-mode="text"]').first().locator('.cm-content');
    const password = (await outputEditor.textContent())?.trim() ?? '';

    expect(password.length).toBe(16);
  });
});
