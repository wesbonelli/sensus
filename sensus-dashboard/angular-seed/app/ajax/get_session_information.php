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
	$data = array('email_address' => $_SESSION["email_address"],
        	'viewed_study' => $_SESSION["viewed_study"],
        	'viewed_participant' => $_SESSION["viewed_participant"],
        	'viewed_logentry' => $_SESSION["viewed_logentry"]);
	echo json_encode(array('payload' => $data));
}

?>
