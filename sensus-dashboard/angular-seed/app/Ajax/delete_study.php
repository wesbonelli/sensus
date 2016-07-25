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

// connect to database
$handle = pg_connect("host = sensus.cq86dmznaris.us-east-1.rds.amazonaws.com port = 5432 dbname = sensus_portal user = ajax password = $pgsqlPassword");
if (!$handle) {
        errorReport(-1, "status:postgresql:connectionfailure");
        exit();
}

// check and set POST values
$studyName;
if (empty($_POST['studyName']))
	errorReport(-1, "status:ajax:missingvalues");
if(! get_magic_quotes_gpc() ) {
	$studyName = addslashes($_POST['studyName']);
} else {
	$studyName = $_POST['studyName'];
}

// execute query
$query = "DELETE FROM study WHERE name = '$studyName'";
$result = pg_query($handle, $query);
if (!$result) {
	errorReport(-1, "status:postgresql:queryfailure");
	exit();
}

// close connection
pg_close($handle);

?>
