const { test, expect } = require('@playwright/test');

test.use({ viewport: { width: 1440, height: 900 } });

async function seedAuth(page) {
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
}

async function dragChip(page, value, zone) {
  const chip = page.locator('#tr-chip-tray [data-chip="' + value + '"]').first();
  const target = page.locator('.tr-photo-zone[data-bet="' + zone + '"]');
  const cb = await chip.boundingBox();
  const tb = await target.boundingBox();
  await page.mouse.move(cb.x + cb.width / 2, cb.y + cb.height / 2);
  await page.mouse.down();
  await page.mouse.move(tb.x + tb.width / 2, tb.y + tb.height / 2, { steps: 10 });
  await page.mouse.up();
  await page.waitForTimeout(80);
}

async function dragShoeTo(page, hand) {
  const shoe = page.locator('#trPhotoShoe');
  const target = page.locator('.tr-photo-hand[data-hand="' + hand + '"]');
  const sb = await shoe.boundingBox();
  const tb = await target.boundingBox();
  await page.mouse.move(sb.x + sb.width / 2, sb.y + sb.height / 2);
  await page.mouse.down();
  await page.mouse.move(tb.x + tb.width / 2, tb.y + tb.height / 2, { steps: 8 });
  await page.mouse.up();
  await page.waitForTimeout(80);
}

test('photo table: bet → balance debit, settle → payout, squeeze opens', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (err) => errors.push('PAGEERROR: ' + err.message));
  page.on('console', (msg) => { if (msg.type() === 'error') errors.push('CONSOLE_ERROR: ' + msg.text()); });

  await seedAuth(page);
  await page.goto('/home/training/index.html', { waitUntil: 'networkidle' });

  // Initial visual snapshot — overlay zones should be invisible
  await expect(page.locator('#trPhotoOverlay')).toBeVisible();
  await page.screenshot({ path: 'test-results/photo-01-initial.png' });

  // Confirm balance starts at 1,000,000
  await expect(page.locator('#balanceAmt')).toHaveText('1,000,000');

  // Place 100K on banker → balance becomes 900,000
  await dragChip(page, '100000', 'banker');
  await expect(page.locator('#balanceAmt')).toHaveText('900,000');
  await expect(page.locator('#totalBetAmt')).toHaveText('100,000');

  // Place another 50K on player → balance 850,000, totalBet 150,000
  await dragChip(page, '50000', 'player');
  await expect(page.locator('#balanceAmt')).toHaveText('850,000');
  await expect(page.locator('#totalBetAmt')).toHaveText('150,000');

  await page.screenshot({ path: 'test-results/photo-02-after-bets.png' });

  // Deal 2 cards each to player + banker → all face-down
  await dragShoeTo(page, 'player');
  await dragShoeTo(page, 'banker');
  await dragShoeTo(page, 'player');
  await dragShoeTo(page, 'banker');

  expect(await page.locator('.tr-photo-card.is-face-down').count()).toBe(4);
  await page.screenshot({ path: 'test-results/photo-03-after-deal.png' });

  // Left-click a face-down card → enlarged squeeze modal opens
  await page.locator('.tr-photo-card.is-face-down').first().click();
  await expect(page.locator('#trSqueezeModal')).toBeVisible();

  // Drag squeeze card up by 300px → should reveal and auto-close
  let sqCard = page.locator('#trSqueezeCard');
  let sb = await sqCard.boundingBox();
  await page.mouse.move(sb.x + sb.width / 2, sb.y + sb.height / 2);
  await page.mouse.down();
  await page.mouse.move(sb.x + sb.width / 2, sb.y + sb.height / 2 - 280, { steps: 20 });
  await page.mouse.up();
  await page.waitForTimeout(950);
  await expect(page.locator('#trSqueezeModal')).toBeHidden();

  // Right-drag another face-down card still opens squeeze
  const squeezeTarget = page.locator('.tr-photo-card.is-face-down').first();
  const squeezeBox = await squeezeTarget.boundingBox();
  await page.mouse.move(squeezeBox.x + squeezeBox.width / 2, squeezeBox.y + squeezeBox.height - 5);
  await page.mouse.down({ button: 'right' });
  await page.mouse.move(squeezeBox.x + squeezeBox.width / 2, squeezeBox.y - 80, { steps: 12 });
  await page.mouse.up({ button: 'right' });
  await expect(page.locator('#trSqueezeModal')).toBeVisible();
  await page.screenshot({ path: 'test-results/photo-04-squeeze-open.png' });

  sqCard = page.locator('#trSqueezeCard');
  sb = await sqCard.boundingBox();
  await page.mouse.move(sb.x + sb.width / 2, sb.y + sb.height / 2);
  await page.mouse.down();
  await page.mouse.move(sb.x + sb.width / 2, sb.y + sb.height / 2 - 280, { steps: 20 });
  await page.mouse.up();
  await page.waitForTimeout(950);
  await expect(page.locator('#trSqueezeModal')).toBeHidden();

  // The squeezed card should now be face-up (revealed in hand)
  expect(await page.locator('.tr-photo-card:not(.is-face-down)').count()).toBeGreaterThan(0);

  // Settle → balance changes (either + or - depending on randomness)
  const balBefore = await page.locator('#balanceAmt').textContent();
  await page.locator('#trPhotoSettle').click();
  await page.waitForTimeout(300);
  await expect(page.locator('.tr-photo-result')).toBeVisible();
  await page.screenshot({ path: 'test-results/photo-05-after-settle.png' });

  // After settle, all cards face-up, settle button label flips to "New Round"
  expect(await page.locator('.tr-photo-card.is-face-down').count()).toBe(0);
  await expect(page.locator('#trPhotoSettle')).toHaveText('New Round');

  // Click "New Round" → bets and cards cleared, label back to "Settle"
  await page.locator('#trPhotoSettle').click();
  await page.waitForTimeout(200);
  expect(await page.locator('.tr-photo-card').count()).toBe(0);
  expect(await page.locator('.tr-zone-chip').count()).toBe(0);
  await expect(page.locator('#trPhotoSettle')).toHaveText('Settle');

  expect(errors, 'no console/page errors\n' + errors.join('\n')).toHaveLength(0);
});

