"use strict";

window.SETI = window.SETI || {};
const SETI = window.SETI;
SETI.CONFIG = SETI.CONFIG || {};

Object.assign(SETI.CONFIG, {
  FORM_ID: "#formPlayersInfo",
  DEBUG: false,
  AUTOSTART: true,
  PR_ENUM_SPECIALITY: {
    No: 0,
    Technical: 1,
    Quick: 2,
    Powerful: 3,
    Unpredictable: 4,
    Head: 5,
    Regainer: 6,
  },
  PR_ENUM_SKILL: {
    Keeper: 0,
    Defending: 1,
    Playmaking: 2,
    Winger: 3,
    Passing: 4,
    Scoring: 5,
  },
});

const FORM_ID = SETI.CONFIG.FORM_ID;

// ---------------------------------------------------------------------------
// Utility functions
// ---------------------------------------------------------------------------

function format(source, params) {
  if (arguments.length === 1) {
    return function () {
      const args = Array.from(arguments);
      args.unshift(source);
      return format.apply(this, args);
    };
  }
  params = arguments.length > 2 && params.constructor !== Array
    ? Array.from(arguments).slice(1)
    : params;
  if (params.constructor !== Array) params = [params];
  $.each(params, function (i, n) {
    source = source.replace(new RegExp("\\{" + i + "\\}", "g"), n);
  });
  return source;
}
SETI.format = format;

function number_format(number = "", decimals = 0, dec_point = ".", thousands_sep = ",") {
  number = String(number).replace(/[^0-9+\-Ee.]/g, "");
  const n = isFinite(number) ? number : 0;
  const prec = isFinite(decimals) ? Math.abs(decimals) : 0;
  const toFixedFix = (n, prec) => {
    const k = Math.pow(10, prec);
    return "" + Math.round(n * k) / k;
  };
  let s = (prec ? toFixedFix(n, prec) : "" + Math.round(n)).split(".");
  if (s[0].length > 3) {
    s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, thousands_sep);
  }
  if ((s[1] || "").length < prec) {
    s[1] = s[1] || "";
    s[1] += new Array(prec - s[1].length + 1).join("0");
  }
  return s.join(dec_point);
}

function gup(name) {
  name = name.replace(/[[]/, "\\[").replace(/[\]]/, "\\]");
  const regexS = "[\\?&]" + name + "=([^&#]*)";
  const regex = new RegExp(regexS);
  const results = regex.exec(window.location.search);
  return results ? results[1] : undefined;
}

function scrollUpToResults() {
  const $elem = $(".nav-tabs");
  const docViewTop = $(window).scrollTop();
  const elemTop = $elem.offset().top;
  if (docViewTop > elemTop) {
    $("html, body").animate({ scrollTop: elemTop }, 200);
  }
}

function stripeTable() {
  $("#se-tables-container tbody").each(function () {
    $(this).find("th, td").removeClass("stripe");
    $(this).find("tr:visible:odd th, tr:visible:odd td").addClass("stripe");
  });
}

function createAlert(params) {
  return `
    <div class="alert alert-${params.type} fade show" id="${params.id}" role="alert">
      <button class="btn-close" data-bs-dismiss="alert" type="button" aria-label="Close"></button>
      <h4 class="alert-heading">${params.title}</h4>
      <p id="${params.id}Body">${params.body}</p>
    </div>`;
}

// Bootstrap 5 button loading state helpers (BS2 .button('loading') removed).
function buttonLoading($btn) {
  $btn.prop("disabled", true).text($btn.data("loading-text"));
}

function buttonComplete($btn) {
  $btn.prop("disabled", false).text($btn.data("complete-text"));
}

// ---------------------------------------------------------------------------
// No-op stubs for UI features not present in SETI
// ---------------------------------------------------------------------------
function checkFormButtonsAppearance() {}
function isAdvancedModeEnabled() { return false; }
function enableAdvancedMode() {}
function disableAdvancedMode() {}
function resetAndHideTabs() {}

// ---------------------------------------------------------------------------
// Iframe check
// ---------------------------------------------------------------------------
function checkIframe() {
  if (top.location !== self.location) {
    top.location = self.location;
  }
}

