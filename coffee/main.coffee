"use strict"
window.SETI = window.SETI || {}
SETI = window.SETI
SETI.CONFIG = SETI.CONFIG || {}
$.extend SETI.CONFIG,
  FORM_ID: "#formPlayersInfo"
  DEBUG: false
  AUTOSTART: true
  PR_ENUM_SPECIALITY:
    No: 0
    Technical: 1
    Quick: 2
    Powerful: 3
    Unpredictable: 4
    Head: 5
    Regainer: 6
  PR_ENUM_SKILL:
    Keeper: 0
    Defending: 1
    Playmaking: 2
    Winger: 3
    Passing: 4
    Scoring: 5
  PLOT_OPTIONS:
    shadowSize: 0
    lines:
      show: true
      lineWidth: 2
      steps: false
    points:
      show: false
      radius: 3
    xaxis:
      color: "#666666"
      ticks: [1, 6, 11, 16, 21, 26, 31, 36, 41, 46, 51, 56, 61, 66, 71, 76, 81, 86, 89]
    yaxis:
      color: "#666666"
      tickFormatter: (val, axis) ->
        val.toFixed(2)
    grid:
      backgroundColor: null
      color: null
      borderWidth: 2
      borderColor: "#AAAAAA"
      hoverable: true
      labelMargin: 15

format = (source, params) ->
  if arguments.length is 1
    return ->
      args = $.makeArray(arguments)
      args.unshift source
      format.apply this, args
  params = $.makeArray(arguments).slice(1)  if arguments.length > 2 and params.constructor isnt Array
  params = [ params ]  unless params.constructor is Array
  $.each params, (i, n) ->
    source = source.replace(new RegExp("\\{" + i + "\\}", "g"), n)
    return
  source

FORM_ID = SETI.CONFIG.FORM_ID
DEBUG = SETI.CONFIG.DEBUG
AUTOSTART = SETI.CONFIG.AUTOSTART

# Stops propagation of click event on login form
$('.dropdown-menu').find('form').click (e) ->
  e.stopPropagation()

checkIframe = ->
  top.location = self.location if top.location isnt self.location

# GUP
gup = (name) ->
  name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]")
  regexS = "[\\?&]#{name}=([^&#]*)"
  regex = new RegExp(regexS)
  results = regex.exec(window.location.search)
  results[1] if results?

number_format = (number = "", decimals = 0, dec_point = ".", thousands_sep = ",") ->
  number = ((String) number).replace /[^0-9+\-Ee.]/g, ""
  n = if isFinite(number) then number else 0
  prec = if isFinite(decimals) then Math.abs(decimals) else 0
  s = ""
  toFixedFix = (n, prec) ->
    k = Math.pow(10, prec)
    "" + Math.round(n * k) / k
  s = (if prec then toFixedFix(n, prec) else "" + Math.round(n)).split '.'
  if s[0].length > 3
    s[0] = s[0].replace /\B(?=(?:\d{3})+(?!\d))/g, thousands_sep
  if (s[1] or "").length < prec
    s[1] = s[1] or ""
    s[1] += new Array(prec - s[1].length + 1).join "0"

  s.join dec_point

# Set the view at the right point
scrollUpToResults = ->
  $elem = $(".nav-tabs")
  docViewTop = $(window).scrollTop()
  elemTop = $elem.offset().top
  if docViewTop > elemTop
    $('html, body').animate {scrollTop: elemTop}, 200

# Dynamic Table Stripe
stripeTable = ->
  $("#se-tables-container tbody").each ->
    $(this).find("th, td").removeClass "stripe"
    $(this).find("tr:visible:odd th, tr:visible:odd td").addClass "stripe"

# Create alert
createAlert = (params) ->
  """
  <div class="alert alert-block alert-#{params.type} fade in" id="#{params.id}">
    <button class="close" data-dismiss="alert" type="button">&times;</button>
    <h4 class="alert-heading">#{params.title}</h4>
    <p id="#{params.id}Body">#{params.body}</p>
  </div>
  """

