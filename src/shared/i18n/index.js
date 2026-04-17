import "../../../assets/js/i18n.js";

const i18n = window.YiDingI18n || null;

if (!i18n) {
  throw new Error("YiDingI18n failed to initialize.");
}

export { i18n };
