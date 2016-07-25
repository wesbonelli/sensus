<?php

header('Access-Control-Allow-Origin: http://ec2-54-227-229-48.compute-1.amazonaws.com/app/*');
ini_set('display_errors', 1);
include('app.php');
set_error_handler('errorReport');

// start session
session_start();

// check if user is logged in
if ($_SESSION["logged_in"] == false) {
        errorReport(-1, "status:session:expired");
        exit();
}

// get database password
$text = file_get_contents('/pgsql-roles/pgsql_roles.json');
$json = json_decode($text, true);
$pgsqlPassword = $json['ajax']['pw'];

// set up database connection
$handle = pg_connect("host = sensus.cq86dmznaris.us-east-1.rds.amazonaws.com port = 5432 dbname = sensus_portal user = ajax password = $pgsqlPassword");
if (!$handle) {
        errorReport(-1, 'status:postgresql:connectionfailure.');
        exit();
}

// check and set POST values
$studyName;
$studyStartDate;
$studyEndDate;
$studyRunning = 'f';
if (empty($_POST['studyName']) || empty($_POST['studyStartDate']))
	errorReport(-1, "status:ajax:formincomplete");
if(!get_magic_quotes_gpc()) {
	$studyName = addslashes($_POST['studyName']);
	$studyStartDate = addslashes($_POST['studyStartDate']);
	$studyEndDate = addslashes($_POST['studyEndDate']);
} else {
	$studyName = $_POST['studyName'];
	$studyStartDate = $_POST['studyStartDate'];
	$studyEndDate = $_POST['studyEndDate'];
}

// build query
if (empty($_POST['studyEndDate'])) {
	$query = "INSERT INTO study (name, startdate) VALUES ('$studyName', '$studyStartDate');";
} else {
	$query = "INSERT INTO study (name, startdate, enddate) VALUES ('$studyName', '$studyStartDate', '$studyEndDate');";
}

// execute query
$result = pg_query($handle, $query);
if (!$result) {
	errorReport(-1, "statuspostgresql:queryfailure");
	exit();
}

// close connection
pg_close($handle);

?>
