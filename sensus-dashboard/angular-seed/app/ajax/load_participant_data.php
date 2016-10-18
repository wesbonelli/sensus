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

// get study, participant and data type if there is one
$studyId = $_SESSION["viewed_study"];
$participantId = $_SESSION["viewed_participant"];
$type = '';

if ($_SESSION["viewed_participant"] == 0 && array_key_exists('participantId', $_POST)) {
	if(!get_magic_quotes_gpc()) {
                $participantId = addslashes($_POST['participantId']);
	} else {
		$participantId = $_POST['participantId'];
	}
}

if (array_key_exists('type', $_POST)) {
	if(!get_magic_quotes_gpc()) {
                $type = addslashes($_POST['type']);
        } else {
                $type = $_POST['type'];
        }
}

// get database password
$text = file_get_contents('/pgsql-roles/pgsql_roles.json');
$json = json_decode($text, true);
$pgsqlPassword = $json['ajax']['pw'];

// connect to databases
$dataHandle = pg_connect("host = sensus.cq86dmznaris.us-east-1.rds.amazonaws.com port = 5432 dbname = sensus_data_ers user = ajax password = $pgsqlPassword");
if (!$dataHandle) {
        $error = array('type' => 'database', 'message' => 'connectionfailure');
        errorReport(-1, json_encode(array('error' => $error)));
        exit();
}
$portalHandle = pg_connect("host = sensus.cq86dmznaris.us-east-1.rds.amazonaws.com port = 5432 dbname = sensus_portal user = ajax password = $pgsqlPassword");
if (!$portalHandle) {
        $error = array('type' => 'database', 'message' => 'connectionfailure');
        errorReport(-1, json_encode(array('error' => $error)));
        exit();
}

// load participant's device id
$query = "SELECT identifier FROM participant WHERE id = '$participantId';";
$identifier = null;
$result = pg_query($portalHandle, $query);
if ($result) {
	while ($row = pg_fetch_assoc($result)) {
		if ($row != null) {
			$identifier = $row['identifier'];
		}
	}
}

$scriptNames = null;
$scriptData = null;
$scriptRunData = null;
$accelerometerData = null;
$altitudeData = null;
$ambientTemperatureData = null;
$batteryData = null;
$biologicalSexData = null;
$birthdateData = null;
$bloodTypeData = null;
$bluetoothDeviceProximityData = null;
$cellTowerData = null;
$compassData = null;
$facebookData = null;
$heightData = null;
$lightData = null;
$locationData = null;
$participationRewardData = null;
$pointOfInterestProximityData = null;
$protocolReportData = null;
$screenData = null;
$smsData = null;
$soundData = null;
$speedData = null;
$telephonyData = null;
$wlanData = null;

if ($type == "Overview" || $type == 'Status' || $type == 'None') {
	// find script names
        $query = "SELECT DISTINCT scriptname FROM scriptrundatum;";
        $result = pg_query($dataHandle, $query);
        if ($result) {
                while ($row = pg_fetch_assoc($result)) {
                        if ($row != null) {
                                $scriptNames[] = $row;
                        }
                }
        }

        // load script and script run data
        $query = "SELECT DISTINCT ON (runid) runid, id, timestamp, protocolid, scriptname FROM scriptdatum WHERE identifier = '$identifier' ORDER BY runid;";
        $result = pg_query($dataHandle, $query);
        if ($result) {
                while ($row = pg_fetch_assoc($result)) {
                        if ($row != null) {
                                $scriptData[] = $row;
                        }
                }
        }

        $query = "SELECT DISTINCT ON (runid) runid, id, timestamp, protocolid, scriptname FROM scriptrundatum WHERE identifier = '$identifier' ORDER BY runid";
        $result = pg_query($dataHandle, $query);
        if ($result) {
                while ($row = pg_fetch_assoc($result)) {
                        if ($row != null) {
                                $scriptRunData[] = $row;
                        }
                }
        }

	$limit = 1;
	$type = "Overview";
} else {
	$limit = 10000;
}

