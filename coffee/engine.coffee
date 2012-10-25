"use strict"
window.SETI = window.SETI || {}
SETI = window.SETI
SETI.Engine = SETI.Engine || {}

VERSION = 1

PR_ENUM_ROLE =
  0 : "GK"
  1 : "CD"
  2 : "CD OFF"
  3 : "CD TW"
  4 : "WB"
  5 : "WB OFF"
  6 : "WB DEF"
  7 : "WB TM"
  8 : "IM"
  9 : "IM OFF"
  10 : "IM DEF"
  11 : "IM TW"
  12 : "WI"
  13 : "WI OFF"
  14 : "WI DEF"
  15 : "WI TM"
  16 : "FW"
  17 : "FW DEF"
  18 : "FW DEF+T"
  19 : "FW TW"

  head_wingers_scorers_count: $(".position-offensive").find(".speciality-head").length
  headers_count: $(".soccer-field-movement").find(".speciality-head").length

class SpecialEvent
  attendedGoals: (chanceType1, goalType1, specialistsType1, chanceType2, goalType2, specialistsType2, ballPossession, playCreatively) ->
    (1 - Math.pow((1 - chanceType1 * playCreatively * goalType1), specialistsType1) * Math.pow(( 1 - chanceType2 * playCreatively * goalType2), specialistsType2)) / 0.5 * ballPossession

class HeadCorner extends SpecialEvent
  name: "HeadCorner"
  family: "Head"

  attendedGoals: (ballPossession, playCreatively) ->
    playersOnTheField = $(".soccer-field-movement").find(".player").length
    specialistsType1 = $(".soccer-field-movement").find(".speciality-head").length
    setPiecesTakerHead = if ($("#setPiecesTakerHead")[0].checked or specialistsType1 is playersOnTheField) then 1 else 0
    specialistsType1 -= setPiecesTakerHead
    super 0.0839, 0.9, specialistsType1, 0, 0, 0, ballPossession, playCreatively

  isPossible: ->
    setPiecesTakerHead = if $("#setPiecesTakerHead")[0].checked then 1 else 0
    $(".soccer-field-movement").find(".player").length > 1 and $(".soccer-field-movement").find(".speciality-head").length - setPiecesTakerHead > 0

class HeadCross extends SpecialEvent
  name: "HeadCross"
  family: "Head"

  attendedGoals: (ballPossession, playCreatively) ->
    specialistsType1 = $(".position-offensive").find(".speciality-head").length
    --specialistsType1 if ($(".position-winger").find(".speciality-head").length > 1 or ($(".position-winger").find(".player").length is 1 and $(".position-winger").find(".speciality-head").length is 1))
    super 0.03, 0.9, specialistsType1, 0, 0, 0, ballPossession, playCreatively

  isPossible: ->
    ($(".position-winger").find(".player").length > 0 and $(".position-scorer").find(".speciality-head").length > 0) or
      ($(".position-winger").find(".player").length > 1 and $(".position-winger").find(".speciality-head").length > 0)

class QuickShoot extends SpecialEvent
  name: "QuickShoot"
  family: "Quick"

  attendedGoals: (ballPossession, playCreatively) ->
    specialistsType1 = $(".position-scorer").find(".speciality-quick").length
    specialistsType2 = $(".position-winger").find(".speciality-quick").length
    super 0.09, 0.75, specialistsType1, 0.09, 0.15, specialistsType2, ballPossession, playCreatively

  isPossible: ->
    $(".position-offensive").find(".speciality-quick").length > 0

class QuickPassing extends SpecialEvent
  name: "QuickPassing"
  family: "Quick"

  attendedGoals: (ballPossession, playCreatively) ->
    specialistsType1 = $(".position-offensive").find(".speciality-quick").length
    super 0.0769, 0.75, specialistsType1, 0, 0, 0, ballPossession, playCreatively

  isPossible: ->
    ($(".position-winger").find(".speciality-quick").length > 0 and $(".position-scorer").find(".player").length > 0) or
      ($(".position-scorer").find(".speciality-quick").length > 0 and $(".position-scorer").find(".player").length > 1)

