<?php

header('Access-Control-Allow-Origin: http://ec2-54-227-229-48.compute-1.amazonaws.com/app/*');
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

// get session data
$studyId = $_SESSION["viewed_study"];

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

// check and set POST values
$participantIdentifiers = null;
$i = 1;
while (!empty($_POST['participant' . $i . 'identifier'])) {
	if(!get_magic_quotes_gpc()) {
		$participantIdentifiers[] = addslashes($_POST['participant' . $i . 'identifier']);
	} else {
		$participantIdentifiers[] = $_POST['participant' . $i . 'identifier'];
	}
	$i += 1;
}

for ($i = 0; $i < count($participantIdentifiers); $i += 1) {
	// insert participant
	$identifier = $participantIdentifiers[$i];
	$query = "INSERT INTO participant (identifier, studyid) VALUES ('$identifier', '$studyId');";
	$result = pg_query($handle, $query);
	if (!$result) {
		$error = array('type' => 'database', 'message' => 'queryfailure');
		errorReport(-1, json_encode(array('error' => $error)));
	}

	// get id associated with participant
	$participantId = null;
	$query = "SELECT LASTVAL();";
	$result = pg_query($handle, $query);
	if (!$result) {
		$error = array('type' => 'database', 'message' => 'queryfailure');
		errorReport(-1, json_encode(array('error' => $error)));
		exit();
	}

	$row = pg_fetch_assoc($result);
	$participantId = intval($row['lastval']);

	// create a log entry recording the adding of the participant
	$query = "INSERT INTO logentry (studyid, participantid, participantidentifier, timestamp, message, type) VALUES ('$studyId', '$participantId', '$identifier', now(), 'Participant added: $identifier.', 'admin');";
	$result = pg_query($handle, $query);
	if (!$result) {
		$error = array('type' => 'database', 'message' => 'queryfailure');
		errorReport(-1, json_encode(array('error' => $error)));
		exit();
	}
}

?>