if ($type == 'Script' || $type == 'all') {
	// find script names
	$query = "SELECT DISTINCT scriptname FROM scriptrundatum WHERE identifier = '$identifier';";
	$result = pg_query($dataHandle, $query);
	if ($result) {
		while ($row = pg_fetch_assoc($result)) {
			if ($row != null) {
				$scriptNames[] = $row;
			}
		}
	}

	// load script and script run data
	$query = "SELECT DISTINCT ON (runid) runid, id, timestamp, protocolid, scriptname FROM scriptdatum WHERE identifier = '$identifier' ORDER BY runid;";
	$result = pg_query($dataHandle, $query);
	if ($result) {
		while ($row = pg_fetch_assoc($result)) {
			if ($row != null) {
				$scriptData[] = $row;
			}
		}
	}

	$query = "SELECT DISTINCT ON (runid) runid, id, timestamp, protocolid, scriptname FROM scriptrundatum WHERE identifier = '$identifier' ORDER BY runid;";
	$result = pg_query($dataHandle, $query);
	if ($result) {
		while ($row = pg_fetch_assoc($result)) {
			if ($row != null) {
				$scriptRunData[] = $row;
			}
		}
	}
}

if ($type == 'Accelerometer' || $type == 'all' || $type == 'Overview') {
	$query = "SELECT id, timestamp, protocolid, deviceid FROM accelerometerdatum WHERE identifier = '$identifier' ORDER BY timestamp ASC LIMIT '$limit';";
	$result = pg_query($dataHandle, $query);
	if ($result) {
		while ($row = pg_fetch_assoc($result)) {
			if ($row != null) {
				$accelerometerData[] = $row;
			}
		}
	}
}

if ($type == 'Battery' || $type == 'all'  || $type == 'Overview') {
	$query = "SELECT id, timestamp, protocolid FROM batterydatum WHERE identifier = '$identifier' ORDER BY timestamp ASC LIMIT '$limit';";
	$result = pg_query($dataHandle, $query);
	if ($result) {
		while ($row = pg_fetch_assoc($result)) {
			if ($row != null) {
				$batteryData[] = $row;
			}
		}
	}
}

if ($type == 'Altitude' || $type == 'all' || $type == 'Overview') {
	$query = "SELECT id, timestamp, protocolid FROM altitudedatum WHERE identifier = '$identifier' ORDER BY timestamp ASC LIMIT '$limit';";
	$result = pg_query($dataHandle, $query);
	if ($result) {
		while ($row = pg_fetch_assoc($result)) {
			if ($row != null) {
				$altitudeData[] = $row;
			}
		}
	}
}

if ($type == 'Ambient Temperature' || $type == 'all' || $type == 'Overview') {
	$query = "SELECT id, timestamp, protocolid FROM ambienttemperaturedatum WHERE identifier = '$identifier' ORDER BY timestamp ASC LIMIT '$limit';";
	$result = pg_query($dataHandle, $query);
	if ($result) {
		while ($row = pg_fetch_assoc($result)) {
			if ($row != null) {
				$ambientTemperatureData[] = $row;
			}
		}
	}
}

if ($type == 'Biological Sex' || $type == 'all' || $type == 'Overview') {
	$query = "SELECT id, timestamp, protocolid FROM biologicalsexdatum WHERE identifier = '$identifier' ORDER BY timestamp ASC LIMIT '$limit';";
	$result = pg_query($dataHandle, $query);
	if ($result) {
		while ($row = pg_fetch_assoc($result)) {
			if ($row != null) {
				$biologicalSexData[] = $row;
			}
		}
	}
}

if ($type == 'Birthdate' || $type == 'all' || $type == 'Overview') {
	$query = "SELECT id, timestamp, protocolid FROM birthdatedatum WHERE identifier = '$identifier' ORDER BY timestamp ASC LIMIT '$limit';";
	$result = pg_query($dataHandle, $query);
	if ($result) {
		while ($row = pg_fetch_assoc($result)) {
			if ($row != null) {
				$birthdateData[] = $row;
			}
		}
	}
}

