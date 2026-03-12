"use strict";

window.SETI = window.SETI || {};
const SETI = window.SETI;
SETI.Engine = SETI.Engine || {};

class SpecialEvent {
  attendedGoals(chanceType1, goalType1, specialistsType1, chanceType2, goalType2, specialistsType2, ballPossession, playCreatively) {
    return (1 - Math.pow((1 - chanceType1 * playCreatively * goalType1), specialistsType1) * Math.pow((1 - chanceType2 * playCreatively * goalType2), specialistsType2)) / 0.5 * ballPossession;
  }
}

class HeadCorner extends SpecialEvent {
  constructor() {
    super();
    this.name = "HeadCorner";
    this.family = "Head";
  }

  attendedGoals(ballPossession, playCreatively) {
    const playersOnTheField = $(".soccer-field-movement").find(".player").length;
    const specialistsType1Raw = $(".soccer-field-movement").find(".speciality-head").length;
    const setPiecesTakerHead = ($("#setPiecesTakerHead")[0].checked || specialistsType1Raw === playersOnTheField) ? 1 : 0;
    const specialistsType1 = specialistsType1Raw - setPiecesTakerHead;
    return super.attendedGoals(0.0839, 0.9, specialistsType1, 0, 0, 0, ballPossession, playCreatively);
  }

  isPossible() {
    const setPiecesTakerHead = $("#setPiecesTakerHead")[0].checked ? 1 : 0;
    return $(".soccer-field-movement").find(".player").length > 1 &&
      $(".soccer-field-movement").find(".speciality-head").length - setPiecesTakerHead > 0;
  }
}

class HeadCross extends SpecialEvent {
  constructor() {
    super();
    this.name = "HeadCross";
    this.family = "Head";
  }

  attendedGoals(ballPossession, playCreatively) {
    let specialistsType1 = $(".position-offensive").find(".speciality-head").length;
    if ($(".position-winger").find(".player").length === 1 && $(".position-winger").find(".speciality-head").length === 1) {
      specialistsType1--;
    }
    return super.attendedGoals(0.03, 0.9, specialistsType1, 0, 0, 0, ballPossession, playCreatively);
  }

  isPossible() {
    return ($(".position-winger").find(".player").length > 0 && $(".position-scorer").find(".speciality-head").length > 0) ||
      ($(".position-winger").find(".player").length > 1 && $(".position-winger").find(".speciality-head").length > 0);
  }
}

class QuickShoot extends SpecialEvent {
  constructor() {
    super();
    this.name = "QuickShoot";
    this.family = "Quick";
  }

  attendedGoals(ballPossession, playCreatively) {
    const specialistsType1 = $(".position-scorer").find(".speciality-quick").length;
    const specialistsType2 = $(".position-winger").find(".speciality-quick").length;
    return super.attendedGoals(0.09, 0.75, specialistsType1, 0.09, 0.15, specialistsType2, ballPossession, playCreatively);
  }

  isPossible() {
    return $(".position-offensive").find(".speciality-quick").length > 0;
  }
}

class QuickPassing extends SpecialEvent {
  constructor() {
    super();
    this.name = "QuickPassing";
    this.family = "Quick";
  }

  attendedGoals(ballPossession, playCreatively) {
    let specialistsType1 = $(".position-offensive").find(".speciality-quick").length;
    if ($(".position-scorer").find(".speciality-quick").length === 1 && $(".position-scorer").find(".player").length === 1) {
      specialistsType1--;
    }
    return super.attendedGoals(0.0769, 0.75, specialistsType1, 0, 0, 0, ballPossession, playCreatively);
  }

  isPossible() {
    return ($(".position-winger").find(".speciality-quick").length > 0 && $(".position-scorer").find(".player").length > 0) ||
      ($(".position-scorer").find(".speciality-quick").length > 0 && $(".position-scorer").find(".player").length > 1);
  }
}

class TechnicalVsHead extends SpecialEvent {
  constructor() {
    super();
    this.name = "TechnicalVsHead";
    this.family = "Technical";
  }

  attendedGoals(ballPossession, playCreatively) {
    const specialistsType1 = $(".position-scorer").find(".speciality-technical").length;
    const specialistsType2 = $(".position-winger").find(".speciality-technical").length;
    return super.attendedGoals(0.0473, 0.75, specialistsType1, 0.0473, 0.15, specialistsType2, ballPossession, playCreatively);
  }

  isPossible() {
    return $(".position-offensive").find(".speciality-technical").length > 0;
  }
}

class UnpredictableKeeper extends SpecialEvent {
  constructor() {
    super();
    this.name = "UnpredictableKeeper";
    this.family = "Unpredictable";
  }

  attendedGoals(ballPossession, playCreatively) {
    const scorers = $(".position-scorer").find(".player").length;
    const wingers = $(".position-winger").find(".player").length;
    const chanceKeeper = (scorers * 0.75 + wingers * 0.15) / (scorers + wingers);
    return super.attendedGoals(0.0217, chanceKeeper, 1, 0, 0, 0, ballPossession, playCreatively);
  }

  isPossible() {
    return $(".position-keeper").find(".speciality-unpredictable").length > 0 &&
      $(".position-offensive").find(".player").length > 0;
  }
}

class UnpredictableShoot extends SpecialEvent {
  constructor() {
    super();
    this.name = "UnpredictableShoot";
    this.family = "Unpredictable";
  }

  attendedGoals(ballPossession, playCreatively) {
    const specialistsType1 = $(".position-scorer").find(".speciality-unpredictable").length;
    const specialistsType2 = $(".position-winger").find(".speciality-unpredictable").length;
    return super.attendedGoals(0.0283, 0.75, specialistsType1, 0.0283, 0.15, specialistsType2, ballPossession, playCreatively);
  }

