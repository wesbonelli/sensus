<?php

header('Access-Control-Allow-Origin: http://ec2-54-227-229-48.compute-1.amazonaws.com/app/*');
ini_set('display_errors', 0);
include('app.php');
set_error_handler('errorReport');

// start session
session_start();

// check if user is logged in and return information if so
if (!isset($_SESSION["logged_in"])) {
        $error = array('type' => 'session', 'message' => 'doesnotexist');
        errorReport(-1, json_encode(array('error' => $error)));
        exit();
}
else if ($_SESSION["logged_in"] == false) {
        $error = array('type' => 'session', 'message' => 'expired');
        errorReport(-1, json_encode(array('error' => $error)));
        exit();
} else {
	$data = array('logged_in' => $_SESSION["logged_in"],
		'user_id' => $_SESSION["user_id"],
		'user_email_address' => $_SESSION["user_email_address"],
		'user_role' => $_SESSION["user_role"],
        	'study_id' => intval($_SESSION["viewed_study"]),
        	'participant_id' => intval($_SESSION["viewed_participant"]),
        	'logentry_id' => intval($_SESSION["viewed_logentry"]));
	echo json_encode(array('payload' => $data));
}

?>
