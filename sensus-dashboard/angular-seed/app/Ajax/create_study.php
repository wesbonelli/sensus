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

$userId = $_SESSION["user_id"];

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
if (empty($_POST['studyTitle']) || empty($_POST['studyStartDate'] || empty($_POST['studyDescription']) || empty($_POST['databaseType']) || empty($_POST['dataSourceType'])))
	$error = array('type' => 'ajax', 'message' => 'missingvalues');
        errorReport(-1, json_encode(array('error' => $error)));
if(!get_magic_quotes_gpc()) {
	$studyTitle = addslashes($_POST['studyTitle']);
	$studyStartDate = addslashes($_POST['studyStartDate']);
	$studyEndDate = addslashes($_POST['studyEndDate']);
	$studyDescription = addslashes($_POST['studyDescription']);
	$dataSourceType = addslashes($_POST['dataSourceType']);
	$databaseType = addslashes($_POST['databaseType']);
	$postgreSQLHost = addslashes($_POST['postgreSQLHost']);
	$postgreSQLName = addslashes($_POST['postgreSQLName']);
	$postgreSQLPassword = addslashes($_POST['postgreSQLPassword']);
	$postgreSQLPort = addslashes($_POST['postgreSQLPort']);
	$s3Bucket = addslashes($_POST['s3Bucket']);
} else {
	$studyTitle = $_POST['studyTitle'];
	$studyStartDate = $_POST['studyStartDate'];
	$studyEndDate = $_POST['studyEndDate'];
	$studyDescription = $_POST['studyDescription'];
	$dataSourceType = $_POST['dataSourceType'];
        $databaseType = $_POST['databaseType'];
	$postgreSQLHost = $_POST['postgreSQLHost'];
	$postgreSQLName = $_POST['postgreSQLName'];
	$postgreSQLPassword = $_POST['postgreSQLPassword'];
	$postgreSQLPort = $_POST['postgreSQLPort'];
	$s3Bucket = $_POST['s3Bucket'];
}

// create study
if (empty($_POST['studyEndDate'])) {
	$query = "INSERT INTO study (title, startdate, description) VALUES ('$studyTitle', '$studyStartDate', '$studyDescription');";
} else {
	$query = "INSERT INTO study (title, startdate, enddate, description) VALUES ('$studyTitle', '$studyStartDate', '$studyEndDate', '$studyDescription');";
}
$result = pg_query($handle, $query);
if (!$result) {
	$error = array('type' => 'database', 'message' => 'queryfailure');
        errorReport(-1, json_encode(array('error' => $error)));
	exit();
}

// get auto-generated id associated with study
$studyId = null;
$query = "SELECT LASTVAL();";
$result = pg_query($handle, $query);
if (!$result) {
        $error = array('type' => 'database', 'message' => 'queryfailure');
        errorReport(-1, json_encode(array('error' => $error)));
        exit();
}

$row = pg_fetch_assoc($result);
$studyId = intval($row['lastval']);

// create study-researcher relationship
$query = "INSERT INTO researcher (studyid, userid) VALUES ('$studyId', '$userId');";
$result = pg_query($handle, $query);
if (!$result) {
        $error = array('type' => 'database', 'message' => 'queryfailure');
        errorReport(-1, json_encode(array('error' => $error)));
        exit();
}

// create a log entry recording the study's creation
$query = "INSERT INTO logentry (studyid, participantidentifier, timestamp, message, type) VALUES ('$studyId', '', now(), 'Study created.', 'admin');";
$result = pg_query($handle, $query);
if (!$result) {
        $error = array('type' => 'database', 'message' => 'queryfailure');
        errorReport(-1, json_encode(array('error' => $error)));
        exit();
}

// create data source
$query = "INSERT INTO datasource (type, s3bucket, studyid) VALUES ('$dataSourceType', '$s3Bucket', '$studyId');";
$result = pg_query($handle, $query);
if (!$result) {
        $error = array('type' => 'database', 'message' => 'queryfailure');
        errorReport(-1, json_encode(array('error' => $error)));
        exit();
}

// hash database password
$postgreSQLPassword = password_hash($postgreSQLPassword, PASSWORD_DEFAULT);

// create database entry
$query = "INSERT INTO database (type, pghost, pgport, pgname, pgpassword, studyid) VALUES ('$databaseType', '$postgreSQLHost', '$postgreSQLPort', '$postgreSQLName', '$postgreSQLPassword', '$studyId');";
$result = pg_query($handle, $query);
if (!$result) {
        $error = array('type' => 'database', 'message' => 'queryfailure');
        errorReport(-1, json_encode(array('error' => $error)));
        exit();
}

// close connection
pg_close($handle);

?>
