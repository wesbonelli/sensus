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
$studyTitle = $_SESSION["viewed_study"];
$participantEmailAddress = $_SESSION["viewed_participant"];

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

// load alerts
if ($studyTitle == '' && $participantEmailAddress == '') {
	$query = "SELECT sourcestudytitle, sourceparticipantemailaddress, timestamp, message FROM logentry;";
} else if ($studyTitle == '') {
	$query = "SELECT sourcestudytitle, sourceparticipantemailaddress, timestamp, message FROM logentry WHERE sourceparticipantemailaddress = '$participantEmailAddress';";
} else if ($participantEmailAddress == '') {
	$query = "SELECT sourcestudytitle, sourceparticipantemailaddress, timestamp, message FROM logentry WHERE sourcestudytitle = '$studyTitle';";
} else {
	$query = "SELECT sourcestudytitle, sourceparticipantemailaddress, timestamp, message FROM logentry WHERE sourcestudytitle = '$studyTitle' AND sourceparticipantemailaddress = '$participantEmailAddress';";
}

$result = pg_query($handle, $query);
if ($result) {
	$json = array('payload' => null);
        while ($row = pg_fetch_assoc($result)) {
        	if ($row != null) {
	        	$values[] = $row;
			$json = array('payload' => $values);
		}
        }
        echo json_encode($json);
} else {
	$error = array('type' => 'session', 'database' => 'queryfailure');
        errorReport(-1, json_encode(array('error' => $error)));
}

// close connection
pg_close($handle);

?>
