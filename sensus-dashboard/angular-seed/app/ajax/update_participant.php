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

// get current study
$studyId = $_SESSION["viewed_study"];
$participantId = $_SESSION["viewed_participant"];

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

// for each POST value we have, update the database
if (!empty($_POST['participantStartDate'])) {
        if(!get_magic_quotes_gpc()) {
                $participantStartDate = addslashes($_POST['participantStartDate']);
        } else {
                $participantStartDate = $_POST['participantStartDate'];
        }
        // build query
        $query = "UPDATE participant SET startdate = '$participantStartDate' WHERE id = '$participantId';";
        // execute query
        $result = pg_query($handle, $query);
        if (!$result) {
                $error = array('type' => 'database', 'message' => 'queryfailure');
                errorReport(-1, json_encode(array('error' => $error)));
                exit();
        }
}
if (!empty($_POST['participantEndDate'])) {
        if(!get_magic_quotes_gpc()) {
                $participantEndDate = addslashes($_POST['participantEndDate']);
        } else {
                $participantEndDate = $_POST['participantEndDate'];
        }
        // build query
        $query = "UPDATE participant SET enddate = '$participantEndDate' WHERE id = '$participantId';";
        // execute query
        $result = pg_query($handle, $query);
        if (!$result) {
                $error = array('type' => 'database', 'message' => 'queryfailure');
                errorReport(-1, json_encode(array('error' => $error)));
                exit();
        }
}
if (!empty($_POST['participantIdentifier'])) {
        if(!get_magic_quotes_gpc()) {
                $participantIdentifier = addslashes($_POST['participantIdentifier']);
        } else {
                $participantIdentifier = $_POST['participantIdentifier'];
        }
        // build query
        $query = "UPDATE participant SET identifier = '$participantIdentifier' WHERE id = '$participantId';";
        // execute query
        $result = pg_query($handle, $query);
        if (!$result) {
                $error = array('type' => 'database', 'message' => 'queryfailure');
                errorReport(-1, json_encode(array('error' => $error)));
                exit();
        }
}

// close connection
pg_close($handle);

?>
