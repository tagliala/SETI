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

function sort_by(field, reverse, primer) {
  const sign = reverse ? -1 : 1;
  return function (a, b) {
    let av = a[field];
    let bv = b[field];
    if (primer) {
      av = primer(av);
      bv = primer(bv);
      if (isNaN(av)) av = Infinity;
      if (isNaN(bv)) bv = Infinity;
    }
    if (av < bv) return sign * -1;
    if (av > bv) return sign * 1;
    return 0;
  };
}

function sortCHPPPlayerFields() {
  const PlayersData = SETI.PlayersData;
  if (!PlayersData) return;

  let field = "PlayerNumber";
  let reverse = false;
  let primer = parseInt;

  switch ($(`${FORM_ID} select[id=CHPP_Players_SortBy]`).val()) {
    case "ShirtNumber":  field = "PlayerNumber"; break;
    case "Name":         field = "PlayerName"; primer = undefined; break;
    case "Form":         field = "PlayerForm"; reverse = true; break;
    case "Stamina":      field = "StaminaSkill"; reverse = true; break;
    case "Keeper":       field = "KeeperSkill"; reverse = true; break;
    case "Playmaking":   field = "PlaymakerSkill"; reverse = true; break;
    case "Passing":      field = "PassingSkill"; reverse = true; break;
    case "Winger":       field = "WingerSkill"; reverse = true; break;
    case "Defending":    field = "DefenderSkill"; reverse = true; break;
    case "Scoring":      field = "ScorerSkill"; reverse = true; break;
    case "SetPieces":    field = "SetPiecesSkill"; reverse = true; break;
    case "Experience":   field = "Experience"; reverse = true; break;
    case "Loyalty":      field = "Loyalty"; reverse = true; break;
  }

  PlayersData.sort(sort_by(field, reverse, primer));
}

function updateCHPPPlayerFields() {
  const PlayersData = SETI.PlayersData;
  if (!PlayersData) return;

  sortCHPPPlayerFields();

  const select = $(document.createElement("select"));
  for (let index = 0; index < PlayersData.length; index++) {
    const player = PlayersData[index];
    const optionElement = $(document.createElement("option"));
    if (Number(player.InjuryLevel) === 0) optionElement.addClass("isBruised");
    if (Number(player.InjuryLevel) > 0) optionElement.addClass("isInjured");
    if (Number(player.Cards) >= 3) optionElement.addClass("isSuspended");
    if (player.TransferListed) optionElement.addClass("isTransferListed");
    optionElement.attr("value", index);
    const number = player.PlayerNumber != null ? player.PlayerNumber + "." : "";
    const mc = player.MotherClubBonus ? "\u2665" : "";
    optionElement.text(`${number} ${player.PlayerName} ${mc}`);
    select.append(optionElement);
  }

  const selectP1 = select.clone(true);
  const selectP2 = select.clone(true);
  selectP1.attr("id", "CHPP_Player_1");
  selectP2.attr("id", "CHPP_Player_2");
  $("#CHPP_Player_1").html(selectP1.html());
  $("#CHPP_Player_2").html(selectP2.html());
}

function setupCHPPPlayerFields(checkUrlParameter = false) {
  updateCHPPPlayerFields();
  if ($("#CHPP_Player_1 option").length > 2 && $("#CHPP_Player_2 option").length > 2) {
    $("#CHPP_Player_1 option:eq(0)").attr("selected", "selected");
    $("#CHPP_Player_2 option:eq(1)").attr("selected", "selected");
    setPlayerFormFields(1, checkUrlParameter);
    setPlayerFormFields(2, checkUrlParameter);
  }
}