# Fill Form Helper
fillForm = ->
  paramsString = gup("params")
  return unless paramsString?
  params = decodeURI(paramsString).split "-"
  fields = $('#formPlayersInfo *[name^=Staminia_]')
  for field, i in fields
    field.value = params[i]
  checkFormButtonsAppearance()
  if isAdvancedModeEnabled()
    enableAdvancedMode()
  else
    disableAdvancedMode()
  stripeTable()
  return

# SETI Get Link Button
$("#getLink").on "click", (e) ->
  unless $(FORM_ID).validate().form()
    $("#generatedLink").alert('close')
    return

  link = document.location.href.split("?")[0]
  locale = gup "locale"

  if locale?
    link += "?locale=#{locale}&amp;"
  else
    link +="?"

  link += "params=#{encodeURI($('#formPlayersInfo *[name^=Staminia_]').fieldValue(false).toString().replace(/,/g,"-"))}"

  clippy = """
    &nbsp;<span class="clippy" data-clipboard-text="#{link}" id="staminiaClippy"></span>
    """
  body = link

  if $("#generatedLinkBody").length
    $("#copyLinkToClipboard").data("text", link)
    $("#staminiaClippy").attr("data-clipboard-text", link)
    $("#generatedLinkBody").fadeOut "fast", ->
      $(this).html(body).fadeIn "fast"
  else
    $("#AlertsContainer").append createAlert "id": "generatedLink", "type": "info", "body": body, "title" : SETI.messages.copy_link + " " + clippy
    new SETI.ClippableBehavior($("#staminiaClippy")[0])

  # Scroll up if needed
  scrollUpToResults()
  return

# Hide alerts when showing credits and redraw charts if needed
$('a[data-toggle="tab"]').on 'shown', (e) ->
  if $(e.target).attr("href") is "#tabCredits"
    $("#AlertsContainer").hide()
  else
    $("#AlertsContainer").show()
  if $(e.target).attr("href") is "#tabCharts"
    plot_redraw document.plot1
    plot_redraw document.plot2
  return

# Stamin.IA! Reset Button
$("#resetApp").on "click", (e) ->
  $(FORM_ID).each ->
    if (typeof this.reset == 'function' or (typeof this.reset == 'object' and !this.reset.nodeType))
      this.reset()

  $('.control-group').removeClass "error"
  $("#AlertsContainer").html ""
  resetAndHideTabs()

  $("button[data-checkbox-button], button[data-radio-button]").each ->
    form = $(FORM_ID)[0]
    form[$(this).data("linkedTo")].value = $(this).data "default-value"
    return

  checkFormButtonsAppearance()
  disableAdvancedMode()
  setupCHPPPlayerFields()
  stripeTable()
  e.preventDefault()

$.validator.methods.range = (value, element, param) ->
  globalizedValue = value.replace ",", "."
  @optional(element) or (globalizedValue >= param[0] and globalizedValue <= param[1])

$.validator.methods.number = (value, element) ->
  return @optional(element) or /^-?(?:\d+|\d{1,3}(?:[\s\.,]\d{3})+)(?:[\.,]\d+)?$/.test(value)

$.validator.addMethod "position" , (value, element, params) ->
 @optional(element) or value >= params[0] and value <= params[1]
, jQuery.validator.messages.required

