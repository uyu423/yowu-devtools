import { test, expect } from '@playwright/test';

test.describe('Hash Generator', () => {
  test('calculates SHA-256 for text', async ({ page }) => {
    await page.goto('/hash?locale=en-US');
    await expect(page.getByRole('heading', { level: 2 })).toContainText('Hash');

    const inputEditor = page.locator('[data-mode="text"]').first().locator('.cm-content');
    await inputEditor.click();
    await inputEditor.fill('hello');

    const outputEditor = page.locator('[data-mode="text"]').last().locator('.cm-content');
    await expect(outputEditor).toContainText(
      '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824'
    );
  });
});
