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

// get database password
$text = file_get_contents('/pgsql-roles/pgsql_roles.json');
$json = json_decode($text, true);
$pgsqlPassword = $json['ajax']['pw'];

// set up database connection
$handle = pg_connect("host = sensus.cq86dmznaris.us-east-1.rds.amazonaws.com port = 5432 dbname = sensus_portal user = ajax password = $pgsqlPassword");
if (!$handle) {
	$error = array('type' => 'database', 'message' => 'connectionfailure');
        errorReport(-1, json_encode(array('error' => $error)));
        exit();
}

// check and get post values
if (empty($_POST['identifier']) || empty($_POST['startDate'])) {
	$error = array('type' => 'ajax', 'message' => 'missingvalues');
        errorReport(-1, json_encode(array('error' => $error)));
	exit();
} else {
	if(!get_magic_quotes_gpc()) {
		$identifier = addslashes($_POST['identifier']);
		$startDate = addslashes($_POST['startDate']);
		$endDate = addslashes($_POST['endDate']);
	} else {
		$identifier = $_POST['identifier'];
		$startDate = $_POST['startDate'];
		$endDate = $_POST['endDate'];
	}
}

// get study title and id
$studyId = $_SESSION["viewed_study"];
$query = "SELECT title FROM study WHERE id = '$studyId';";
$result = pg_query($handle, $query);
if (!$result) {
        $error = array('type' => 'database', 'message' => 'queryfailure');
        errorReport(-1, json_encode(array('error' => $error)));
        exit();
}
$row = pg_fetch_assoc($result);
$studyTitle = $row['title'];

// create participant
if (empty($_POST['endDate'])) {
	$query = "INSERT INTO participant (identifier, startdate, studyid) VALUES ('$identifier', '$startDate', '$studyId');";
} else {
	$query = "INSERT INTO participant (identifier, startdate, enddate, studyid) VALUES ('$identifier', '$startDate', '$endDate', '$studyId');";
}
$result = pg_query($handle, $query);
if (!$result) {
	$error = array('type' => 'database', 'message' => 'queryfailure');
        errorReport(-1, json_encode(array('error' => $error)));
	exit();
}

// get auto-generated id associated with participant
$query = "SELECT LASTVAL();";
$result = pg_query($handle, $query);
if (!$result) {
        $error = array('type' => 'database', 'message' => 'queryfailure');
        errorReport(-1, json_encode(array('error' => $error)));
        exit();
}
$row = pg_fetch_assoc($result);
$participantId = intval($row['lastval']);

// create a log entry recording the event
$query = "INSERT INTO logentry (studyid, participantid, timestamp, message) VALUES ('$studyId', '$participantId', now(), 'Participant added: $identifier.');";
$result = pg_query($handle, $query);
if (!$result) {
        $error = array('type' => 'database', 'message' => 'queryfailure');
        errorReport(-1, json_encode(array('error' => $error)));
        exit();
}

// close connection
pg_close($handle);

?>