$.ajaxSetup {
  dataType: "json",
  timeout: 30000,
  beforeSend : (XMLHttpRequest, settings) ->
    $("#CHPP_Refresh_Data").button('loading')
    $("#CHPP_Refresh_Data_Status").find("i").attr "class", "icon-white icon-time"
    $("#CHPP_Refresh_Data_Status").find("i").attr "title", ""
    $("#CHPP_Refresh_Data_Status").attr "disabled", "disabled"
    $("#CHPP_Refresh_Data_Status").removeClass("btn-danger btn-success btn-warning").addClass "btn-progress"
    $("#CHPP_Results").hide()
    $("#CHPP_Status_Description").html ""
  success : (jsonObject, textStatus, xhr) ->
    switch jsonObject.Status
      when "OK"
        try
          $("#menuLoginTitle").text jsonObject.TeamName
          PlayersData = jsonObject.PlayersData
          SETI.PlayersData = PlayersData
          # Fast access to player
          SETI.Players = {}
          for player in PlayersData
            SETI.Players[player.PlayerID] = player
          MatchOrders = jsonObject.MatchOrders
          SETI.MatchOrders = MatchOrders
          #setupCHPPPlayerFields(true)
          fillFieldFromMatch(true)
          loginMenuHide()
          #enableCHPPMode()
          #stripeTable()
          if (jsonObject.RefreshThrottle)
            $("#CHPP_Refresh_Data_Status").find("i").attr "class", "icon-warning-sign"
            $("#CHPP_Refresh_Data_Status").find("i").attr "title", SETI.messages.status_warning
            $("#CHPP_Refresh_Data_Status").removeClass("btn-progress btn-danger btn-success").addClass "btn-warning"
            $("#CHPP_Status_Description").text SETI.messages.refresh_throttle jsonObject.RefreshThrottle
          else
            $("#CHPP_Refresh_Data_Status").find("i").attr "class", "icon-white icon-ok"
            $("#CHPP_Refresh_Data_Status").find("i").attr "title", SETI.messages.status_ok
            $("#CHPP_Refresh_Data_Status").removeClass("btn-progress btn-danger btn-warning").addClass "btn-success"
          $("#CHPP_Refresh_Data").data "completeText", $("#CHPP_Refresh_Data").data("successText")
        catch error
          $("#CHPP_Refresh_Data_Status").find("i").attr "class", "icon-white icon-remove"
          $("#CHPP_Refresh_Data_Status").find("i").attr "title", SETI.messages.status_error
          $("#CHPP_Refresh_Data_Status").removeClass("btn-progress btn-success btn-warning").addClass "btn-danger"
          loginMenuShow()
          $("#CHPP_Refresh_Data").data "completeText", $("#CHPP_Refresh_Data").data("errorText")
          $("#CHPP_Status_Description").html """
            #{SETI.messages.error_unknown}.<br/>
            #{SETI.messages.retry_to_authorize}.
            """
      when "Error"
        switch jsonObject.ErrorCode
          when "InvalidToken"
            error_message = SETI.messages.error_invalid_token
            description_message = SETI.messages.retry_to_authorize
          when ""
          else
            error_message = SETI.messages.error_unknown
            description_message = SETI.messages.retry_to_authorize
        $("#CHPP_Refresh_Data_Status").find("i").attr "class", "icon-white icon-remove"
        $("#CHPP_Refresh_Data_Status").find("i").attr "title", SETI.messages.status_error
        $("#CHPP_Refresh_Data_Status").removeClass("btn-progress btn-success btn-warning").addClass "btn-danger"
        $("#CHPP_Status_Description").html """
          #{error_message}<br/>
          #{description_message}
          """
        loginMenuShow()
        $("#CHPP_Refresh_Data").data "completeText", $("#CHPP_Refresh_Data").data("errorText")
    $("#CHPP_Refresh_Data_Status").removeAttr "disabled"
    return

  error : (jqXHR, textStatus, thrownError) ->
    switch textStatus
      when "timeout"
        error_message = SETI.messages.error_timeout
        description_message = ""
      when "parsererror"
        error_message = SETI.messages.error_parser
        description_message = ""
      else
        error_message = SETI.messages.error_unknown
        description_message = SETI.messages.retry_to_authorize
    $("#CHPP_Refresh_Data_Status").find("i").attr "class", "icon-white icon-remove"
    $("#CHPP_Refresh_Data_Status").find("i").attr "title", SETI.messages.status_error
    $("#CHPP_Refresh_Data_Status").removeClass("btn-success btn-warning").addClass "btn-danger"
    $("#CHPP_Status_Description").html """
      #{error_message}<br/>
      #{description_message}
      """
    loginMenuShow()
    $("#CHPP_Refresh_Data").data "completeText", $("#CHPP_Refresh_Data").data("errorText")
    $("#CHPP_Refresh_Data_Status").removeAttr "disabled"
    return

  complete : (jqXHR, textStatus) ->
    $("#CHPP_Results").show()
    $("#CHPP_Refresh_Data").button 'complete'
}

