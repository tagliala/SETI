"use strict";

window.SETI = window.SETI || {};
const SETI = window.SETI;

// Replace Flash-based ClippableBehavior with native Clipboard API.
// Delegated click handler on any [data-clipboard-text] element.
$(document).on("click", "[data-clipboard-text]", function (e) {
  e.preventDefault();
  const text = $(this).attr("data-clipboard-text");
  if (!text) return;
  navigator.clipboard.writeText(text).catch(() => {
    // Silent fallback — clipboard write failed (e.g. non-secure context).
  });
});

SETI.ClippableBehavior = {
  // No-op: included only for compatibility with existing call sites.
  handleCopied: function () {},
};
