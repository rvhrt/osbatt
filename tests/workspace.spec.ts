import { test, expect } from '@playwright/test';

test('creates projects, saves drafts and preserves history snapshots', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'New project', exact: true }).click();
  await page.getByRole('textbox', { name: 'Project name' }).fill('Recursion workshop');
  await page.getByRole('button', { name: 'Create project' }).click();
  await page.getByRole('button', { name: 'Theory question', exact: true }).click();
  await page.getByRole('button', { name: /01 New question theory/ }).click();
  await page.getByRole('textbox', { name: 'Title', exact: true }).fill('Why a base case?');
  await page.getByRole('textbox', { name: 'Content', exact: true }).fill('Explain termination.');
  await page.getByRole('button', { name: 'Save section' }).click();
  await page.getByRole('button', { name: 'Rehearse', exact: true }).click();
  await page
    .getByRole('textbox', { name: 'Your answer' })
    .fill('The base case stops recursive calls.');
  await page.getByRole('button', { name: 'Save attempt' }).click();
  await expect(page.getByRole('status')).toHaveText('Attempt saved locally');
  await page.getByRole('button', { name: 'Finish rehearsal' }).click();
  await page.getByRole('button', { name: /Recursion workshop Local rehearsal/ }).click();
  await expect(page.locator('pre')).toHaveText('The base case stops recursive calls.');
  await page.getByRole('button', { name: 'Projects', exact: true }).click();
  await page.getByRole('button', { name: /Recursion workshop No description/ }).click();
  await page.getByRole('button', { name: /01 Why a base case/ }).click();
  await page.getByRole('textbox', { name: 'Title', exact: true }).fill('Edited later');
  await page.getByRole('button', { name: 'Save section' }).click();
  await page.getByRole('button', { name: 'History', exact: true }).click();
  await page.getByRole('button', { name: /Recursion workshop Local rehearsal/ }).click();
  await expect(page.getByRole('heading', { name: 'Why a base case?' })).toBeVisible();
  await page.reload();
  await page.getByRole('button', { name: 'History', exact: true }).click();
  await expect(
    page.getByRole('button', { name: /Recursion workshop Local rehearsal/ }),
  ).toBeVisible();
});

test('themes, editor and navigation work without a remote editor CDN', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await page.getByRole('button', { name: 'Switch to light mode' }).click();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.getByRole('button', { name: /Linked lists Pointers/ }).click();
  await page.getByRole('button', { name: 'Rehearse', exact: true }).click();
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await page.getByRole('textbox', { name: 'Your answer' }).fill('O(n), visiting each node.');
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.locator('.monaco-editor').first()).toBeVisible();
  await expect(
    page.getByText('Terminal execution is not available in this preview.'),
  ).toBeVisible();
  await page.screenshot({ path: '/tmp/osbatt-light.png', fullPage: true });
  await page.getByRole('button', { name: 'Switch to dark mode' }).click();
  await page.screenshot({ path: '/tmp/osbatt-dark.png', fullPage: true });
  await page.getByRole('button', { name: 'Previous', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'Your answer' })).toHaveValue(
    'O(n), visiting each node.',
  );
  expect(errors).toEqual([]);
});

test('mobile dashboard fits and invalid saved data is preserved', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'New project' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.evaluate(() => localStorage.setItem('osbatt.workspace.v1', '{broken'));
  await page.reload();
  await expect(page.locator('.error')).toContainText('Storage is paused');
  expect(await page.evaluate(() => localStorage.getItem('osbatt.workspace.v1'))).toBe('{broken');
});