sort_by = (field, reverse, primer) ->
  reverse = if reverse then -1 else 1
  (a, b) ->
    a = a[field];
    b = b[field];
    if primer?
      a = primer(a)
      b = primer(b)

      a = Infinity if isNaN(a)
      b = Infinity if isNaN(b)
    return reverse * -1 if a < b
    return reverse * 1 if a > b
    0

sortCHPPPlayerFields = ->
  PlayersData = SETI.PlayersData
  return unless PlayersData?

  field = "PlayerNumber"
  reverse = false
  primer = parseInt

  switch $("#{FORM_ID} select[id=CHPP_Players_SortBy]").val()
    when "ShirtNumber"
      field = "PlayerNumber"
    when "Name"
      field = "PlayerName"
      primer = undefined
    when "Form"
      field = "PlayerForm"
      reverse = true
    when "Stamina"
      field = "StaminaSkill"
      reverse = true
    when "Keeper"
      field = "KeeperSkill"
      reverse = true
    when "Playmaking"
      field = "PlaymakerSkill"
      reverse = true
    when "Passing"
      field = "PassingSkill"
      reverse = true
    when "Winger"
      field = "WingerSkill"
      reverse = true
    when "Defending"
      field = "DefenderSkill"
      reverse = true
    when "Scoring"
      field = "ScorerSkill"
      reverse = true
    when "SetPieces"
      field = "SetPiecesSkill"
      reverse = true
    when "Experience"
      field = "Experience"
      reverse = true
    when "Loyalty"
      field = "Loyalty"
      reverse = true

  PlayersData.sort sort_by(field, reverse, primer)

  return

updateCHPPPlayerFields = ->
  PlayersData = SETI.PlayersData
  return unless PlayersData?

  sortCHPPPlayerFields()

  $("#CHPP_Player_1").html ""
  $("#CHPP_Player_2").html ""

  select = $(document.createElement("select"))
  for player, index in PlayersData
    optionElement = $(document.createElement("option"))
    optionElement.addClass("isBruised") if ((Number) player.InjuryLevel) == 0
    optionElement.addClass("isInjured") if ((Number) player.InjuryLevel) > 0
    optionElement.addClass("isSuspended") if ((Number) player.Cards) >= 3
    optionElement.addClass("isTransferListed") if player.TransferListed
    optionElement.attr "value", index
    name = optionElement.text "#{ number = if player.PlayerNumber? then player.PlayerNumber + '.' else '' } #{player.PlayerName} #{ mc = if player.MotherClubBonus then '\u2665' else '' }"
    select.append optionElement

  selectP1 = select.clone("true")
  selectP2 = select.clone("true")

  selectP1.attr("id","CHPP_Player_1")
  selectP2.attr("id","CHPP_Player_2")

  $("#CHPP_Player_1").html selectP1.html()
  $("#CHPP_Player_2").html selectP2.html()

  return

setupCHPPPlayerFields = (checkUrlParameter = false) ->
  updateCHPPPlayerFields()

  if ($("#CHPP_Player_1 option").length > 2 and $("#CHPP_Player_2 option").length > 2)
    $("#CHPP_Player_1 option:eq(0)").attr "selected", "selected"
    $("#CHPP_Player_2 option:eq(1)").attr "selected", "selected"
    setPlayerFormFields 1, checkUrlParameter
    setPlayerFormFields 2, checkUrlParameter
  return

