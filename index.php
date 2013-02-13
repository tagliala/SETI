<?php
include 'config.php';
include 'lib/PHT/PHT.php';
session_start();
$HT = $_SESSION['HT'];
$permanent = $_COOKIE['permanent'];
/*
When user is redirected to your callback url
you will received two parameters in url
oauth_token and oauth_verifier
use both in next function:
*/
if ($HT != null) try
{
}
catch(HTError $e)
{
  echo $e->getMessage();
}
$tryAjax = (($HT != null) || $permanent);
?>
<?php
include 'localization.php';
?>
<?

function optionSkills($start = 0, $stop = 20, $select = 6) {
  global $localizedSkills;

  if ($start < 0) $start = 0;
  if ($stop > 20) $stop = 20;
  if (($select < 0) || ($select > 20)) $select = -1;

  if ($stop < $start) { $start = 0; $stop = 20; }
  if ($select > $stop) { $select = -1; }

  for ($i = $start; $i <= $stop; ++$i) {
    echo "<option value=\"$i\"" . (($select == $i)?" selected=\"selected\"":"") . ">$localizedSkills[$i]</option>\n";
  }
}
?>
<?php $staminia_version = "13.02.13" ?>
<!DOCTYPE html>
<html lang="<?php echo localize("lang"); ?>">
  <head>
    <meta http-equiv="content-type" content="text/html; charset=UTF-8">
    <meta charset="utf-8">
    <title>SETI <?php echo localize("SUBTITLE"); ?></title>

    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="SETI <?php echo localize("SUBTITLE"); ?>"/>
    <meta name="author" content="Lizardopoli"/>

    <meta name="description" content="SETI <?php echo localize("SUBTITLE"); ?>"/>
    <meta name="keywords" content="SETI, CHPP, hattrick, special events tool, special events"/>

    <?php if (FB_ADMINS != "") { ?>
      <meta property="fb:admins" content="<?= FB_ADMINS ?>"/>
      <meta property="og:title" content="SETI"/>
      <meta property="og:description" content="<?php echo localize("SUBTITLE"); ?>"/>
      <meta property="og:type" content="game"/>
      <meta property="og:image" content="<?= APP_ROOT ?>img/big_logo.png"/>
      <meta property="og:url" content="<?= APP_ROOT ?>"/>
      <meta property="og:site_name" content="Lizardopoli"/>
    <?php } ?>

    <!-- Le HTML5 shim, for IE6-8 support of HTML elements -->
    <!--[if lt IE 9]>
      <script src="http://html5shim.googlecode.com/svn/trunk/html5.js"></script>
    <![endif]-->

    <!-- Le styles -->
    <link href="css/main.css" rel="stylesheet">
    <link href="http://fonts.googleapis.com/css?family=Signika:400,700|Squada+One" rel="stylesheet" type="text/css">

    <!-- Le fav and touch icons -->
    <link rel="shortcut icon" href="img/staminia_favicon.png">
    <link rel="apple-touch-icon" href="img/ico/apple-touch-icon.png">
    <link rel="apple-touch-icon" sizes="72x72" href="img/ico/apple-touch-icon-72x72.png">
    <link rel="apple-touch-icon" sizes="114x114" href="img/ico/apple-touch-icon-114x114.png">
  </head>
<?php flush(); ?>
  <body>
  <div id="fb-root"></div>

  <!-- Navbar
    ================================================== -->
    <div class="navbar navbar-fixed-top navbar-inverse">
      <div class="navbar-inner">
        <div class="container">
          <a class="btn btn-navbar" data-toggle="collapse" data-target=".nav-collapse">
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
          </a>
          <div class="brand"><i id="staminia-logo"></i><span id="staminia-brand">SETI</span></div>
          <ul class="nav pull-right">
            <?php if (CHPP_APP_ID != "") { ?>
              <li class="dropdown" id="dropdownLogin">
                <a href="#" class="dropdown-toggle" data-toggle="dropdown">
                  <span id="menuLoginTitle"><?= localize("CHPP"); ?></span>
                  <b class="caret"></b>
                </a>
                <ul class="dropdown-menu" id="loginDropdown">
                  <li>
                    <form id="LoginForm" action="chpp/chpp_auth.php" method="get">
                      <p><?= localize("Authorize SETI to access your data"); ?></p>
                      <fieldset>
                        <label class="rememberme"><input type="checkbox" name="permanent" <?php if ($permanent) echo "checked=\"checked\"" ?>/> <span><?php echo localize("Remember me"); ?></span></label>
                        <button type="submit" class="btn" id="CHPPLink"><?= localize("Login"); ?></button>
                      </fieldset>
                    </form>
                    <small><i class="icon-warning-sign"></i> <?php echo sprintf(localize("<b>WARNING:</b> by enabling \"%s\", your authorization data are stored in a %s on your computer. <b>DO NOT USE</b> this option if you are using a public computer (i.e. internet points)."), localize("Remember me"), "<abbr title=\"" . localize("A cookie is used for an origin website to send state information to a user's browser and for the browser to return the state information to the origin site.") . "\">" . localize("cookie") . "</abbr>"); ?></small>
                  </li>
                </ul>
                <ul class="dropdown-menu hide" id="loggedInDropdown">
                  <li>
                    <a id="CHPP_Revoke_Auth_Link" href="chpp/chpp_revokeauth.php"><?= localize("Revoke authorization"); ?></a>
                  </li>
                </ul>
              </li>
            <?php } ?>
            <li class="dropdown" id="dropdownLanguages">
              <a class="dropdown-toggle" data-toggle="dropdown" href="#">
                <i class="flag-<?= $lang_array[strtolower(localize("lang"))]["flag"] ?>"></i>
                <span class="hidden-phone">
                  <?= $lang_array[strtolower(localize("lang"))]["lang-name"] ?>
                </span>
                <b class="caret"></b>
              </a>
              <ul class="dropdown-menu">