// ---------------------------------------------------------------------------
// Fill form from URL params
// ---------------------------------------------------------------------------
function fillForm() {
  const paramsString = gup("params");
  if (!paramsString) return;
  const params = decodeURI(paramsString).split("-");
  const fields = $("#formPlayersInfo *[name^=Staminia_]");
  fields.each(function (i) {
    this.value = params[i];
  });
  checkFormButtonsAppearance();
  if (isAdvancedModeEnabled()) {
    enableAdvancedMode();
  } else {
    disableAdvancedMode();
  }
  stripeTable();
}

// ---------------------------------------------------------------------------
// CHPP player field helpers
// ---------------------------------------------------------------------------
function loginMenuHide() {
  $("#loginDropdown").addClass("d-none");
  $("#loggedInDropdown").removeClass("d-none");
}

function loginMenuShow() {
  $("#menuLoginTitle").text("CHPP");
  $("#loggedInDropdown").addClass("d-none");
  $("#loginDropdown").removeClass("d-none");
}

// ---------------------------------------------------------------------------
// CHPP data fetch & UI setup
// ---------------------------------------------------------------------------
async function fetchCHPP(refresh = false) {
  const url = refresh ? "chpp/chpp_retrievedata.php?refresh" : "chpp/chpp_retrievedata.php";

  buttonLoading($("#CHPP_Refresh_Data"));
  $("#CHPP_Refresh_Data_Status").find("i").attr("class", "bi bi-clock text-white").attr("title", "");
  $("#CHPP_Refresh_Data_Status").attr("disabled", "disabled");
  $("#CHPP_Refresh_Data_Status").removeClass("btn-danger btn-success btn-warning").addClass("btn-progress");
  document.getElementById("CHPP_Results").classList.add("d-none");
  document.getElementById("CHPP_Match_Row")?.classList.add("d-none");
  $("#CHPP_Status_Description").html("");

  let jsonObject;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!response.ok) throw new Error("network");
    jsonObject = await response.json();
  } catch (err) {
    let error_message, description_message;
    if (err.name === "AbortError") {
      error_message = SETI.messages.error_timeout;
      description_message = "";
    } else {
      error_message = SETI.messages.error_unknown;
      description_message = SETI.messages.retry_to_authorize;
    }
    $("#CHPP_Refresh_Data_Status").find("i").attr("class", "bi bi-x-lg text-white").attr("title", SETI.messages.status_error);
    $("#CHPP_Refresh_Data_Status").removeClass("btn-success btn-warning").addClass("btn-danger");
    $("#CHPP_Status_Description").html(`${error_message}<br/>${description_message}`);
    loginMenuShow();
    $("#CHPP_Refresh_Data").data("complete-text", $("#CHPP_Refresh_Data").data("error-text"));
    $("#CHPP_Refresh_Data_Status").removeAttr("disabled");
    document.getElementById("CHPP_Results").classList.remove("d-none");
    buttonComplete($("#CHPP_Refresh_Data"));
    return;
  }

  if (jsonObject.Status === "OK") {
    try {
      SETI.Teams = jsonObject.Teams;
      setupCHPPTeamFields();

      if (jsonObject.RefreshThrottle) {
        $("#CHPP_Refresh_Data_Status").find("i").attr("class", "bi bi-exclamation-triangle").attr("title", SETI.messages.status_warning);
        $("#CHPP_Refresh_Data_Status").removeClass("btn-progress btn-danger btn-success").addClass("btn-warning");
        $("#CHPP_Status_Description").text(SETI.messages.refresh_throttle(jsonObject.RefreshThrottle));
      } else {
        $("#CHPP_Refresh_Data_Status").find("i").attr("class", "bi bi-check-lg text-white").attr("title", SETI.messages.status_ok);
        $("#CHPP_Refresh_Data_Status").removeClass("btn-progress btn-danger btn-warning").addClass("btn-success");
      }
      $("#CHPP_Refresh_Data").data("complete-text", $("#CHPP_Refresh_Data").data("success-text"));
    } catch (error) {
      console.error("[SETI CHPP] Error processing OK response:", error);
      $("#CHPP_Refresh_Data_Status").find("i").attr("class", "bi bi-x-lg text-white").attr("title", SETI.messages.status_error);
      $("#CHPP_Refresh_Data_Status").removeClass("btn-progress btn-success btn-warning").addClass("btn-danger");
      loginMenuShow();
      $("#CHPP_Refresh_Data").data("complete-text", $("#CHPP_Refresh_Data").data("error-text"));
      $("#CHPP_Status_Description").html(`${SETI.messages.error_unknown}.<br/>${SETI.messages.retry_to_authorize}.`);
    }
  } else if (jsonObject.Status === "Error") {
    let error_message, description_message;
    if (jsonObject.ErrorCode === "InvalidToken") {
      error_message = SETI.messages.error_invalid_token;
      description_message = SETI.messages.retry_to_authorize;
    } else {
      error_message = SETI.messages.error_unknown;
      description_message = SETI.messages.retry_to_authorize;
    }
    $("#CHPP_Refresh_Data_Status").find("i").attr("class", "bi bi-x-lg text-white").attr("title", SETI.messages.status_error);
    $("#CHPP_Refresh_Data_Status").removeClass("btn-progress btn-success btn-warning").addClass("btn-danger");
    $("#CHPP_Status_Description").html(`${error_message}<br/>${description_message}`);
    loginMenuShow();
    $("#CHPP_Refresh_Data").data("complete-text", $("#CHPP_Refresh_Data").data("error-text"));
  }

  $("#CHPP_Refresh_Data_Status").removeAttr("disabled");
  document.getElementById("CHPP_Results").classList.remove("d-none");
  buttonComplete($("#CHPP_Refresh_Data"));
}

