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
$loginEmailAddress;
$loginPassword;
if (empty($_POST['loginEmailAddress']) || empty($_POST['loginPassword'])) {
        errorReport(-1, "status:ajax:incompleteform");
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
$query = "SELECT password FROM researcher WHERE emailaddress = '$loginEmailAddress';";

// execute query
$result = pg_query($handle, $query);

// check return value
if ($result) {
	// if no rows were returned, email was incorrect
	if (pg_num_rows($result) == 0)
                echo "authenticate:fail";
	// if a row was returned, check password
        else {
		$rowArray = pg_fetch_array($result, 0, PGSQL_NUM);
		if (password_verify($loginPassword, $rowArray[0])) {
			echo "authenticate:pass";
		}
		else {
			echo "authenticate:fail";
			exit();
		}
	}
} else {
        errorReport(-1, "status:postgresql:queryfailure");
	exit();
}

// start session
session_start();

// update session
$_SESSION["logged_in"] = true;
$_SESSION["user_email_address"] = $loginEmailAddress;
$_SESSION["viewed_study"] = '';
$_SESSION["viewed_participant"] = '';

// close connection
pg_close($handle);

?>