<?php
foreach ($lang_array as $key => $val) {
if (strtolower(localize("lang")) === $key) { continue; }
echo "                  <li><a href=\"?locale=$key\"><i class=\"flag-" . $val["flag"] . "\"></i> " . $val["lang-name"] . "</a></li>\n";
}
?>
                </ul>
              </li>
          </ul>
          <div class="nav-collapse">
            <ul class="nav">
              <li><a href="#helpModal" role="button" data-toggle="modal"><?= localize("Help") ?></a></li>
            </ul>
            <ul class="nav pull-right">
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Container Fluid Start -->
    <div id="main" class="container-fluid">

      <!-- First Row Start -->
      <div class="row-fluid">
        <div class="span12">
          <h1>Special Events True Investigator <small><?= localize('for Hattrick'); ?></small></h1>
        </div>
      </div> <!-- First Row End -->

      <!-- Second Row Start -->
      <div class="row-fluid">

        <!-- First Column Start -->
        <div class="span8 no-text-select">
          <div class="soccer-field-wrapper noise">
            <div class="soccer-field-with-lines">
              <div class="soccer-field-lines"></div>
              <div class="soccer-field">
                <div class="soccer-field-keeper">
                  <ul class="unstyled players-row">
                    <li class="player-empty-position">
                      <form action="#">
                        <input type="checkbox" name="setPiecesTakerHead" id="setPiecesTakerHead">
                        <label for="setPiecesTakerHead">
                          <?= localize("Set pieces taker is header?"); ?>
                        </label>
                      </form>
                    </li>
                    <li class="player-empty-position"></li>
                    <li class="player-position position-keeper drop" id="position-100"><div></div></li>
                    <li class="player-empty-position">
                      <form action="#">
                        <label for="ballPossession" class="inline">
                          <?= localize("Ball Possession"); ?>:
                        </label>
                        <select class="ignore width-auto" id="ballPossession" name="ballPossession">
                          <?php for ($i = 99; $i >= 11; $i--) { ?>
                            <option value=<?= $i ?><?php if ($i == 50) { echo " selected=\"selected\""; } ?>><?= $i ?>%</option>
                          <?php } ?>
                        </select>
                      </form>
                    </li>
                    <li class="player-empty-position">
                      <form action="#">
                        <label for="playCreatively" class="inline">
                          <?= localize("Play creatively"); ?>:
                        </label>
                        <select class="ignore width-auto" id="playCreatively" name="playCreatively">
                          <option value="no"><?= localize("No"); ?></option>
                          <option value="yes"><?= localize("Yes"); ?></option>
                          <option value="both"><?= localize("Both"); ?></option>
                        </select>
                      </form>
                    </li>
                  </ul>
                </div>
                <div class="soccer-field-movement">
                  <ul class="unstyled players-row players-row-defence">
                    <li class="player-position position-defensive position-defender drop" id="position-101"><div></div></li>
                    <li class="player-position position-defensive position-defender drop" id="position-102"><div></div></li>
                    <li class="player-position position-defensive position-defender drop" id="position-103"><div></div></li>
                    <li class="player-position position-defensive position-defender drop" id="position-104"><div></div></li>
                    <li class="player-position position-defensive position-defender drop" id="position-105"><div></div></li>
                  </ul>
                  <ul class="unstyled players-row players-row-midfield">
                    <li class="player-position position-offensive position-winger drop" id="position-106"><div></div></li>
                    <li class="player-position position-defensive position-inner drop" id="position-107"><div></div></li>
                    <li class="player-position position-defensive position-inner drop" id="position-108"><div></div></li>
                    <li class="player-position position-defensive position-inner drop" id="position-109"><div></div></li>
                    <li class="player-position position-offensive position-winger drop" id="position-110"><div></div></li>
                  </ul>
                  <ul class="unstyled players-row">
                    <li class="player-empty-position"><div class="trash-players hide"><i class="icon-trash"></i></div></li>
                    <li class="player-position position-offensive position-scorer drop" id="position-111"><div></div></li>
                    <li class="player-position position-offensive position-scorer drop" id="position-112"><div></div></li>
                    <li class="player-position position-offensive position-scorer drop" id="position-113"><div></div></li>
                    <li class="player-empty-position"><div class="trash-players hide"><i class="icon-trash"></i></div></li>
                  </ul>
                </div>
              </div>
            </div>
            <div class="draggablePlayers">
              <ul class="unstyled players-row">
                <li class="player-position draggable" id="player-speciality-2"><div class="player speciality speciality-quick"><div class="player-description"><span><?= localize("Quick") ?></span></div></div></li>
                <li class="player-position draggable" id="player-speciality-5"><div class="player speciality speciality-head"><div class="player-description"><span><?= localize("Head") ?></span></div></div></li>
                <li class="player-position draggable" id="player-speciality-4"><div class="player speciality speciality-unpredictable"><div class="player-description"><span><?= localize("Unpredictable") ?></span></div></div></li>
                <li class="player-position draggable" id="player-speciality-1"><div class="player speciality speciality-technical"><div class="player-description"><span><?= localize("Technical") ?></span></div></div></li>
                <li class="player-position draggable" id="player-speciality-0"><div class="player"></div></li>
              </ul>
              <p class="align-center">
                <?= localize("Drag and drop the above players on the field to get a prediction of the estimated goals") ?>
              </p>
            </div>
          </div>
          <div class="spacer"></div>

          <!-- Staminia CHPP Options Start -->
          <div class="staminia-button-panel<? if (!$tryAjax) echo " hide"; ?>" id="Staminia_Options_CHPP">
            <b><?= localize("CHPP Mode") ?>: </b>
            <div class="btn-group btn-checkbox inline-block">
              <button class="btn btn-status" id="CHPP_Refresh_Data_Status" disabled="disabled"><i class="icon-warning-sign"></i></button>
              <button class="btn" disabled="disabled" id="CHPP_Refresh_Data" data-error-text="<?= localize("Error"); ?>" data-loading-text="<?= localize("Loading..."); ?>" data-success-text="<?= localize("Refresh data") ?>" data-complete-text="<?= localize("Refresh data") ?>"><?= localize("Unauthorized") ?></button>
            </div>
            <div id="CHPP_Results" class="hide shy align-left">
              <p id="CHPP_Status_Description"></p>
            </div>
          </div> <!-- Staminia CHPP Options End -->

        </div> <!-- First Column End -->
        <!-- Second Column Start -->
        <div class="span4">
          <div class="noise" id="attendedGoalsContainer">
            <?= localize("Estimated goals:") ?>
            <strong id="attendedGoals">0.00</strong>
          </div>
          <div id="se-tables-container">
            <table class="table table-condensed hide" id="Count_Quick" data-subtotal="0">
              <thead>
                <tr><th colspan="2"><?= localize("Quick"); ?> <strong id="Count_Quick_Subtotal"></strong></th></tr>
              </thead>
              <tbody>
                <tr class="hide"><td id="Count_QuickShoot" class="min-width align-right"></td><td><?= localize("QuickShoot"); ?></td></tr>
                <tr class="hide"><td id="Count_QuickPassing" class="min-width align-right"></td><td><?= localize("QuickPassing"); ?></td></tr>
              </tbody>
            </table>
            <table class="table table-condensed hide" id="Count_Head" data-subtotal="0">
              <thead>
                <tr><th colspan="2"><?= localize("Head"); ?> <strong id="Count_Head_Subtotal"></strong></th></tr>
              </thead>
              <tbody>
                <tr class="hide"><td id="Count_HeadCross" class="min-width align-right"></td><td><?= localize("HeadCross"); ?></td></tr>
                <tr class="hide"><td id="Count_HeadCorner" class="min-width align-right"></td><td><?= localize("HeadCorner"); ?></td></tr>
              </tbody>
            </table>
            <table class="table table-condensed hide" id="Count_Unpredictable" data-subtotal="0">
              <thead>
                <tr><th colspan="2"><?= localize("Unpredictable"); ?> <strong id="Count_Unpredictable_Subtotal"></strong></th></tr>
              </thead>
              <tbody>
                <tr class="hide"><td id="Count_UnpredictableKeeper" class="min-width align-right"></td><td><?= localize("UnpredictableKeeper"); ?></td></tr>
                <tr class="hide"><td id="Count_UnpredictableShoot" class="min-width align-right"></td><td><?= localize("UnpredictableShoot"); ?></td></tr>
                <tr class="hide"><td id="Count_UnpredictableAction" class="min-width align-right"></td><td><?= localize("UnpredictableAction"); ?></td></tr>
                <tr class="hide"><td id="Count_UnpredictablePassing" class="min-width align-right"></td><td><?= localize("UnpredictablePassing"); ?></td></tr>
                <tr class="hide"><td id="Count_UnpredictableNegative" class="min-width align-right"></td><td><?= localize("UnpredictableNegative"); ?></td></tr>
              </tbody>
            </table>
            <table class="table table-condensed hide" id="Count_Technical" data-subtotal="0">
              <thead>
                <tr><th colspan="2"><?= localize("Technical"); ?> <strong id="Count_Technical_Subtotal"></strong></th></tr>
              </thead>
              <tbody>
                <tr class="hide"><td id="Count_TechnicalVsHead" class="min-width align-right"></td><td><?= localize("TechnicalVsHead"); ?></td></tr>
              </tbody>
            </table>
          </div>
        </div> <!-- Second Column End -->

      </div> <!-- Second Row End -->

      <!-- Help Modal Start -->
      <div class='modal hide' id='helpModal' tabindex="-1" role="dialog" aria-hidden="true">
        <div class='modal-header'>
          <button type='button' class='close' data-dismiss='modal'>&times;</button>
          <h3><?= localize("Help") ?></h3>
        </div>
        <div class="modal-body">
          <?= localize("LONG_HELP") ?>
        </div>
        <div class="modal-footer">
          <a href="#" class="btn" data-dismiss="modal"><?= localize("Close") ?></a>
        </div>
      </div> <!-- Help Modal End -->

      <hr/>

      <!-- Footer Start -->
      <footer>
        <ul class="unstyled">
          <li><b>SETI</b> by <b>Lizardopoli</b> (5246225)</li>
          <li><a href="https://github.com/<?= GH_REPO ?>/blob/master/CHANGELOG.md">v<?= $staminia_version ?></a></li>
          <?php if (CHPP_APP_ID != "") { ?>
            <li><i class="icon-star"></i> <a href="http://www.hattrick.org/Community/CHPP/ChppProgramDetails.aspx?ApplicationId=<?= CHPP_APP_ID ?>">Certified Hattrick Product Provider</a></li>
          <?php } ?>
          <li><i class="icon-github"></i> <a href="http://github.com/<?= GH_REPO ?>">SETI @ github</a></li>
        </ul>
      </footer> <!-- Footer End -->

    </div> <!-- Container Fluid End -->
