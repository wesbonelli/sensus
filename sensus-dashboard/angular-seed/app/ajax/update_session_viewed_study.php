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
$studyName;
if (empty($_POST['studyName']))
        errorReport(-1, "status:ajax:missingvalues");
if(!get_magic_quotes_gpc()) {
        $studyName = addslashes($_POST['studyName']);
} else {
        $studyName = $_POST['studyName'];
}

// update session
$_SESSION["viewed_study"] = $studyName;

?>