function setupCHPPTeamFields() {
  const teams = SETI.Teams;
  if (!teams || teams.length === 0) return;

  const teamSelect = document.getElementById("CHPP_Team");
  teamSelect.innerHTML = "";
  teams.forEach((team, i) => {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = team.TeamName;
    teamSelect.appendChild(opt);
  });

  document.getElementById("CHPP_Team_Row").classList.toggle("d-none", teams.length <= 1);
  document.getElementById("CHPP_Match_Row")?.classList.remove("d-none");
  document.getElementById("menuLoginTitle").textContent = teams[0].TeamName;
  loginMenuHide();
  setupCHPPMatchFields(0);
}

function setupCHPPMatchFields(teamIndex) {
  const team = SETI.Teams[teamIndex];
  const matchSelect = document.getElementById("CHPP_Match");
  matchSelect.innerHTML = "";
  clearCHPPPlayerPanel();

  if (!team.NextMatches || team.NextMatches.length === 0) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "—";
    matchSelect.appendChild(opt);
    return;
  }

  team.NextMatches.forEach((match) => {
    const opt = document.createElement("option");
    opt.value = match.MatchId;
    opt.textContent = `${match.Date} — ${match.HomeTeamName} vs ${match.AwayTeamName}`;
    matchSelect.appendChild(opt);
  });

  fetchMatchOrders(team.NextMatches[0].MatchId, teamIndex);
}

async function fetchMatchOrders(matchId, teamIndex) {
  teamIndex = teamIndex ?? parseInt(document.getElementById("CHPP_Team").value, 10);

  let jsonObject;
  try {
    const teamId = SETI.Teams[teamIndex].TeamId;
    const response = await fetch(`chpp/chpp_retrievedata.php?matchId=${encodeURIComponent(matchId)}&teamId=${encodeURIComponent(teamId)}`);
    if (!response.ok) throw new Error("network");
    jsonObject = await response.json();
  } catch (err) {
    updatePlayerListVisibility(false);
    return;
  }

  if (jsonObject.Status === "OK") {
    SETI.MatchOrders = jsonObject.MatchOrders;
    SETI.Players = {};
    for (const player of SETI.Teams[teamIndex].PlayersData) {
      SETI.Players[player.PlayerID] = player;
    }
    fillFieldFromMatch();
    renderCHPPPlayerList(SETI.Teams[teamIndex].PlayersData);
  } else {
    updatePlayerListVisibility(false);
  }
}

