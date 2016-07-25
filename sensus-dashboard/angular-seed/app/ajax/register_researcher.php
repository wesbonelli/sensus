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
$researcherFirstName;
$researcherLastName;
$researcherEmailAddress;
$researcherPassword;
if (empty($_POST['researcherFirstName']) || empty($_POST['researcherLastName']) || empty($_POST['researcherEmailAddress']) || empty($_POST['researcherPassword']))
        errorReport("status:ajax:incompleteform");
if(!get_magic_quotes_gpc()) {
        $researcherFirstName = addslashes($_POST['researcherFirstName']);
        $researcherLastName = addslashes($_POST['researcherLastName']);
        $researcherEmailAddress = addslashes($_POST['researcherEmailAddress']);
	$researcherPassword = addslashes($_POST['researcherPassword']);
} else {
	$researcherFirstName = $_POST['researcherFirstName'];
        $researcherLastName = $_POST['researcherLastName'];
        $researcherEmailAddress = $_POST['researcherEmailAddress'];
        $researcherPassword = $_POST['researcherPassword'];
}

// hash password
$researcherPassword = password_hash($researcherPassword, PASSWORD_DEFAULT);

// build query
$query = "INSERT INTO researcher (firstname, lastname, emailaddress, password) VALUES ('$researcherFirstName', '$researcherLastName', '$researcherEmailAddress', '$researcherPassword');";

// execute query
$result = pg_query($handle, $query);
if (!$result) {
        errorReport(-1, "status:postgresql:queryfailure");
}

// close connection
pg_close($handle);

?>
