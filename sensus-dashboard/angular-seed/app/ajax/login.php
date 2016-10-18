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
	$error = array('type' => 'database', 'message' => 'connectionfailure');
        errorReport(-1, json_encode(array('error' => $error)));
        exit();
}

// check and set POST values
$loginEmailAddress;
$loginPassword;
if (empty($_POST['loginEmailAddress']) || empty($_POST['loginPassword'])) {
	$error = array('type' => 'ajax', 'message' => 'missingvalues');
        errorReport(-1, json_encode(array('error' => $error)));
	exit();
}
if(!get_magic_quotes_gpc()) {
        $loginEmailAddress = addslashes($_POST['loginEmailAddress']);
        $loginPassword = addslashes($_POST['loginPassword']);
} else {
        $loginEmailAddress = $_POST['loginEmailAddress'];
        $loginPassword = $_POST['loginPassword'];
}

// build query
$query = "SELECT password, id FROM useraccount WHERE emailaddress = '$loginEmailAddress';";

// execute query
$result = pg_query($handle, $query);

// check return value
$userId = null;
if ($result) {
	// if no rows were returned, email was incorrect
	if (pg_num_rows($result) == 0)
		echo json_encode(array('payload' => array('authenticate' => 'fail')));
	// if a row was returned, check password
        else {
		$rowArray = pg_fetch_array($result, 0, PGSQL_NUM);
		if (password_verify($loginPassword, $rowArray[0])) {
			$userId = $rowArray[1];
			echo json_encode(array('payload' => array('authenticate' => 'pass', 'userId' => $userId)));
		}
		else {
			echo json_encode(array('payload' => array('authenticate' => 'fail')));
			exit();
		}
	}
} else {
	$error = array('type' => 'database', 'message' => 'queryfailure');
        errorReport(-1, json_encode(array('error' => $error)));
	exit();
}

// start session
session_start();

// update session
$_SESSION["logged_in"] = true;
$_SESSION["user_id"] = $userId;
$_SESSION["user_role"] = '';
$_SESSION["viewed_study"] = 0;
$_SESSION["viewed_participant"] = 0;
$_SESSION["viewed_logentry"] = 0;

// close connection
pg_close($handle);

?>
