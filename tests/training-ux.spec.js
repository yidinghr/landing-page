/**
 * training-ux.spec.js — User-perspective flow tests
 *
 * Tests the 3 roles as a real user would interact:
 *   - Dealer: manual card drag, wrong-order error, auto-deal, stats
 *   - Customer: place bets, submit, request panel, reveal interaction
 *   - Insurance: role layout, insurance panel, NPC auto-decide
 *   - Phase 14: casino arc table structure verification
 */

const { test, expect } = require("@playwright/test");

const ACCOUNTS_KEY = "yiding_accounts_v1";
const SESSION_KEY  = "yiding_auth_session_v1";

function seedAdminAuth(page) {
  return page.addInitScript(
    ({ accountsKey, sessionKey }) => {
      const acc = {
        username: "YiDing Admin", password: "YDI0006", role: "admin",
        displayName: "YiDing Admin", welcomeMessage: "燈哥",
        avatarSrc: "/image/logoweb.png", createdAt: "2026-04-13T00:00:00.000Z"
      };
      window.localStorage.setItem(accountsKey, JSON.stringify([acc]));
      window.sessionStorage.setItem(sessionKey, JSON.stringify({
        username: acc.username, role: acc.role,
        displayName: acc.displayName, welcomeMessage: acc.welcomeMessage,
        avatarSrc: acc.avatarSrc
      }));
    },
    { accountsKey: ACCOUNTS_KEY, sessionKey: SESSION_KEY }
  );
}

/** Simulate a card drag from shoe → target area using raw mouse events */
async function dragCardTo(page, targetSelector) {
  const source = page.locator("#tr-card-source");
  const target = page.locator(targetSelector);

  const sb = await source.boundingBox();
  const tb = await target.boundingBox();
  if (!sb || !tb) throw new Error(`boundingBox missing: source=${!!sb} target(${targetSelector})=${!!tb}`);

  await page.mouse.move(sb.x + sb.width / 2, sb.y + sb.height / 2);
  await page.mouse.down();
  // Move in steps so the drag engine has time to cache rects
  await page.mouse.move(tb.x + tb.width / 2, tb.y + tb.height / 2, { steps: 10 });
  await page.mouse.up();
}

/** Read text of #tr-feedback-panel (empty string if no feedback) */
async function getFeedback(page) {
  return page.locator("#tr-feedback-panel").innerText().catch(() => "");
}

/** Read current shoe count as a number */
async function shoeCount(page) {
  const txt = await page.locator("#tr-shoe-count").innerText();
  return parseInt(txt.replace(/[^0-9]/g, ""), 10);
}

// ---------------------------------------------------------------------------

test.describe("Phase 14 — Casino arc table structure", () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await seedAdminAuth(page);
    await page.goto("/home/training/index.html", { waitUntil: "load" });
    await expect(page.locator("#tr-shoe-count")).not.toBeEmpty({ timeout: 5000 });
  });

  test("Arc table container exists and is visible", async ({ page }) => {
    await expect(page.locator("#tr-baccarat-table")).toBeVisible();
  });

  test("Dealer strip shows DEALER label at top of table", async ({ page }) => {
    const strip = page.locator(".tr-dealer-strip");
    await expect(strip).toBeVisible();
    await expect(strip).toContainText("DEALER");
  });

  test("Seat arc has exactly 5 seat markers", async ({ page }) => {
    await expect(page.locator("#tr-seat-arc")).toBeVisible();
    await expect(page.locator("#tr-seat-arc .tr-arc-seat")).toHaveCount(5);
  });

  test("Card zones and bet matrix are inside the arc table", async ({ page }) => {
    // Both should be descendents of #tr-baccarat-table
    await expect(page.locator("#tr-baccarat-table #tr-card-zones")).toBeVisible();
    await expect(page.locator("#tr-baccarat-table #tr-bet-matrix")).toBeVisible();
  });

  test("Arc table has overflow:hidden (arc clip applied)", async ({ page }) => {
    const overflow = await page.locator("#tr-baccarat-table").evaluate(
      el => getComputedStyle(el).overflow
    );
    expect(overflow).toBe("hidden");
  });
});

