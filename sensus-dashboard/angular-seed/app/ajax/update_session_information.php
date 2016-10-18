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

// check and set POST values
if (array_key_exists('logEntryId', $_POST)
	&& array_key_exists('loggedIn', $_POST)
	&& array_key_exists('userId', $_POST)
	&& array_key_exists('userEmailAddress', $_POST)
	&& array_key_exists('userRole', $_POST)
	&& array_key_exists('studyId', $_POST)
	&& array_key_exists('participantId', $_POST)
	&& array_key_exists('logEntryId', $_POST)) {
	if(!get_magic_quotes_gpc()) {
                $logEntryId = addslashes($_POST['logEntryId']);
                $participantId = addslashes($_POST['participantId']);
                $studyId = addslashes($_POST['studyId']);
                $userRole = addslashes($_POST['userRole']);
                $userId = addslashes($_POST['userId']);
		$userEmailAddress = addslashes($_POST['userEmailAddress']);
                $loggedIn = addslashes($_POST['loggedIn']);
        } else {
                $logEntryId = $_POST['logEntryId'];
                $participantId = $_POST['participantId'];
                $studyId = $_POST['studyId'];
                $userRole = $_POST['userRole'];
                $userId = $_POST['userId'];
		$userEmailAddress = $_POST['userEmailAddress'];
                $loggedIn = $_POST['loggedIn'];
        }
} else {
	$error = array('type' => 'ajax', 'message' => 'missingvalues');
        errorReport(-1, json_encode(array('error' => $error)));
        exit();
}

// update session
$_SESSION["logged_in"] = $loggedIn;
$_SESSION["user_id"] = $userId;
$_SESSION["user_email_address"] = $userEmailAddress;
$_SESSION["user_role"] = $userRole;
$_SESSION["viewed_study"] = intval($studyId);
$_SESSION["viewed_participant"] = intval($participantId);
$_SESSION["viewed_logentry"] = intval($logEntryId);

?>
