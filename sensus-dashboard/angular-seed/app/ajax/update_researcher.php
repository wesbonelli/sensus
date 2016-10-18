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
$researcherId = $_SESSION["user_id"];

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
if (!empty($_POST['firstName'])) {
        if(!get_magic_quotes_gpc()) {
                $firstName = addslashes($_POST['firstName']);
        } else {
                $firstName = $_POST['firstName'];
        }
        // build query
        $query = "UPDATE useraccount SET firstname = '$firstName' WHERE id = '$researcherId';";
        // execute query
        $result = pg_query($handle, $query);
        if (!$result) {
                $error = array('type' => 'database', 'message' => 'queryfailure');
                errorReport(-1, json_encode(array('error' => $error)));
                exit();
        }
}
if (!empty($_POST['lastName'])) {
        if(!get_magic_quotes_gpc()) {
                $lastName = addslashes($_POST['lastName']);
        } else {
                $lastName = $_POST['lastName'];
        }
        // build query
        $query = "UPDATE useraccount SET lastname = '$lastName' WHERE id = '$researcherId';";
        // execute query
        $result = pg_query($handle, $query);
        if (!$result) {
                $error = array('type' => 'database', 'message' => 'queryfailure');
                errorReport(-1, json_encode(array('error' => $error)));
                exit();
        }
}
if (!empty($_POST['emailAddress'])) {
        if(!get_magic_quotes_gpc()) {
                $lastName = addslashes($_POST['emailAddress']);
        } else {
                $lastName = $_POST['emailAddress'];
        }
        // build query
        $query = "UPDATE useraccount SET emailaddress = '$lastName' WHERE id = '$researcherId';";
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
