import { test, expect } from '@playwright/test';

test.describe('Epoch / ISO Converter', () => {
  test('converts epoch to ISO in UTC', async ({ page }) => {
    await page.goto('/time?locale=en-US');
    await expect(page.getByRole('heading', { level: 2 })).toContainText('Epoch');

    await page.getByRole('button', { name: 'UTC' }).click();

    const epochInput = page.getByPlaceholder('e.g. 1704067200000');
    await epochInput.fill('1704067200000');

    const isoInput = page.getByPlaceholder('e.g. 2024-01-01T00:00:00.000Z');
    await expect(isoInput).toHaveValue('2024-01-01T00:00:00.000Z');
  });
});
