<?php

header('Access-Control-Allow-Origin: http://ec2-54-227-229-48.compute-1.amazonaws.com/app/*');
ini_set('display_errors', 1);
include('app.php');
set_error_handler('errorReport');

// start session
session_start();

// check if user is logged in
if ($_SESSION["logged_in"] == false) {
        errorReport(-1, "status:session:expired");
        exit();
}

// check and set POST values
$participantId;
if (empty($_POST['participantId']))
        errorReport(-1, "status:ajax:missingvalues");
if(!get_magic_quotes_gpc()) {
        $participantId = addslashes($_POST['participantId']);
} else {
        $participantId = $_POST['participantId'];
}

// update session
$_SESSION["viewed_participant"] = $participantId;

?>
