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
$participantStudyName = $_SESSION["viewed_study"];

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
$participantEmailAddress;
$participantStartDate;
$participantEndDate;
$participantAnonymize;
if (empty($_POST['participantStartDate']))
	$error = array('type' => 'ajax', 'message' => 'missingvalues');
        errorReport(-1, json_encode(array('error' => $error)));
if(!get_magic_quotes_gpc()) {
	$participantEmailAddress = addslashes($_POST['participantEmailAddress']);
        $participantStartDate = addslashes($_POST['participantStartDate']);
        $participantEndDate = addslashes($_POST['participantEndDate']);
	if (!empty($_POST['participantAnonymize'])) {
		$participantAnonymize = addslashes($_POST['participantAnonymize']);
	}
} else {
	$participantEmailAddress = $_POST['participantEmailAddress'];
        $participantStartDate = $_POST['participantStartDate'];
        $participantEndDate = $_POST['participantEndDate'];
	if (!empty($_POST['participantAnonymize'])) {
		$participantAnonymize = $_POST['participantAnonymize'];
	}
}

// hash password if option selected
if (!empty($_POST['participantAnonymize'])) {
	if ($participantAnonymize == "true") {
		$participantEmailAddress = password_hash($participantEmailAddress, PASSWORD_DEFAULT);
	}
}



// build query
$query = "INSERT INTO participant (emailaddress, startdate, enddate, studyname) VALUES ('$participantEmailAddress', '$participantStartDate', '$participantEndDate', '$participantStudyName');";

// execute query
$result = pg_query($handle, $query);
if (!$result) {
	$error = array('type' => 'database', 'message' => 'queryfailure');
        errorReport(-1, json_encode(array('error' => $error)));
}

?>
