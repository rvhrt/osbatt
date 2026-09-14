import { test, expect } from '@playwright/test';

test('Markdown previews and rendering survive saving, rehearsal and history', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'New project', exact: true }).click();
  await page.getByLabel('Project name', { exact: true }).fill('**Pointers** and `C`');
  await page
    .getByLabel('Description', { exact: true })
    .fill('A **description**.\n\n- First\n- Second\n\n[Docs](https://example.com)');
  await page.getByText('Description preview', { exact: true }).click();
  await expect(page.locator('.markdown-preview[open] strong')).toHaveText('description');
  await page.getByRole('button', { name: 'Create project' }).click();
  await expect(page.locator('h1 strong')).toHaveText('Pointers');
  await expect(page.locator('h1 code')).toHaveText('C');
  await expect(page.locator('.page-heading .markdown li')).toHaveCount(2);
  await page.getByRole('button', { name: 'Theory question', exact: true }).click();
  await page.locator('.activity-summary').click();
  await page.getByLabel('Title', { exact: true }).fill('Explain *pointers*');
  await page
    .getByLabel('Content', { exact: true })
    .fill(
      '## Example\n\n```c\nint *p = &n;\n```\n\n<script>window.bad = true</script>\n\n[unsafe](javascript:alert(1))',
    );
  await page.getByRole('button', { name: 'Save section' }).click();
  await page.getByRole('button', { name: 'Rehearse', exact: true }).click();
  await expect(page.locator('.question h1 em')).toHaveText('pointers');
  await expect(page.locator('.question pre code')).toContainText('int *p = &n;');
  await expect(page.locator('.question script')).toHaveCount(0);
  await expect(page.locator('.question a[href^="javascript:"]')).toHaveCount(0);
  await page.getByRole('textbox', { name: 'Your answer' }).fill('Address of n.');
  await page.getByRole('button', { name: 'Finish rehearsal' }).click();
  await page.getByRole('button', { name: /Pointers and C Local rehearsal/ }).click();
  await expect(page.locator('.review-answer h2 em')).toHaveText('pointers');
  await expect(page.locator('.review-answer .markdown pre code')).toContainText('int *p = &n;');
  await page.reload();
  await page.getByRole('button', { name: /Pointers and C A description/ }).click();
  await expect(page.locator('h1 strong')).toHaveText('Pointers');
});

test('formatting toolbar edits the selected text without submitting the form', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'New project', exact: true }).click();
  const title = page.getByLabel('Project name', { exact: true });
  await title.fill('Pointers');
  await title.selectText();
  await page
    .getByRole('group', { name: 'Project name formatting' })
    .getByRole('button', { name: 'Bold', exact: true })
    .click();
  await expect(title).toHaveValue('**Pointers**');
  await expect(page.getByRole('dialog')).toBeVisible();
});
