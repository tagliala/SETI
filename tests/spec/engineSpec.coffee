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

normalPlayer = ->
  """<div class="player speciality speciality-unpredictable">"""

technicalPlayer = ->
  """<div class="player speciality speciality-technical">"""

unpredictablePlayer = ->
  """<div class="player speciality speciality-unpredictable">"""

resetField = ->
  fieldHtml = """
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
      # One quick scorer only produces Quick Shoot SEs.
      # Attended goals for QuickShoot are 0.0675
      # Total goals are 0.0675
      $(".position-scorer:nth(1)").html player(QUICK)
      results = SETI.Engine.start()
      expect(results.SE.size()).toBe 1
      expect(results.goals).toBe 0.0675
      expect(results.SE.QuickShoot).toBe 0.0675
      expect(results.SE.QuickPass?).toBe false

    it 'handles one quick winger', ->
      # One quick winger only produces Quick Shoot SEs.
      # Attended goals for QuickShoot are 0.013499999999999956
      # Total goals are 0.013499999999999956
      $(".position-winger:nth(1)").html player(QUICK)
      results = SETI.Engine.start()
      expect(results.SE.size()).toBe 1
      expect(results.goals).toBe 0.013499999999999956
      expect(results.SE.QuickShoot).toBe 0.013499999999999956
      expect(results.SE.QuickPassing?).toBe false

    it 'handles one quick scorer and one normal scorer', ->
      # One quick scorer with one normal scorer produces Quick Shoot and Quick Pass SEs.
      # Attended goals for QuickShoot are 0.0675
      # Attended goals for QuickPass are 0.05767500000000003
      # Total goals are 0.12517500000000004
      $(".position-scorer:nth(1)").html player(QUICK)
      $(".position-scorer:nth(2)").html player()
      results = SETI.Engine.start()
      console.log results
      expect(results.SE.size()).toBe 2
      expect(results.goals).toBe 0.12517500000000004
      expect(results.SE.QuickShoot).toBe 0.0675
      expect(results.SE.QuickPassing).toBe 0.05767500000000003
