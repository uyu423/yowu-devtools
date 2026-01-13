import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '../../../..');

test.describe('Image Studio', () => {
  test('loads an image file for preview', async ({ page }) => {
    await page.goto('/image-studio?locale=en-US');
    await expect(page.getByRole('heading', { level: 2 })).toContainText('Image Studio');

    const fileInput = page.locator('#image-studio-file-input');
    await fileInput.setInputFiles(path.join(repoRoot, 'apps/web/public/opengraph.png'));

    await expect(page.getByText('Change File')).toBeVisible();
  });
});
