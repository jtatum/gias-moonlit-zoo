import { expect, test } from '@playwright/test';

test('Gia can choose bubble power and hear her story', async ({ page }) => {
  await page.goto('./');

  await expect(
    page.getByRole('heading', { name: 'Moonlight Aquarium' }),
  ).toBeVisible();
  await expect(page.getByAltText("Penguin, Gia's stuffed best friend")).toBeVisible();
  await expect(page.getByRole('button', { name: 'Tell my story' })).toBeDisabled();

  await page.getByRole('button', { name: 'Bubble power!' }).click();
  await expect(
    page.getByText('You and Penguin woke Luma'),
  ).toBeVisible();

  await page.getByRole('button', { name: 'Wake Luma the moon jellyfish' }).click();
  await page.getByRole('button', { name: 'Play the blue moon bell' }).click();
  await page.getByRole('button', { name: 'Play the gold moon bell' }).click();
  await expect(page.getByText('You played 2 notes')).toBeVisible();

  await page.getByRole('button', { name: 'Tell my story' }).click();
  await expect(
    page.getByRole('dialog', {
      name: "Gia and Penguin's Bubble-Power Adventure",
    }),
  ).toBeVisible();
  await expect(page.getByText('Gia chose bubble power', { exact: false })).toBeVisible();
  await expect(page.getByText('Penguin danced', { exact: false })).toBeVisible();

  await page.getByRole('button', { name: 'Back to the aquarium' }).click();
  await expect(page.getByRole('button', { name: 'Make more moon bubbles' })).toBeVisible();

  await page.evaluate(() => navigator.serviceWorker.ready.then(() => true));
  await page.context().setOffline(true);
  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'Moonlight Aquarium' }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Make more moon bubbles' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Hear Luma again' })).toBeVisible();

  const grownUpEntry = page.getByRole('button', {
    name: 'Press and hold for grown-up settings',
  });
  await grownUpEntry.dispatchEvent('pointerdown');
  await page.waitForTimeout(950);
  await grownUpEntry.dispatchEvent('pointerup');
  await expect(page.getByRole('dialog', { name: 'Game status' })).toBeVisible();
  await expect(page.getByText('Offline ready')).toBeVisible();
  await page.getByRole('button', { name: 'Close grown-up settings' }).click();

  await page.context().setOffline(false);
});
