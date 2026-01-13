import { test, expect } from '@playwright/test';

test.describe('Video Studio', () => {
  test('shows drop area for video upload', async ({ page }) => {
    await page.goto('/video-studio?locale=en-US');
    await expect(page.getByRole('heading', { level: 2 })).toContainText('Video Studio');
    await expect(page.getByText('Drop a video file here or click to browse')).toBeVisible();
  });
});