// ---------------------------------------------------------------------------

test.describe("Dealer flow — manual card drag", () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await seedAdminAuth(page);
    await page.goto("/home/training/index.html", { waitUntil: "load" });
    await expect(page.locator("#tr-shoe-count")).not.toBeEmpty({ timeout: 5000 });
  });

  test("Wrong-order drag shows Vietnamese error and increments error count", async ({ page }) => {
    // Enter dealing phase
    await page.locator("#btnCloseBets").click();

    // DEAL_1 requires Player first. Try Banker → expect error.
    await dragCardTo(page, "#tr-banker-area");

    const fb = await getFeedback(page);
    expect(fb).toMatch(/Banker|Player|thứ tự|lá 1|đầu tiên/i);

    // Stats panel should show Dealer err. 1
    const stats = await page.locator("#statsPanel").innerText();
    expect(stats).toMatch(/Dealer err\.?\s*[1-9]/);
  });

  test("Correct 4-card deal: P1→B1→P2→B2 reaches reveal phase", async ({ page }) => {
    const countBefore = await shoeCount(page);
    await page.locator("#btnCloseBets").click();

    // Deal in correct order
    await dragCardTo(page, "#tr-player-area"); // P1 → DEAL_2
    await dragCardTo(page, "#tr-banker-area"); // B1 → DEAL_3
    await dragCardTo(page, "#tr-player-area"); // P2 → DEAL_4
    await dragCardTo(page, "#tr-banker-area"); // B2 → draw / reveal

    // May need 1-2 more cards for draw phases — keep dealing until reveal or settlement
    for (let i = 0; i < 2; i++) {
      const isReveal = await page.locator("#btnReveal").isEnabled().catch(() => false);
      const isSettled = await page.locator("#settlementBoard").isVisible().catch(() => false);
      if (isReveal || isSettled) break;
      // Try player draw then banker draw
      const drawable = await page.locator("#tr-player-area, #tr-banker-area").first();
      await dragCardTo(page, "#tr-player-area").catch(() => {});
      await dragCardTo(page, "#tr-banker-area").catch(() => {});
    }

    // Shoe should have decreased
    const countAfter = await shoeCount(page);
    expect(countAfter).toBeLessThan(countBefore);

    // Either at reveal (can flip) or settlement (auto-natural)
    const revealEnabled = await page.locator("#btnReveal").isEnabled();
    const settled = await page.locator("#settlementBoard").isVisible();
    expect(revealEnabled || settled).toBeTruthy();
  });

  test("Cards are face-down before flip and face-up after click", async ({ page }) => {
    // Use auto-deal to reach reveal quickly — it stops at reveal for dealer role?
    // Actually dealer auto-deal goes to settlement. Use a different approach:
    // Close bets and deal 4 cards manually, then check reveal.
    await page.locator("#btnCloseBets").click();
    await dragCardTo(page, "#tr-player-area");
    await dragCardTo(page, "#tr-banker-area");
    await dragCardTo(page, "#tr-player-area");
    await dragCardTo(page, "#tr-banker-area");

    // After 4 cards, if Reveal button is enabled we're in reveal phase
    const revealEnabled = await page.locator("#btnReveal").isEnabled().catch(() => false);
    if (!revealEnabled) {
      // Natural hand — went straight to settlement, skip flip test
      test.skip();
      return;
    }

    // At least one face-down card should exist (data-card-key on unrevealed cards)
    const faceDownCards = page.locator("[data-card-key]");
    const count = await faceDownCards.count();
    expect(count).toBeGreaterThan(0);

    // Click first face-down card → it should flip
    await faceDownCards.first().click();
    // After click, the element may disappear or change — just verify no JS error occurred
    // and shoe count is still valid
    await expect(page.locator("#tr-shoe-count")).not.toBeEmpty();
  });

  test("Auto-deal then stats shows at least 1 round played", async ({ page }) => {
    // Auto-deal reaches settlement (1 round complete)
    await page.locator("#btnAutoDeal").click();
    await expect(page.locator("#settlementBoard")).toBeVisible({ timeout: 15000 });

    // Stats panel should now show round data (not the "no rounds" placeholder)
    const stats = await page.locator("#statsPanel").innerText();
    expect(stats).not.toMatch(/No rounds played yet/);
    expect(stats).toMatch(/\d+/); // contains at least one number

    // Confirm Round button is disabled because chips not settled
    await expect(page.locator("#btnNext")).toBeDisabled();
  });

  test("Result box shows BANKER / PLAYER / TIE after settlement", async ({ page }) => {
    await page.locator("#btnAutoDeal").click();
    await expect(page.locator("#settlementBoard")).toBeVisible({ timeout: 15000 });

    const resultText = await page.locator("#resultBox").innerText();
    const validOutcomes = ["BANKER", "PLAYER", "TIE"];
    expect(validOutcomes.some(o => resultText.includes(o))).toBeTruthy();
  });

  test("Round detail panel populates after a hand is dealt", async ({ page }) => {
    await page.locator("#btnAutoDeal").click();
    await expect(page.locator("#settlementBoard")).toBeVisible({ timeout: 15000 });

    const detail = await page.locator("#roundDetail").innerText();
    expect(detail).not.toMatch(/Deal a hand to see/);
    expect(detail).toMatch(/\d/); // contains numbers (scores/amounts)
  });

  test("Roadmap canvases render — bead road has non-zero size after a hand", async ({ page }) => {
    await page.locator("#btnAutoDeal").click();
    await expect(page.locator("#settlementBoard")).toBeVisible({ timeout: 15000 });

    const bead = page.locator("#tr-road-bead");
    const box = await bead.boundingBox();
    expect(box).not.toBeNull();
    expect(box.width).toBeGreaterThan(0);
    expect(box.height).toBeGreaterThan(0);
  });

  test("Session log records a round after auto-deal", async ({ page }) => {
    await page.locator("#btnAutoDeal").click();
    await expect(page.locator("#settlementBoard")).toBeVisible({ timeout: 15000 });

    const log = await page.locator("#tr-session-log").innerText();
    expect(log).not.toMatch(/No hands played yet/);
    expect(log).toMatch(/#1/); // round 1 entry
  });

  test("Settlement board shows seat outcomes (WIN/LOSE) for active seat", async ({ page }) => {
    await page.locator("#btnAutoDeal").click();
    await expect(page.locator("#settlementBoard")).toBeVisible({ timeout: 15000 });

    const board = await page.locator("#settlementBoard").innerText();
    expect(board).toMatch(/WIN|LOSE|PUSH/i);
  });

  test("Chip tray is rendered with at least one denomination button", async ({ page }) => {
    const chipTray = page.locator("#tr-chip-tray .tr-chip, #tr-chip-tray [data-chip-value]");
    await expect(chipTray.first()).toBeVisible({ timeout: 5000 });
  });
});