  isPossible() {
    return $(".position-offensive").find(".speciality-unpredictable").length > 0;
  }
}

class UnpredictableAction extends SpecialEvent {
  constructor() {
    super();
    this.name = "UnpredictableAction";
    this.family = "Unpredictable";
  }

  attendedGoals(ballPossession, playCreatively) {
    const unpredictablePlayers = $(".soccer-field-movement").find(".speciality-unpredictable").length;
    const unpredictableWingers = $(".position-winger").find(".speciality-unpredictable").length;
    const unpredictableScorers = $(".position-scorer").find(".speciality-unpredictable").length;
    const unpredictableDefensive = $(".position-defensive").find(".speciality-unpredictable").length;
    const scorers = $(".position-scorer").find(".player").length;
    const wingers = $(".position-winger").find(".player").length;
    const chanceWingers = (wingers + scorers > 1) ? (scorers * 0.75 + (wingers - 1) * 0.15) / (scorers + wingers - 1) : 0;
    const chanceScorers = (wingers + scorers > 1) ? ((scorers - 1) * 0.75 + wingers * 0.15) / (scorers + wingers - 1) : 0;
    const chanceDefensive = (scorers + wingers > 0) ? (scorers * 0.75 + wingers * 0.15) / (scorers + wingers) : 0;
    const chanceTotal = (chanceWingers * unpredictableWingers + chanceScorers * unpredictableScorers + chanceDefensive * unpredictableDefensive) / unpredictablePlayers;
    return super.attendedGoals(0.0181, chanceTotal, unpredictablePlayers, 0, 0, 0, ballPossession, playCreatively);
  }

  isPossible() {
    return ($(".position-defensive").find(".speciality-unpredictable").length > 0 && $(".position-offensive").find(".player").length > 0) ||
      ($(".position-offensive").find(".speciality-unpredictable").length > 0 && $(".position-offensive").find(".player").length > 1);
  }
}

class UnpredictablePassing extends SpecialEvent {
  constructor() {
    super();
    this.name = "UnpredictablePassing";
    this.family = "Unpredictable";
  }

  attendedGoals(ballPossession, playCreatively) {
    const unpredictablePlayers = $(".soccer-field-movement").find(".speciality-unpredictable").length;
    const unpredictableWingers = $(".position-winger").find(".speciality-unpredictable").length;
    const unpredictableScorers = $(".position-scorer").find(".speciality-unpredictable").length;
    const unpredictableDefensive = $(".position-defensive").find(".speciality-unpredictable").length;
    const scorers = $(".position-scorer").find(".player").length;
    const wingers = $(".position-winger").find(".player").length;
    const chanceWingers = (wingers + scorers > 1) ? (scorers * 0.75 + (wingers - 1) * 0.15) / (scorers + wingers - 1) : 0;
    const chanceScorers = (wingers + scorers > 1) ? ((scorers - 1) * 0.75 + wingers * 0.15) / (scorers + wingers - 1) : 0;
    const chanceDefensive = (scorers + wingers > 0) ? (scorers * 0.75 + wingers * 0.15) / (scorers + wingers) : 0;
    const chanceTotal = (chanceWingers * unpredictableWingers + chanceScorers * unpredictableScorers + chanceDefensive * unpredictableDefensive) / unpredictablePlayers;
    return super.attendedGoals(0.0181, chanceTotal, unpredictablePlayers, 0, 0, 0, ballPossession, playCreatively);
  }

  isPossible() {
    return ($(".position-defensive").find(".speciality-unpredictable").length > 0 && $(".position-offensive").find(".player").length > 0) ||
      ($(".position-offensive").find(".speciality-unpredictable").length > 0 && $(".position-offensive").find(".player").length > 1);
  }
}

class UnpredictableNegative extends SpecialEvent {
  constructor() {
    super();
    this.name = "UnpredictableNegative";
    this.family = "Unpredictable";
  }

  attendedGoals(ballPossession, playCreatively) {
    const specialistsType1 = $(".position-inner").find(".speciality-unpredictable").length;
    const specialistsType2 = $(".position-defender").find(".speciality-unpredictable").length;
    return -1 * super.attendedGoals(0.0451, 0.55, specialistsType1, 0.022, 0.55, specialistsType2, ballPossession, playCreatively);
  }

  isPossible() {
    return $(".position-defensive").find(".speciality-unpredictable").length > 0;
  }
}

SETI.Engine.SpecialEvents = [
  new HeadCorner(),
  new HeadCross(),
  new QuickShoot(),
  new QuickPassing(),
  new TechnicalVsHead(),
  new UnpredictableKeeper(),
  new UnpredictableShoot(),
  new UnpredictableAction(),
  new UnpredictablePassing(),
  new UnpredictableNegative(),
];

SETI.Engine.start = function () {
  this.results = {
    goals: 0,
    SE: {},
  };
  this.results.SE.size = function () {
    return Object.keys(this).length - 1;
  };

  const ballPossession = $("#ballPossession").val() / 100;
  let playCreatively;
  switch ($("#playCreatively").val()) {
    case "yes":
      playCreatively = 1.5;
      break;
    case "both":
      playCreatively = 1.7;
      break;
    default:
      playCreatively = 1;
  }

  for (const specialEvent of SETI.Engine.SpecialEvents) {
    if (specialEvent.isPossible()) {
      const currentAttendedGoals = specialEvent.attendedGoals(ballPossession, playCreatively);
      this.results.SE[specialEvent.name] = currentAttendedGoals;
      this.results.goals = this.results.goals + currentAttendedGoals;
    }
  }
  return this.results;
};