if ($type == 'Blood Type' || $type == 'all' || $type == 'Overview') {
	$query = "SELECT id, timestamp, protocolid FROM bloodtypedatum WHERE identifier = '$identifier' ORDER BY timestamp ASC LIMIT '$limit';";
	$result = pg_query($dataHandle, $query);
	if ($result) {
		while ($row = pg_fetch_assoc($result)) {
			if ($row != null) {
				$bloodTypeData[] = $row;
			}
		}
	}
}

if ($type == 'Bluetooth Device Proximity' || $type == 'all' || $type == 'Overview') {
	$query = "SELECT id, timestamp, protocolid FROM bluetoothdeviceproximitydatum WHERE identifier = '$identifier' ORDER BY timestamp ASC LIMIT '$limit';";
	$result = pg_query($dataHandle, $query);
	if ($result) {
		while ($row = pg_fetch_assoc($result)) {
			if ($row != null) {
				$bluetoothDeviceProximityData[] = $row;
			}
		}
	}
}

if ($type == 'Cell Tower' || $type == 'all' || $type == 'Overview') {
	$query = "SELECT id, timestamp, protocolid FROM celltowerdatum WHERE identifier = '$identifier' ORDER BY timestamp ASC LIMIT '$limit';";
	$result = pg_query($dataHandle, $query);
	if ($result) {
		while ($row = pg_fetch_assoc($result)) {
			if ($row != null) {
				$cellTowerData[] = $row;
			}
		}
	}
}

if ($type == 'Compass' || $type == 'all' || $type == 'Overview') {
	$query = "SELECT id, timestamp, protocolid FROM compassdatum WHERE identifier = '$identifier' ORDER BY timestamp ASC LIMIT '$limit';";
	$result = pg_query($dataHandle, $query);
	if ($result) {
		while ($row = pg_fetch_assoc($result)) {
			if ($row != null) {
				$compassData[] = $row;
			}
		}
	}
}

if ($type == 'Facebook' || $type == 'all' || $type == 'Overview') {
	$query = "SELECT id, timestamp, protocolid FROM facebookdatum WHERE identifier = '$identifier' ORDER BY timestamp ASC LIMIT '$limit';";
	$result = pg_query($dataHandle, $query);
	if ($result) {
		while ($row = pg_fetch_assoc($result)) {
			if ($row != null) {
				$cellTowerData[] = $row;
			}
		}
	}
}

if ($type == 'Height' || $type == 'all' || $type == 'Overview') {
	$query = "SELECT id, timestamp, protocolid FROM heightdatum WHERE identifier = '$identifier' ORDER BY timestamp ASC LIMIT '$limit';";
	$result = pg_query($dataHandle, $query);
	if ($result) {
		while ($row = pg_fetch_assoc($result)) {
			if ($row != null) {
				$heightData[] = $row;
			}
		}
	}
}

if ($type == 'Light' || $type == 'all' || $type == 'Overview') {
	$query = "SELECT id, timestamp, protocolid FROM lightdatum WHERE identifier = '$identifier' ORDER BY timestamp ASC LIMIT '$limit';";
	$result = pg_query($dataHandle, $query);
	if ($result) {
		while ($row = pg_fetch_assoc($result)) {
			if ($row != null) {
				$lightData[] = $row;
			}
		}
	}
}

if ($type == 'Location' || $type == 'all' || $type == 'Overview') {
	$query = "SELECT id, timestamp, protocolid, deviceid FROM locationdatum WHERE identifier = '$identifier' ORDER BY timestamp ASC LIMIT '$limit';";
	$result = pg_query($dataHandle, $query);
	if ($result) {
		while ($row = pg_fetch_assoc($result)) {
			if ($row != null) {
				$locationData[] = $row;
			}
		}
	}
}

if ($type == 'Participation Reward' || $type == 'all' || $type == 'Overview') {
	$query = "SELECT id, timestamp, protocolid FROM participationrewarddatum WHERE identifier = '$identifier' ORDER BY timestamp ASC LIMIT '$limit';";
	$result = pg_query($dataHandle, $query);
	if ($result) {
		while ($row = pg_fetch_assoc($result)) {
			if ($row != null) {
				$participationRewardData[] = $row;
			}
		}
	}
}

