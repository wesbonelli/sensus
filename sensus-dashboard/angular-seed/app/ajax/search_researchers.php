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

// get viewed study
$userId = $_SESSION["user_id"];
$studyId = $_SESSION['viewed_study'];

// get POST values
$researcherLastName = '';
$researcherEmailAddress = '';
if (!empty($_POST['researcherLastName'])) {
        if(!get_magic_quotes_gpc()) {
                $researcherLastName = addslashes($_POST['researcherLastName']);
        } else {
                $researcherLastName = $_POST['researcherLastName'];
        }
}
if (!empty($_POST['researcherEmailAddress'])) {
        if(!get_magic_quotes_gpc()) {
                $researcherEmailAddress = addslashes($_POST['researcherEmailAddress']);
        } else {
                $researcherEmailAddress = $_POST['researcherEmailAddress'];
        }
}

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

// find the user ids associated with the researcher role in this study 
//$userAccounts = null;
//$query = "SELECT userid FROM researcher WHERE studyid = '$studyId';";
//$result = pg_query($handle, $query);
//if ($result) {
//	while ($row = pg_fetch_assoc($result)) {
//		if ($row != null) {
//			$userAccounts[]["id"] = $row["userid"];
//		}
//	}
//} else {
//	$error = array('type' => 'database', 'message' => 'queryfailure');
//	errorReport(-1, json_encode(array('error' => $error)));
//}

// filter out the user accounts not associated with the given last name and email address
//for ($i = 0; $i < count($userAccounts); $i += 1) {
//	$currentUserId = $userAccounts[$i]["id"];
	// skip if it's the current user
//	if ($currentUserId == $userId) {
//		continue;
//	}
$userAccounts = null;
	if ($researcherLastName == '' && $researcherEmailAddress == '') {
		$error = array('type' => 'ajax', 'message' => 'missingvalues');
		errorReport(-1, json_encode(array('error' => $error)));
		exit();
	} else if ($researcherLastName == '' && $researcherEmailAddress != '') {
		$query = "SELECT id, firstname, lastname, emailaddress FROM useraccount WHERE emailaddress = '$researcherEmailAddress';";
	} else if ($researcherEmailAddress == '' && $researcherLastName != '') {
		$query = "SELECT id, firstname, lastname, emailaddress FROM useraccount WHERE lastname = '$researcherLastName';";
	} else {
		$query = "SELECT id, firstname, lastname, emailaddress FROM useraccount WHERE emailaddress = '$researcherEmailAddress' AND lastname = '$researcherLastName';";
	}
	$result = pg_query($handle, $query);
	if ($result) {
		while ($row = pg_fetch_assoc($result)) {
			if ($row != null) {
				$userAccounts[] = $row;
			}
		}
	} else {
		$error = array('type' => 'database', 'message' => 'queryfailure');
		errorReport(-1, json_encode(array('error' => $error)));
	}
//}
echo json_encode(array('payload' => $userAccounts));

// close connection
pg_close($handle);

?>