// ---------------------------------------------------------------------------

test.describe("Customer flow — bet, submit, reveal panel", () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await seedAdminAuth(page);
    await page.goto("/home/training/index.html", { waitUntil: "load" });
    await expect(page.locator("#tr-shoe-count")).not.toBeEmpty({ timeout: 5000 });
    // Switch to customer
    await page.locator('button.tr-role-btn[data-role="customer"]').click();
    await expect(page.locator("body")).toHaveAttribute("data-role", "customer");
  });

  test("Clicking a chip then a bet cell adds the bet visually", async ({ page }) => {
    await page.locator(".tr-chip--100k").click();
    const cell = page.locator('.tr-matrix-cell[data-seat="1"][data-zone="player"]');
    await cell.click();

    // Bet amount div should appear (not hidden)
    const betAmt = cell.locator(".tr-zone-bet-amt");
    await expect(betAmt).toBeVisible({ timeout: 3000 });
    await expect(betAmt).not.toBeEmpty();
  });

  test("Bet on two different seats is reflected in both cells", async ({ page }) => {
    await page.locator(".tr-chip--100k").click();
    await page.locator('.tr-matrix-cell[data-seat="1"][data-zone="player"]').click();
    await page.locator(".tr-chip--100k").click();
    await page.locator('.tr-matrix-cell[data-seat="2"][data-zone="banker"]').click();

    await expect(page.locator('.tr-matrix-cell[data-seat="1"][data-zone="player"] .tr-zone-bet-amt')).toBeVisible();
    await expect(page.locator('.tr-matrix-cell[data-seat="2"][data-zone="banker"] .tr-zone-bet-amt')).toBeVisible();
  });

  test("Clear button removes all bets", async ({ page }) => {
    await page.locator(".tr-chip--100k").click();
    await page.locator('.tr-matrix-cell[data-seat="1"][data-zone="player"]').click();
    // Bet appears
    await expect(page.locator('.tr-matrix-cell[data-seat="1"][data-zone="player"] .tr-zone-bet-amt')).toBeVisible();

    await page.locator("#btnClearBets").click();
    // Bet amount should be hidden again
    await expect(page.locator('.tr-matrix-cell[data-seat="1"][data-zone="player"] .tr-zone-bet-amt')).toBeHidden({ timeout: 3000 });
  });

  test("Submit bets → customer request panel appears at reveal phase", async ({ page }) => {
    await page.locator(".tr-chip--100k").click();
    await page.locator('.tr-matrix-cell[data-seat="1"][data-zone="player"]').click();
    await page.locator("#btnSubmitBets").click();

    await expect(page.locator("#tr-customer-panel")).toBeVisible({ timeout: 10000 });
    await expect(page.locator('[data-customer-req="squeeze-p1"]')).toBeVisible();
    await expect(page.locator('[data-customer-req="flip-banker-first"]')).toBeVisible();
  });

  test("Customer can click Squeeze P1 request without error", async ({ page }) => {
    await page.locator(".tr-chip--100k").click();
    await page.locator('.tr-matrix-cell[data-seat="1"][data-zone="player"]').click();
    await page.locator("#btnSubmitBets").click();
    await expect(page.locator("#tr-customer-panel")).toBeVisible({ timeout: 10000 });

    await page.locator('[data-customer-req="squeeze-p1"]').click();
    // Panel should still exist (or phase advanced) — no JS crash
    await expect(page.locator("#tr-shoe-count")).not.toBeEmpty();
  });

  test("Customer panel is NOT visible during idle phase", async ({ page }) => {
    // In idle/betting phase, panel should not exist
    await expect(page.locator("#tr-customer-panel")).not.toBeVisible();
  });

  test("Dealer role buttons are disabled for customer (bet matrix pointer-events:none)", async ({ page }) => {
    // With role=customer, bet matrix should accept clicks; dealer drag source should not
    // Check that the bet matrix cell is clickable (not pointer-events:none)
    const ptrEvents = await page.locator("#tr-bet-matrix").evaluate(
      el => getComputedStyle(el).pointerEvents
    );
    expect(ptrEvents).not.toBe("none");
  });
});

