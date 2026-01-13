import { test, expect } from '@playwright/test';

test.describe('YAML Converter', () => {
  test('converts YAML to JSON', async ({ page }) => {
    await page.goto('/yaml?locale=en-US');
    await expect(page.getByRole('heading', { level: 2 })).toContainText('YAML');

    const inputEditor = page.locator('[data-mode="yaml"]').first().locator('.cm-content');
    await inputEditor.click();
    await inputEditor.fill('name: Alice\nitems:\n  - 1\n  - 2');

    const outputEditor = page.locator('[data-mode="json"]').locator('.cm-content');
    await expect(outputEditor).toContainText('"name": "Alice"');
  });
});
