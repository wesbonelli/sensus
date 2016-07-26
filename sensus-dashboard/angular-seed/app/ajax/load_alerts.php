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

// get session information
$studyName = $_SESSION["viewed_study"];
$participantEmailAddress = $_SESSION["viewed_participant"];

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

// load alerts
if ($studyName == '' && $participantEmailAddress == '') {
	$query = "SELECT sourcestudyname, sourceparticipantemailaddress, timestamp, message FROM alert;";
} else if ($studyName == '') {
	$query = "SELECT sourcestudyname, sourceparticipantemailaddress, timestamp, message FROM alert WHERE sourceparticipantemailaddress = '$participantEmailAddress';";
} else if ($participantEmailAddress == '') {
	$query = "SELECT sourcestudyname, sourceparticipantemailaddress, timestamp, message FROM alert WHERE sourcestudyname = '$studyName';";
} else {
	$query = "SELECT sourcestudyname, sourceparticipantemailaddress, timestamp, message FROM alert WHERE sourcestudyname = '$stuyName' AND sourceparticipantemailaddress = '$participantEmailAddress';";
}
$result = pg_query($handle, $query);
if ($result) {
        while ($row = pg_fetch_assoc($result))
                $values[] = $row;
        $json = json_encode($values);
        echo $json;
} else {
        errorReport(-1, "status:postgresql:queryfailure");
}

// close connection
pg_close($handle);

?>