// ---------------------------------------------------------------------------
// Get link button
// ---------------------------------------------------------------------------
$("#getLink").on("click", function (e) {
  if (!$(FORM_ID).validate().form()) {
    const alertEl = document.getElementById("generatedLink");
    if (alertEl) bootstrap.Alert.getOrCreateInstance(alertEl)?.close();
    return;
  }

  let link = document.location.href.split("?")[0];
  const locale = gup("locale");
  if (locale) {
    link += "?locale=" + locale + "&amp;";
  } else {
    link += "?";
  }

  // Replace jqform's .fieldValue() with native jQuery map.
  const fieldValues = $("#formPlayersInfo *[name^=Staminia_]").map(function () {
    return this.value;
  }).get();
  link += "params=" + encodeURI(fieldValues.toString().replace(/,/g, "-"));

  const clippy = `&nbsp;<span class="clippy" data-clipboard-text="${link}" id="staminiaClippy"></span>`;
  const body = link;

  if ($("#generatedLinkBody").length) {
    $("#staminiaClippy").attr("data-clipboard-text", link);
    $("#generatedLinkBody").fadeOut("fast", function () {
      $(this).html(body).fadeIn("fast");
    });
  } else {
    $("#AlertsContainer").append(
      createAlert({ id: "generatedLink", type: "info", body: body, title: SETI.messages.copy_link + " " + clippy })
    );
  }

  scrollUpToResults();
});

// ---------------------------------------------------------------------------
// Tab events — Bootstrap 5 uses 'shown.bs.tab'
// ---------------------------------------------------------------------------
$('[data-bs-toggle="tab"]').on("shown.bs.tab", function (e) {
  if ($(e.target).attr("data-bs-target") === "#tabCredits") {
    $("#AlertsContainer").hide();
  } else {
    $("#AlertsContainer").show();
  }
});

// ---------------------------------------------------------------------------
// Reset button
// ---------------------------------------------------------------------------
$("#resetApp").on("click", function (e) {
  $(FORM_ID).each(function () {
    if (typeof this.reset === "function" || (typeof this.reset === "object" && !this.reset.nodeType)) {
      this.reset();
    }
  });

  $(".control-group").removeClass("error");
  $("#AlertsContainer").html("");
  resetAndHideTabs();

  $("button[data-checkbox-button], button[data-radio-button]").each(function () {
    const form = $(FORM_ID)[0];
    form[$(this).data("linkedTo")].value = $(this).data("default-value");
  });

  checkFormButtonsAppearance();
  disableAdvancedMode();
  resetSoccerField();
  stripeTable();
  e.preventDefault();
});

// ---------------------------------------------------------------------------
// jquery-validation custom methods
// ---------------------------------------------------------------------------
$.validator.methods.range = function (value, element, param) {
  const globalizedValue = value.replace(",", ".");
  return this.optional(element) || (globalizedValue >= param[0] && globalizedValue <= param[1]);
};

$.validator.methods.number = function (value, element) {
  return this.optional(element) || /^-?(?:\d+|\d{1,3}(?:[\s.,]\d{3})+)(?:[.,]\d+)?$/.test(value);
};

$.validator.addMethod(
  "position",
  function (value, element, params) {
    return this.optional(element) || (value >= params[0] && value <= params[1]);
  },
  jQuery.validator.messages.required
);

// ---------------------------------------------------------------------------
// CHPP click handlers
// ---------------------------------------------------------------------------
$("#CHPP_Refresh_Data").on("click", function () {
  fetchCHPP(true);
});

$("#CHPP_Revoke_Auth_Link").on("click", function () {
  $(this).closest("[class~='open']").removeClass("open");
  window.confirm(SETI.messages.revoke_auth_confirm);
});

document.getElementById("CHPP_Team").addEventListener("change", function () {
  setupCHPPMatchFields(parseInt(this.value, 10));
});

document.getElementById("CHPP_Match")?.addEventListener("change", function () {
  const matchId = parseInt(this.value, 10);
  if (!isNaN(matchId)) fetchMatchOrders(matchId);
});

// Dropdown form click propagation stop
$(".dropdown-menu").find("form").on("click", function (e) { e.stopPropagation(); });

// ---------------------------------------------------------------------------
// Inline debounce (replaces $.debounce from jqthrottle)
// ---------------------------------------------------------------------------
function debounce(fn, delay) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

$(window).on("resize", debounce(function () {
  // Charts removed — no-op kept for future use.
}, 500));

// ---------------------------------------------------------------------------
// Player list visibility & state management
// ---------------------------------------------------------------------------

// Compute set of player IDs currently placed on the field
function getUnavailablePlayerIds() {
  const unavailable = new Set();
  document.querySelectorAll(".drop .player[data-player-id]").forEach(card => {
    unavailable.add(card.dataset.playerId);
  });
  return unavailable;
}

