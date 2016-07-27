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
$loggedIn = '';
$emailAddress = '';
$viewedStudy = '';
$viewedParticipant = '';
$viewedLogEntry = '';
if (!empty($_POST['loggedIn']))
        if(!get_magic_quotes_gpc()) {
                $loggedIn = addslashes($_POST['loggedIn']);
        } else {
                $loggedIn = $_POST['loggedIn'];
}
if (!empty($_POST['emailAddress']))
        if(!get_magic_quotes_gpc()) {
                $emailAddress = addslashes($_POST['emailAddress']);
        } else {
                $emailAddress = $_POST['emailAddress'];
}
if (!empty($_POST['viewedStudy']))
        if(!get_magic_quotes_gpc()) {
                $viewedStudy = addslashes($_POST['viewedStudy']);
        } else {
                $viewedStudy = $_POST['viewedStudy'];
}
if (!empty($_POST['viewedParticipant']))
	if(!get_magic_quotes_gpc()) {
		$viewedParticipant = addslashes($_POST['viewedParticipant']);
	} else {
        	$viewedParticipant = $_POST['viewedParticipant'];
}
if (!empty($_POST['viewedLogEntry']))
        if(!get_magic_quotes_gpc()) {
                $viewedLogEntry = addslashes($_POST['viewedLogEntry']);
        } else {
                $viewedLogEntry = $_POST['viewedLogEntry'];
}

// update session
if ($loggedIn != '')
	$_SESSION["logged_in"] = $loggedIn;
if ($emailAddress != '')
	$_SESSION["email_address"] = $emailAddress;
if ($viewedStudy != '')
	$_SESSION["viewed_study"] = $viewedStudy;
if ($viewedParticipant != '')
	$_SESSION["viewed_participant"] = $viewedParticipant;
if ($viewedLogEntry != '')
	$_SESSION["viewed_logentry"] = $viewedLogEntry;

?>