class TechnicalVsHead extends SpecialEvent
  name: "TechnicalVsHead"
  family: "Technical"

  attendedGoals: (ballPossession, playCreatively) ->
    specialistsType1 = $(".position-scorer").find(".speciality-technical").length
    specialistsType2 = $(".position-winger").find(".speciality-technical").length
    super 0.0473, 0.75, specialistsType1, 0.0473, 0.15, specialistsType2, ballPossession, playCreatively

  isPossible: ->
    $(".position-offensive").find(".speciality-technical").length > 0

class UnpredictableShoot extends SpecialEvent
  name: "UnpredictableShoot"
  family: "Unpredictable"

  attendedGoals: (ballPossession, playCreatively) ->
    specialistsType1 = $(".position-scorer").find(".speciality-unpredictable").length
    specialistsType2 = $(".position-winger").find(".speciality-unpredictable").length
    super 0.0283, 0.75, specialistsType1, 0.0283, 0.15, specialistsType2, ballPossession, playCreatively

  isPossible: ->
    $(".position-offensive").find(".speciality-unpredictable").length > 0

class UnpredictableKeeper extends SpecialEvent
  name: "UnpredictableKeeper"
  family: "Unpredictable"

  attendedGoals: (ballPossession, playCreatively) ->
    scorers = $(".position-scorer").find(".player").length
    wingers = $(".position-winger").find(".player").length
    chanceKeeper = (scorers * 0.75 + wingers * 0.15) / (scorers + wingers)
    super 0.0217, chanceKeeper, 1, 0, 0, 0, ballPossession, playCreatively

  isPossible: ->
    ($(".position-keeper").find(".speciality-unpredictable").length > 0 and $(".position-offensive").find(".player").length > 0)

class UnpredictableAction extends SpecialEvent
  name: "UnpredictableAction"
  family: "Unpredictable"

  attendedGoals: (ballPossession, playCreatively) ->
    unpredictablePlayers = $(".soccer-field-movement").find(".speciality-unpredictable").length
    unpredictableWingers = $(".position-winger").find(".speciality-unpredictable").length
    unpredictableScorers = $(".position-scorer").find(".speciality-unpredictable").length
    unpredictableDefensive = $(".position-defensive").find(".speciality-unpredictable").length
    scorers = $(".position-scorer").find(".player").length
    wingers = $(".position-winger").find(".player").length
    chanceWingers = if (wingers + scorers > 1) then (scorers * 0.75 + (wingers - 1) * 0.15) / (scorers + wingers - 1) else 0
    chanceScorers = if (wingers + scorers > 1) then ((scorers - 1) * 0.75 + wingers * 0.15) / (scorers + wingers - 1) else 0
    chanceDefensive = if (scorers + wingers > 0) then (scorers * 0.75 + wingers * 0.15) / (scorers + wingers) else 0
    chanceTotal = (chanceWingers * unpredictableWingers + chanceScorers * unpredictableScorers + chanceDefensive * unpredictableDefensive) / unpredictablePlayers
    super 0.0181, chanceTotal, unpredictablePlayers, 0, 0, 0, ballPossession, playCreatively

  isPossible: ->
    ($(".position-defensive").find(".speciality-unpredictable").length > 0 and $(".position-offensive").find(".player").length > 0) or
      ($(".position-offensive").find(".speciality-unpredictable").length > 0 and $(".position-offensive").find(".player").length > 1)

class UnpredictablePassing extends SpecialEvent
  name: "UnpredictablePassing"
  family: "Unpredictable"

  attendedGoals: (ballPossession, playCreatively) ->
    unpredictablePlayers = $(".soccer-field-movement").find(".speciality-unpredictable").length
    unpredictableWingers = $(".position-winger").find(".speciality-unpredictable").length
    unpredictableScorers = $(".position-scorer").find(".speciality-unpredictable").length
    unpredictableDefensive = $(".position-defensive").find(".speciality-unpredictable").length
    scorers = $(".position-scorer").find(".player").length
    wingers = $(".position-winger").find(".player").length
    chanceWingers = if (wingers + scorers > 1) then (scorers * 0.75 + (wingers - 1) * 0.15) / (scorers + wingers - 1) else 0
    chanceScorers = if (wingers + scorers > 1) then ((scorers - 1) * 0.75 + wingers * 0.15) / (scorers + wingers - 1) else 0
    chanceDefensive = if (scorers + wingers > 0) then (scorers * 0.75 + wingers * 0.15) / (scorers + wingers) else 0
    chanceTotal = (chanceWingers * unpredictableWingers + chanceScorers * unpredictableScorers + chanceDefensive * unpredictableDefensive) / unpredictablePlayers
    super 0.0181, chanceTotal, unpredictablePlayers, 0, 0, 0, ballPossession, playCreatively

  isPossible: ->
    ($(".position-defensive").find(".speciality-unpredictable").length > 0 and $(".position-offensive").find(".player").length > 0) or
      ($(".position-offensive").find(".speciality-unpredictable").length > 0 and $(".position-offensive").find(".player").length > 1)

