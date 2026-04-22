const KEY = 'yiding_training_rules_v1';
const INS_KEY = 'yiding_training_insurance_v1';
const TABLE_PREFS_KEY = 'yiding_training_table_prefs_v1';

export const STORAGE_KEYS = Object.freeze({
  rules: KEY,
  insurance: INS_KEY,
  tablePrefs: TABLE_PREFS_KEY
});

export const DEFAULT_INSURANCE = Object.freeze({
  enabled:          false,
  offerCondition:   'banker8',  // 'banker7' | 'banker8' | 'always'
  maxInsurancePct:  50,         // max % of player bet
  payout:           1,          // 1:1
  payoutMode:       'flat',     // 'flat' | 'onlyIfBankerNatural' | 'onlyIfBankerWinsNon-tie'
  settleOnTie:      false,      // false means insurance pushes on tie
  whoCanInsure:     'player-only',
  staffControlled:  false,
});

export const DEFAULT_TABLE_PREFS = Object.freeze({
  role: 'dealer',
  activeSeatId: 1,
  autoDealEnabled: true,
  insuranceNpcMode: 'decline', // 'decline' | 'maxAccept'
  wrongPayoutEnabled: false,
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

export const RULE_PRESETS = Object.freeze({
  standard: Object.freeze({ ...DEFAULT_RULES }),
  noCommission: Object.freeze({
    ...DEFAULT_RULES,
    id: 'noCommission',
    name: 'No Commission',
    bankerCommission: 0
  })
});

export const INSURANCE_PRESETS = Object.freeze({
  off: Object.freeze({ ...DEFAULT_INSURANCE }),
  banker8Staff: Object.freeze({
    ...DEFAULT_INSURANCE,
    enabled: true,
    offerCondition: 'banker8',
    staffControlled: true
  }),
  alwaysStaff: Object.freeze({
    ...DEFAULT_INSURANCE,
    enabled: true,
    offerCondition: 'always',
    staffControlled: true
  }),
  banker8AllPlayers: Object.freeze({
    ...DEFAULT_INSURANCE,
    enabled: true,
    offerCondition: 'banker8',
    staffControlled: false
  })
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

export function getTablePrefs() {
  try {
    const raw = localStorage.getItem(TABLE_PREFS_KEY);
    if (raw) return { ...DEFAULT_TABLE_PREFS, ...JSON.parse(raw) };
  } catch (_) {}
  return { ...DEFAULT_TABLE_PREFS };
}

export function saveTablePrefs(p) {
  try { localStorage.setItem(TABLE_PREFS_KEY, JSON.stringify(p)); } catch (_) {}
}
