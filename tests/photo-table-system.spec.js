const { test, expect } = require('@playwright/test');

test.use({ viewport: { width: 1440, height: 900 } });

test('photo table: chip drag, card drag, dealer rotation', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (err) => errors.push('PAGEERROR: ' + err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push('CONSOLE_ERROR: ' + msg.text());
  });

  // Hit login page first so YiDingAuthStore initializes, then authenticate
  await page.goto('/', { waitUntil: 'networkidle' });
  const ok = await page.evaluate(() => {
    const store = window.YiDingAuthStore;
    if (!store) return false;
    const account = store.authenticate('DAISY-YDI0032', 'YDI0032');
    if (!account) return false;
    store.setSession(account);
    return Boolean(store.getSession());
  });
  if (!ok) throw new Error('auth seed failed');
  await page.goto('/home/training/index.html', { waitUntil: 'networkidle' });

  await expect(page.locator('#trPhotoOverlay')).toBeVisible();
  await expect(page.locator('.tr-photo-zone[data-bet="banker"]')).toBeVisible();
  await page.screenshot({ path: 'test-results/photo-table-01-initial-dealer.png', fullPage: false });

  // --- Chip drag: tray → banker zone ---
  const chip = page.locator('#tr-chip-tray [data-chip="1000000"]').first();
  const banker = page.locator('.tr-photo-zone[data-bet="banker"]');
  const cb = await chip.boundingBox();
  const bb = await banker.boundingBox();
  await page.mouse.move(cb.x + cb.width / 2, cb.y + cb.height / 2);
  await page.mouse.down();
  await page.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2, { steps: 10 });
  await page.mouse.up();
  await page.waitForTimeout(150);

  // Drag a 100k chip onto Player too
  const chip100k = page.locator('#tr-chip-tray [data-chip="100000"]').first();
  const player = page.locator('.tr-photo-zone[data-bet="player"]');
  const cb2 = await chip100k.boundingBox();
  const pb = await player.boundingBox();
  await page.mouse.move(cb2.x + cb2.width / 2, cb2.y + cb2.height / 2);
  await page.mouse.down();
  await page.mouse.move(pb.x + pb.width / 2, pb.y + pb.height / 2, { steps: 10 });
  await page.mouse.up();
  await page.waitForTimeout(150);

  expect(await page.locator('.tr-photo-zone[data-bet="banker"] .tr-zone-chip').count()).toBeGreaterThan(0);
  expect(await page.locator('.tr-photo-zone[data-bet="banker"] [data-zone-amount]').textContent()).toContain('1,000,000');
  expect(await page.locator('.tr-photo-zone[data-bet="player"] [data-zone-amount]').textContent()).toContain('100,000');

  await page.screenshot({ path: 'test-results/photo-table-02-after-chips-dealer.png', fullPage: false });

  // --- Card drag: shoe → player + banker hand ---
  const shoe = page.locator('#trPhotoShoe');
  for (const handKey of ['player', 'banker', 'player', 'banker']) {
    const handLoc = page.locator('.tr-photo-hand[data-hand="' + handKey + '"]');
    const sb = await shoe.boundingBox();
    const hb = await handLoc.boundingBox();
    await page.mouse.move(sb.x + sb.width / 2, sb.y + sb.height / 2);
    await page.mouse.down();
    await page.mouse.move(hb.x + hb.width / 2, hb.y + hb.height / 2, { steps: 8 });
    await page.mouse.up();
    await page.waitForTimeout(80);
  }
  expect(await page.locator('.tr-photo-hand[data-hand="player"] .tr-photo-card').count()).toBe(2);
  expect(await page.locator('.tr-photo-hand[data-hand="banker"] .tr-photo-card').count()).toBe(2);

  await page.screenshot({ path: 'test-results/photo-table-03-after-cards-dealer.png', fullPage: false });

  // --- Switch to Customer view (no rotation) ---
  await page.locator('button.tr-role-btn[data-role="customer"]').click();
  await page.waitForTimeout(550);
  await page.screenshot({ path: 'test-results/photo-table-04-customer-view.png', fullPage: false });

  // Bets and cards should persist after role switch
  expect(await page.locator('.tr-photo-zone[data-bet="banker"] .tr-zone-chip').count()).toBeGreaterThan(0);

  expect(errors, 'no console/page errors\n' + errors.join('\n')).toHaveLength(0);
});