class UnpredictableNegative extends SpecialEvent
  name: "UnpredictableNegative"
  family: "Unpredictable"

  attendedGoals: (ballPossession, playCreatively) ->
    specialistsType1 = $(".position-inner").find(".speciality-unpredictable").length
    specialistsType2 = $(".position-defender").find(".speciality-unpredictable").length
    -1 * super 0.0451, 0.55, specialistsType1, 0.022, 0.55, specialistsType2, ballPossession, playCreatively

  isPossible: ->
    $(".position-defensive").find(".speciality-unpredictable").length > 0

###
1) Corner + CdT : 8.39% - Dif CC Ali Att - 90% tutti
2) Cross + CdT : 3% - Ali (almeno due) - Att (almeno un'ala) - 90%
3) Veloce + Tiro - 9% - Ali 15% - Att 75%
4) Veloce + Pass - 7.69% - Ali e Att 75% - Almeno un attaccante se Ala veloce, almeno due attaccanti se Att veloce
5) Tecnico vs CdT - 4.73% (un CdT avversario CC/dif) - Ali 15% - Att 75%
6) Imprevedibile + Tiro - 2.83% - Ali 15% - Att 75%
7) Imprevedibile (Azione?) - 1.81% - Realizzano ali e attaccanti, quindi % = (x * 15% + y * 75%) / (x+y) dove x sono le ali e y gli attaccanti - possono farlo anche cc e dif, userei la stessa %
8) Imprevedibile + Pass - 1.47% - Uguale a quello sopra
9) Imprevedibile errore - 4.51% - 55% per i CC - 2.20% - 55% per i difensori
###

collectSpecialists = ->
  # Head
  head_wingers_scorers_count: $(".position-offensive").find(".speciality-head").length
  headers_count: $(".soccer-field-movement").find(".speciality-head").length

  # Quick
  quick_wingers_count: $(".position-winger").find(".speciality-quick").length
  quick_scorers_count: $(".position-scorer").find(".speciality-quick").length

  # Unpredictable
  unpredictable_keeper_count: $(".position-keeper").find(".speciality-unpredictable").length
  unpredictable_defenders_count: $(".position-defender").find(".speciality-unpredictable").length
  unpredictable_inners_count: $(".position-inner").find(".speciality-unpredictable").length
  unpredictable_wingers_count: $(".position-winger").find(".speciality-unpredictable").length
  unpredictable_scorers_count: $(".position-scorer").find(".speciality-unpredictable").length

  # Technicals
  technicals_count: $(".position-offensive").find(".speciality-technical").length

SETI.Engine.SpecialEvents = [
    new HeadCorner()
    new HeadCross()
    new QuickShoot()
    new QuickPassing()
    new TechnicalVsHead()
    new UnpredictableKeeper()
    new UnpredictableShoot()
    new UnpredictableAction()
    new UnpredictablePassing()
    new UnpredictableNegative()
  ]

SETI.Engine.start = ->
  @results =
    goals: 0
    SE: {}
  @results.SE.size = ->
    Object.keys(this).length - 1

  specialists = collectSpecialists()

  ballPossession = $("#ballPossession").val() / 100
  switch $("#playCreatively").val()
    when "yes" then playCreatively = 1.5
    when "both" then playCreatively = 1.7
    else playCreatively = 1

  for specialEvent in SETI.Engine.SpecialEvents
    if specialEvent.isPossible()
      currentAttendedGoals = specialEvent.attendedGoals ballPossession, playCreatively
      @results.SE[specialEvent.name] = currentAttendedGoals
      @results.goals = @results.goals + currentAttendedGoals
  @results
