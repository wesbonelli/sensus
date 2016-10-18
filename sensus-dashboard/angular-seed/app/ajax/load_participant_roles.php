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

// find all the studies the user is involved with as a participant
$studyIds = null;
$query = "SELECT * FROM participant WHERE userid = '$userId';";
$result = pg_query($handle, $query);
if ($result) {
        while ($row = pg_fetch_assoc($result)) {
                if ($row != null) {
                        $studyIds[] = $row;
                }
        }
} else {
        $error = array('type' => 'database', 'message' => 'queryfailure');
        errorReport(-1, json_encode(array('error' => $error)));
}

// load the studies
$studies = null;
$json = null;
for ($i = 0; $i < count($studyIds); $i += 1) {
        $id = intval($studyIds[$i]["studyid"]);
        $query = "SELECT id, title, startdate, enddate, description FROM study WHERE id = '$id';";
        $result = pg_query($handle, $query);
        if ($result) {
                while ($row = pg_fetch_assoc($result)) {
                        if ($row != null) {
                                $studies[] = $row;
                        }
                }
        } else {
                $error = array('type' => 'database', 'message' => 'queryfailure');
                errorReport(-1, json_encode(array('error' => $error)));
        }
}
$json = json_encode(array('payload' => $studies));
echo $json;

// close connection
pg_close($handle);

?>
