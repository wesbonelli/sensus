<?php

header('Access-Control-Allow-Origin: http://ec2-54-227-229-48.compute-1.amazonaws.com/app/*');
ini_set('display_errors', 0);
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

// get session information
$userId = $_SESSION["user_id"];
$studyId = $_SESSION["viewed_study"];
$participantId = $_SESSION["viewed_participant"];

// get database password
$text = file_get_contents('/pgsql-roles/pgsql_roles.json');
$json = json_decode($text, true);
$pgsqlPassword = $json['ajax']['pw'];

// connect to database
$handle = pg_connect("host = sensus.cq86dmznaris.us-east-1.rds.amazonaws.com port = 5432 dbname = sensus_portal user = ajax password = $pgsqlPassword");
if (!$handle) {
	$error = array('type' => 'database', 'message' => 'connectionfailure');
        errorReport(-1, json_encode(array('error' => $error)));
        exit();
}
if ($studyId == 0 ) {
	// find all the studies the user is involved with as a researcher
	$studyIds = null;
	$query = "SELECT * FROM researcher WHERE userid = '$userId';";
	$result = pg_query($handle, $query);
	if ($result) {
		while ($row = pg_fetch_assoc($result)) {
			if ($row != null) {
				$studyIds[] = $row["studyid"];
			}
		}
	} else {
		$error = array('type' => 'database', 'message' => 'queryfailure');
		errorReport(-1, json_encode(array('error' => $error)));
	}

	// find all the studies the user is involved with as a participant
	$query = "SELECT * FROM participant WHERE userid = '$userId';";
	$result = pg_query($handle, $query);
	if ($result) {
		while ($row = pg_fetch_assoc($result)) {
			if ($row != null) {
				$studyIds[] = $row["studyid"];
			}
		}
	} else {
		$error = array('type' => 'database', 'message' => 'queryfailure');
		errorReport(-1, json_encode(array('error' => $error)));
	}

	// load log entries
	$logEntries = null;
	for ($i = 0; $i < count($studyIds); $i += 1) {
		$id = intval($studyIds[$i]);
		$query = "SELECT id, studyid, participantid, timestamp, message FROM logentry WHERE studyid = '$id';";
		$result = pg_query($handle, $query);
		if ($result) {
			while ($row = pg_fetch_assoc($result)) {
				if ($row != null) {
					$logEntries[] = $row;
				}
			}
		} else {
			$error = array('type' => 'session', 'database' => 'queryfailure');
			errorReport(-1, json_encode(array('error' => $error)));
		}
	}
} else {
	if ($participantId == '') {
        	$query = "SELECT id, studyid, participantid, participantidentifier, timestamp, message FROM logentry WHERE studyid = '$studyId';";
        } else {
                $query = "SELECT id, studyid, participantid, participantidentifier, timestamp, timestamp, message FROM logentry WHERE studyid = '$studyId' AND participantid = '$participantId';";
        }
	$result = pg_query($handle, $query);
	if ($result) {
		while ($row = pg_fetch_assoc($result)) {
			if ($row != null) {
				$logEntries[] = $row;
			}
		}
	} else {
		$error = array('type' => 'session', 'database' => 'queryfailure');
		errorReport(-1, json_encode(array('error' => $error)));
	}
}

// load log entry study information
for ($i = 0; $i < count($logEntries); $i += 1) {
        $currentStudyId = $logEntries[$i]["studyid"];
        $query = "SELECT title FROM study WHERE id = '$currentStudyId';";
        $result = pg_query($handle, $query);
        if ($result) {
                $queryData = null;
                while ($row = pg_fetch_assoc($result)) {
                        if ($row != null) {
				$logEntries[$i]["studytitle"] = $row["title"];
                        }
                }
        } else {
                $error = array('type' => 'database', 'message' => 'queryfailure');
                errorReport(-1, json_encode(array('error' => $error)));
        }
}

// load log entry participant information
for ($i = 0; $i < count($logEntries); $i += 1) {
        $currentParticipantId = $logEntries[$i]["participantid"];
	if ($currentParticipantId != null) {
        	$query = "SELECT userid, identifier FROM participant WHERE id = '$currentParticipantId';";
		$result = pg_query($handle, $query);
		if ($result) {
			while ($row = pg_fetch_assoc($result)) {
				if ($row != null) {
					$logEntries[$i]["participantidentifier"] = $row["identifier"];
				}
			}
			//while ($row = pg_fetch_assoc($result)) {
			//	if ($row != null) {
			//		$userId = intval($row["userid"]);
			//		$query = "SELECT emailaddress FROM useraccount WHERE id = '$userId';";
			//		$result = pg_query($handle, $query);
			//		if ($result) {
			//			while ($row = pg_fetch_assoc($result)) {
			//				if ($row != null) {
			//					$logEntries[$i]["participantemailaddress"] = $row["emailaddress"];
			//				}
			//			}
			//		} else {
			//			$error = array('type' => 'database', 'message' => 'queryfailure');
			//			errorReport(-1, json_encode(array('error' => $error)));
			//		}
			//	}
			//}
		} else {
			$error = array('type' => 'database', 'message' => 'queryfailure');
			errorReport(-1, json_encode(array('error' => $error)));
		}
	}
}
echo json_encode(array('payload' => $logEntries));

// close connection
pg_close($handle);

?>