// Sync unavailable state in draggable list and CHPP sidebar
function syncPlayerAvailability() {
  const unavailable = getUnavailablePlayerIds();
  
  // Update generic draggable players
  document.querySelectorAll(".draggablePlayers .draggable").forEach(li => {
    const card = li.querySelector(".player");
    const playerId = card?.dataset.playerId;
    if (playerId && unavailable.has(playerId)) {
      li.classList.add("unavailable");
      li.draggable = false;
    } else {
      li.classList.remove("unavailable");
      li.draggable = true;
    }
  });
  
  // Update CHPP sidebar rows
  document.querySelectorAll("#CHPP_Players_List .chpp-player-row").forEach(row => {
    const playerId = row.dataset.playerId;
    if (playerId && unavailable.has(playerId)) {
      row.classList.add("unavailable");
      row.draggable = false;
    } else {
      row.classList.remove("unavailable");
      row.draggable = true;
    }
  });
}

// Unified visibility control: show CHPP list if available, else show generic
function updatePlayerListVisibility(showCHPP = false) {
  const chppPanel = document.getElementById("CHPP_Players_Panel");
  const chppList = document.getElementById("CHPP_Players_List");
  const genericList = document.querySelector(".draggablePlayers");
  
  if (showCHPP && chppPanel && chppList && chppList.children.length > 0) {
    chppPanel.classList.remove("d-none");
    genericList?.classList.add("d-none");
  } else {
    renderGenericPlayerList();
    chppPanel?.classList.remove("d-none");
    genericList?.classList.remove("d-none");
  }
  syncPlayerAvailability();
}

// ---------------------------------------------------------------------------
// Soccer field — match orders
// ---------------------------------------------------------------------------

// Speciality metadata: id → {class, icon, label}
const SPECIALITY_META = {
  "1": { cls: "speciality-technical",     icon: "img/speciality-technical.svg",     label: "Technical" },
  "2": { cls: "speciality-quick",         icon: "img/speciality-quick.svg",         label: "Quick" },
  "3": { cls: "speciality-powerful",      icon: "img/speciality-powerful.svg",      label: "Powerful" },
  "4": { cls: "speciality-unpredictable", icon: "img/speciality-unpredictable.svg", label: "Unpredictable" },
  "5": { cls: "speciality-head",          icon: "img/speciality-head.svg",          label: "Head" },
  "6": { cls: "speciality-resilient",     icon: "img/speciality-resilient.svg",     label: "Resilient" },
  "7": { cls: "speciality-leader",        icon: "img/speciality-leader.svg",        label: "Support" },
};

// Generic avatar — FA circle-user icon
const AVATAR_FALLBACK = `<img src="img/avatar-generic.svg" class="avatar-generic-icon" alt="">`;

// Format player display name: "N. Surname" — truncate surname to 9 chars
function formatPlayerName(player) {
  const shirtNo = player.PlayerNumber ? `${player.PlayerNumber}.` : "";
  const fullName = player.PlayerName || "";
  const parts = fullName.trim().split(/\s+/);
  const surname = parts.length > 1 ? parts[parts.length - 1] : fullName;
  const display = surname.length > 9 ? surname.slice(0, 9) + "…" : surname;
  return shirtNo ? `${shirtNo} ${display}` : display;
}

// Build inner HTML for a player card placed on the field
function buildPlayerCardHtml(player, speciality) {
  const spec = SPECIALITY_META[speciality];
  const specClass = spec ? spec.cls : "";
  const specBadge = spec
    ? `<div class="player-speciality-badge"><img src="${spec.icon}" alt="${spec.label}" width="14" height="14"></div>`
    : "";
  const name = formatPlayerName(player);
  const avatarContent = player.Avatar ? `<div class="ht-avatar-wrap">${player.Avatar}</div>` : AVATAR_FALLBACK;

  return `<div class="player${specClass ? " speciality " + specClass : ""}" data-player-id="${player.PlayerID}">
    <div class="player-avatar"><div class="player-avatar-clip">${avatarContent}</div>${specBadge}</div>
    <div class="player-description"><span>${name}</span></div>
  </div>`;
}