function setPlayerFormFields(player, checkUrlParameter = false) {
  if (checkUrlParameter && gup("params")) return;
  const PlayersData = SETI.PlayersData;
  if (!PlayersData) return;
  const formReference = $(FORM_ID)[0];
  const PlayerData = PlayersData[formReference[`CHPP_Player_${player}`].value];
  if (!PlayerData) return;

  formReference[`Staminia_Simple_Player_${player}_Experience`].value = PlayerData.Experience;
  formReference[`Staminia_Simple_Player_${player}_Stamina`].value = PlayerData.StaminaSkill;
  formReference[`Staminia_Simple_Player_${player}_Form`].value = PlayerData.PlayerForm;
  formReference[`Staminia_Simple_Player_${player}_MainSkill`].value = PlayerData.MainSkill;
  formReference[`Staminia_Simple_Player_${player}_Loyalty`].value = PlayerData.Loyalty;

  const mbBtn = $(`#Button_Player_${player}_MotherClubBonus`);
  const mbStatus = $(`#Button_Player_${player}_MotherClubBonus_Status`);
  if ((PlayerData.MotherClubBonus && !mbStatus.hasClass("btn-success")) ||
    (!PlayerData.MotherClubBonus && mbStatus.hasClass("btn-success"))) {
    mbBtn.click();
  }

  formReference[`Staminia_Advanced_Player_${player}_Experience`].value       = number_format(PlayerData.Experience,     2);
  formReference[`Staminia_Advanced_Player_${player}_Stamina`].value          = number_format(PlayerData.StaminaSkill,   2);
  formReference[`Staminia_Advanced_Player_${player}_Form`].value             = number_format(PlayerData.PlayerForm,     2);
  formReference[`Staminia_Advanced_Player_${player}_Loyalty`].value          = number_format(PlayerData.Loyalty,        2);
  formReference[`Staminia_Advanced_Player_${player}_Skill_Keeper`].value     = number_format(PlayerData.KeeperSkill,    2);
  formReference[`Staminia_Advanced_Player_${player}_Skill_Defending`].value  = number_format(PlayerData.DefenderSkill,  2);
  formReference[`Staminia_Advanced_Player_${player}_Skill_Playmaking`].value = number_format(PlayerData.PlaymakerSkill, 2);
  formReference[`Staminia_Advanced_Player_${player}_Skill_Winger`].value     = number_format(PlayerData.WingerSkill,    2);
  formReference[`Staminia_Advanced_Player_${player}_Skill_Passing`].value    = number_format(PlayerData.PassingSkill,   2);
  formReference[`Staminia_Advanced_Player_${player}_Skill_Scoring`].value    = number_format(PlayerData.ScorerSkill,    2);
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
  setupCHPPPlayerFields();
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
// AJAX setup — CHPP data retrieval
// ---------------------------------------------------------------------------
$.ajaxSetup({
  dataType: "json",
  timeout: 30000,
  beforeSend: function (XMLHttpRequest, settings) {
    buttonLoading($("#CHPP_Refresh_Data"));
    $("#CHPP_Refresh_Data_Status").find("i").attr("class", "bi bi-clock text-white").attr("title", "");
    $("#CHPP_Refresh_Data_Status").attr("disabled", "disabled");
    $("#CHPP_Refresh_Data_Status").removeClass("btn-danger btn-success btn-warning").addClass("btn-progress");
    $("#CHPP_Results").hide();
    $("#CHPP_Status_Description").html("");
  },
  success: function (jsonObject) {
    if (jsonObject.Status === "OK") {
      try {
        $("#menuLoginTitle").text(jsonObject.TeamName);
        const PlayersData = jsonObject.PlayersData;
        SETI.PlayersData = PlayersData;
        SETI.Players = {};
        for (const player of PlayersData) {
          SETI.Players[player.PlayerID] = player;
        }
        SETI.MatchOrders = jsonObject.MatchOrders;
        fillFieldFromMatch(true);
        loginMenuHide();

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
  },
  error: function (jqXHR, textStatus) {
    let error_message, description_message;
    switch (textStatus) {
      case "timeout":
        error_message = SETI.messages.error_timeout;
        description_message = "";
        break;
      case "parsererror":
        error_message = SETI.messages.error_parser;
        description_message = "";
        break;
      default:
        error_message = SETI.messages.error_unknown;
        description_message = SETI.messages.retry_to_authorize;
    }
    $("#CHPP_Refresh_Data_Status").find("i").attr("class", "bi bi-x-lg text-white").attr("title", SETI.messages.status_error);
    $("#CHPP_Refresh_Data_Status").removeClass("btn-success btn-warning").addClass("btn-danger");
    $("#CHPP_Status_Description").html(`${error_message}<br/>${description_message}`);
    loginMenuShow();
    $("#CHPP_Refresh_Data").data("complete-text", $("#CHPP_Refresh_Data").data("error-text"));
    $("#CHPP_Refresh_Data_Status").removeAttr("disabled");
  },
  complete: function () {
    $("#CHPP_Results").show();
    buttonComplete($("#CHPP_Refresh_Data"));
  },
});

// ---------------------------------------------------------------------------
// CHPP click handlers
// ---------------------------------------------------------------------------
$("#CHPP_Refresh_Data").on("click", function () {
  $.ajax({ url: "chpp/chpp_retrievedata.php?refresh", cache: false });
});

$("#CHPP_Revoke_Auth_Link").on("click", function () {
  $(this).closest("[class~='open']").removeClass("open");
  window.confirm(SETI.messages.revoke_auth_confirm);
});

// Player select change handlers
$(`${FORM_ID} select[id=CHPP_Player_1]`).on("change", function () { setPlayerFormFields(1); });
$(`${FORM_ID} select[id=CHPP_Player_2]`).on("change", function () { setPlayerFormFields(2); });

$(`${FORM_ID} select[id=CHPP_Players_SortBy]`).on("change", function () {
  updateCHPPPlayerFields();
  if ($("#CHPP_Player_1 option").length > 2 && $("#CHPP_Player_2 option").length > 2) {
    $("#CHPP_Player_1 option:eq(0)").attr("selected", "selected");
    $("#CHPP_Player_2 option:eq(1)").attr("selected", "selected");
    setPlayerFormFields(1);
    setPlayerFormFields(2);
  }
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
// Soccer field — match orders
// ---------------------------------------------------------------------------
function fillFieldFromMatch() {
  if (!SETI.MatchOrders) return;
  resetSoccerField();
  const Players = SETI.Players;
  for (const order of SETI.MatchOrders) {
    const position = Number(order.Position);
    const player = Players[order.PlayerID];
    if (position === 17) { // Set pieces taker
      if (player.Speciality === "5") { // Head
        $("#setPiecesTakerHead").prop("checked", true);
      }
    }
    if (position < 100) continue; // Keeper
    let speciality = player.Speciality;
    if (speciality === "3" || speciality === "6") speciality = "0"; // harmless specialities
    $(`#position-${position}`).html($(`#player-speciality-${speciality}`).html());
  }
  startCalculation();
}

function resetSoccerField() {
  $(".player-position.drop").html("<div></div>");
  $("#setPiecesTakerHead").prop("checked", false);
  $("#playCreatively").val("No");
  $("#ballPossession").val(50);
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
  $dst.html($src.html());
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
  $("#attendedGoalsContainer").removeClass("success danger");
  $("#attendedGoals").text("0.00");
  $("#se-tables-container table").each(function () {
    $(this).data("subtotal", 0);
    $(this).hide();
  });
}

function startCalculation() {
  setTimeout(function () {
    resetResults();
    const results = SETI.Engine.start();
    if (results.goals < 0) {
      $("#attendedGoalsContainer").addClass("danger");
    } else if (results.goals > 0) {
      $("#attendedGoalsContainer").addClass("success");
    }
    $("#attendedGoals").text(results.goals.toFixed(2));
    for (const specialEvent of SETI.Engine.SpecialEvents) {
      const currentSeGoals = results.SE[specialEvent.name];
      if (currentSeGoals != null) {
        $(`#Count_${specialEvent.name}`).text(currentSeGoals.toFixed(4)).closest("tr").show();
        const $table = $(`#Count_${specialEvent.family}`);
        const subtotal = ($table.data("subtotal") || 0) + currentSeGoals;
        $table.data("subtotal", subtotal);
        $(`#Count_${specialEvent.family}_Subtotal`).text(`(${subtotal.toFixed(4)})`);
        $table.show();
      } else {
        $(`#Count_${specialEvent.name}`).closest("tr").hide();
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
    $.ajax({ url: "chpp/chpp_retrievedata.php", cache: true });
  }

  initDragdrop($("li.drop, li.draggable"));
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
