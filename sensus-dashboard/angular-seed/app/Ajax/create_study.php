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

// check and set POST values
$studyName;
$studyStartDate;
$studyEndDate;
$studyDescription;
if (empty($_POST['studyName']) || empty($_POST['studyStartDate'] || empty($_POST['studyDescription'])))
	$error = array('type' => 'ajax', 'message' => 'missingvalues');
        errorReport(-1, json_encode(array('error' => $error)));
if(!get_magic_quotes_gpc()) {
	$studyName = addslashes($_POST['studyName']);
	$studyStartDate = addslashes($_POST['studyStartDate']);
	$studyEndDate = addslashes($_POST['studyEndDate']);
	$studyDescription = addslashes($_POST['studyDescription']);
} else {
	$studyName = $_POST['studyName'];
	$studyStartDate = $_POST['studyStartDate'];
	$studyEndDate = $_POST['studyEndDate'];
	$studyDescription = $_POST['studyDescription'];
}

// build query
if (empty($_POST['studyEndDate'])) {
	$query = "INSERT INTO study (name, startdate, description) VALUES ('$studyName', '$studyStartDate', '$studyDescription');";
} else {
	$query = "INSERT INTO study (name, startdate, enddate, description) VALUES ('$studyName', '$studyStartDate', '$studyEndDate', '$studyDescription');";
}

// execute query
$result = pg_query($handle, $query);
if (!$result) {
	$error = array('type' => 'database', 'message' => 'queryfailure');
        errorReport(-1, json_encode(array('error' => $error)));
	exit();
}

// close connection
pg_close($handle);

?>
