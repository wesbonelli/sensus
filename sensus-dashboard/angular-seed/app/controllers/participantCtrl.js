'use strict';

angular.module('SensusPortal.participantCtrl', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/participant', {
    templateUrl: 'views/participant.html',
    controller: 'participantCtrl'
  });
}])

.controller('participantCtrl', ['$scope', '$rootScope', '$http', '$location', '$route', 'httpHandler', 'sessionHandler', 'headerMenuHandler', function($scope, $rootScope, $http, $location, $route, httpHandler, sessionHandler, headerMenuHandler) {

	function addDays(date, days) {
	    	var result = new Date(date);
	    	result.setDate(result.getDate() + days);
	    	return result;
	};
	var daysBetween = function(date1, date2) {
                var oneDay=1000*60*60*24;
                var date1MS = date1.getTime();
                var date2MS = date2.getTime();
                var differenceMS = date2MS - date1MS;
                return Math.round(differenceMS/oneDay);
        };

        $scope.study = {
                'id' : '',
                'title' : '',
		'startDate' : null,
		'endDate' : null
        };
        $scope.loadStudy = function() {
		httpHandler.get('http://ec2-184-72-207-243.compute-1.amazonaws.com/app-Wes/ajax/load_study.php', 'json').then(function(data) {
                        if (data.error == null && data.payload != null) {
                                $scope.study.id = data.payload[0].id;
                                $scope.study.title = data.payload[0].title;
				$rootScope.navigationStackMenu.push($scope.study.title);
				$scope.study.startDate = data.payload[0].startdate != null ? new Date(data.payload[0].startdate.substr(0, data.payload[0].startdate.length - 3).replace(' ','T')+'Z') : null;
				$scope.study.endDate = data.payload.enddate != null ? new Date(data.payload[0].enddate.substr(0, data.payload[0].enddate.length - 3).replace(' ','T')+'Z') : null;
				$scope.loadParticipant();
                        } else if (data.error != null) {
                                if (data.error.type == "session") {
                                        if (data.error.message == "expired" || data.error.message == "doesnotexist") {
                                                $location.path('/login');
                                        }
                                }
                        }
                });
        };

	$scope.participant = {
		'id' : '',
		'studyId' : '',
		'identifier' : '',
		'startDate' : '',
		'endDate' : '',
		'lastDataType' : '',
		'lastDataTimestamp' : '',
		'lastDataMessage' : ''
	};
	$scope.participantDays = [];
        $scope.loadParticipant = function() {
		httpHandler.get('http://ec2-184-72-207-243.compute-1.amazonaws.com/app-Wes/ajax/load_participant.php', 'json').then(function(data) {
                        if (data.error == null && data.payload != null) {
				$scope.participant.studyId = data.payload.studyid != null ? data.payload.studyid : 0;
				$scope.participant.deviceId = data.payload.deviceid != null ? data.payload.deviceid : 'None';
				$scope.participant.emailAddress = data.payload.emailAddress != null ? data.payload.emailAddress : "None";
				$scope.participant.identifier = data.payload.identifier != null ? data.payload.identifier : 'None';
				$scope.participant.startDate = data.payload.startdate != null ? new Date(data.payload.startdate.substr(0, data.payload.startdate.length - 3).replace(' ','T')+'Z') : null;
				$scope.participant.endDate = data.payload.enddate != null ? new Date(data.payload.enddate.substr(0, data.payload.enddate.length - 3).replace(' ','T')+'Z') : null;
				$scope.participant.startDate.setHours($scope.participant.startDate.getHours()+4);
				$scope.participant.endDate.setHours($scope.participant.endDate.getHours()+4);
				$scope.participant.lastDataType = data.payload.lastdatatype != null ? data.payload.lastdatatype : 'None';
				$scope.participant.lastDataTimestamp = data.payload.lastdatatimestamp != null ? data.payload.lastdatatimestamp : '';
				if ($scope.participant.lastDataType != '' && $scope.participant.lastDataTimestamp != '') {
					$scope.participant.lastDataMessage = $scope.participant.lastDataType + ', ';
				} else {
					$scope.participant.lastDataMessage = 'None';
				}
				
				$scope.updateParticipantEmailAddressDisplayText();
				if ($scope.participant.emailAddress == "None") {
					document.getElementById("showHideEmailAddressButton").style.display = "none";
				}

				if ($scope.participant.startDate != null && $scope.participant.endDate != null) {
					for (var i = 0; i < daysBetween($scope.participant.startDate, $scope.participant.endDate); i += 1) {
						var date = addDays($scope.participant.startDate, i);
						if (date > Date.now()) continue;
						$scope.participantDays.push({
							index : i,
							date : date,
							scriptRuns : [],
							scriptResponses : []
						});
					}
				}

				$rootScope.navigationStackMenu.push("Participants");
                                $rootScope.navigationStackMenu.push($scope.participant.identifier);
                        } else if (data.error != null) {
                                if (data.error.type == "session" && data.error.message == "doesnotexist") {
                                        $location.path('/login');
                                }
                        }
                });
        };
	$scope.deleteParticipant = function() {
		if (confirm("Unregister participant? Associated information and log entries will be deleted.")) {
			httpHandler.get('http://ec2-184-72-207-243.compute-1.amazonaws.com/app-Wes/ajax/delete_participant.php', 'json').then(function(data) {
				if (data.error == null && data.payload == null) {
					alert("Participant deleted successfully.");
					$location.path('/participants');
				} else if (data.error != null) {
					if (data.error.type == "session" && data.error.message == "doesnotexist") {
						$location.path('/login');
					}
				}
			});
		}
	};

	$scope.participantData = {
		'participantDays' : [],
		'scriptNames' : [],
		'scriptData' : [],
		'scriptRunData' : [],
		'accelerometerData' : [],
		'altitudeData' : [],
		'ambientTemperatureData' : [],
		'batteryData' : [],
		'biologicalSexData' : [],
		'birthdateData' : [],
		'bloodTypeData' : [],
		'bluetoothDeviceProximityData' : [],
		'cellTowerData' :[],
		'compassData' : [],
		'facebookData' : [],
		'heightData' : [],
		'lightData' : [],
		'locationData' : [],
		'participationRewardData' : [],
		'pointOfInterestProximityData' : [],
		'protocolReportData' : [],
		'screenData' : [],
		'smsData' : [],
		'soundData' : [],
		'speedData' : [],
		'telephonyData' : [],
		'wlanData' : []
	};
	$scope.scriptNames = [];
	$scope.mostRecentTimestamp = new Date("January 1, 1970 00:00:00");
	$scope.loadParticipantData = function() {
		var data = 'type=all';
		httpHandler.post('http://ec2-184-72-207-243.compute-1.amazonaws.com/app-Wes/ajax/load_participant_data.php', data).then(function(data) {
                        if (data.error == null && data.payload != null) {
				if ($scope.participant.startDate != null && $scope.participant.endDate != null) {
					$scope.participantData.participantDays = [];
					for (var i = 0; i <= daysBetween($scope.participant.startDate, $scope.participant.endDate); i += 1) {
						var date = addDays($scope.participant.startDate, i);
						date.setHours(date.getHours()+4);
						if (date > Date.now()) {
							break;
						}
						$scope.participantData.participantDays.push({
							index : i,
							date : date,
							studyStartIndex : daysBetween($scope.study.startDate, date),
							scriptRuns : [],
							scriptResponses : []
						});
					}
				}
				if (data.payload.scriptNames != null) {
					for (var i = 0; i < data.payload.scriptNames.length; i += 1) {
						$scope.participantData.scriptNames.push(data.payload.scriptNames[i]);
					}
				}

				if (data.payload.scriptData != null) {
					for (var i = 0; i < data.payload.scriptData.length; i += 1) {
						var timestamp = new Date(data.payload.scriptData[i].timestamp.substr(0, data.payload.scriptData[i].timestamp.length - 3).replace(' ','T')+'Z');
						var day = daysBetween($scope.participant.startDate, timestamp);
						for (var k = 0; k < $scope.participantDays.length; k += 1) {
							if ($scope.participantDays[k].index == day) {
								$scope.participantDays[k].scriptResponses.push({
									index : day,
									name : data.payload.scriptData[i].scriptname
								});
							}
						}
						for (var j = 0; j < $scope.participantData.scriptNames.length; j += 1) {
							if ($scope.participantData.scriptNames[j].scriptname == data.payload.scriptData[i].scriptname) {
								if ($scope.participantData.scriptNames[j].scriptCount == null) {
                                                                        $scope.participantData.scriptNames[j].scriptCount = 1;
                                                                }
								$scope.participantData.scriptNames[j].scriptCount += 1;
							}
						}
						$scope.participantData.scriptData.push({
							id : data.payload.scriptData[i].id,
							timestamp : timestamp,
							protocolId : data.payload.scriptData[i].protocolid,
							scriptName : data.payload.scriptData[i].scriptname
						});
						if (!($.inArray(data.payload.scriptData[i].scriptname, $scope.scriptNames) > -1)) {
							$scope.scriptNames.push(data.payload.scriptData[i].scriptname);
						}
						if (timestamp > $scope.mostRecentTimestamp) {
							$scope.mostRecentTimestamp = timestamp;
						}
					}
				}

				if (data.payload.scriptRunData != null) {
					for (var i = 0; i < data.payload.scriptRunData.length; i += 1) {
						var timestamp = new Date(data.payload.scriptRunData[i].timestamp.substr(0, data.payload.scriptRunData[i].timestamp.length - 3).replace(' ','T')+'Z');
						var day = daysBetween($scope.participant.startDate, timestamp);
                                                for (var k = 0; k < $scope.participantDays.length; k += 1) {
                                                        if ($scope.participantDays[k].index == day) {
                                                                $scope.participantDays[k].scriptRuns.push({
                                                                        index : day,
                                                                        name : data.payload.scriptRunData[i].scriptname
                                                                });
                                                        }
                                                }
						for (var j = 0; j < $scope.participantData.scriptNames.length; j += 1) {
                                                        if ($scope.participantData.scriptNames[j].scriptname == data.payload.scriptRunData[i].scriptname) {
                                                                if ($scope.participantData.scriptNames[j].scriptRunCount == null) {
									$scope.participantData.scriptNames[j].scriptRunCount = 0;
								}
								$scope.participantData.scriptNames[j].scriptRunCount += 1;
                                                        }
                                                }
						$scope.participantData.scriptRunData.push({
							id : data.payload.scriptRunData[i].id,
							timestamp : timestamp,
							protocolId : data.payload.scriptRunData[i].protocolid,
							scriptName : data.payload.scriptRunData[i].scriptname
						});
						if (!($.inArray(data.payload.scriptRunData[i].scriptname, $scope.scriptNames) > -1)) {
							$scope.scriptNames.push(
								data.payload.scriptRunData[i].scriptname
								
							);
						}
						if (timestamp > $scope.mostRecentTimestamp) {
							$scope.mostRecentTimestamp = timestamp;
						}
					}
				}
				
				if ($scope.participantData.scriptData.length > $scope.participantData.scriptRunData.length) {
					$scope.overallScriptResponseRate = 1.0;
				} else {
					$scope.overallScriptResponseRate = $scope.participantData.scriptData.length / $scope.participantData.scriptRunData.length;
				}
				if ($scope.participantData.scriptData.length > (7 * $scope.participantData.participantDays.length)) {
					$scope.overallDesiredScriptResponseRate = 1.0
				} else {
					$scope.overallDesiredScriptResponseRate = $scope.participantData.scriptData.length / (7 * $scope.participantData.participantDays.length);
				}
		
				if (data.payload.accelerometerData != null) {
					for (var i = 0; i < data.payload.accelerometerData.length; i += 1) {
						$scope.participantData.accelerometerData.push({
							id : data.payload.accelerometerData[i].id,
							timestamp : new Date(data.payload.accelerometerData[i].timestamp.substr(0, data.payload.accelerometerData[i].timestamp.length - 3).replace(' ','T')+'Z'),
							protocolId : data.payload.accelerometerData[i].protocolid,
						});
					}
				}

				if (data.payload.altitudeData != null) {
					for (var i = 0; i < data.payload.altitudeData.length; i += 1) {
						$scope.participantData.altitudeData.push({
							id : data.payload.altitudeData[i].id,
							timestamp : new Date(data.payload.altitudeData[i].timestamp.substr(0, data.payload.altitude[i].timestamp.length - 3).replace(' ','T')+'Z'),
							protocolId : data.payload.altitudeData[i].protocolid,
						});
					}
				}

				if (data.payload.ambientTemperatureData != null) {
					for (var i = 0; i < data.payload.ambientTemperatureData.length; i += 1) {
						$scope.participantData.ambientTemperatureData.push({
							id : data.payload.ambientTemperatureData[i].id,
							timestamp : new Date(data.payload.ambientTemperatureData[i].timestamp.substr(0, data.payload.ambientTemperatureData[i].timestamp.length - 3).replace(' ','T')+'Z'),
							protocolId : data.payload.ambientTemperatureData[i].protocolid,
						});
					}
				}

				if (data.payload.batteryData != null) {
					for (var i = 0; i < data.payload.batteryData.length; i += 1) {
						$scope.participantData.batteryData.push({
							id : data.payload.batteryData[i].id,
							timestamp : new Date(data.payload.batteryData[i].timestamp.substr(0, data.payload.batteryData[i].timestamp.length - 3).replace(' ','T')+'Z'),
							protocolId : data.payload.batteryData[i].protocolid,
						});
					}
				}

				if (data.payload.biologicalSexData != null) {
					for (var i = 0; i < data.payload.biologicalSexData.length; i += 1) {
						$scope.participantData.biologicalSexData.push({
							id : data.payload.biologicalSexData[i].id,
							timestamp : new Date(data.payload.biologicalSexData[i].timestamp.substr(0, data.payload.biologicalSexData[i].timestamp.length - 3).replace(' ','T')+'Z'),
							protocolId : data.payload.biologicalSexData[i].protocolid,
						});
					}
				}

				if (data.payload.birthdateData != null) {
					for (var i = 0; i < data.payload.birthdateData.length; i += 1) {
						$scope.participantData.birthdateData.push({
							id : data.payload.birthdateData[i].id,
							timestamp : new Date(data.payload.birthdateData[i].timestamp.substr(0, data.payload.birthdateData[i].timestamp.length - 3).replace(' ','T')+'Z'),
							protocolId : data.payload.birthdateData[i].protocolid,
						});
					}
				}

				if (data.payload.bloodTypeData != null) {
					for (var i = 0; i < data.payload.bloodTypeData.length; i += 1) {
						$scope.participantData.bloodTypeData.push({
							id : data.payload.bloodTypeData[i].id,
							timestamp : new Date(data.payload.bloodTypeData[i].timestamp.substr(0, data.payload.bloodTypeData[i].timestamp.length - 3).replace(' ','T')+'Z'),
							protocolId : data.payload.bloodTypeData[i].protocolid,
						});
					}
				}

				if (data.payload.bluetoothDeviceProximityData != null) {
					for (var i = 0; i < data.payload.bluetoothDeviceProximityData.length; i += 1) {
						$scope.participantData.bluetoothDeviceProximityData.push({
							id : data.payload.bluetoothDeviceProximityData[i].id,
							timestamp : new Date(data.payload.bluetoothDeviceProximityData[i].timestamp.substr(0, data.payload.bluetoothDeviceProximityData[i].timestamp.length - 3).replace(' ','T')+'Z'),
							protocolId : data.payload.bluetoothDeviceProximityData[i].protocolid,
						});
					}
				}

				if (data.payload.cellTowerData != null) {
					for (var i = 0; i < data.payload.cellTowerData.length; i += 1) {
						$scope.participantData.cellTowerData.push({
							id : data.payload.cellTowerData[i].id,
							timestamp : new Date(data.payload.cellTowerData[i].timestamp.substr(0, data.payload.cellTowerData[i].timestamp.length - 3).replace(' ','T')+'Z'),
							protocolId : data.payload.cellTowerData[i].protocolid,
						});
					}
				}

				if (data.payload.compassData != null) {
					for (var i = 0; i < data.payload.compassData.length; i += 1) {
						$scope.participantData.compassData.push({
							id : data.payload.compassData[i].id,
							timestamp : new Date(data.payload.compassData[i].timestamp.substr(0, data.payload.compassData[i].timestamp.length - 3).replace(' ','T')+'Z'),
							protocolId : data.payload.compassData[i].protocolid,
						});
					}
				}

				if (data.payload.facebookData != null) {
					for (var i = 0; i < data.payload.facebookData.length; i += 1) {
						$scope.participantData.facebookData.push({
							id : data.payload.facebookData[i].id,
							timestamp : new Date(data.payload.facebookData[i].timestamp.substr(0, data.payload.facebookData[i].timestamp.length - 3).replace(' ','T')+'Z'),
							protocolId : data.payload.facebookData[i].protocolid,
						});
					}
				}

				if (data.payload.heightData != null) {
					for (var i = 0; i < data.payload.heightData.length; i += 1) {
						$scope.participantData.heightData.push({
							id : data.payload.heightData[i].id,
							timestamp : new Date(data.payload.heightData[i].timestamp.substr(0, data.payload.heightData[i].timestamp.length - 3).replace(' ','T')+'Z'),
							protocolId : data.payload.heightData[i].protocolid,
						});
					}
				}

				if (data.payload.lightData != null) {
					for (var i = 0; i < data.payload.lightData.length; i += 1) {
						$scope.participantData.lightData.push({
							id : data.payload.lightData[i].id,
							timestamp : new Date(data.payload.lightData[i].timestamp.substr(0, data.payload.lightData[i].timestamp.length - 3).replace(' ','T')+'Z'),
							protocolId : data.payload.lightData[i].protocolid,
						});
					}
				}

				if (data.payload.locationData != null) {
					for (var i = 0; i < data.payload.locationData.length; i += 1) {
						$scope.participantData.locationData.push({
							id : data.payload.locationData[i].id,
							timestamp : new Date(data.payload.locationData[i].timestamp.substr(0, data.payload.locationData[i].timestamp.length - 3).replace(' ','T')+'Z'),
							protocolId : data.payload.locationData[i].protocolid,
						});
					}
				}

				if (data.payload.participantRewardData != null) {
					for (var i = 0; i < data.payload.participationRewardData.length; i += 1) {
						$scope.participantData.participationRewardData.push({
							id : data.payload.participationRewardData[i].id,
							timestamp : new Date(data.payload.participantRewardData[i].timestamp.substr(0, data.payload.participantRewardData[i].timestamp.length - 3).replace(' ','T')+'Z'),
							protocolId : data.payload.participationRewardData[i].protocolid,
						});
					}
				}

				if (data.payload.pointOfInterestProximityData != null) {
					for (var i = 0; i < data.payload.pointOfInterestProximityData.length; i += 1) {
						$scope.participantData.pointOfInterestProximityData.push({
							id : data.payload.pointOfInterestProximityData[i].id,
							timestamp : new Date(data.payload.pointOfInterestProximityData[i].timestamp.substr(0, data.payload.pointOfInterestProximityData[i].timestamp.length - 3).replace(' ','T')+'Z'),
							protocolId : data.payload.pointOfInterestProximityData[i].protocolid,
						});
					}
				}

				if (data.payload.protocolReportData != null) {
					for (var i = 0; i < data.payload.protocolReportData.length; i += 1) {
						$scope.participantData.protocolReportData.push({
							id : data.payload.protocolReportData[i].id,
							timestamp : new Date(data.payload.protocolReportData[i].timestamp.substr(0, data.payload.protocolReportData[i].timestamp.length - 3).replace(' ','T')+'Z'),
							protocolId : data.payload.protocolReportData[i].protocolid,
						});
					}
				}

				if (data.payload.screenData != null) {
					for (var i = 0; i < data.payload.screenData.length; i += 1) {
						$scope.participantData.screenData.push({
							id : data.payload.screenData[i].id,
							timestamp : new Date(data.payload.screenData[i].timestamp.substr(0, data.payload.screenData[i].timestamp.length - 3).replace(' ','T')+'Z'),
							protocolId : data.payload.screenData[i].protocolid,
						});
					}
				}
				
				if (data.payload.smsData != null) {
					for (var i = 0; i < data.payload.smsData.length; i += 1) {
						$scope.participantData.smsData.push({
							id : data.payload.smsData[i].id,
							timestamp : new Date(data.payload.smsData[i].timestamp.substr(0, data.payload.smsData[i].timestamp.length - 3).replace(' ','T')+'Z'),
							protocolId : data.payload.smsData[i].protocolid,
						});
					}
				}

				if (data.payload.soundData != null) {
					for (var i = 0; i < data.payload.soundData.length; i += 1) {
						$scope.participantData.soundData.push({
							id : data.payload.soundData[i].id,
							timestamp : new Date(data.payload.soundData[i].timestamp.substr(0, data.payload.soundData[i].timestamp.length - 3).replace(' ','T')+'Z'),
							protocolId : data.payload.soundData[i].protocolid,
						});
					}
				}

				if (data.payload.speedData != null) {
					for (var i = 0; i < data.payload.speedData.length; i += 1) {
						$scope.participantData.speedData.push({
							id : data.payload.speedData[i].id,
							timestamp : new Date(data.payload.speedData[i].timestamp.substr(0, data.payload.speedData[i].timestamp.length - 3).replace(' ','T')+'Z'),
							protocolId : data.payload.speedData[i].protocolid,
						});
					}
				}

				if (data.payload.telephonyData != null) {
					for (var i = 0; i < data.payload.telephonyData.length; i += 1) {
						$scope.participantData.telephonyData.push({
							id : data.payload.telephonyData[i].id,
							timestamp : new Date(data.payload.telephonyData[i].timestamp.substr(0, data.payload.telephonyData[i].timestamp.length - 3).replace(' ','T')+'Z'),
							protocolId : data.payload.telephonyData[i].protocolid,
						});
					}
				}

				if (data.payload.wlanData != null) {
					for (var i = 0; i < data.payload.wlanData.length; i += 1) {
						$scope.participantData.wlanData.push({
							id : data.payload.wlanData[i].id,
							timestamp : new Date(data.payload.wlanData[i].timestamp.substr(0, data.payload.wlanData[i].timestamp.length - 3).replace(' ','T')+'Z'),
							protocolId : data.payload.wlanData[i].protocolid,
						});
					}
				}
                        } else if (data.error != null) {
                                if (data.error.type == "session" && data.error.message == "doesnotexist") {
                                        $location.path('/login');
                                }
                        }
                });
        };

	$scope.logEntries = {
                'list' : [],
                'message' : ''
        };
        $scope.loadLogEntries = function() {
		httpHandler.get('http://ec2-184-72-207-243.compute-1.amazonaws.com/app-Wes/ajax/load_logentries.php', 'json').then(function(data) {
                        if (data.payload == null) {
                                $scope.logEntries.message = 'No entries found.';
                        }
                        else if (data.error == null && data.payload != null) {
                                for (var i = 0; i < data.payload.length; i += 1) {
					var timestamp = data.payload[0].timestamp != null ? new Date(data.payload[0].timestamp.substr(0, data.payload[0].timestamp.length - 3).replace(' ','T')+'Z') : null;
                                        $scope.logEntries.list.push({
                                                id : data.payload[i].id,
                                                studyId : data.payload[i].studyid,
                                                studyTitle : data.payload[i].studytitle,
                                                participantId : data.payload[i].participantid,
                                                participantIdentifier : data.payload[i].participantidentifier,
                                                timestamp : timestamp,
                                                message : data.payload[i].message,
                                        });
                                }
                        } else if (data.error != null) {
                                if (data.error.type == "session" && data.error.message == "doesnotexist") {
                                        $location.path('/login');
                                }
                        }
                });
        };
	$scope.refreshLogEntries = function() {
                $scope.logEntries = {
                        'list' : [],
                        'message' : ''
                };
                $scope.loadLogEntries();
        }

	$scope.showHideDeviceIdButtonText = "Show";
	$scope.showHideEmailAddressButtonText = "Show";
	$scope.participantDeviceIdDisplayText = "Hidden";
	$scope.updateParticipantEmailAddressDisplayText = function() {
		$scope.participantEmailAddressDisplayText = $scope.participant.emailAddress != "None" ? "Hidden" : "None";
	}
	$scope.showHideDeviceId = function() {
		if ($scope.showHideDeviceIdButtonText == "Show") {
			$scope.showHideDeviceIdButtonText = "Hide";
			$scope.participantDeviceIdDisplayText = $scope.participant.deviceId;
		} else {
			$scope.showHideDeviceIdButtonText = "Show";
			$scope.participantDeviceIdDisplayText = "Hidden";
		}
	};
	$scope.showHideEmailAddress = function() {
                if ($scope.showHideDeviceIdButtonText == "Show") {
                        $scope.showHideDeviceIdButtonText = "Hide";
                        $scope.participantEmailAddressDisplayText = $scope.participant.emailAddress;
                } else {
                        $scope.showHideEmailAddressButtonText = "Show";
                        $scope.participantEmailAddressDisplayText = "Hidden";
                }
        };

	$scope.editingDetails = false;
	$scope.viewEditParticipantDetails = function() {
		var viewables = document.getElementsByClassName("viewable");
		for (var i = 0; i < viewables.length; i++) {
			viewables[i].style.display = $scope.editingDetails == false ? "none" : "inline-block";
		}
		var editables = document.getElementsByClassName("editable");
		for (var i = 0; i < editables.length; i++) {
			editables[i].style.display = $scope.editingDetails == false ? "inline-block" : "none";
		}
		document.getElementById("viewDetailsMenu").style.display = $scope.editingDetails == false ? "none" : "inline-block";
		document.getElementById("editDetailsMenu").style.display = $scope.editingDetails == false ? "inline-block" : "none";
		$scope.editingDetails = $scope.editingDetails == false ? true : false;
        }
        $scope.saveParticipantDetailsChanges = function() {
		httpHandler.post('http://ec2-184-72-207-243.compute-1.amazonaws.com/app-Wes/ajax/update_participant.php', $.param($scope.detailsFormData)).then(function(data) {
                        if (data.payload == null && data.error == null) {
                                alert("Participant details changed successfully.");
                                $route.reload();
                        } else if (data.error != null) {
                                if (data.error.type == "session") {
                                        if (data.error.message == "expired" || data.error.message == "doesnotexist") {
                                                $location.path('/login');
                                        }
                                }
                        }
                });
        };
        $scope.discardParticipantDetailsChanges = function() {
		$scope.viewEditParticipantDetails();
        }

	$scope.passiveFilterText = "None";
	$scope.passiveFilterTextOptions = [
                "None",
                "Accelerometer",
                "Altitude",
                "Ambient Temperature",
                "Battery",
                "Biological Sex",
                "Birthdate",
                "Blood Type",
                "Bluetooth Device Proximity",
                "Cell Tower",
                "Compass",
                "Facebook",
                "Height",
                "Light",
                "Location",
                "Participation Reward",
                "Point Of Interest Proximity",
                "Protocol Report",
                "Screen",
                "SMS",
                "Sound",
                "Speed",
                "Telephony",
                "WLAN"
        ];
        $scope.showHidePassiveFilterMenu = function() {
                if (document.getElementById("passiveFilterOptions").style.display == "block") {
                        document.getElementById("passiveFilterOptions").style.display = "none";
                } else {
                        document.getElementById("passiveFilterOptions").style.display = "block"
                }
        };
	$scope.hidePassiveFilterMenu = function() {
		document.getElementById("passiveFilterOptions").style.display = "none";
	};
        $scope.setPassiveFilter = function(filter) {
                $scope.hidePassiveFilterMenu();
                $scope.passiveFilterText = filter;
		//$scope.loadParticipantData(participant, filter);
		createPassiveDataPlot(filter);
        };

	var createScriptDataPlot = function(name) {
		var scriptTimes = [];
		var scriptStatuses = [];
		for (var j = 0; j < $scope.participantData.scriptRunData.length; j += 1) {
			if ($scope.participantData.scriptRunData[j].scriptName == name) {
				scriptTimes.push($scope.participantData.scriptRunData[j].timestamp);
				scriptStatuses.push("Run");
			}
		}
		for (var j = 0; j < $scope.participantData.scriptData.length; j += 1) {
			if ($scope.participantData.scriptData[j].scriptName == name) {
				scriptTimes.push($scope.participantData.scriptData[j].timestamp);
				scriptStatuses.push("Completed");
			}
		}
		var plot = [{
			x: scriptTimes,
			y: scriptStatuses,
			type: 'scatter',
			mode: 'markers'
		}];
		Plotly.newPlot(String(name), plot);
	};

	var createPassiveDataPlot = function(filter) {
                var dataPointTimes = [];
		var yAxis = [];
		for (var j = 0; j < $scope.participantData[filter.toLowerCase() + 'Data'].length; j += 1) {
			dataPointTimes.push($scope.participantData[filter.toLowerCase() + 'Data'][j].timestamp);
			yAxis.push(filter);
		}
                var plot = [{
                        x: dataPointTimes,
                        y: yAxis,
                        type: 'scatter',
                        mode: 'markers'
                }];
                var layout = {
                        title: " ",
                        yaxis: {
                                type: 'category',
                                categoryarray: yAxis,
                                ticks: '',
                                showticklabels: false
                        }
                };
                Plotly.newPlot("PassivePlot", plot, layout);
		var plotDiv = document.getElementById("PassivePlot");
                Plotly.redraw(plotDiv);
        };

	$(document).ready(function () {
                $scope.loadStudy();
		$scope.loadLogEntries();

                setTimeout(function() {
			$scope.loadParticipantData();
                }, 500);
		setTimeout(function() {
			for (var name of $scope.participantData.scriptNames) {
				createScriptDataPlot(name.scriptname);
			}
		}, 1000);

		$rootScope.navigationStackMenu.length = 0;
		$rootScope.navigationStackMenu.push("Studies");
        });
}]);
