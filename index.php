<?php
include 'config.php';
session_start();

$oauthToken = $_SESSION['oauthToken'] ?? null;
$permanent = $_COOKIE['permanent'] ?? false;
$tryAjax = ($oauthToken != null || $permanent);

if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}
$csrfToken = $_SESSION['csrf_token'];
?>
<?php
include 'localization.php';
?>
<?php

function optionSkills($start = 0, $stop = 20, $select = 6)
{
    global $localizedSkills;

    if ($start < 0) {
        $start = 0;
    }
    if ($stop > 20) {
        $stop = 20;
    }
    if ($select < 0 || $select > 20) {
        $select = -1;
    }

    if ($stop < $start) {
        $start = 0;
        $stop = 20;
    }
    if ($select > $stop) {
        $select = -1;
    }

    for ($i = $start; $i <= $stop; ++$i) {
        echo "<option value=\"$i\"" . (($select == $i) ? " selected=\"selected\"" : "") . ">$localizedSkills[$i]</option>\n";
    }
}

$seti_version = trim(file_get_contents('VERSION'));
?>
<!DOCTYPE html>
<html lang="<?= e(localize("lang")); ?>">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SETI &mdash; <?= e(localize("SUBTITLE")); ?></title>
    <meta name="description" content="SETI <?= e(localize("SUBTITLE")); ?>">
    <meta name="author" content="Lizardopoli">
    <meta name="keywords" content="SETI, CHPP, hattrick, special events tool, special events">

    <?php if (defined('FB_ADMINS') && FB_ADMINS != "") { ?>
      <meta property="fb:admins" content="<?= e(FB_ADMINS); ?>">
      <meta property="og:title" content="SETI">
      <meta property="og:description" content="<?= e(localize("SUBTITLE")); ?>">
      <meta property="og:type" content="game">
      <meta property="og:image" content="<?= e(APP_ROOT); ?>img/big_logo.png">
      <meta property="og:url" content="<?= e(APP_ROOT); ?>">
      <meta property="og:site_name" content="Lizardopoli">
    <?php } ?>

    <link rel="stylesheet" href="dist/seti.min.css?v=<?php echo filemtime('dist/seti.min.css'); ?>">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.13.1/font/bootstrap-icons.min.css">
    <link rel="shortcut icon" href="img/staminia_favicon.png">
    <link rel="apple-touch-icon" href="img/ico/apple-touch-icon.png">
    <link rel="apple-touch-icon" sizes="72x72" href="img/ico/apple-touch-icon-72x72.png">
    <link rel="apple-touch-icon" sizes="114x114" href="img/ico/apple-touch-icon-114x114.png">
  </head>