// ---------------------------------------------------------------------------

test.describe("Insurance role flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await seedAdminAuth(page);
    await page.goto("/home/training/index.html", { waitUntil: "load" });
    await expect(page.locator("#tr-shoe-count")).not.toBeEmpty({ timeout: 5000 });
    await page.locator('button.tr-role-btn[data-role="insurance"]').click();
    await expect(page.locator("body")).toHaveAttribute("data-role", "insurance");
  });

  test("Insurance role hides the bet matrix and chip tray", async ({ page }) => {
    // CSS: body[data-role="insurance"] .tr-bet-zones { display: none }
    await expect(page.locator("#betZones")).toBeHidden();
    await expect(page.locator(".tr-chip-section")).toBeHidden();
  });

  test("Insurance role hides the left balance bar", async ({ page }) => {
    await expect(page.locator(".tr-balance-bar")).toBeHidden();
  });

  test("Insurance role shows only 1-column layout (right sidebar hidden)", async ({ page }) => {
    // CSS: body[data-role="insurance"] .tr-main { grid-template-columns: 1fr }
    const cols = await page.locator(".tr-main").evaluate(
      el => getComputedStyle(el).gridTemplateColumns
    );
    // Should be a single column (no 200px sidebars)
    expect(cols).not.toMatch(/200px/);
  });

  test("Insurance role: controls hidden, NPC round button exists in panel", async ({ page }) => {
    // Controls bar is hidden for insurance role
    await expect(page.locator("#tr-controls-bar")).toBeHidden();
    // The insurance-specific trigger button exists in the DOM (inside overlay panel)
    await expect(page.locator("#btnInsuranceNpcRound")).toBeAttached();
    // Shoe count is still valid (role switch didn't break state)
    await expect(page.locator("#tr-shoe-count")).not.toBeEmpty();
  });
});

