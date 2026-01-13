import { test, expect } from '@playwright/test';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '../../../..');

const largeJson = readFileSync(path.join(repoRoot, 'test-data/large-json.json'), 'utf8');

test.describe('JSON Pretty Viewer', () => {
  test('parsing, view switching, error state, worker usage', async ({ page }) => {
    await page.goto('/json?locale=en-US');
    await expect(page).toHaveTitle(/JSON Pretty Viewer/i);

    const editor = page.locator('[data-mode="json"]').first().locator('.cm-content');
    const validJson = JSON.stringify({ name: 'Alice', items: [1, 2, 3] }, null, 2);

    // 유효 JSON 입력 후 트리/프리티/미니파이 확인
    await editor.click();
    await editor.fill(validJson);

    await page.getByRole('button', { name: 'Tree', exact: true }).click();
    await expect(page.getByText('"name": "Alice"')).toBeVisible();

    await page.getByRole('button', { name: 'Pretty', exact: true }).click();
    await page.getByPlaceholder('Search...').fill('Alice');
    await expect(page.locator('mark')).toContainText('Alice');

    await page.getByRole('button', { name: 'Minified', exact: true }).click();
    await expect(page.locator('pre')).toContainText('{"name":"Alice","items":[1,2,3]}');

    // 잘못된 JSON 시 에러 배너 노출
    await editor.fill('{"name": ');
    await expect(page.getByText('JSON parsing failed')).toBeVisible();

    // 대용량 JSON 입력 시 로딩 인디케이터 및 워커 사용 확인
    const fileInput = page.locator('input[type="file"][accept=".json,application/json"]').first();
    await fileInput.setInputFiles(path.join(repoRoot, 'test-data/large-json.json'));
    await expect(page.getByText('Processing large JSON data...')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Processing large JSON data...')).not.toBeVisible({ timeout: 30_000 });
  });
});