// Build portrait card for generic specialty players (100x145 format with user-icon overlay)
function buildGenericSpecialtyCardHtml(specialtyId) {
  const spec = SPECIALITY_META[specialtyId];
  const specClass = spec ? spec.cls : "";
  const label = spec ? spec.label : "—";
  const specBadge = spec
    ? `<div class="player-speciality-badge"><img src="${spec.icon}" alt="${spec.label}" width="14" height="14"></div>`
    : "";
  return `<div class="player generic-specialty${specClass ? " " + specClass : ""}" data-player-id="generic-${specialtyId}">
    <div class="player-avatar"><div class="player-avatar-clip generic-bg">${AVATAR_FALLBACK}</div>${specBadge}</div>
    <div class="player-description"><span>${label}</span></div>
  </div>`;
}

function fillFieldFromMatch() {
  if (!SETI.MatchOrders) return;
  resetSoccerField();
  const Players = SETI.Players;
  for (const order of SETI.MatchOrders) {
    const position = Number(order.Position);
    const player = Players[order.PlayerID];
    if (!player) continue; // skip opponent players
    if (position === 17) { // Set pieces taker
      if (player.Speciality === "5") { // Head
        $("#setPiecesTakerHead").prop("checked", true);
      }
    }
    if (position < 100) continue;
    let speciality = String(player.Speciality ?? "0");
    if (speciality === "3" || speciality === "6") speciality = "0"; // harmless specialities
    $(`#position-${position}`).html(buildPlayerCardHtml(player, speciality));
  }
  startCalculation();
  syncPlayerAvailability();
}

// ---------------------------------------------------------------------------
// CHPP sidebar player list
// ---------------------------------------------------------------------------
function renderCHPPPlayerList(players) {
  const panel = document.getElementById("CHPP_Players_Panel");
  const list = document.getElementById("CHPP_Players_List");
  if (!panel || !list) return;

  list.innerHTML = "";

  const sorted = [...players].sort((a, b) => {
    const na = Number(a.PlayerNumber) || 99;
    const nb = Number(b.PlayerNumber) || 99;
    return na - nb;
  });

  for (const player of sorted) {
    const specKey = String(player.Speciality ?? "0");
    const spec = SPECIALITY_META[specKey];
    const specBadgeHtml = spec
      ? `<div class="chpp-player-spec ${spec.cls}"><img src="${spec.icon}" alt="${spec.label}"></div>`
      : "";
    const name = player.PlayerName || "—";

    const row = document.createElement("div");
    row.className = "chpp-player-row";
    row.dataset.playerId = player.PlayerID;
    row.draggable = true;
    row.innerHTML = `
      <div class="chpp-player-avatar-wrap">
        <img class="chpp-avatar-icon" src="img/avatar-generic.svg" alt="">
        ${specBadgeHtml}
      </div>
      <div class="chpp-player-info">
        <div class="chpp-player-name">${name}</div>
      </div>`;

    // HTML5 drag from sidebar to field slots
    row.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/player-id", player.PlayerID);
      row.classList.add("dragging");
    });
    row.addEventListener("dragend", () => {
      row.classList.remove("dragging");
      document.querySelectorAll(".drop.chpp-dragover").forEach(el => el.classList.remove("chpp-dragover"));
      syncPlayerAvailability();
    });

    list.appendChild(row);
  }

  // Wire field slots to accept drops from sidebar
  document.querySelectorAll(".drop").forEach(slot => {
    slot.addEventListener("dragover", (e) => {
      e.preventDefault();
      slot.classList.add("chpp-dragover");
    });
    slot.addEventListener("dragleave", () => {
      slot.classList.remove("chpp-dragover");
    });
    slot.addEventListener("drop", (e) => {
      e.preventDefault();
      slot.classList.remove("chpp-dragover");
      const pid = e.dataTransfer.getData("text/player-id");
      if (!pid) return;
      const player = SETI.Players[pid];
      if (!player) return;
      const $slot = $(slot);
      // Block if the same player is already somewhere on the field
      if (document.querySelector(`.drop .player[data-player-id="${pid}"]`)) return;
      // Only allow if < 10 players or it's a swap, or keeper slot
      const isKeeper = slot.classList.contains("position-keeper");
      const fieldCount = $(".soccer-field-movement").find(".player").length;
      if (!isKeeper && fieldCount >= 10 && !$slot.find(".player").length) return;
      let speciality = String(player.Speciality ?? "0");
      if (speciality === "3" || speciality === "6") speciality = "0";
      $slot.html(buildPlayerCardHtml(player, speciality));
      syncPlayerAvailability();
      syncPlayerAvailability();
      startCalculation();
    });
  });

  updatePlayerListVisibility(true);
}

