<?php

error_reporting(E_ALL & ~E_DEPRECATED);
ob_start('ob_gzhandler');
header('Content-type: application/json');
require __DIR__ . '/../vendor/autoload.php';
include __DIR__ . '/config.php';

session_start();
$returnArray = [];

$oauthToken = $_SESSION['oauthToken'] ?? null;
$oauthTokenSecret = $_SESSION['oauthTokenSecret'] ?? null;

$clearCache = isset($_GET['refresh']);

function resetPermanentToken()
{
    if ($_COOKIE['permanent'] ?? false) {
        $clear = array_merge(COOKIE_OPTIONS, ['expires' => time() - 3600]);
        setcookie('permanent', '', $clear);
        setcookie('userToken', '', $clear);
        setcookie('userTokenSecret', '', $clear);
    }
}

function getTeamDetails($HT, $team)
{
    $teamId = $team->getId();
    $teamArray = [
        "TeamId"   => $teamId,
        "TeamName" => $team->getName(),
    ];

    // Only the fields SETI needs (no skills/stamina/form/experience)
    $teamPlayers = $HT->getSeniorPlayers($teamId);
    $teamPlayersArray = [];
    for ($i = 0; $i < $teamPlayers->getPlayerNumber(); $i++) {
        $player = $teamPlayers->getPlayer($i);
        $teamPlayersArray[] = [
            'PlayerID'       => $player->getId(),
            'PlayerName'     => $player->getName(),
            'PlayerNumber'   => $player->getShirtNumber(),
            'Speciality'     => $player->getSpecialty(),
            'InjuryLevel'    => $player->getInjury(),
            'TransferListed' => $player->isTransferListed(),
            'Cards'          => $player->getCards(),
        ];
    }
    $teamArray["PlayersData"] = $teamPlayersArray;

    // Upcoming matches for this team
    $nextMatchesArray = [];
    $nextMatches = $HT->getSeniorMatches($teamId)->getNextMatches();
    foreach ($nextMatches as $match) {
        $nextMatchesArray[] = [
            'MatchId'      => $match->getId(),
            'Date'         => $match->getDate('Y-m-d H:i'),
            'HomeTeamName' => $match->getHomeTeamName(),
            'AwayTeamName' => $match->getAwayTeamName(),
            'MatchType'    => $match->getType(),
        ];
    }
    $teamArray["NextMatches"] = $nextMatchesArray;

    return $teamArray;
}

if ($oauthToken == null && ($_COOKIE['permanent'] ?? false)) {
    $oauthToken = $_COOKIE['userToken'] ?? null;
    $oauthTokenSecret = $_COOKIE['userTokenSecret'] ?? null;

    if ($oauthToken && $oauthTokenSecret) {
        $_SESSION['oauthToken'] = $oauthToken;
        $_SESSION['oauthTokenSecret'] = $oauthTokenSecret;
    } else {
        $returnArray['Status'] = 'Error';
        $returnArray['ErrorCode'] = 'InvalidToken';
        resetPermanentToken();
    }
}

if ($oauthToken != null && $oauthTokenSecret != null) {
    try {
        $HT = new \PHT\PHT(getPhtConfig([
            'OAUTH_TOKEN' => $oauthToken,
            'OAUTH_TOKEN_SECRET' => $oauthTokenSecret,
            'CACHE' => 'session',
        ]));

        if (isset($_GET['matchId'])) {
            // Match orders mode — return lineup/orders for a specific match
            $matchId = intval($_GET['matchId']);
            $ordersArray = [];
            if ($matchId > 0) {
                $orders = $HT->getSeniorMatchOrders($matchId);
                if ($orders !== null && $orders->isDataAvailable()) {
                    for ($i = 0; $i < $orders->getPlayerNumber(); $i++) {
                        $player = $orders->getPlayer($i);
                        $ordersArray[] = [
                            'PlayerID'        => $player->getId(),
                            'Position'        => $player->getRole(),
                            'IndividualOrder' => $player->getIndividualOrder(),
                        ];
                    }
                }
            }
            $returnArray['Status'] = 'OK';
            $returnArray['MatchOrders'] = $ordersArray;
        } else {
            // Teams + players + upcoming matches mode
            if ($clearCache) {
                // Prevent flooding
                if (isset($_SESSION['lastRefreshTime'])) {
                    $currentRefreshRequestTime = time();
                    if ($currentRefreshRequestTime >= ($_SESSION['lastRefreshTime'] + MIN_REFRESH_SECONDS)) {
                        \PHT\Cache\Driver::getInstance()->clear('players');
                        $_SESSION['lastRefreshTime'] = time();
                    } else {
                        $returnArray["RefreshThrottle"] = (MIN_REFRESH_SECONDS - ($currentRefreshRequestTime - $_SESSION['lastRefreshTime']));
                    }
                } else {
                    \PHT\Cache\Driver::getInstance()->clear('players');
                    $_SESSION['lastRefreshTime'] = time();
                }
            }

            $returnArray["Teams"] = [];

            // Primary team
            $primaryTeam = $HT->getSeniorTeam();
            if (is_object($primaryTeam)) {
                $returnArray["Teams"][] = getTeamDetails($HT, $primaryTeam);
            }

            // Secondary teams (a user can have up to 3)
            for ($n = 1; $n <= 3; $n++) {
                $teamConfig = new \PHT\Config\Team();
                $teamConfig->secondary = true;
                $teamConfig->number = $n;
                try {
                    $secondaryTeam = $HT->getSeniorTeam($teamConfig);
                    if (!is_object($secondaryTeam)) {
                        break;
                    }
                    $returnArray["Teams"][] = getTeamDetails($HT, $secondaryTeam);
                } catch (\PHT\Exception\ChppException $e) {
                    break;
                }
            }

            $returnArray["Status"] = "OK";

            if (!isset($_SESSION['lastRefreshTime'])) {
                $_SESSION['lastRefreshTime'] = time();
            }
        }
    } catch (\PHT\Exception\ChppException $e) {
        $conn = new \PHT\Connection(getPhtConfig());
        try {
            $tokenCheck = $conn->checkChppAccess($oauthToken, $oauthTokenSecret);
            if ($tokenCheck->isValid()) {
                $returnArray['Status'] = 'Error';
                $returnArray['ErrorCode'] = $e->getMessage();
            } else {
                $returnArray['Status'] = 'Error';
                $returnArray['ErrorCode'] = 'InvalidToken';
                resetPermanentToken();
                unset($_SESSION['oauthToken']);
                unset($_SESSION['oauthTokenSecret']);
            }
        } catch (\Exception $ex) {
            $returnArray['Status'] = 'Error';
            $returnArray['ErrorCode'] = 'InvalidToken';
            resetPermanentToken();
            unset($_SESSION['oauthToken']);
            unset($_SESSION['oauthTokenSecret']);
        }
    }
} else {
    $returnArray['Status'] = 'Error';
    $returnArray['ErrorCode'] = 'UnknownError';
}
echo json_encode($returnArray);
