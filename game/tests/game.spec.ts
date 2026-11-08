import { expect, test } from '@playwright/test';

test('Gia can restore the aquarium song and hear her whole story', async ({ page }) => {
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
  await page.getByRole('button', { name: 'Play the coral moon bell' }).click();
  await expect(page.getByRole('button', { name: 'Meet Ocho!' })).toBeVisible();

  await page.getByRole('button', { name: 'Meet Ocho!' }).click();
  await expect(page.getByAltText('Ocho, a purple octopus conductor with eight arms')).toBeVisible();
  await page.getByRole('button', { name: 'Play the blue circle moon pearl' }).click();
  await page.getByRole('button', { name: 'Play the gold star moon pearl' }).click();
  await page.getByRole('button', { name: 'Play the blue circle moon pearl' }).click();
  await page.getByRole('button', { name: 'Play the coral diamond moon pearl' }).click();
  await expect(page.getByText('All three moon pearls are home', { exact: false })).toBeVisible();

  await page.getByRole('button', { name: 'Play the finale!' }).click();
  await expect(page.getByText('That was our moonlight song', { exact: false })).toBeVisible();

  await page.getByRole('button', { name: 'Tell my story' }).click();
  await expect(
    page.getByRole('dialog', {
      name: "Gia and Penguin's Bubble-Power Adventure",
    }),
  ).toBeVisible();
  await expect(page.getByText('Gia chose bubble power', { exact: false })).toBeVisible();
  await expect(page.getByText('Penguin danced', { exact: false })).toBeVisible();
  await expect(page.getByText('Ocho, an octopus with eight arms', { exact: false })).toBeVisible();
  await expect(page.getByText('one moon pearl again', { exact: false })).toBeVisible();
  await expect(page.getByText('whole aquarium played Gia’s moonlight song', { exact: false })).toBeVisible();

  await page.getByRole('button', { name: 'Back to the aquarium' }).click();
  await expect(page.getByRole('button', { name: 'Make more moon bubbles' })).toBeVisible();

  await page.evaluate(() => navigator.serviceWorker.ready.then(() => true));
  await page.context().setOffline(true);
  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'Moonlight Aquarium' }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Make more moon bubbles' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Hear Ocho the octopus' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Finale again!' })).toBeVisible();

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

test('Gia or a grown-up can restart the current adventure', async ({ page }) => {
  await page.goto('./');

  await page.getByRole('button', { name: 'Bubble power!' }).click();
  await expect(page.getByRole('button', { name: 'Wake Luma the moon jellyfish' })).toBeVisible();

  await page.getByRole('button', { name: 'Tell my story' }).click();
  await page.getByRole('button', { name: 'Start again' }).click();

  await expect(page.getByRole('button', { name: 'Bubble power!' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Tell my story' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Wake Luma the moon jellyfish' })).toHaveCount(0);

  await page.getByRole('button', { name: 'Bubble power!' }).click();
  const grownUpEntry = page.getByRole('button', {
    name: 'Press and hold for grown-up settings',
  });
  await grownUpEntry.dispatchEvent('pointerdown');
  await page.waitForTimeout(950);
  await grownUpEntry.dispatchEvent('pointerup');

  await page.getByRole('button', { name: 'Restart adventure' }).click();

  await expect(page.getByRole('button', { name: 'Bubble power!' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Tell my story' })).toBeDisabled();
  await expect(page.getByRole('dialog', { name: 'Game status' })).toHaveCount(0);
  await expect.poll(
    () => page.evaluate(() => window.localStorage.getItem('moonlight-zoo-session-v1')),
  ).toBe('[]');
});

test('two quick fingers on the grown-up button do not open the panel', async ({ page }) => {
  await page.goto('./');

  const grownUpEntry = page.getByRole('button', {
    name: 'Press and hold for grown-up settings',
  });
  // Two overlapping touches, both lifted well before the hold completes.
  await grownUpEntry.dispatchEvent('pointerdown', { pointerId: 1 });
  await grownUpEntry.dispatchEvent('pointerdown', { pointerId: 2 });
  await grownUpEntry.dispatchEvent('pointerup', { pointerId: 2 });
  await grownUpEntry.dispatchEvent('pointerup', { pointerId: 1 });
  await page.waitForTimeout(1200);

  await expect(page.getByRole('dialog', { name: 'Game status' })).toHaveCount(0);
});
