function checked(value) {
  return value ? ' checked' : '';
}

function selected(value, expected) {
  return value === expected ? ' selected' : '';
}

function numberValue(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function readNumber(form, name, fallback) {
  const field = form.elements[name];
  return numberValue(field && field.value, fallback);
}

function rulesFromForm(form, currentRules) {
  return {
    ...currentRules,
    bankerCommission: readNumber(form, 'bankerCommissionPct', currentRules.bankerCommission * 100) / 100,
    tiePayout: readNumber(form, 'tiePayout', currentRules.tiePayout),
    playerPairPayout: readNumber(form, 'playerPairPayout', currentRules.playerPairPayout),
    bankerPairPayout: readNumber(form, 'bankerPairPayout', currentRules.bankerPairPayout),
    luckySix2CardPayout: readNumber(form, 'luckySix2CardPayout', currentRules.luckySix2CardPayout),
    luckySix3CardPayout: readNumber(form, 'luckySix3CardPayout', currentRules.luckySix3CardPayout)
  };
}

function insuranceFromForm(form, currentInsurance) {
  return {
    ...currentInsurance,
    enabled: Boolean(form.elements.insuranceEnabled && form.elements.insuranceEnabled.checked),
    offerCondition: form.elements.offerCondition.value,
    maxInsurancePct: readNumber(form, 'maxInsurancePct', currentInsurance.maxInsurancePct),
    payout: readNumber(form, 'insurancePayout', currentInsurance.payout),
    payoutMode: form.elements.payoutMode.value,
    settleOnTie: Boolean(form.elements.settleOnTie && form.elements.settleOnTie.checked),
    whoCanInsure: form.elements.whoCanInsure.value,
    staffControlled: Boolean(form.elements.staffControlled && form.elements.staffControlled.checked)
  };
}

function prefsFromForm(form, currentPrefs) {
  return {
    ...currentPrefs,
    role: form.elements.defaultRole.value,
    activeSeatId: readNumber(form, 'activeSeatId', currentPrefs.activeSeatId),
    autoDealEnabled: Boolean(form.elements.autoDealEnabled && form.elements.autoDealEnabled.checked),
    insuranceNpcMode: form.elements.insuranceNpcMode.value,
    wrongPayoutEnabled: Boolean(form.elements.wrongPayoutEnabled && form.elements.wrongPayoutEnabled.checked),
    evPanelEnabled: Boolean(form.elements.evPanelEnabled && form.elements.evPanelEnabled.checked),
    squeezeEnabled: Boolean(form.elements.squeezeEnabled && form.elements.squeezeEnabled.checked),
    manualCutEnabled: Boolean(form.elements.manualCutEnabled && form.elements.manualCutEnabled.checked),
    manualCutPct: readNumber(form, 'manualCutPct', currentPrefs.manualCutPct),
    shoePreset: form.elements.shoePreset.value
  };
}

function presetOptions(presets, currentId) {
  return Object.keys(presets).map(function (key) {
    const preset = presets[key];
    return '<option value="' + key + '"' + selected(key, currentId) + '>' + (preset.name || key) + '</option>';
  }).join('');
}

export function createSettingsPanel(options) {
  const host = options.host;
  const openButton = options.openButton;
  let isOpen = false;

  function close() {
    isOpen = false;
    if (!host) return;
    host.hidden = true;
    host.innerHTML = '';
  }

  function render() {
    if (!host) return;
    const state = options.getState();
    const rules = state.rules;
    const insurance = state.insuranceConfig;
    const prefs = state.tablePrefs;

    host.innerHTML = [
      '<div class="tr-settings-backdrop" data-settings-close></div>',
      '<section class="tr-settings-modal" role="dialog" aria-modal="true" aria-label="Training settings">',
      '<form id="trainingSettingsForm" class="tr-settings-form">',
      '<div class="tr-settings-head">',
      '<h2>Settings</h2>',
      '<button type="button" class="tr-settings-close" data-settings-close>Close</button>',
      '</div>',
      '<div class="tr-settings-grid">',
      '<fieldset>',
      '<legend>Rules</legend>',
      '<label>Preset<select name="rulesPreset">' + presetOptions(options.rulePresets, rules.id || 'standard') + '</select></label>',
      '<label>Banker commission %<input name="bankerCommissionPct" type="number" min="0" step="0.1" value="' + (rules.bankerCommission * 100) + '"></label>',
      '<label>Tie payout<input name="tiePayout" type="number" min="0" step="1" value="' + rules.tiePayout + '"></label>',
      '<label>Player pair<input name="playerPairPayout" type="number" min="0" step="1" value="' + rules.playerPairPayout + '"></label>',
      '<label>Banker pair<input name="bankerPairPayout" type="number" min="0" step="1" value="' + rules.bankerPairPayout + '"></label>',
      '<label>Lucky 6 two-card<input name="luckySix2CardPayout" type="number" min="0" step="1" value="' + rules.luckySix2CardPayout + '"></label>',
      '<label>Lucky 6 three-card<input name="luckySix3CardPayout" type="number" min="0" step="1" value="' + rules.luckySix3CardPayout + '"></label>',
      '</fieldset>',
      '<fieldset>',
      '<legend>Insurance</legend>',
      '<label class="tr-settings-check"><input name="insuranceEnabled" type="checkbox"' + checked(insurance.enabled) + '>Enabled</label>',
      '<label>Offer<select name="offerCondition">',
      '<option value="banker7"' + selected(insurance.offerCondition, 'banker7') + '>Banker 7+</option>',
      '<option value="banker8"' + selected(insurance.offerCondition, 'banker8') + '>Banker 8+</option>',
      '<option value="always"' + selected(insurance.offerCondition, 'always') + '>Always</option>',
      '</select></label>',
      '<label>Max %<input name="maxInsurancePct" type="number" min="0" max="100" step="1" value="' + insurance.maxInsurancePct + '"></label>',
      '<label>Payout<input name="insurancePayout" type="number" min="0" step="0.1" value="' + insurance.payout + '"></label>',
      '<label>Payout mode<select name="payoutMode">',
      '<option value="flat"' + selected(insurance.payoutMode, 'flat') + '>Flat banker win</option>',
      '<option value="onlyIfBankerNatural"' + selected(insurance.payoutMode, 'onlyIfBankerNatural') + '>Banker natural only</option>',
      '<option value="onlyIfBankerWinsNon-tie"' + selected(insurance.payoutMode, 'onlyIfBankerWinsNon-tie') + '>Banker non-tie win</option>',
      '</select></label>',
      '<label>Who can insure<select name="whoCanInsure">',
      '<option value="player-only"' + selected(insurance.whoCanInsure, 'player-only') + '>Player bet only</option>',
      '<option value="main-bets"' + selected(insurance.whoCanInsure, 'main-bets') + '>Player or Banker</option>',
      '<option value="all-bets"' + selected(insurance.whoCanInsure, 'all-bets') + '>Any bet base</option>',
      '</select></label>',
      '<label class="tr-settings-check"><input name="settleOnTie" type="checkbox"' + checked(insurance.settleOnTie) + '>Settle on tie</label>',
      '<label class="tr-settings-check"><input name="staffControlled" type="checkbox"' + checked(insurance.staffControlled) + '>Staff controlled</label>',
      '</fieldset>',
      '<fieldset>',
      '<legend>Table</legend>',
      '<label>Default role<select name="defaultRole">',
      '<option value="dealer"' + selected(prefs.role, 'dealer') + '>Dealer</option>',
      '<option value="customer"' + selected(prefs.role, 'customer') + '>Customer</option>',
      '<option value="insurance"' + selected(prefs.role, 'insurance') + '>Insurance</option>',
      '</select></label>',
      '<label>Active seat<input name="activeSeatId" type="number" min="1" max="5" step="1" value="' + prefs.activeSeatId + '"></label>',
      '<label class="tr-settings-check"><input name="autoDealEnabled" type="checkbox"' + checked(prefs.autoDealEnabled) + '>Dev Auto-Deal</label>',
      '<label class="tr-settings-check"><input name="evPanelEnabled" type="checkbox"' + checked(prefs.evPanelEnabled) + '>EV panel</label>',
      '<label class="tr-settings-check"><input name="squeezeEnabled" type="checkbox"' + checked(prefs.squeezeEnabled) + '>Squeeze / reveal</label>',
      '<label>NPC insurance<select name="insuranceNpcMode">',
      '<option value="decline"' + selected(prefs.insuranceNpcMode, 'decline') + '>Auto decline</option>',
      '<option value="maxAccept"' + selected(prefs.insuranceNpcMode, 'maxAccept') + '>Max accept</option>',
      '</select></label>',
      '<label>Preset shoe<select name="shoePreset">' + presetOptions(options.shoePresets || {}, prefs.shoePreset || 'random') + '</select></label>',
      '<label class="tr-settings-check"><input name="manualCutEnabled" type="checkbox"' + checked(prefs.manualCutEnabled) + '>Manual cut on New Shoe</label>',
      '<label>Cut card %<input name="manualCutPct" type="number" min="20" max="80" step="1" value="' + prefs.manualCutPct + '"></label>',
      '<label class="tr-settings-check"><input name="wrongPayoutEnabled" type="checkbox"' + checked(prefs.wrongPayoutEnabled) + '>Wrong-payout drill</label>',
      '</fieldset>',
      '</div>',
      '<div class="tr-settings-actions">',
      '<button type="button" class="tr-btn tr-btn--ghost" data-settings-reset>Reset</button>',
      '<button type="submit" class="tr-btn tr-btn--deal">Save</button>',
      '</div>',
      '</form>',
      '</section>'
    ].join('');

    host.hidden = false;

    const form = host.querySelector('#trainingSettingsForm');
    const rulesPreset = form.elements.rulesPreset;
    rulesPreset.addEventListener('change', function () {
      const preset = options.rulePresets[rulesPreset.value];
      if (!preset) return;
      form.elements.bankerCommissionPct.value = preset.bankerCommission * 100;
      form.elements.tiePayout.value = preset.tiePayout;
      form.elements.playerPairPayout.value = preset.playerPairPayout;
      form.elements.bankerPairPayout.value = preset.bankerPairPayout;
      form.elements.luckySix2CardPayout.value = preset.luckySix2CardPayout;
      form.elements.luckySix3CardPayout.value = preset.luckySix3CardPayout;
    });

    host.querySelectorAll('[data-settings-close]').forEach(function (node) {
      node.addEventListener('click', close);
    });
    host.querySelector('[data-settings-reset]').addEventListener('click', function () {
      options.onReset();
      close();
    });
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      const current = options.getState();
      options.onSave({
        rules: rulesFromForm(form, current.rules),
        insuranceConfig: insuranceFromForm(form, current.insuranceConfig),
        tablePrefs: prefsFromForm(form, current.tablePrefs)
      });
      close();
    });
  }

  function open() {
    isOpen = true;
    render();
  }

  if (openButton) {
    openButton.addEventListener('click', open);
  }

  return {
    open: open,
    close: close,
    isOpen: function () {
      return isOpen;
    }
  };
}