$("#{FORM_ID} select[id=CHPP_Player_1]").on "change", ->
  setPlayerFormFields 1
  return

$("#{FORM_ID} select[id=CHPP_Player_2]").on "change", ->
  setPlayerFormFields 2
  return

$("#{FORM_ID} select[id=CHPP_Players_SortBy]").on "change", ->
  updateCHPPPlayerFields()

  if ($("#CHPP_Player_1 option").length > 2 and $("#CHPP_Player_2 option").length > 2)
    $("#CHPP_Player_1 option:eq(0)").attr "selected", "selected"
    $("#CHPP_Player_2 option:eq(1)").attr "selected", "selected"
    setPlayerFormFields 1
    setPlayerFormFields 2

  return

setPlayerFormFields = (player, checkUrlParameter = false) ->
  return if checkUrlParameter && gup("params")?

  PlayersData = SETI.PlayersData
  formReference = $(FORM_ID)[0]
  return unless PlayersData?
  PlayerData = PlayersData[formReference["CHPP_Player_" + player].value]
  return unless PlayerData?

  # Standard Mode
  formReference["Staminia_Simple_Player_#{player}_Experience"].value = PlayerData.Experience;
  formReference["Staminia_Simple_Player_#{player}_Stamina"].value = PlayerData.StaminaSkill;
  formReference["Staminia_Simple_Player_#{player}_Form"].value = PlayerData.PlayerForm;
  formReference["Staminia_Simple_Player_#{player}_MainSkill"].value = PlayerData.MainSkill;
  formReference["Staminia_Simple_Player_#{player}_Loyalty"].value = PlayerData.Loyalty;

  # Mother Club Bonus
  $("#Button_Player_#{player}_MotherClubBonus").click() if (PlayerData.MotherClubBonus and !$("#Button_Player_#{player}_MotherClubBonus_Status").hasClass("btn-success")) or (!PlayerData.MotherClubBonus and $("#Button_Player_#{player}_MotherClubBonus_Status").hasClass("btn-success"))

  # Advanced Mode
  formReference["Staminia_Advanced_Player_#{player}_Experience"].value       = number_format(PlayerData.Experience,     2);
  formReference["Staminia_Advanced_Player_#{player}_Stamina"].value          = number_format(PlayerData.StaminaSkill,   2);
  formReference["Staminia_Advanced_Player_#{player}_Form"].value             = number_format(PlayerData.PlayerForm,     2);
  formReference["Staminia_Advanced_Player_#{player}_Loyalty"].value          = number_format(PlayerData.Loyalty,        2);
  formReference["Staminia_Advanced_Player_#{player}_Skill_Keeper"].value     = number_format(PlayerData.KeeperSkill,    2);
  formReference["Staminia_Advanced_Player_#{player}_Skill_Defending"].value  = number_format(PlayerData.DefenderSkill,  2);
  formReference["Staminia_Advanced_Player_#{player}_Skill_Playmaking"].value = number_format(PlayerData.PlaymakerSkill, 2);
  formReference["Staminia_Advanced_Player_#{player}_Skill_Winger"].value     = number_format(PlayerData.WingerSkill,    2);
  formReference["Staminia_Advanced_Player_#{player}_Skill_Passing"].value    = number_format(PlayerData.PassingSkill,   2);
  formReference["Staminia_Advanced_Player_#{player}_Skill_Scoring"].value    = number_format(PlayerData.ScorerSkill,    2);

loginMenuHide = ->
  $("#loginDropdown").addClass "hide"
  $("#loggedInDropdown").removeClass "hide"

loginMenuShow = ->
  $("#menuLoginTitle").text "CHPP"
  $("#loggedInDropdown").addClass "hide"
  $("#loginDropdown").removeClass "hide"