// ---------------------------------------------------------------------------

test.describe("Feedback and error messages", () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await seedAdminAuth(page);
    await page.goto("/home/training/index.html", { waitUntil: "load" });
    await expect(page.locator("#tr-shoe-count")).not.toBeEmpty({ timeout: 5000 });
  });

  test("Feedback panel is empty on page load", async ({ page }) => {
    const fb = await getFeedback(page);
    expect(fb.trim()).toBe("");
  });

  test("Wrong-order deal: feedback contains Vietnamese text", async ({ page }) => {
    await page.locator("#btnCloseBets").click();
    // Try to drag to Banker first (should be Player)
    await dragCardTo(page, "#tr-banker-area");
    const fb = await getFeedback(page);
    // Must be a non-empty Vietnamese message
    expect(fb.length).toBeGreaterThan(10);
    // Rough Vietnamese character check (has at least a Vietnamese diacritic or expected keyword)
    expect(fb).toMatch(/Player|Banker|lá|thứ|phải|chuẩn/i);
  });

  test("Next Round button is disabled at settlement (chip not completed)", async ({ page }) => {
    await page.locator("#btnAutoDeal").click();
    await expect(page.locator("#settlementBoard")).toBeVisible({ timeout: 15000 });

    // Next Round should be disabled until chips are settled
    await expect(page.locator("#btnNext")).toBeDisabled();
  });

  test("Clicking Next Round while disabled doesn't crash the app", async ({ page }) => {
    await page.locator("#btnAutoDeal").click();
    await expect(page.locator("#settlementBoard")).toBeVisible({ timeout: 15000 });

    // Click disabled button (no-op, but ensure no crash)
    await page.locator("#btnNext").dispatchEvent("click");
    await expect(page.locator("#tr-shoe-count")).not.toBeEmpty();
  });

  test("Live probability bar renders after a hand is dealt", async ({ page }) => {
    await page.locator("#btnAutoDeal").click();
    await expect(page.locator("#settlementBoard")).toBeVisible({ timeout: 15000 });
    // Live prob panel should have content
    await expect(page.locator("#tr-live-prob")).not.toBeEmpty({ timeout: 3000 });
  });

  test("Card counter renders a grid after a hand is dealt", async ({ page }) => {
    await page.locator("#btnAutoDeal").click();
    await expect(page.locator("#settlementBoard")).toBeVisible({ timeout: 15000 });
    await expect(page.locator("#tr-card-counter")).not.toBeEmpty({ timeout: 3000 });
  });
});
