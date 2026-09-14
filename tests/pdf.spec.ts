import { test, expect, type Page } from '@playwright/test';
import path from 'node:path';
async function newProject(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'New project', exact: true }).click();
  await page.getByRole('textbox', { name: 'Project name' }).fill('Imported deck');
  await page.getByRole('button', { name: 'Create project' }).click();
  await page.getByRole('button', { name: 'Import PDF' }).click();
}

test('imports pages, attaches activities and retains slides in history', async ({ page }) => {
  await newProject(page);
  await page
    .getByLabel('Presentation PDF')
    .setInputFiles(path.join(__dirname, 'fixtures/slides.pdf'));
  await page.getByRole('button', { name: 'Add slides' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.locator('.slide-thumbnail')).toHaveCount(3);
  await page.getByRole('button', { name: 'Move Slide 3 up' }).click();
  await expect(page.locator('.activity-summary strong')).toHaveText([
    'Slide 1',
    'Slide 3',
    'Slide 2',
  ]);
  await page.locator('.activity-summary').first().click();
  await page.getByLabel('Section type').selectOption('theory');
  await page.getByRole('button', { name: 'Save section' }).click();
  await page.locator('.activity-summary').nth(1).click();
  await page.getByLabel('Section type').selectOption('coding');
  await page.getByLabel('Upload starter file').setInputFiles({
    name: 'exercise.c',
    mimeType: 'text/plain',
    buffer: Buffer.from('int main(void) { return 42; }'),
  });
  await expect(page.getByLabel('Starter file · main.c')).toHaveValue(
    'int main(void) { return 42; }',
  );
  await page.getByRole('button', { name: 'Save section' }).click();
  await page.getByRole('button', { name: 'Rehearse', exact: true }).click();
  await expect(page.locator('.question .slide-image')).toBeVisible();
  await page
    .getByRole('textbox', { name: 'Your answer' })
    .fill('The pointer targets the second node.');
  await page.getByRole('button', { name: 'Finish rehearsal' }).click();
  await page.getByRole('button', { name: /Imported deck Local rehearsal/ }).click();
  await expect(page.locator('.review-answer .slide-image')).toHaveCount(2);
  await page.getByRole('button', { name: 'Projects', exact: true }).click();
  await page.getByRole('button', { name: /Imported deck No description/ }).click();
  page.on('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Remove Slide 1', exact: true }).click();
  await page.reload();
  await page.getByRole('button', { name: 'History', exact: true }).click();
  await page.getByRole('button', { name: /Imported deck Local rehearsal/ }).click();
  await expect(page.getByRole('heading', { name: 'Slide 1', exact: true })).toBeVisible();
  await expect(page.locator('.review-answer .slide-image').first()).toBeVisible();
  await expect(page.locator('.review-answer pre').first()).toHaveText(
    'The pointer targets the second node.',
  );
});

test('invalid PDF does not add partial sections', async ({ page }) => {
  await newProject(page);
  await page.getByLabel('Presentation PDF').setInputFiles({
    name: 'broken.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('not a PDF'),
  });
  await page.getByRole('button', { name: 'Add slides' }).click();
  await expect(page.locator('.import-error')).toHaveText('This file is not a PDF.');
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(page.locator('.activity-summary')).toHaveCount(0);
});

test('user deck preserves all 115 pages', async ({ page }) => {
  test.skip(!process.env.OSBATT_SAMPLE_PDF, 'Optional local reference PDF');
  test.setTimeout(180000);
  await newProject(page);
  await page.getByLabel('Presentation PDF').setInputFiles(process.env.OSBATT_SAMPLE_PDF!);
  await page.getByRole('button', { name: 'Add slides' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0, { timeout: 150000 });
  await expect(page.locator('.activity-summary')).toHaveCount(115);
  await page.locator('.activity-summary').nth(16).click();
  await expect(page.locator('.activity-slide-preview .slide-image')).toBeVisible();
  await page.locator('.activity-slide-preview').scrollIntoViewIfNeeded();
  await page.screenshot({ path: '/tmp/osbatt-pdf-question.png' });
  await page.getByLabel('Section type').selectOption('theory');
  await page.getByRole('button', { name: 'Save section' }).click();
  await page.getByRole('button', { name: 'Rehearse', exact: true }).click();
  await expect(page.locator('.question .slide-image')).toBeVisible();
  await page.screenshot({ path: '/tmp/osbatt-pdf-title.png' });
  const imageBox = await page.locator('.question .slide-image').boundingBox();
  const paneBox = await page.locator('.question').boundingBox();
  expect(imageBox!.y + imageBox!.height).toBeLessThanOrEqual(paneBox!.y + paneBox!.height);
  await page.getByRole('button', { name: 'Expand page 1', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Page 1 enlarged', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Close slide', exact: true }).click();
  await page.getByRole('button', { name: 'Finish rehearsal' }).click();
  await page.reload();
  await page.getByRole('button', { name: /Imported deck No description/ }).click();
  await expect(page.locator('.activity-summary')).toHaveCount(115);
});

test('inserts theory and coding sections on either side of a slide', async ({ page }) => {
  await newProject(page);
  await page
    .getByLabel('Presentation PDF')
    .setInputFiles(path.join(__dirname, 'fixtures/slides.pdf'));
  await page.getByRole('button', { name: 'Add slides' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  const above = page.getByRole('button', { name: 'Insert above Slide 1', exact: true });
  await above.click();
  await expect(page.getByRole('menuitem', { name: 'Theory', exact: true })).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('menuitem', { name: 'Coding', exact: true })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('menu')).toHaveCount(0);
  await expect(above).toBeFocused();
  await above.click();
  await page.getByRole('heading', { name: 'Imported deck', exact: true }).click();
  await expect(page.getByRole('menu')).toHaveCount(0);
  for (const [kind, position, title] of [
    ['Theory', 'above', 'Before slide'],
    ['Coding', 'below', 'After slide'],
  ]) {
    await page.getByRole('button', { name: `Insert ${position} Slide 1`, exact: true }).click();
    await page.getByRole('menuitem', { name: kind, exact: true }).click();
    await page.getByRole('textbox', { name: 'Title', exact: true }).fill(title);
    await page.getByRole('button', { name: 'Save section' }).click();
  }
  await expect(page.locator('.activity-summary strong')).toHaveText([
    'Before slide',
    'Slide 1',
    'After slide',
    'Slide 2',
    'Slide 3',
  ]);
  await page.getByRole('button', { name: 'Insert above Before slide', exact: true }).click();
  await page.getByRole('menuitem', { name: 'Coding', exact: true }).click();
  await page.getByRole('textbox', { name: 'Title', exact: true }).fill('First coding');
  await page.getByRole('button', { name: 'Save section' }).click();
  await page.getByRole('button', { name: 'Insert below After slide', exact: true }).click();
  await page.getByRole('menuitem', { name: 'Theory', exact: true }).click();
  await page.getByRole('textbox', { name: 'Title', exact: true }).fill('Last theory');
  await page.getByRole('button', { name: 'Save section' }).click();
  await page.reload();
  await page.getByRole('button', { name: /Imported deck No description/ }).click();
  await expect(page.locator('.activity-summary strong')).toHaveText([
    'First coding',
    'Before slide',
    'Slide 1',
    'After slide',
    'Last theory',
    'Slide 2',
    'Slide 3',
  ]);
  await expect(page.locator('.slide-thumbnail')).toHaveCount(3);
});