<?php flush(); ?>
  <body>

  <!-- Navbar
    ================================================== -->
  <nav class="navbar navbar-expand-md fixed-top bg-dark navbar-dark">
    <div class="container-fluid">
      <a class="navbar-brand position-relative" href="#">
        <i id="staminia-logo"></i><span id="staminia-brand">SETI</span>
      </a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent" aria-controls="navbarContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarContent">
        <ul class="navbar-nav me-auto">
          <li class="nav-item">
            <a class="nav-link" href="#helpModal" data-bs-toggle="modal"><?= localize("Help"); ?></a>
          </li>
        </ul>
        <ul class="navbar-nav mb-3 mb-md-0">
          <?php if (defined('CHPP_APP_ID') && CHPP_APP_ID != "") { ?>
            <li class="nav-item dropdown" id="dropdownLogin">
              <a class="nav-link dropdown-toggle" data-bs-toggle="dropdown" data-bs-auto-close="outside" href="#" role="button" aria-expanded="false">
                <span id="menuLoginTitle"><?= localize("CHPP"); ?></span>
              </a>
              <div class="dropdown-menu dropdown-menu-end">
                <div id="loginDropdown">
                  <form id="LoginForm" action="chpp/chpp_auth.php" method="post">
                    <input type="hidden" name="csrf_token" value="<?= e($csrfToken); ?>">
                    <p class="small text-body-secondary mb-2"><?= localize("Authorize SETI to access your data"); ?></p>
                    <fieldset>
                      <div class="d-flex align-items-center justify-content-between gap-2">
                        <div class="form-check">
                          <input class="form-check-input" type="checkbox" name="permanent" id="chppRememberMe" <?php if ($permanent) {
                              echo "checked=\"checked\"";
                          } ?>/>
                          <label class="form-check-label" for="chppRememberMe"><?= localize("Remember me"); ?></label>
                        </div>
                        <button type="submit" class="btn btn-sm btn-primary" id="CHPPLink"><?= localize("Login"); ?></button>
                      </div>
                    </fieldset>
                  </form>
                  <div class="alert alert-warning small mb-0 mt-2 p-2"><i class="bi bi-exclamation-triangle"></i> <?php echo sprintf(localize("<b>WARNING:</b> by enabling \"%s\", your authorization data are stored in a %s on your computer.<br><b>DO NOT USE</b> this option on public WiFi or shared devices (e.g. library, hotel).", false), localize("Remember me"), "<abbr title=\"" . localize("A cookie is used for an origin website to send state information to a user's browser and for the browser to return the state information to the origin site.") . "\">" . localize("cookie") . "</abbr>"); ?></div>
                </div>
                <ul class="list-unstyled mb-0 d-none" id="loggedInDropdown">
                  <li>
                    <a class="dropdown-item" id="CHPP_Revoke_Auth_Link" href="chpp/chpp_revokeauth.php"><?= localize("Revoke authorization"); ?></a>
                  </li>
                </ul>
              </div>
            </li>
          <?php } ?>
          <li class="nav-item dropdown" id="dropdownLanguages">
            <a class="nav-link dropdown-toggle" data-bs-toggle="dropdown" href="#" id="dropdownLanguagesToggle" role="button" aria-expanded="false">
              <i class="flag-<?= e($lang_array[strtolower(localize("lang"))]["flag"]); ?>"></i>
              <span class="d-none d-sm-inline">
                <?= localize($lang_array[strtolower(localize("lang"))]["lang-name"]); ?>
              </span>
            </a>
            <ul class="dropdown-menu dropdown-menu-end">
              <?php foreach ($lang_array as $key => $val) {
                  if (strtolower(localize("lang")) === $key) {
                      continue;
                  }
                  echo "              <li><a class=\"dropdown-item\" href=\"?locale=$key\"><i class=\"flag-" . e($val["flag"]) . "\"></i> " . e($val["lang-name"]) . "</a></li>\n";
              } ?>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  </nav>

  <!-- Container Fluid Start -->
  <div id="main" class="container-fluid">

    <!-- First Row Start -->
    <div class="row">
      <div class="col-12">
        <h1>Special Events True Investigator <small class="text-muted"><?= localize('for Hattrick'); ?></small></h1>
      </div>
    </div> <!-- First Row End -->

    <!-- Second Row Start -->
    <div class="row">

      <!-- First Column Start -->
      <div class="col-md-8 no-text-select">
        <div class="soccer-field-wrapper noise">
          <div class="soccer-field-with-lines">
            <div class="soccer-field-lines"></div>
            <div class="soccer-field">
              <div class="soccer-field-keeper">
                <ul class="list-unstyled players-row">
                  <li class="player-empty-position d-flex align-items-center">
                    <form action="#">
                      <div class="form-check">
                        <input class="form-check-input" type="checkbox" name="setPiecesTakerHead" id="setPiecesTakerHead">
                        <label class="form-check-label" for="setPiecesTakerHead">
                          <?= rtrim(localize("Set pieces taker is header?"), "?"); ?>
                        </label>
                      </div>
                    </form>
                  </li>
                  <li class="player-empty-position"></li>
                  <li class="player-position position-keeper drop" id="position-100"><div></div></li>
                  <li class="player-empty-position">
                    <form action="#">
                      <label for="ballPossession" class="inline">
                        <?= localize("Ball Possession"); ?>:
                      </label>
                      <select class="form-select form-select-sm" id="ballPossession" name="ballPossession">
                        <?php for ($i = 99; $i >= 11; $i--) { ?>
                          <option value="<?= $i ?>"<?php if ($i == 50) {
                              echo ' selected="selected"';
                          } ?>><?= $i ?>%</option>
                        <?php } ?>
                      </select>
                    </form>
                  </li>
                  <li class="player-empty-position">
                    <form action="#">
                      <label for="playCreatively" class="inline">
                        <?= localize("Play creatively"); ?>:
                      </label>
                      <select class="form-select form-select-sm" id="playCreatively" name="playCreatively">
                        <option value="no"><?= localize("No"); ?></option>
                        <option value="yes"><?= localize("Yes"); ?></option>
                        <option value="both"><?= localize("Both"); ?></option>
                      </select>
                    </form>
                  </li>
                </ul>
              </div>
              <div class="soccer-field-movement">
                <ul class="list-unstyled players-row players-row-defence">
                  <li class="player-position position-defensive position-defender drop" id="position-101"><div></div></li>
                  <li class="player-position position-defensive position-defender drop" id="position-102"><div></div></li>
                  <li class="player-position position-defensive position-defender drop" id="position-103"><div></div></li>
                  <li class="player-position position-defensive position-defender drop" id="position-104"><div></div></li>
                  <li class="player-position position-defensive position-defender drop" id="position-105"><div></div></li>
                </ul>
                <ul class="list-unstyled players-row players-row-midfield">
                  <li class="player-position position-offensive position-winger drop" id="position-106"><div></div></li>
                  <li class="player-position position-defensive position-inner drop" id="position-107"><div></div></li>
                  <li class="player-position position-defensive position-inner drop" id="position-108"><div></div></li>
                  <li class="player-position position-defensive position-inner drop" id="position-109"><div></div></li>
                  <li class="player-position position-offensive position-winger drop" id="position-110"><div></div></li>
                </ul>
                <ul class="list-unstyled players-row">
                  <li class="player-empty-position"><div class="trash-players hide"><i class="bi bi-trash"></i></div></li>
                  <li class="player-position position-offensive position-scorer drop" id="position-111"><div></div></li>
                  <li class="player-position position-offensive position-scorer drop" id="position-112"><div></div></li>
                  <li class="player-position position-offensive position-scorer drop" id="position-113"><div></div></li>
                  <li class="player-empty-position"><div class="trash-players hide"><i class="bi bi-trash"></i></div></li>
                </ul>
              </div>
            </div>
          </div>
          <div class="draggablePlayers">
            <ul class="list-unstyled players-row">
              <li class="player-position draggable" id="player-speciality-2">
                <div class="player speciality speciality-quick">
                  <div class="player-avatar"><img src="img/speciality-quick.svg" alt="quick" width="36" height="36"></div>
                  <div class="player-description"><span><?= localize("Quick"); ?></span></div>
                </div>
              </li>
              <li class="player-position draggable" id="player-speciality-5">
                <div class="player speciality speciality-head">
                  <div class="player-avatar"><img src="img/speciality-head.svg" alt="head" width="36" height="36"></div>
                  <div class="player-description"><span><?= localize("Head"); ?></span></div>
                </div>
              </li>
              <li class="player-position draggable" id="player-speciality-4">
                <div class="player speciality speciality-unpredictable">
                  <div class="player-avatar"><img src="img/speciality-unpredictable.svg" alt="unpredictable" width="36" height="36"></div>
                  <div class="player-description"><span><?= localize("Unpredictable"); ?></span></div>
                </div>
              </li>
              <li class="player-position draggable" id="player-speciality-1">
                <div class="player speciality speciality-technical">
                  <div class="player-avatar"><img src="img/speciality-technical.svg" alt="technical" width="36" height="36"></div>
                  <div class="player-description"><span><?= localize("Technical"); ?></span></div>
                </div>
              </li>
              <li class="player-position draggable" id="player-speciality-0">
                <div class="player">
                  <div class="player-avatar">
                    <svg viewBox="0 0 24 24" fill="white" opacity="0.5" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                  </div>
                  <div class="player-description"><span>&mdash;</span></div>
                </div>
              </li>
            </ul>
            <p class="text-center">
              <?= localize("Drag and drop the above players on the field to get a prediction of the estimated goals"); ?>
            </p>
          </div>
        </div>
        <div class="spacer"></div>

      </div> <!-- First Column End -->

      <!-- Second Column Start -->
      <div class="col-md-4">

        <!-- Estimated Goals Accordion Start -->
        <div class="accordion mb-3" id="accordionEstimatedGoals">
          <div class="accordion-item">
            <h2 class="accordion-header">
              <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseEstimatedGoals" aria-expanded="true" aria-controls="collapseEstimatedGoals">
                <?= localize("Estimated goals:"); ?>&nbsp;<strong id="attendedGoals">0.00</strong>
              </button>
            </h2>
            <div id="collapseEstimatedGoals" class="accordion-collapse collapse show">
              <div class="accordion-body p-0">
                <div id="se-tables-container" class="p-2">
                  <table class="table table-sm d-none" id="Count_Quick" data-subtotal="0">
                    <thead>
                      <tr><th colspan="2"><?= localize("Quick"); ?> <strong id="Count_Quick_Subtotal"></strong></th></tr>
                    </thead>
                    <tbody>
                      <tr class="d-none"><td id="Count_QuickShoot" class="text-end"></td><td><?= localize("QuickShoot"); ?></td></tr>
                      <tr class="d-none"><td id="Count_QuickPassing" class="text-end"></td><td><?= localize("QuickPassing"); ?></td></tr>
                    </tbody>
                  </table>
                  <table class="table table-sm d-none" id="Count_Head" data-subtotal="0">
                    <thead>
                      <tr><th colspan="2"><?= localize("Head"); ?> <strong id="Count_Head_Subtotal"></strong></th></tr>
                    </thead>
                    <tbody>
                      <tr class="d-none"><td id="Count_HeadCross" class="text-end"></td><td><?= localize("HeadCross"); ?></td></tr>
                      <tr class="d-none"><td id="Count_HeadCorner" class="text-end"></td><td><?= localize("HeadCorner"); ?></td></tr>
                    </tbody>
                  </table>
                  <table class="table table-sm d-none" id="Count_Unpredictable" data-subtotal="0">
                    <thead>
                      <tr><th colspan="2"><?= localize("Unpredictable"); ?> <strong id="Count_Unpredictable_Subtotal"></strong></th></tr>
                    </thead>
                    <tbody>
                      <tr class="d-none"><td id="Count_UnpredictableKeeper" class="text-end"></td><td><?= localize("UnpredictableKeeper"); ?></td></tr>
                      <tr class="d-none"><td id="Count_UnpredictableShoot" class="text-end"></td><td><?= localize("UnpredictableShoot"); ?></td></tr>
                      <tr class="d-none"><td id="Count_UnpredictableAction" class="text-end"></td><td><?= localize("UnpredictableAction"); ?></td></tr>
                      <tr class="d-none"><td id="Count_UnpredictablePassing" class="text-end"></td><td><?= localize("UnpredictablePassing"); ?></td></tr>
                      <tr class="d-none"><td id="Count_UnpredictableNegative" class="text-end"></td><td><?= localize("UnpredictableNegative"); ?></td></tr>
                    </tbody>
                  </table>
                  <table class="table table-sm d-none" id="Count_Technical" data-subtotal="0">
                    <thead>
                      <tr><th colspan="2"><?= localize("Technical"); ?> <strong id="Count_Technical_Subtotal"></strong></th></tr>
                    </thead>
                    <tbody>
                      <tr class="d-none"><td id="Count_TechnicalVsHead" class="text-end"></td><td><?= localize("TechnicalVsHead"); ?></td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div> <!-- Estimated Goals Accordion End -->

        <!-- Match select (visible after CHPP data loaded) -->
        <?php if ($tryAjax): ?>
        <div class="d-none mb-3" id="CHPP_Match_Row">
          <select class="form-select form-select-lg" id="CHPP_Match"></select>
        </div>
        <?php endif; ?>

        <!-- CHPP Players roster (visible when CHPP match is loaded) -->
        <div class="d-none mb-3" id="CHPP_Players_Panel">
          <div id="CHPP_Players_List"></div>
        </div>

        <!-- SETI CHPP Start -->
        <div class="accordion mb-3<?php if (!$tryAjax) {
            echo ' d-none';
        } ?>" id="accordion-chpp">
          <div class="accordion-item">
            <h2 class="accordion-header">
              <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseCHPP" aria-expanded="false" aria-controls="collapseCHPP">
                <i class="bi bi-star"></i>
                <span class="ms-2"><?= localize("CHPP Mode"); ?></span>
              </button>
            </h2>
            <div id="collapseCHPP" class="accordion-collapse collapse" data-bs-parent="#accordion-chpp">
              <div class="accordion-body">
                <div class="staminia-button-panel" id="Staminia_Options_CHPP">
                  <div class="btn-group d-flex" role="group">
                    <button class="btn btn-sm btn-status" id="CHPP_Refresh_Data_Status" disabled><i class="bi bi-exclamation-triangle"></i></button>
                    <button class="btn btn-sm btn-secondary flex-grow-1 text-start" disabled id="CHPP_Refresh_Data"
                      data-error-text="<?= e(localize("Error")); ?>"
                      data-loading-text="<?= e(localize("Loading...")); ?>"
                      data-success-text="<?= e(localize("Refresh data")); ?>"
                      data-complete-text="<?= e(localize("Refresh data")); ?>"><?= localize("Unauthorized"); ?></button>
                  </div>
                  <div id="CHPP_Results" class="d-none">
                    <p class="small text-body-secondary m-0 mt-2" id="CHPP_Status_Description"></p>
                    <div class="mt-2 d-none" id="CHPP_Team_Row">
                      <label class="form-label small mb-1"><?= localize("Team"); ?></label>
                      <select class="form-select form-select-sm" id="CHPP_Team"></select>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </div>
        </div> <!-- SETI CHPP End -->

      </div> <!-- Second Column End -->

    </div> <!-- Second Row End -->

    <!-- Help Modal Start -->
    <div class="modal fade" id="helpModal" tabindex="-1" aria-labelledby="helpModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="helpModalLabel"><?= localize("Help"); ?></h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <?= localize("LONG_HELP", false); ?>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal"><?= localize("Close"); ?></button>
          </div>
        </div>
      </div>
    </div> <!-- Help Modal End -->

    <hr>

    <!-- Footer Start -->
    <footer>
      <ul class="list-unstyled">
        <li><b>SETI</b> by <b>Lizardopoli</b> (5246225)</li>
        <li><a href="https://github.com/<?= e(GH_REPO); ?>/blob/master/CHANGELOG.md">v<?= e($seti_version); ?></a></li>
        <?php if (defined('CHPP_APP_ID') && CHPP_APP_ID != "") { ?>
          <li><i class="bi bi-star"></i> <a href="https://www.hattrick.org/Community/CHPP/ChppProgramDetails.aspx?ApplicationId=<?= e(CHPP_APP_ID); ?>">Certified Hattrick Product Provider</a></li>
        <?php } ?>
        <li><i class="bi bi-github"></i> <a href="https://github.com/<?= e(GH_REPO); ?>">SETI @ github</a></li>
      </ul>
    </footer> <!-- Footer End -->

  </div> <!-- Container Fluid End -->

  <?php if (defined('GA_ID') && GA_ID != '') { ?>
    <script async src="https://www.googletagmanager.com/gtag/js?id=<?= e(GA_ID); ?>"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '<?= e(GA_ID); ?>');
    </script>
  <?php } ?>

  <script src="dist/seti.min.js?v=<?php echo filemtime('dist/seti.min.js'); ?>"></script>
  <script>
    document.startAjax = <?php echo $tryAjax ? 'true' : 'false'; ?>;
    <?php echo localizeJavascript(); ?>
  </script>
  </body>
</html>

