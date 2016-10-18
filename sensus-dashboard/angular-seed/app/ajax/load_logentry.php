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
$studyId = $_SESSION["viewed_study"];
$participantId = $_SESSION["viewed_participant"];
$logEntryId = $_SESSION["viewed_logentry"];

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

// load log entry
if ($studyId == '' && $participantId == '') {
        $query = "SELECT id, studyid, participantid, participantidentifier, timestamp, message FROM logentry WHERE id = '$logEntryId';";
} else if ($studyId == '') {
        $query = "SELECT id, studyid, participantid, participantidentifier, timestamp, message FROM logentry WHERE participantid = '$participantId' AND id = '$logEntryId';";
} else if ($participantId == '') {
        $query = "SELECT id, studyid, participantid, participantidentifier, timestamp, message FROM logentry WHERE studyid = '$studyId' AND id = '$logEntryId';";
} else {
        $query = "SELECT id, studyid, participantid, participantidentifier, timestamp, message FROM logentry WHERE studyid = '$studyId' AND participantid = '$participantId' AND id = '$logEntryId';";
}

$logEntry = null;
$result = pg_query($handle, $query);
if ($result) {
        while ($row = pg_fetch_assoc($result)) {
                if ($row != null) {
                        $logEntry = $row;
                }
        }
} else {
        $error = array('type' => 'session', 'database' => 'queryfailure');
        errorReport(-1, json_encode(array('error' => $error)));
}

// load study information
$studyId = $logEntry["studyid"];
$query = "SELECT title FROM study WHERE id = '$studyId';";
$result = pg_query($handle, $query);
if ($result) {
        while ($row = pg_fetch_assoc($result)) {
                if ($row != null) {
			$logEntry["studytitle"] = $row["title"];
                }
        }
} else {
        $error = array('type' => 'database', 'message' => 'queryfailure');
        errorReport(-1, json_encode(array('error' => $error)));
}

// load participant information
$participantId = intval($logEntry["participantid"]);
$query = "SELECT userid FROM participant WHERE id = '$participantId';";
$result = pg_query($handle, $query);
if ($result) {
        while ($row = pg_fetch_assoc($result)) {
                if ($row != null) {
			$userId = intval($row["userid"]);
			$query = "SELECT emailaddress FROM useraccount WHERE id = '$userId';";
			$result = pg_query($handle, $query);
			if ($result) {
				while ($row = pg_fetch_assoc($result)) {
					if ($row != null) {
						$logEntry["participantemailaddress"] = $row["emailaddress"];
					}
				}
			}
                }
        }
} else {
        $error = array('type' => 'database', 'message' => 'queryfailure');
        errorReport(-1, json_encode(array('error' => $error)));
}

echo json_encode(array('payload' => $logEntry));

// close connection
pg_close($handle);

?>
