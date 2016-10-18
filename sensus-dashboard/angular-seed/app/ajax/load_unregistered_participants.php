<?php

header('Access-Control-Allow-Origin: http://ec2-54-227-229-48.compute-1.amazonaws.com/*');
ini_set('display_errors', 1);
include('app.php');
set_error_handler('errorReport');

// start session
session_start();

// check if user is logged in
if (!isset($_SESSION["logged_in"])) {
        $error = array('type' => 'session', 'message' => 'doesnotexist');
        errorReport(-1, json_encode(array('error' => $error)));
        exit();
}
else if ($_SESSION["logged_in"] == false) {
        $error = array('type' => 'session', 'message' => 'expired');
        errorReport(-1, json_encode(array('error' => $error)));
        exit();
}

// update session
$_SESSION["viewed_participant"] = 0;

// get viewed study
$studyId = $_SESSION["viewed_study"];

// get database password
$text = file_get_contents('/pgsql-roles/pgsql_roles.json');
$json = json_decode($text, true);
$pgsqlPassword = $json['ajax']['pw'];

// connect to databases
$dataHandle = pg_connect("host = sensus.cq86dmznaris.us-east-1.rds.amazonaws.com port = 5432 dbname = sensus_data_ers user = ajax password = $pgsqlPassword");
if (!$dataHandle) {
        $error = array('type' => 'database', 'message' => 'connectionfailure');
        errorReport(-1, json_encode(array('error' => $error)));
        exit();
}
$portalHandle = pg_connect("host = sensus.cq86dmznaris.us-east-1.rds.amazonaws.com port = 5432 dbname = sensus_portal user = ajax password = $pgsqlPassword");
if (!$portalHandle) {
        $error = array('type' => 'database', 'message' => 'connectionfailure');
        errorReport(-1, json_encode(array('error' => $error)));
        exit();
}

// load participants
$query = "select table_name from information_schema.columns where column_name = 'deviceid';";
$result = pg_query($dataHandle, $query);
$participants = null;
$tableNames = null;
if ($result) {
        while ($row = pg_fetch_assoc($result)) {
                if ($row != null) {
			$tableNames[] = $row['table_name'];
		}
	}
} else {
	$error = array('type' => 'database', 'message' => 'queryfailure');
	errorReport(-1, json_encode(array('error' => $error)));
}
for ($i = 0; $i < count($tableNames); $i += 1) {
	$tableName = $tableNames[$i];
	$query = "SELECT DISTINCT identifier FROM $tableName;";
	$result = pg_query($dataHandle, $query);
	$count = 1;
	if ($result) {
		while ($row = pg_fetch_assoc($result)) {
			if ($row != null) {
				$identifier = $row['identifier'];
				$query = "SELECT * FROM participant WHERE studyid = '$studyId' AND identifier = '$identifier';";
				$result2 = pg_query($portalHandle, $query);
				if ($result2) {
					if ($row2 = pg_fetch_assoc($result2)) {
						while ($row2 = pg_fetch_assoc($result2)) {
							if (strcmp($row2['id'], '') == 0) {
								$participants[] = $row;
							}
						}
					} else {
						$participants[] = $row;
					}
				} else {
					$error = array('type' => 'database', 'message' => 'queryfailure');
					errorReport(-1, json_encode(array('error' => $error)));
				}
			}
		}
	} else {
		$error = array('type' => 'database', 'message' => 'queryfailure');
		errorReport(-1, json_encode(array('error' => $error)));
	}
}

$encounteredIdentifiers = null;
for ($i = 0; $i < count($participants); $i += 1) {
	$duplicate = false;
	for ($j = 0; $j < count($encounteredIdentifiers); $j += 1) {
		if ($encounteredIdentifiers[$j] == $participants[$i]['identifier']) {
			$duplicate = true;
		}
	}
	$encounteredIdentifiers[] = $participants[$i]['identifier'];
	if ($duplicate) {
		$participants[$i] = null;
	} else {
		$participants[$i]["index"] = $count;
		$count += 1;
	}
}

$participantsForJson = null;
for ($i = 0; $i < count($participants); $i += 1) {
	if ($participants[$i] != null) {
		$participantsForJson[] = $participants[$i];
	}
}

for ($i = 0; $i < count($participantsForJson); $i += 1) {
	$participantIdentifier = $participantsForJson[$i]['identifier'];
	$query = "SELECT * FROM locationdatum WHERE identifier = '$participantIdentifier' ORDER BY timestamp ASC LIMIT 1;";
	$result = pg_query($dataHandle, $query);
	if ($result) {
		while ($row = pg_fetch_assoc($result)) {
			$participantsForJson[$i]['firstdatum'] = $row;
		}
	} else {
		$error = array('type' => 'database', 'message' => 'queryfailure');
		errorReport(-1, json_encode(array('error' => $error)));
	}
}

echo json_encode(array('payload' => $participantsForJson));

// close connection
pg_close($dataHandle);
pg_close($portalHandle);
?>