function resetSoccerField() {
  $(".player-position.drop").html("<div></div>");
  $("#setPiecesTakerHead").prop("checked", false);
  $("#playCreatively").val("No");
  $("#ballPossession").val(50);
  syncPlayerAvailability();
}

function renderGenericPlayerList() {
  const list = document.getElementById("CHPP_Players_List");
  if (!list) return;
  list.innerHTML = "";

  for (const id of ["2", "5", "4", "1", "0"]) {
    const spec = SPECIALITY_META[id];
    const specBadgeHtml = spec
      ? `<div class="chpp-player-spec ${spec.cls}"><img src="${spec.icon}" alt="${spec.label}"></div>`
      : "";
    const label = spec ? spec.label : "\u2014";
    const row = document.createElement("div");
    row.className = "chpp-player-row generic-row";
    row.dataset.playerId = "generic-" + id;
    row.draggable = true;
    row.innerHTML = `
      <div class="chpp-player-avatar-wrap">
        <img class="chpp-avatar-icon" src="img/avatar-generic.svg" alt="">
        ${specBadgeHtml}
      </div>
      <div class="chpp-player-info">
        <div class="chpp-player-name">${label}</div>
      </div>`;
    row.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/player-id", "generic-" + id);
      row.classList.add("dragging");
    });
    row.addEventListener("dragend", () => {
      row.classList.remove("dragging");
      document.querySelectorAll(".drop.chpp-dragover").forEach(el => el.classList.remove("chpp-dragover"));
      syncPlayerAvailability();
    });
    list.appendChild(row);
  }
}

function clearCHPPPlayerPanel() {
  const list = document.getElementById("CHPP_Players_List");
  if (list) list.innerHTML = "";
  updatePlayerListVisibility(false);
}

// ---------------------------------------------------------------------------
// Drag-drop helpers
// ---------------------------------------------------------------------------
function unhighlightDropElements(clickable = false) {
  $(".drop").removeClass("highlight");
  if (clickable) $(".drop").removeClass("clickable");
  $(".trash-players").fadeOut();
}

function highlightDropElements(clickable = false) {
  if ($(".soccer-field-movement").find(".player").length >= 10) {
    $(".soccer-field-keeper .drop").addClass("highlight");
    if (clickable) $(".soccer-field-keeper .drop").addClass("clickable");
  } else {
    $(".drop").addClass("highlight");
    if (clickable) $(".drop").addClass("clickable");
  }
  if (clickable) $(".drop.player").addClass("clickable");
}

function setPlayerInField($src, $dst) {
  const player = $src.find(".player");
  const playerId = player.attr("data-player-id");
  
  // Detect if this is a generic specialty player (id format: generic-X)
  if (playerId && playerId.startsWith("generic-")) {
    const specialtyId = playerId.replace("generic-", "");
    $dst.html(buildGenericSpecialtyCardHtml(specialtyId));
  } else {
    $dst.html($src.html());
  }
}

function switchPlayersInField($src, $dst) {
  const temp = $dst.html();
  $dst.html($src.html());
  $src.html(temp);
  $src.find("div").removeClass("droppableHover");
}

function initDragdrop($element) {
  $element.dragdrop({
    srcElement: null,
    makeClone: true,
    appendTo: $("body"),
    sourceClass: "pendingDrop",
    dropClass: "droppableHover",
    dragClass: "whileDragging",
    container: $(".no-text-select"),
    canDrag: function ($src, event) {
      const $source = $(event.target);
      if ($source.hasClass("player") && !$source.parent().hasClass("pendingDrop")) {
        highlightDropElements();
        this.srcElement = $source.parent();
        if (this.srcElement.hasClass("drop")) $(".trash-players").fadeIn();
        return this.srcElement;
      }
    },
    canDrop: function ($dst) {
      return (
        ($dst.parent().hasClass("drop") &&
          ($dst.parent().hasClass("position-keeper") ||
            ($(".soccer-field-movement").find(".player").length < 10 || $dst.hasClass("player")))) ||
        (this.srcElement.hasClass("drop") && $dst.parent().hasClass("trash-players")) ||
        (this.srcElement.hasClass("drop") && $dst.parent().hasClass("drop"))
      );
    },
    didDrop: function ($src, $dst) {
      if ($dst.parent().hasClass("trash-players")) {
        $src.html("<div></div>");
      } else {
        const $li = $dst.parent();
        if (!$src.hasClass("drop")) {
          setPlayerInField($src, $li);
        } else if ($src[0] !== $li[0]) {
          switchPlayersInField($src, $li);
        }
      }
      startCalculation();
    },
    endDrag: function ($src, $dst) {
      unhighlightDropElements();
    },
  });
}

