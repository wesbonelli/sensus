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
$viewedStudyTitle = $_SESSION["viewed_study"];

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
if (!empty($_POST['studyEndDate'])) {
	if(!get_magic_quotes_gpc()) {
                $studyEndDate = addslashes($_POST['studyEndDate']);
        } else {
                $studyEndDate = $_POST['studyEndDate'];
        }
	// build query
	$query = "UPDATE study SET enddate = '$studyEndDate' WHERE title = '$viewedStudyTitle';";
	// execute query
	$result = pg_query($handle, $query);
	if (!$result) {
		$error = array('type' => 'database', 'message' => 'queryfailure');
		errorReport(-1, json_encode(array('error' => $error)));
		exit();
	}
}
if (!empty($_POST['studyDescription'])) {
	if(!get_magic_quotes_gpc()) {
                $studyDescription = addslashes($_POST['studyDescription']);
        } else {
                $studyDescription = $_POST['studyDescription'];
        }
	// build query
	$query = "UPDATE study SET description = '$studyDescription' WHERE title = '$viewedStudyTitle';";
	// execute query
	$result = pg_query($handle, $query);
	if (!$result) {
		$error = array('type' => 'database', 'message' => 'queryfailure');
		errorReport(-1, json_encode(array('error' => $error)));
		exit();
	}
}
if (!empty($_POST['studyTitle'])) { 
        if(!get_magic_quotes_gpc()) { 
                $studyTitle = addslashes($_POST['studyTitle']); 
        } else { 
                $studyTitle = $_POST['studyTitle']; 
        } 
        // update session 
        $_SESSION["viewed_study"] = $studyTitle; 
        // update tabe
        $query = "UPDATE participant SET studytitle = '$studyTitle' WHERE studytitle = '$viewedStudyTitle';";
        $result = pg_query($handle, $query);
	if (!$result) {
                $error = array('type' => 'database', 'message' => 'queryfailure');
                errorReport(-1, json_encode(array('error' => $error)));
                exit();
        }
        $query = "UPDATE logentry SET sourcestudytitle = '$studyTitle' WHERE sourcestudytitle = '$viewedStudyTitle';";
        $result = pg_query($handle, $query);
	if (!$result) {
                $error = array('type' => 'database', 'message' => 'queryfailure');
                errorReport(-1, json_encode(array('error' => $error)));
                exit();
        }
	$query = "UPDATE study SET title = '$studyTitle' WHERE title = '$viewedStudyTitle';"; 
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