$("#CHPP_Refresh_Data").on "click", ->
  $.ajax { url: "chpp/chpp_retrievedata.php?refresh", cache: false }

$("#CHPP_Revoke_Auth_Link").on "click", ->
  $(this).closest("[class~='open']").removeClass 'open'
  window.confirm SETI.messages.revoke_auth_confirm

plot_redraw = (plot) ->
  return unless plot?
  plot.resize()
  plot.setupGrid()
  plot.draw()

# Resize charts if needed
$(window).resize $.debounce 500, ->
  return unless $("#tabChartsNav").hasClass "active"
  plot_redraw document.plot1 if document.plot1?
  plot_redraw document.plot2 if document.plot2?

# Charts tooltips
showTooltip = (x, y, contents) ->
  $content_div = $('<div id="flot-tooltip">' + contents + '</div>').appendTo("body")

  $content_div.css
    display: "none"
    visibility: "visible"
    top: y - $content_div.height() - 11
    left: x - $content_div.width() - 11
  .fadeIn("fast")

previousPoint = null

$("#chartTotal, #chartPartials").bind "plothover", (event, pos, item) ->
  if (item)
    return if previousPoint is item.dataIndex
    previousPoint = item.dataIndex
    $("#flot-tooltip").remove()
    x = item.datapoint[0]
    y = item.datapoint[1].toFixed 2
    showTooltip item.pageX, item.pageY, "#{SETI.messages.substitution_minute}: #{x}<br/>#{SETI.messages.contribution}: #{y}"
  else
    $("#flot-tooltip").remove()
    previousPoint = null

fillFieldFromMatch = ->
  return unless SETI.MatchOrders
  resetSoccerField()
  Players = SETI.Players
  for order in SETI.MatchOrders
    position = (Number) order.Position
    player = Players[order.PlayerID]
    if position is 17 # Set pieces taker
      if player.Speciality is "5" # Head
        $("#setPiecesTakerHead").prop("checked", true)
    continue if position < 100 # Keeper
    speciality = player.Speciality
    speciality = "0" if speciality is "3" or speciality is "6" # set as no speciality if player is harmless
    $("#position-#{position}").html $("#player-speciality-#{speciality}").html()
  startCalculation()

resetSoccerField = ->
  $(".player-position.drop").html "<div></div>"
  $("#setPiecesTakerHead").prop("checked", false)
  $("#playCreatively").val "No"
  $("#ballPossession").val 50

#export
SETI.format = format
SETI.number_format = number_format

# Document.ready
$ ->
  checkIframe()
  hasParams = gup("params")?
  fillForm() if hasParams
  #$(FORM_ID).submit() if hasParams and AUTOSTART
  #$("#imgMadeInItaly").tooltip()
  $.ajax { url: "chpp/chpp_retrievedata.php", cache: true } if document.startAjax

unhighlightDropElements = (clickable = false) ->
    $(".drop").removeClass "highlight"
    $(".drop").removeClass "clickable" if clickable
    $(".trash-players").fadeOut()

highlightDropElements = (clickable = false) ->
  if $(".soccer-field-movement").find(".player").length >= 10
    $(".soccer-field-keeper .drop").addClass "highlight"
    $(".soccer-field-keeper .drop").addClass "clickable" if clickable
  else
    $(".drop").addClass "highlight"
    $(".drop").addClass "clickable" if clickable
  $(".drop.player").addClass "clickable" if clickable

setPlayerInField = ($src, $dst) ->
  $dst.html $src.html()

switchPlayersInField = ($src, $dst) ->
  $temp = $dst.html()
  $dst.html $src.html()
  $src.html $temp
  $src.find("div").removeClass("droppableHover")

$ ->
  initDragdrop $("li.drop, li.draggable")