test('photo table: insurance hidden, sign opens roadmap, settle updates live odds', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (err) => errors.push('PAGEERROR: ' + err.message));
  page.on('console', (msg) => { if (msg.type() === 'error') errors.push('CONSOLE_ERROR: ' + msg.text()); });

  await seedAuth(page);
  await page.goto('/home/training/index.html', { waitUntil: 'networkidle' });

  // Insurance role button is removed (only Dealer + Customer remain)
  expect(await page.locator('.tr-role-btn').count()).toBe(2);
  await expect(page.locator('.tr-role-btn[data-role="insurance"]')).toHaveCount(0);

  // Click sign on photo opens roadmap modal
  await page.locator('#trPhotoSignBtn').click();
  await expect(page.locator('#trRoadmapModal')).toBeVisible();
  await expect(page.locator('#rmStats')).toContainText('Chưa có ván nào');
  await page.screenshot({ path: 'test-results/photo-roadmap-empty.png' });
  await page.locator('#trRoadmapClose').click();
  await expect(page.locator('#trRoadmapModal')).toBeHidden();

  // Play one round so history is non-empty: bet 50K on player, deal 4 cards, settle
  await dragChip(page, '50000', 'player');
  for (const h of ['player', 'banker', 'player', 'banker']) {
    await dragShoeTo(page, h);
  }
  await page.locator('#trPhotoSettle').click();
  await page.waitForTimeout(200);

  // Right-panel live odds now reflect the empirical history (1 round, so 100% / 0%)
  const probHost = page.locator('#tr-live-prob');
  await expect(probHost).toHaveAttribute('data-empirical', '1');

  // Reopen roadmap → stats should now show 1 total round
  await page.locator('#trPhotoSignBtn').click();
  await expect(page.locator('#trRoadmapModal')).toBeVisible();
  await expect(page.locator('#rmStats')).toContainText('Tổng số ván');
  await expect(page.locator('.tr-bead-cell:not(.tr-bead-cell--empty)')).toHaveCount(1);
  await page.screenshot({ path: 'test-results/photo-roadmap-with-data.png' });

  expect(errors, 'no console/page errors\n' + errors.join('\n')).toHaveLength(0);
});

test('photo table: clear bets refunds balance', async ({ page }) => {
  await seedAuth(page);
  await page.goto('/home/training/index.html', { waitUntil: 'networkidle' });

  await expect(page.locator('#balanceAmt')).toHaveText('1,000,000');
  await dragChip(page, '500000', 'player');
  await expect(page.locator('#balanceAmt')).toHaveText('500,000');

  await page.locator('#trPhotoClearBets').click();
  await page.waitForTimeout(150);
  await expect(page.locator('#balanceAmt')).toHaveText('1,000,000');
  await expect(page.locator('#totalBetAmt')).toHaveText('—');
});
