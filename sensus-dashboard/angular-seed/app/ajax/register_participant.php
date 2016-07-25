<?php

header('Access-Control-Allow-Origin: http://ec2-54-227-229-48.compute-1.amazonaws.com/app/*');
ini_set('display_errors', 1);
include('app.php');
set_error_handler('errorReport');

// get database password
$text = file_get_contents('/pgsql-roles/pgsql_roles.json');
$json = json_decode($text, true);
$pgsqlPassword = $json['ajax']['pw'];

// connect to database
$handle = pg_connect("host = sensus.cq86dmznaris.us-east-1.rds.amazonaws.com port = 5432 dbname = sensus_portal user = ajax password = $pgsqlPassword");
if (!$handle) {
        errorReport(-1, "status:postgresql:connectionfailure");
        exit();
}

// check and set POST values
$participantEmailAddress;
$participantStartDate;
$participantEndDate;
$participantAnonymize;
if (empty($_POST['participantStartDate']))
        errorReport(-1, "status:ajax:incompleteform");
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
$query = "INSERT INTO participant (emailaddress, startdate, enddate) VALUES ('$participantEmailAddress', '$participantStartDate', '$participantEndDate');";

// execute query
$result = pg_query($handle, $query);
if (!$result) {
        errorReport(-1, "status:postgresql:queryfailure");
}