initDragdrop = ($element) ->
  $element.dragdrop
    srcElement: null
    makeClone: true
    appendTo: $("body")
    sourceClass: "pendingDrop"
    dropClass: "droppableHover"
    dragClass: "whileDragging"
    container: $(".no-text-select")
    canDrag: ($src, event) ->
      $source = $(event.target)
      if $source.hasClass("player") and !$source.parent().hasClass("pendingDrop")
        highlightDropElements()
        @srcElement = $source.parent()
        $(".trash-players").fadeIn() if @srcElement.hasClass "drop"
        return @srcElement
    canDrop: ($dst) ->
      $dst.parent().hasClass("drop") and ($dst.parent().hasClass("position-keeper") or ($(".soccer-field-movement").find(".player").length < 10 or $dst.hasClass("player"))) or
        @srcElement.hasClass("drop") and $dst.parent().hasClass("trash-players") or
        @srcElement.hasClass("drop") and $dst.parent().hasClass("drop")

    didDrop: ($src, $dst) ->
      if $dst.parent().hasClass "trash-players"
        $src.html "<div></div>"
      else
        $li = $dst.parent()
        unless $src.hasClass "drop"
          setPlayerInField $src, $li
        else
          switchPlayersInField $src, $li if $src isnt $li
      startCalculation()

    endDrag: ($src, $dst) ->
      unhighlightDropElements()

###
  $(".draggable").each ->
    console.log "TOP: #{$(this).offset().top} - LEFT: #{$(this).offset().left}"
  $(".lead").each ->
    console.log "TOP: #{$(this).offset().top} - LEFT: #{$(this).offset().left}"
###
$("select, input[type=checkbox]").on "change", ->
  startCalculation()

$(".trash-players").on "click touchend", (e) ->
  $src = $(".soccer-field .pendingDrop")
  return unless $src[0]?
  $src.removeClass("pendingDrop").html "<div></div>"
  unhighlightDropElements true
  startCalculation()

$(".soccer-field-wrapper").on "click touchend", ".draggable, .drop", (e) ->
  $this = $(this)
  if $(".pendingDrop").length is 0 && $this.find(".player")[0]?
    $(".trash-players").fadeIn() if $this.hasClass "drop"
    $this.addClass "pendingDrop"
    highlightDropElements true
  else if $(".pendingDrop").length > 0
    $src = $(".pendingDrop").removeClass("pendingDrop")
    unhighlightDropElements true
    $dst = $(this)
    if $src is $dst || $dst.hasClass "draggable"
      return
    unless $src.hasClass "drop"
      setPlayerInField $src, $dst
    else
      switchPlayersInField $src, $dst if $src isnt $dst
    startCalculation()

resetResults = ->
  $("#attendedGoalsContainer").removeClass "success danger"
  $("#attendedGoals").text "0.00"
  $("#se-tables-container table").each ->
    $(this).data "subtotal", 0
    $(this).hide()

startCalculation = ->
  setTimeout ->
    resetResults()
    results = SETI.Engine.start()
    #$("#debug").html JSON.stringify(results).replace(/,/g, ",<br/>")
    if results.goals < 0
      $("#attendedGoalsContainer").addClass "danger"
    else if results.goals > 0
      $("#attendedGoalsContainer").addClass "success"
    $("#attendedGoals").text results.goals.toFixed(2)
    for specialEvent in SETI.Engine.SpecialEvents
      if (currentSeGoals = results.SE[specialEvent.name])?
        $("#Count_#{specialEvent.name}").text(currentSeGoals.toFixed(4)).closest("tr").show()
        $table = $("#Count_#{specialEvent.family}")
        subtotal = $table.data("subtotal") + currentSeGoals
        $table.data "subtotal", subtotal
        $("#Count_#{specialEvent.family}_Subtotal").text "(#{subtotal.toFixed(4)})"
        $table.show()
      else
        $("#Count_#{specialEvent.name}").closest("tr").hide()
    stripeTable()
  , 0