<?php
if (defined('GA_ID')) { ?>
    <script type="text/javascript">
      var _gaq = _gaq || [];
      _gaq.push(['_setAccount', '<?= GA_ID ?>']);
      _gaq.push(['_trackPageview']);

      (function() {
        var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
        ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
        var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
      })();
    </script>
<? } ?>
    <!-- Bootstrap and jQuery from CDN for better performance -->
    <script src="//code.jquery.com/jquery-1.8.2.min.js"></script>
    <script src="//netdna.bootstrapcdn.com/twitter-bootstrap/2.3.0/js/bootstrap.min.js"></script>

    <!-- scripts concatenated and minified via build script -->
    <script src="js/vendor/jqform/jquery.form.min.js"></script>
    <script src="js/vendor/jqvalidate/jquery.validate.min.js"></script>
    <script src="js/vendor/jqthrottle/jquery.ba-throttle-debounce.min.js"></script>
    <script src="js/jquery.flot.js"></script>
    <script src="js/jquery.drag-drop.plugin.js"></script>
    <script src="js/main.js"></script>
    <script src="js/plugins.js"></script>
    <script src="js/engine.js"></script>
    <!-- end scripts -->

    <!--[if IE]><script language="javascript" type="text/javascript" src="js/vendor/flot/excanvas.min.js"></script><![endif]-->

    <script>
      document.startAjax = <?php if ($tryAjax) { echo "true"; } else { echo "false"; } ?>;
<?php
$file = "js/vendor/jqvalidate/localization/messages_" . localize("validateLang") . ".js";
if (is_file($file)) { include($file); }
$file = "js/localization/messages_" . localize("lang") . ".js";
$file_en = "js/localization/messages_en-US.js";
if (is_file($file)) { include($file); }
else { include($file_en); }
?>
    </script>
  </body>
</html>
