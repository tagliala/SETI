"use strict"

TECHNICAL = "technical"
UNPREDICTABLE = "unpredictable"
HEAD = "head"
QUICK = "quick"

player = (speciality = null) ->
  if speciality?
    """<div class="player speciality speciality-#{speciality}">"""
  else
    """<div class="player">"""

resetField = ->
  fieldHtml = """
    <input type="checkbox" id="setPiecesTakerHead"/>
    <input type="hidden" id="ballPossession" value="50"/>
    <input type="hidden" id="playCreatively" value="no"/>
    <div class="soccer-field" style="display: none">
      <div class="soccer-field-keeper">
        <ul class="unstyled players-row">
          <li class="player-empty-position"></li>
          <li class="player-empty-position"></li>
          <li class="player-position position-keeper drop"><div></div></li>
          <li class="player-empty-position"></li>
          <li class="player-empty-position"></li>
        </ul>
      </div>
      <div class="soccer-field-movement">
        <ul class="unstyled players-row players-row-defence">
          <li class="player-position position-defensive position-defender drop"><div></div></li>
          <li class="player-position position-defensive position-defender drop"><div></div></li>
          <li class="player-position position-defensive position-defender drop"><div></div></li>
          <li class="player-position position-defensive position-defender drop"><div></div></li>
          <li class="player-position position-defensive position-defender drop"><div></div></li>
        </ul>
        <ul class="unstyled players-row players-row-midfield">
          <li class="player-position position-offensive position-winger drop"><div></div></li>
          <li class="player-position position-defensive position-inner drop"><div></div></li>
          <li class="player-position position-defensive position-inner drop"><div></div></li>
          <li class="player-position position-defensive position-inner drop"><div></div></li>
          <li class="player-position position-offensive position-winger drop"><div></div></li>
        </ul>
        <ul class="unstyled players-row">
          <li class="player-empty-position"><div class="trash-players hide"><i class="icon-trash"></i></div></li>
          <li class="player-position position-offensive position-scorer drop"><div></div></li>
          <li class="player-position position-offensive position-scorer drop"><div></div></li>
          <li class="player-position position-offensive position-scorer drop"><div></div></li>
          <li class="player-empty-position"><div class="trash-players hide"><i class="icon-trash"></i></div></li>
        </ul>
      </div>
    </div>
    """

  $("body").append """<div id="field"></div>""" unless $("#field")[0]?
  $("#field").html fieldHtml

describe 'SETI.Engine', ->
  $field = null

  beforeEach ->
    resetField()
    $field = $("#field")

  afterEach ->
    #resetField()

  describe 'Quick', ->
    it 'handles one quick scorer', ->
      $(".position-scorer:nth(0)").html player(QUICK)
      results = SETI.Engine.start()
      expect(results.SE.size()).toBe 1
      expect(results.goals).toBe 0.0675
      expect(results.SE.QuickShoot).toBe 0.0675
      expect(results.SE.QuickPass?).toBe false

    it 'handles one quick winger', ->
      $(".position-winger:nth(0)").html player(QUICK)
      results = SETI.Engine.start()
      expect(results.SE.size()).toBe 1
      expect(results.goals).toBe 0.013499999999999956
      expect(results.SE.QuickShoot).toBe 0.013499999999999956
      expect(results.SE.QuickPassing?).toBe false

    it 'handles one quick scorer and one normal scorer', ->
      $(".position-scorer:nth(0)").html player(QUICK)
      $(".position-scorer:nth(1)").html player()
      results = SETI.Engine.start()
      expect(results.SE.size()).toBe 2
      expect(results.goals).toBe 0.12517500000000004
      expect(results.SE.QuickShoot).toBe 0.0675
      expect(results.SE.QuickPassing).toBe 0.05767500000000003

    it 'handles one quick winger and one quick scorer as one quick winger and one normal scorer', ->
      $(".position-winger:nth(0)").html player(QUICK)
      $(".position-scorer:nth(0)").html player()
      results_1qw_1s = SETI.Engine.start()
      expect(results_1qw_1s.SE.size()).toBe 2
      expect(results_1qw_1s.goals).toBe 0.07117499999999999
      expect(results_1qw_1s.SE.QuickShoot).toBe 0.013499999999999956
      expect(results_1qw_1s.SE.QuickPassing).toBe 0.05767500000000003
      $(".position-scorer:nth(0)").html player(QUICK)
      results_1qw_1qs = SETI.Engine.start()
      expect(results_1qw_1qs.SE.size()).toBe results_1qw_1s.SE.size()
      expect(results_1qw_1qs.goals).toBe 0.13776374999999996
      expect(results_1qw_1qs.SE.QuickShoot).toBe 0.08008874999999993
      expect(results_1qw_1qs.SE.QuickPassing).toBe results_1qw_1s.SE.QuickPassing

    it 'handles two quick wingers and one quick scorer as two quick wingers and one normal scorer', ->
      $(".position-winger:nth(0)").html player(QUICK)
      $(".position-winger:nth(1)").html player(QUICK)
      $(".position-scorer:nth(0)").html player()
      results_2qw_1s = SETI.Engine.start()
      expect(results_2qw_1s.SE.size()).toBe 2
      expect(results_2qw_1s.goals).toBe 0.13884134437499995
      expect(results_2qw_1s.SE.QuickShoot).toBe 0.026817749999999863
      expect(results_2qw_1s.SE.QuickPassing).toBe 0.11202359437500009
      $(".position-scorer:nth(0)").html player(QUICK)
      results_2qw_1qs = SETI.Engine.start()
      expect(results_2qw_1qs.SE.size()).toBe results_2qw_1s.SE.size()
      expect(results_2qw_1qs.goals).toBe 0.20453114625000002
      expect(results_2qw_1qs.SE.QuickShoot).toBe 0.09250755187499993
      expect(results_2qw_1qs.SE.QuickPassing).toBe results_2qw_1s.SE.QuickPassing

  describe 'Head', ->
    it 'handles two head wingers', ->
      $(".position-winger:nth(0)").html player(HEAD)
      $(".position-winger:nth(1)").html player(HEAD)
      results = SETI.Engine.start()
      expect(results.SE.size()).toBe 2
      expect(results.goals).toBe 0.12878100000000003
      expect(results.SE.HeadCross).toBe 0.05327100000000007
      expect(results.SE.HeadCorner).toBe 0.07550999999999997
