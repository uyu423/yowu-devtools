import { test, expect } from '@playwright/test';

test.describe('JWT Decoder', () => {
  test('decodes token payload', async ({ page }) => {
    await page.goto('/jwt-decoder?locale=en-US');
    await expect(page.getByRole('heading', { level: 2 })).toContainText('JWT');

    const token =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
      'eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFsaWNlIiwiaWF0IjoxNTE2MjM5MDIyfQ.' +
      'signature';

    const inputEditor = page.locator('[data-mode="text"]').first().locator('.cm-content');
    await inputEditor.click();
    await inputEditor.fill(token);

    await expect(page.getByText('Alice')).toBeVisible();
  });
});