// ---------------------------------------------------------------------------
// Calculation
// ---------------------------------------------------------------------------
function resetResults() {
  $("#attendedGoals").text("0.00");
  $("#se-tables-container table").each(function () {
    $(this).data("subtotal", 0);
    $(this).addClass("d-none");
  });
}

function startCalculation() {
  setTimeout(function () {
    resetResults();
    const results = SETI.Engine.start();
    $("#attendedGoals").text(results.goals.toFixed(2));
    for (const specialEvent of SETI.Engine.SpecialEvents) {
      const currentSeGoals = results.SE[specialEvent.name];
      if (currentSeGoals != null) {
        $(`#Count_${specialEvent.name}`).text(currentSeGoals.toFixed(4)).closest("tr").removeClass("d-none");
        const $table = $(`#Count_${specialEvent.family}`);
        const subtotal = ($table.data("subtotal") || 0) + currentSeGoals;
        $table.data("subtotal", subtotal);
        $(`#Count_${specialEvent.family}_Subtotal`).text(`(${subtotal.toFixed(4)})`);
        $table.removeClass("d-none");
      } else {
        $(`#Count_${specialEvent.name}`).closest("tr").addClass("d-none");
      }
    }
    stripeTable();
  }, 0);
}

// ---------------------------------------------------------------------------
// Document ready
// ---------------------------------------------------------------------------
$(function () {
  checkIframe();
  const hasParams = gup("params") != null;
  if (hasParams) fillForm();
  if (document.startAjax) {
    fetchCHPP(false);
  }

  initDragdrop($("li.drop, li.draggable"));

  // One-time setup: handle HTML5 drop of generic specialty players onto field slots
  document.querySelectorAll(".drop").forEach(slot => {
    slot.addEventListener("dragover", (e) => { e.preventDefault(); slot.classList.add("chpp-dragover"); });
    slot.addEventListener("dragleave", () => { slot.classList.remove("chpp-dragover"); });
    slot.addEventListener("drop", (e) => {
      const pid = e.dataTransfer.getData("text/player-id");
      if (!pid?.startsWith("generic-")) return;
      e.preventDefault();
      slot.classList.remove("chpp-dragover");
      const specialtyId = pid.replace("generic-", "");
      $(slot).html(buildGenericSpecialtyCardHtml(specialtyId));
      syncPlayerAvailability();
      startCalculation();
    });
  });

  updatePlayerListVisibility(false);
});

// ---------------------------------------------------------------------------
// Event handlers
// ---------------------------------------------------------------------------
$("select, input[type=checkbox]").on("change", function () {
  startCalculation();
});

$(".trash-players").on("click touchend", function (e) {
  const $src = $(".soccer-field .pendingDrop");
  if (!$src[0]) return;
  $src.removeClass("pendingDrop").html("<div></div>");
  unhighlightDropElements(true);
  startCalculation();
});

$(".soccer-field-wrapper").on("click touchend", ".draggable, .drop", function (e) {
  const $this = $(this);
  if ($(".pendingDrop").length === 0 && $this.find(".player")[0]) {
    if ($this.hasClass("drop")) $(".trash-players").fadeIn();
    $this.addClass("pendingDrop");
    highlightDropElements(true);
  } else if ($(".pendingDrop").length > 0) {
    const $src = $(".pendingDrop").removeClass("pendingDrop");
    unhighlightDropElements(true);
    const $dst = $(this);
    if ($src[0] === $dst[0] || $dst.hasClass("draggable")) return;
    if (!$src.hasClass("drop")) {
      setPlayerInField($src, $dst);
    } else if ($src[0] !== $dst[0]) {
      switchPlayersInField($src, $dst);
    }
    startCalculation();
  }
});

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------
SETI.format = format;
SETI.number_format = number_format;