if ($type == 'Point Of Interest Proximity' || $type == 'all' || $type == 'Overview') {
	$query = "SELECT id, timestamp, protocolid FROM pointofinterestproximitydatum WHERE identifier = '$identifier' ORDER BY timestamp ASC LIMIT '$limit';";
	$result = pg_query($dataHandle, $query);
	if ($result) {
		while ($row = pg_fetch_assoc($result)) {
			if ($row != null) {
				$pointOfInterestProximityData[] = $row;
			}
		}
	}
}

if ($type == 'Protocol Report' || $type == 'all' || $type == 'Overview') {
	$query = "SELECT id, timestamp, protocolid FROM protocolreportdatum WHERE identifier = '$identifier' ORDER BY timestamp ASC LIMIT '$limit';";
	$result = pg_query($dataHandle, $query);
	if ($result) {
		while ($row = pg_fetch_assoc($result)) {
			if ($row != null) {
				$protocolReportData[] = $row;
			}
		}
	}
}

if ($type == 'Screen' || $type == 'all' || $type == 'Overview') {
	$query = "SELECT id, timestamp, protocolid FROM screendatum WHERE identifier = '$identifier' ORDER BY timestamp ASC LIMIT '$limit';";
	$result = pg_query($dataHandle, $query);
	if ($result) {
		while ($row = pg_fetch_assoc($result)) {
			if ($row != null) {
				$screenData[] = $row;
			}
		}
	}
}

if ($type == 'Speed' || $type == 'all' || $type == 'Overview') {
	$query = "SELECT id, timestamp, protocolid FROM speeddatum WHERE identifier = '$identifier' ORDER BY timestamp ASC LIMIT '$limit';";
	$result = pg_query($dataHandle, $query);
	if ($result) {
		while ($row = pg_fetch_assoc($result)) {
			if ($row != null) {
				$speedData[] = $row;
			}
		}
	}
}

if ($type == 'Telephony' || $type == 'all' || $type == 'Overview') {
	$query = "SELECT id, timestamp, protocolid FROM telephonydatum WHERE identifier = '$identifier' ORDER BY timestamp ASC LIMIT '$limit';";
	$result = pg_query($dataHandle, $query);
	if ($result) {
		while ($row = pg_fetch_assoc($result)) {
			if ($row != null) {
				$telephonyData[] = $row;
			}
		}
	}
}

if ($type == 'WLAN' || $type == 'all' || $type == 'Overview') {
	$query = "SELECT id, timestamp, protocolid FROM wlandatum WHERE identifier = '$identifier' ORDER BY timestamp ASC LIMIT '$limit';";
	$result = pg_query($dataHandle, $query);
	if ($result) {
		while ($row = pg_fetch_assoc($result)) {
			if ($row != null) {
				$wlanData[] = $row;
			}
		}
	}
}

echo json_encode(array('payload' => array(
	'scriptNames' => $scriptNames,
	'scriptData' => $scriptData,
	'scriptRunData' => $scriptRunData,
	'accelerometerData' => $accelerometerData,
	'altitudeData' => $altitudeData,
	'ambientTemperatureData' => $ambientTemperatureData,
	'batteryData' => $batteryData,
	'biologicalSexData' => $biologicalSexData,
	'birthdateData' => $birthdateData,
	'bloodTypeData' => $bloodTypeData,
	'bluetoothDeviceProximityData' => $bluetoothDeviceProximityData,
	'cellTowerData' => $cellTowerData,
	'compassData' => $compassData,
	'facebookData' => $facebookData,
	'heightData' => $heightData,
	'lightData' => $lightData,
	'locationData' => $locationData,
	'participationRewardData' => $participationRewardData,
	'pointOfInterestProximityData' => $pointOfInterestProximityData,
	'protocolReportData' => $protocolReportData,
	'screenData' => $screenData,
	'smsData' => $smsData,
	'soundData' => $soundData,
	'speedData' => $speedData,
	'telephonyData' => $telephonyData,
	'wlanData' => $wlanData
	)));

// close connection
pg_close($dataHandle);
pg_close($portalHandle);
?>
