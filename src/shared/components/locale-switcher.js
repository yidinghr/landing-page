import { escapeHtml } from "../utils/escape-html.js";

export function renderLocalePopover({ i18n, isOpen }) {
  const currentLocale = i18n.getLocale();
  const options = i18n
    .getLocaleOptions()
    .map(function (option) {
      const activeClass = option.value === currentLocale ? " is-active" : "";

      return [
        '<button type="button" class="yd-locale-option',
        activeClass,
        '" data-locale-value="',
        escapeHtml(option.value),
        '">',
        "<span>",
        escapeHtml(option.label),
        "</span>",
        '<span class="yd-locale-option__check" aria-hidden="true">●</span>',
        "</button>"
      ].join("");
    })
    .join("");

  return [
    '<div class="yd-locale-popover"',
    isOpen ? "" : " hidden",
    '>',
    '<p class="yd-locale-popover__title">',
    escapeHtml(i18n.t("common.language")),
    "</p>",
    options,
    "</div>"
  ].join("");
}
