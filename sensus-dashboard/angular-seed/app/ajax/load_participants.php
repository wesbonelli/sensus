<?php

header('Access-Control-Allow-Origin: http://ec2-54-227-229-48.compute-1.amazonaws.com/*');
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

// update session
$_SESSION["viewed_participant"] = 0;

// get viewed study
$studyId = $_SESSION["viewed_study"];

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

// load participants
$query = "SELECT id, identifier, studyid, userid, startdate, enddate FROM participant WHERE studyid = '$studyId';";
$result = pg_query($handle, $query);
$participants = null;
//$participantIds = null;
if ($result) {
        while ($row = pg_fetch_assoc($result)) {
        	if ($row != null) {
			//$participantIds[] = $row;
			$participants[] = $row;
		}
	}
} else {
	$error = array('type' => 'database', 'message' => 'queryfailure');
        errorReport(-1, json_encode(array('error' => $error)));
}

// TODO get participant email address if participants are not anonymized
//for ($i = 0; $i < count($participants); $i += 1) {
//	$userId = $participants[$i]["userid"];
        //$currentParticipantId = $participantIds[$i]["studyid"];
//        $query = "SELECT emailaddress FROM useraccount WHERE id = '$userId';";
//        $result = pg_query($handle, $query);
//        if ($result) {
//                $queryData = null;
//                while ($row = pg_fetch_assoc($result)) {
//                        if ($row != null) {
//                                $participants[$i]["emailaddress"] = $row["emailaddress"];
//                        }
//                }
//        } else {
//                $error = array('type' => 'database', 'message' => 'queryfailure');
//                errorReport(-1, json_encode(array('error' => $error)));
//        }
//}
echo json_encode(array('payload' => $participants));

// close connection
pg_close($handle);

?>
