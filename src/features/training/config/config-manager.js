const KEY     = 'yiding_training_rules_v1';
const INS_KEY = 'yiding_training_insurance_v1';

export const DEFAULT_INSURANCE = Object.freeze({
  enabled:          false,
  offerCondition:   'banker8',  // 'banker7' | 'banker8' | 'always'
  maxInsurancePct:  50,         // max % of player bet
  payout:           1,          // 1:1
});

export function getInsuranceConfig() {
  try {
    const raw = localStorage.getItem(INS_KEY);
    if (raw) return { ...DEFAULT_INSURANCE, ...JSON.parse(raw) };
  } catch (_) {}
  return { ...DEFAULT_INSURANCE };
}

export function saveInsuranceConfig(c) {
  try { localStorage.setItem(INS_KEY, JSON.stringify(c)); } catch (_) {}
}

export const DEFAULT_RULES = Object.freeze({
  id: 'default',
  name: 'Standard Rules',
  bankerCommission: 0.05,   // 5%
  tiePayout: 8,             // 8:1
  playerPairPayout: 11,     // 11:1
  bankerPairPayout: 11,     // 11:1
  luckySix2CardPayout: 12,  // 12:1
  luckySix3CardPayout: 20,  // 20:1
});

export function getRules() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...DEFAULT_RULES, ...JSON.parse(raw) };
  } catch (_) {}
  return { ...DEFAULT_RULES };
}

export function saveRules(r) {
  try { localStorage.setItem(KEY, JSON.stringify(r)); } catch (_) {}
}
