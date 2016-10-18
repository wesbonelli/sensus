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
$firstName;
$lastName;
$emailAddress;
$password;
if (empty($_POST['firstName']) || empty($_POST['lastName']) || empty($_POST['emailAddress']) || empty($_POST['password'])) {
        $error = array('type' => 'ajax', 'message' => 'missingvalues');
        errorReport(-1, json_encode(array('error' => $error)));
	exit();
}
if(!get_magic_quotes_gpc()) {
        $firstName = addslashes($_POST['firstName']);
        $lastName = addslashes($_POST['lastName']);
        $emailAddress = addslashes($_POST['emailAddress']);
        $password = addslashes($_POST['password']);
} else {
        $firstName = $_POST['firstName'];
        $lastName = $_POST['lastName'];
        $emailAddress = $_POST['emailAddress'];
        $password = $_POST['password'];
}

// check if email address already used
$query = "SELECT id FROM useraccount WHERE emailaddress = '$emailAddress';";
$result = pg_query($handle, $query);
if ($result) {
	while ($row = pg_fetch_assoc($result)) {
                if ($row != null) {
			$id = $row["id"];
			if ($id != null) {
				$error = array('type' => 'database', 'message' => 'duplicateemailaddress');
                        	errorReport(-1, json_encode(array('error' => $error)));
                        	exit();
			}
                }
        }
}

// hash password
$password = password_hash($password, PASSWORD_DEFAULT);

// create new user
$query = "INSERT INTO useraccount (firstname, lastname, emailaddress, password) VALUES ('$firstName', '$lastName', '$emailAddress', '$password');";
$result = pg_query($handle, $query);
if (!$result) {
        $error = array('type' => 'database', 'message' => 'queryfailure');
        errorReport(-1, json_encode(array('error' => $error)));
	exit();
}

// close connection
pg_close($handle);

?>
