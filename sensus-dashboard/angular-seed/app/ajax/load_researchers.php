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

// connect to database
$handle = pg_connect("host = sensus.cq86dmznaris.us-east-1.rds.amazonaws.com port = 5432 dbname = sensus_portal user = ajax password = $pgsqlPassword");
if (!$handle) {
        $error = array('type' => 'database', 'message' => 'connectionfailure');
        errorReport(-1, json_encode(array('error' => $error)));
        exit();
}

// get current study
$studyId = $_SESSION["viewed_study"];

// find the researcherids of all researchers with a relationship to this study
$researcherIds = null;
$query = "SELECT id, userid FROM researcher WHERE studyid = '$studyId';";
$result = pg_query($handle, $query);
if ($result) {
	while ($row = pg_fetch_assoc($result)) {
		if ($row != null) {
			$researcherIds[] = $row;
		}
	}
	//$json = json_encode(array('payload' => $researcherIds));
	//echo $json;
} else {
        $error = array('type' => 'database', 'message' => 'queryfailure');
        errorReport(-1, json_encode(array('error' => $error)));
}

// load the id and name of researchers found
$json = null;
for ($i = 0; $i < count($researcherIds); $i += 1) {
	$currentId = $researcherIds[$i]["userid"];
	$query = "SELECT id, firstname, lastname FROM useraccount where id = '$currentId';";
	$result = pg_query($handle, $query);
	if ($result) {
		$queryData = null;
		while ($row = pg_fetch_assoc($result)) {
			if ($row != null) {
				$researchers[] = $row;
			}
		}
	} else {
		$error = array('type' => 'database', 'message' => 'queryfailure');
		errorReport(-1, json_encode(array('error' => $error)));
	}
}
echo json_encode(array('payload' => $researchers));

// close connection
pg_close($handle);

?>
