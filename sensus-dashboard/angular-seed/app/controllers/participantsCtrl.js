'use strict';

angular.module('SensusPortal.participantsCtrl', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/participants', {
    templateUrl: 'views/participants.html',
    controller: 'participantsCtrl'
  });
}])

.controller('participantsCtrl', ['$scope', '$rootScope', '$http', '$location', '$route', 'httpHandler', 'sessionHandler', 'headerMenuHandler', function($scope, $rootScope, $http, $location, $route, httpHandler, sessionHandler, headerMenuHandler) {	

	var daysBetween = function(date1, date2) {
                var oneDay=1000*60*60*24;
                var date1MS = date1.getTime();
                var date2MS = date2.getTime();
                var differenceMS = date2MS - date1MS;
                return Math.round(differenceMS/oneDay);
        };
        function addDays(date, days) {
                var result = new Date(date);
                result.setDate(result.getDate() + days);
                return result;
        };

        $scope.study = {
                'id' : '',
                'title' : ''
        };
	$scope.studyDays = [];
	$scope.loadStudy = function() {
		httpHandler.get('http://ec2-184-72-207-243.compute-1.amazonaws.com/app-Wes/ajax/load_study.php', 'json').then(function(data) {
                        if (data.error == null && data.payload != null) {
                                $scope.study.id = data.payload[0].id;
                                $scope.study.title = data.payload[0].title;
                                $scope.study.startDate = data.payload[0].startdate != null ? new Date(data.payload[0].startdate.substr(0, data.payload[0].startdate.length - 3).replace(' ','T')+'Z') : null;
                                $scope.study.endDate = data.payload[0].enddate != null ? new Date(data.payload[0].enddate.substr(0, data.payload[0].enddate.length - 3).replace(' ','T')+'Z') : null;
                                if ($scope.study.startDate != null && $scope.study.endDate != null) {
                                        for (var i = 0; i < daysBetween($scope.study.startDate, $scope.study.endDate); i += 1) {
                                                $scope.studyDays.push({
                                                        index : i,
                                                        date : addDays($scope.study.startDate, i),
                                                        scriptRuns : [],
                                                        scriptResponses : []
                                                });
                                        }
                                }

				$rootScope.navigationStackMenu.push($scope.study.title);
                		$rootScope.navigationStackMenu.push("Participants");
                        } else if (data.error != null) {
                                if (data.error.type == "session") {
                                        if (data.error.message == "expired" || data.error.message == "doesnotexist") {
                                                $location.path('/login');
                                        }
                                }
                        }
                });
        };

	$scope.participants = {
		'registered' : {
			'active' : [],
			'inactive' : []
		},
		'unregistered' : [],
		'message' : '',
		'active' : 0,
		'inactive' : 0,
		'total' : 0
	};
	$scope.loadParticipants = function() {
		httpHandler.get('http://ec2-184-72-207-243.compute-1.amazonaws.com/app-Wes/ajax/load_participants.php', 'json').then(function(data) {
                        if (data.error == null && data.payload != null) {
				for (var i = 0; i < data.payload.length; i += 1) {
                                        var startDate = data.payload[i].startdate != null ? new Date(data.payload[i].startdate.substr(0, data.payload[i].startdate.length - 3).replace(' ','T')+'Z') : null;
                                        var endDate = data.payload[i].enddate != null ? new Date(data.payload[i].enddate.substr(0, data.payload[i].enddate.length - 3).replace(' ','T')+'Z') : null;
                                        if (startDate < Date.now() && endDate > Date.now()) {
                                                $scope.participants.registered.active.push({
                                                        id : data.payload[i].id,
							identifier : data.payload[i].identifier,
                                                        studyId : data.payload[i].studyid,
                                                        emailAddress : data.payload[i].emailaddress,
                                                        startDate : startDate,
                                                        endDate : endDate,
							scriptNames : [],
                					scriptData : [],
                					scriptRunData : [],
							accelerometerData : [],
							altitudeData : [],
							ambientTemperatureData : [],
							batteryData : [],
							biologicalSexData : [],
							birthdateDate : [],
							bloodTypeData : [],
							bluetoothDeviceProximityData : [],
							cellTowerData :[],
							compassData : [],
							facebookData : [],
							heightData : [],
							lightData : [],
							locationData : [],
							participationRewardData : [],
							pointOfInterestProximityData : [],
							protocolReportData : [],
							screenData : [],
							smsData : [],
							soundData : [],
							speedData : [],
							telephonyData : [],
							wlanData : [],
							mostRecentTimestamp : '',
							overallScriptResponseRate : '0',
							scriptRunsToday : 0,
							scriptCompletionsToday : 0,
							participantDays : [],
							mostRecentDatum : {
								type : '',
								timestamp : new Date(1980, 1, 1, 1, 1, 1)
							},
							firstDatum : {
                                                                type : '',
                                                                timestamp : new Date(1980, 1, 1, 1, 1, 1)
                                                        },
							dataStatus : "Loading...",
							logEntries : []
                                                });
                                        } else {
                                                $scope.participants.registered.inactive.push({
                                                        id : data.payload[i].id,
							identifier : data.payload[i].identifier,
                                                        studyId : data.payload[i].studyid,
                                                        emailAddress : data.payload[i].emailaddress,
                                                        startDate : startDate,
                                                        endDate : endDate
                                                });
                                        }

                                }
                                $scope.participants.total = $scope.participants.registered.active.length + $scope.participants.registered.inactive.length;
                        } else if (data.error != null) {
                                if (data.error.type == "session") {
                                        if (data.error.message == "expired" || data.error.message == "doesnotexist") {
                                                $location.path('/login');
                                        }
                                }
                        }
                });
	};
	$scope.loadUnregisteredParticipants = function() {
		httpHandler.get('http://ec2-184-72-207-243.compute-1.amazonaws.com/app-Wes/ajax/load_unregistered_participants.php', 'json').then(function(data) {
                        if (data.error == null && data.payload != null) {
                                for (var i = 0; i < data.payload.length; i += 1) {
                                        $scope.participants.unregistered.push({
						index : data.payload[i].index,
                                                deviceId : data.payload[i].deviceid,
						identifier : data.payload[i].identifier
                                       });
					
                                }
                        } else if (data.error != null) {
                                if (data.error.type == "session") {
                                        if (data.error.message == "expired" || data.error.message == "doesnotexist") {
                                                $location.path('/login');
                                        }
                                }
                        }
                });
        };

        $scope.mostRecentTimestamp = new Date("January 1, 1970 00:00:00");

	$scope.filterTextOptions = [
		"None",
		"Log Entries",
		"Overview",
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
		"Script",
		"SMS",
		"Sound",
		"Speed",
		"Telephony",
		"WLAN"
	];

	$scope.unregisteredParticipantFilterTextOptions = [
		"S3 Folder",
		"Device ID"
	];

	$scope.hideFilterMenu = function() {
		document.getElementById("filterOptions").style.display = "none";
	};

	$scope.hideUnregisteredParticipantFilterMenu = function() {
		document.getElementById("unregisteredParticipantFilterOptions").style.display = "none";
	};

	$scope.filterText = "None";

	$scope.unregisteredParticipantFilterText = "S3 Folder";

	$scope.showHideFilterMenu = function() {
                if (document.getElementById("filterOptions").style.display == "block") {
                        document.getElementById("filterOptions").style.display = "none";
                } else {
                        document.getElementById("filterOptions").style.display = "block"
                }
        };
	$scope.showHideUnregisteredParticipantFilterMenu = function() {
                if (document.getElementById("unregisteredParticipantFilterOptions").style.display == "block") {
                        document.getElementById("unregisteredParticipantFilterOptions").style.display = "none";
                } else {
                        document.getElementById("unregisteredParticipantFilterOptions").style.display = "block";
                }
        };
        $scope.setFilter = function(filter) {
		$scope.hideFilterMenu();
		$scope.filterText = filter;
		for (var participant of $scope.participants.registered.active) {
			for (var filterOption of $scope.filterTextOptions) {
				if (document.getElementById(participant.identifier + filterOption) != null) {
                                	document.getElementById(participant.identifier + filterOption).style.display = "none";
				}
                        }
		}
		for (var participant of $scope.participants.registered.active) {
			$scope.loadParticipantData(participant, filter);
			if (document.getElementById(participant.identifier + filter) != null) {
				document.getElementById(participant.identifier + filter).style.display = "inline-block";
			}
		}
		document.getElementById("ScriptPlotOptions").style.display = "none";
		document.getElementById("AllPlot").style.display = "none";
		if (filter != "Script" && filter != "None" && filter != "Log Entries") {
			document.getElementById("AllPlot").style.display = "inline-block";
			$scope.createPlot(filter);
		}
		if (filter == "Script") {
			document.getElementById("ScriptPlotOptions").style.display = "inline-block";
			document.getElementById("AllPlot").style.display = "inline-block";
			$scope.createScriptPlot($scope.scriptFilterMenuText);
		}
        };
	var findActiveParticipantById = function(id) {
                for (var participant of $scope.participants.registered.active) {
                        if (participant.id == id)
                                return participant;
                }
        }
	$scope.scriptNames = [];
	$scope.scriptFilterMenuText = "Confirmed run";
	$scope.scriptFilterMenuTextOptions = [
		"Confirmed run",
		"Ideal"
	];
        $scope.showHideScriptFilterMenu = function() {
                if (document.getElementById("scriptFilterOptions").style.display == "block") {
                        document.getElementById("scriptFilterOptions").style.display = "none";
                } else {
                        document.getElementById("scriptFilterOptions").style.display = "block"
                }
        };
        $scope.hideScriptFilterMenu = function() {
                document.getElementById("scriptFilterOptions").style.display = "none";
        };
        $scope.setScriptFilter = function(filter) {
                $scope.hideScriptFilterMenu();
                $scope.scriptFilterMenuText = filter;
                $scope.createScriptPlot(filter);
        };
	$scope.loadParticipantData = function(participant, type) {
		if (participant.startDate != null && participant.endDate != null) {
			participant.participantDays = [];
			for (var i = 0; i <= daysBetween(participant.startDate, participant.endDate); i += 1) {
				var date = addDays(participant.startDate, i);
				date.setHours(date.getHours()+4);
				if (addDays(date, 1) > Date.now()) {
					break;
				}
				participant.participantDays.push({
					index : i,
					date : date,
					studyStartIndex : daysBetween($scope.study.startDate, date),
					scriptRuns : [],
					scriptResponses : []
				});
			}
		}
		var data = '';
		data += 'participantId=' + participant.id + '&';
		data += 'type=' + type;
		httpHandler.post('http://ec2-184-72-207-243.compute-1.amazonaws.com/app-Wes/ajax/load_participant_data.php', data).then(function(data) {
			if (data.error == null && data.payload != null) {
				if (data.payload.scriptNames != null) {
					participant.scriptNames = [];
					for (var i = 0; i < data.payload.scriptNames.length; i += 1) {
						var scriptName = data.payload.scriptNames[i].scriptname.replace(/\s+/g, '');
						var dupe = false;
						for (var name of participant.scriptNames) {
							if (name == scriptName)
								dupe = true;
						}
						var dupe2 = false;
						for (var name of $scope.scriptNames) {
							if (name == scriptName)
								dupe2 = true;
						}
						if (!dupe2) {
							$scope.scriptNames.push(scriptName);
						}
						if (!dupe)
							participant.scriptNames.push(scriptName);
					}
				}
				if (data.payload.scriptData != null) {
					participant.scriptData = [];
					for (var i = 0; i < data.payload.scriptData.length; i += 1) {
						var timestamp = new Date(data.payload.scriptData[i].timestamp.substr(0, data.payload.scriptData[i].timestamp.length - 3).replace(' ','T')+'Z');
						if (timestamp > participant.mostRecentDatum.timestamp) {
							participant.mostRecentDatum.type = "Script completion";
							participant.mostRecentDatum.timestamp = timestamp;
						}
						if (timestamp < participant.firstDatum.timestamp) {
                                                        participant.firstDatum.type = "Script completion";
                                                        participant.firstDatum.timestamp = timestamp;
                                                }
						var day = daysBetween(participant.startDate, timestamp) - 1;
						for (var k = 0; k < participant.participantDays.length; k += 1) {
							if (participant.participantDays[k].index == day) {
								participant.participantDays[k].scriptResponses.push({
									index : day,
									name : data.payload.scriptData[i].scriptname
								});
							}
						}
						for (var j = 0; j < participant.scriptNames.length; j += 1) {
							if (participant.scriptNames[j].scriptname == data.payload.scriptData[i].scriptname) {
								if (participant.scriptNames[j].scriptCount == null) {
									participant.scriptNames[j].scriptCount = 1;
								}
								participant.scriptNames[j].scriptCount += 1;
							}
						}
						//if (participant.identifier == "3036") 
						//alert(timestamp + "  " + participant.identifier);
						participant.scriptData.push({
							id : data.payload.scriptData[i].id,
							timestamp : timestamp,
							protocolId : data.payload.scriptData[i].protocolid,
							scriptName : data.payload.scriptData[i].scriptname
						});
						if (timestamp > participant.mostRecentTimestamp) {
							participant.mostRecentTimestamp = timestamp;
						}
						var today = new Date();
                                                if (timestamp.getDate() == today.getDate() &&
                                                        timestamp.getMonth() == today.getMonth() &&
                                                        timestamp.getFullYear() == today.getFullYear()) {
                                                        participant.scriptCompletionsToday += 1;
                                                }
					}
				}

				if (data.payload.scriptRunData != null) {
					participant.scriptRunData = [];
					for (var i = 0; i < data.payload.scriptRunData.length; i += 1) {
						var timestamp = new Date(data.payload.scriptRunData[i].timestamp.substr(0, data.payload.scriptRunData[i].timestamp.length - 3).replace(' ','T')+'Z');
						var day = daysBetween(participant.startDate, timestamp) - 1;
						if (timestamp > participant.mostRecentDatum.timestamp) {
                                                        participant.mostRecentDatum.type = "Script run";
                                                        participant.mostRecentDatum.timestamp = timestamp;
                                                }
						if (timestamp < participant.firstDatum.timestamp) {
                                                        participant.firstDatum.type = "Script run";
                                                        participant.firstDatum.timestamp = timestamp;
                                                }
						for (var k = 0; k < participant.participantDays.length; k += 1) {
							if (participant.participantDays[k].index == day) {
								participant.participantDays[k].scriptRuns.push({
									index : day,
									name : data.payload.scriptRunData[i].scriptname
								});
							}
						}
						for (var j = 0; j < participant.scriptNames.length; j += 1) {
							if (participant.scriptNames[j].scriptname == data.payload.scriptRunData[i].scriptname) {
								if (participant.scriptNames[j].scriptRunCount == null) {
									participant.scriptNames[j].scriptRunCount = 0;
								}
								participant.scriptNames[j].scriptRunCount += 1;
							}
						}
						participant.scriptRunData.push({
							id : data.payload.scriptRunData[i].id,
							timestamp : timestamp,
							protocolId : data.payload.scriptRunData[i].protocolid,
							scriptName : data.payload.scriptRunData[i].scriptname
						});
						if (timestamp > participant.mostRecentTimestamp) {
							participant.mostRecentTimestamp = timestamp;
						}
						var today = new Date();
						if (timestamp.getDate() == today.getDate() &&
							timestamp.getMonth() == today.getMonth() &&
							timestamp.getFullYear() == today.getFullYear()) {
							participant.scriptRunsToday += 1;
						}
					}
				}
				participant.overallScriptResponseRate = participant.scriptData.length / participant.scriptRunData.length > 1.0 ? 1.0 : participant.scriptData.length / participant.scriptRunData.length;
				participant.overallDesiredScriptResponseRate = participant.scriptData.length / (7 * participant.participantDays.length);
			
				if (data.payload.accelerometerData != null) {
					participant.accelerometerData = [];
					for (var i = 0; i < data.payload.accelerometerData.length; i += 1) {
						var timestamp = new Date(data.payload.accelerometerData[i].timestamp.substr(0, data.payload.accelerometerData[i].timestamp.length - 3).replace(' ','T')+'Z');
						if (timestamp > participant.mostRecentDatum.timestamp) {
                                                        participant.mostRecentDatum.type = "Accelerometer";
                                                        participant.mostRecentDatum.timestamp = timestamp;
                                                }
						if (timestamp < participant.firstDatum.timestamp) {
                                                        participant.firstDatum.type = "Accelerometer";
                                                        participant.firstDatum.timestamp = timestamp;
                                                }
						participant.accelerometerData.push({
							id : data.payload.accelerometerData[i].id,
							timestamp : timestamp,
							protocolId : data.payload.accelerometerData[i].protocolid,
						});
					}
				}

				if (data.payload.altitudeData != null) {
					participant.altitudeData = [];
					for (var i = 0; i < data.payload.altitudeData.length; i += 1) {
						if (timestamp > participant.mostRecentDatum.timestamp) {
                                                        participant.mostRecentDatum.type = "Altitude";
                                                        participant.mostRecentDatum.timestamp = timestamp;
                                                }
						if (timestamp < participant.firstDatum.timestamp) {
                                                        participant.firstDatum.type = "Altitude";
                                                        participant.firstDatum.timestamp = timestamp;
                                                }
						participant.altitudeData.push({
							id : data.payload.altitudeData[i].id,
							timestamp : new Date(data.payload.altitudeData[i].timestamp.substr(0, data.payload.altitude[i].timestamp.length - 3).replace(' ','T')+'Z'),
							protocolId : data.payload.altitudeData[i].protocolid,
						});
					}
				}

				if (data.payload.ambientTemperatureData != null) {
					participant.ambientTemperatureData = [];
					for (var i = 0; i < data.payload.ambientTemperatureData.length; i += 1) {
						if (timestamp > participant.mostRecentDatum.timestamp) {
                                                        participant.mostRecentDatum.type = "Ambient temperature";
                                                        participant.mostRecentDatum.timestamp = timestamp;
                                                }
                                                if (timestamp < participant.firstDatum.timestamp) {
                                                        participant.firstDatum.type = "Ambient temperature";
                                                        participant.firstDatum.timestamp = timestamp;
                                                }
						participant.ambientTemperatureData.push({
							id : data.payload.ambientTemperatureData[i].id,
							timestamp : new Date(data.payload.ambientTemperatureData[i].timestamp.substr(0, data.payload.ambientTemperatureData[i].timestamp.length - 3).replace(' ','T')+'Z'),
							protocolId : data.payload.ambientTemperatureData[i].protocolid,
						});
					}
				}

				if (data.payload.batteryData != null) {
					participant.batteryData = [];
					for (var i = 0; i < data.payload.batteryData.length; i += 1) {
						if (timestamp > participant.mostRecentDatum.timestamp) {
                                                        participant.mostRecentDatum.type = "Battery";
                                                        participant.mostRecentDatum.timestamp = timestamp;
                                                }
                                                if (timestamp < participant.firstDatum.timestamp) {
                                                        participant.firstDatum.type = "Battery";
                                                        participant.firstDatum.timestamp = timestamp;
                                                }
						participant.batteryData.push({
							id : data.payload.batteryData[i].id,
							timestamp : new Date(data.payload.batteryData[i].timestamp.substr(0, data.payload.batteryData[i].timestamp.length - 3).replace(' ','T')+'Z'),
							protocolId : data.payload.batteryData[i].protocolid,
						});
					}
				}

				if (data.payload.biologicalSexData != null) {
					participant.biologicalSexData = [];
					for (var i = 0; i < data.payload.biologicalSexData.length; i += 1) {
						if (timestamp > participant.mostRecentDatum.timestamp) {
                                                        participant.mostRecentDatum.type = "Biological sex";
                                                        participant.mostRecentDatum.timestamp = timestamp;
                                                }
                                                if (timestamp < participant.firstDatum.timestamp) {
                                                        participant.firstDatum.type = "Biological sex";
                                                        participant.firstDatum.timestamp = timestamp;
                                                }
						participant.biologicalSexData.push({
							id : data.payload.biologicalSexData[i].id,
							timestamp : new Date(data.payload.biologicalSexData[i].timestamp.substr(0, data.payload.biologicalSexData[i].timestamp.length - 3).replace(' ','T')+'Z'),
							protocolId : data.payload.biologicalSexData[i].protocolid,
						});
					}
				}

				if (data.payload.birthdateData != null) {
					participant.birthdateData = [];
					for (var i = 0; i < data.payload.birthdateData.length; i += 1) {
						if (timestamp > participant.mostRecentDatum.timestamp) {
                                                        participant.mostRecentDatum.type = "Birthdate";
                                                        participant.mostRecentDatum.timestamp = timestamp;
                                                }
                                                if (timestamp < participant.firstDatum.timestamp) {
                                                        participant.firstDatum.type = "Birthdate";
                                                        participant.firstDatum.timestamp = timestamp;
                                                }
						participant.birthdateData.push({
							id : data.payload.birthdateData[i].id,
							timestamp : new Date(data.payload.birthdateData[i].timestamp.substr(0, data.payload.birthdateData[i].timestamp.length - 3).replace(' ','T')+'Z'),
							protocolId : data.payload.birthdateData[i].protocolid,
						});
					}
				}

				if (data.payload.bloodTypeData != null) {
					participant.bloodTypeData = [];
					for (var i = 0; i < data.payload.bloodTypeData.length; i += 1) {
						if (timestamp > participant.mostRecentDatum.timestamp) {
                                                        participant.mostRecentDatum.type = "Blood type";
                                                        participant.mostRecentDatum.timestamp = timestamp;
                                                }
                                                if (timestamp < participant.firstDatum.timestamp) {
                                                        participant.firstDatum.type = "Blood type";
                                                        participant.firstDatum.timestamp = timestamp;
                                                }
						participant.bloodTypeData.push({
							id : data.payload.bloodTypeData[i].id,
							timestamp : new Date(data.payload.bloodTypeData[i].timestamp.substr(0, data.payload.bloodTypeData[i].timestamp.length - 3).replace(' ','T')+'Z'),
							protocolId : data.payload.bloodTypeData[i].protocolid,
						});
					}
				}

				if (data.payload.bluetoothDeviceProximityData != null) {
					participant.bluetoothDeviceProximityData = [];
					for (var i = 0; i < data.payload.bluetoothDeviceProximityData.length; i += 1) {
						if (timestamp > participant.mostRecentDatum.timestamp) {
                                                        participant.mostRecentDatum.type = "Bluetooth device proximity";
                                                        participant.mostRecentDatum.timestamp = timestamp;
                                                }
                                                if (timestamp < participant.firstDatum.timestamp) {
                                                        participant.firstDatum.type = "Bluetooth device proximity";
                                                        participant.firstDatum.timestamp = timestamp;
                                                }
						participant.bluetoothDeviceProximityData.push({
							id : data.payload.bluetoothDeviceProximityData[i].id,
							timestamp : new Date(data.payload.bluetoothDeviceProximityData[i].timestamp.substr(0, data.payload.bluetoothDeviceProximityData[i].timestamp.length - 3).replace(' ','T')+'Z'),
							protocolId : data.payload.bluetoothDeviceProximityData[i].protocolid,
						});
					}
				}

				if (data.payload.cellTowerData != null) {
					participant.cellTowerData = [];
					for (var i = 0; i < data.payload.cellTowerData.length; i += 1) {
						if (timestamp > participant.mostRecentDatum.timestamp) {
                                                        participant.mostRecentDatum.type = "Cell tower";
                                                        participant.mostRecentDatum.timestamp = timestamp;
                                                }
                                                if (timestamp < participant.firstDatum.timestamp) {
                                                        participant.firstDatum.type = "Cell tower";
                                                        participant.firstDatum.timestamp = timestamp;
                                                }
						participant.cellTowerData.push({
							id : data.payload.cellTowerData[i].id,
							timestamp : new Date(data.payload.cellTowerData[i].timestamp.substr(0, data.payload.cellTowerData[i].timestamp.length - 3).replace(' ','T')+'Z'),
							protocolId : data.payload.cellTowerData[i].protocolid,
						});
					}
				}

				if (data.payload.compassData != null) {
					participant.compassData = [];
					for (var i = 0; i < data.payload.compassData.length; i += 1) {
						if (timestamp > participant.mostRecentDatum.timestamp) {
                                                        participant.mostRecentDatum.type = "Compass";
                                                        participant.mostRecentDatum.timestamp = timestamp;
                                                }
                                                if (timestamp < participant.firstDatum.timestamp) {
                                                        participant.firstDatum.type = "Compass";
                                                        participant.firstDatum.timestamp = timestamp;
                                                }
						participant.compassData.push({
							id : data.payload.compassData[i].id,
							timestamp : new Date(data.payload.compassData[i].timestamp.substr(0, data.payload.compassData[i].timestamp.length - 3).replace(' ','T')+'Z'),
							protocolId : data.payload.compassData[i].protocolid,
						});
					}
				}

				if (data.payload.facebookData != null) {
					participant.facebookData = [];
					for (var i = 0; i < data.payload.facebookData.length; i += 1) {
						if (timestamp > participant.mostRecentDatum.timestamp) {
                                                        participant.mostRecentDatum.type = "Facebook";
                                                        participant.mostRecentDatum.timestamp = timestamp;
                                                }
                                                if (timestamp < participant.firstDatum.timestamp) {
                                                        participant.firstDatum.type = "Facebook";
                                                        participant.firstDatum.timestamp = timestamp;
                                                }
						participant.facebookData.push({
							id : data.payload.facebookData[i].id,
							timestamp : new Date(data.payload.facebookData[i].timestamp.substr(0, data.payload.facebookData[i].timestamp.length - 3).replace(' ','T')+'Z'),
							protocolId : data.payload.facebookData[i].protocolid,
						});
					}
				}

				if (data.payload.heightData != null) {
					participant.heightData = [];
					for (var i = 0; i < data.payload.heightData.length; i += 1) {
						if (timestamp > participant.mostRecentDatum.timestamp) {
                                                        participant.mostRecentDatum.type = "Height";
                                                        participant.mostRecentDatum.timestamp = timestamp;
                                                }
                                                if (timestamp < participant.firstDatum.timestamp) {
                                                        participant.firstDatum.type = "Height";
                                                        participant.firstDatum.timestamp = timestamp;
                                                }
						participant.heightData.push({
							id : data.payload.heightData[i].id,
							timestamp : new Date(data.payload.heightData[i].timestamp.substr(0, data.payload.heightData[i].timestamp.length - 3).replace(' ','T')+'Z'),
							protocolId : data.payload.heightData[i].protocolid,
						});
					}
				}

				if (data.payload.lightData != null) {
					participant.lightData = [];
					for (var i = 0; i < data.payload.lightData.length; i += 1) {
						if (timestamp > participant.mostRecentDatum.timestamp) {
                                                        participant.mostRecentDatum.type = "Light";
                                                        participant.mostRecentDatum.timestamp = timestamp;
                                                }
                                                if (timestamp < participant.firstDatum.timestamp) {
                                                        participant.firstDatum.type = "Light";
                                                        participant.firstDatum.timestamp = timestamp;
                                                }
						participant.lightData.push({
							id : data.payload.lightData[i].id,
							timestamp : new Date(data.payload.lightData[i].timestamp.substr(0, data.payload.lightData[i].timestamp.length - 3).replace(' ','T')+'Z'),
							protocolId : data.payload.lightData[i].protocolid,
						});
					}
				}

				if (data.payload.locationData != null) {
					participant.locationData = [];
					for (var i = 0; i < data.payload.locationData.length; i += 1) {
						if (timestamp > participant.mostRecentDatum.timestamp) {
                                                        participant.mostRecentDatum.type = "Location";
                                                        participant.mostRecentDatum.timestamp = timestamp;
                                                }
                                                if (timestamp < participant.firstDatum.timestamp) {
                                                        participant.firstDatum.type = "Location";
                                                        participant.firstDatum.timestamp = timestamp;
                                                }
						participant.locationData.push({
							id : data.payload.locationData[i].id,
							timestamp : new Date(data.payload.locationData[i].timestamp.substr(0, data.payload.locationData[i].timestamp.length - 3).replace(' ','T')+'Z'),
							protocolId : data.payload.locationData[i].protocolid,
						});
					}
				}

				if (data.payload.participantRewardData != null) {
					participant.participantRewardData = [];
					for (var i = 0; i < data.payload.participationRewardData.length; i += 1) {
						if (timestamp > participant.mostRecentDatum.timestamp) {
                                                        participant.mostRecentDatum.type = "Participation reward";
                                                        participant.mostRecentDatum.timestamp = timestamp;
                                                }
                                                if (timestamp < participant.firstDatum.timestamp) {
                                                        participant.firstDatum.type = "Participation reward";
                                                        participant.firstDatum.timestamp = timestamp;
                                                }
						participant.participationRewardData.push({
							id : data.payload.participationRewardData[i].id,
							timestamp : new Date(data.payload.participantRewardData[i].timestamp.substr(0, data.payload.participantRewardData[i].timestamp.length - 3).replace(' ','T')+'Z'),
							protocolId : data.payload.participationRewardData[i].protocolid,
						});
					}
				}

				if (data.payload.pointOfInterestProximityData != null) {
					participant.pointOfInterestProximityData = [];
					for (var i = 0; i < data.payload.pointOfInterestProximityData.length; i += 1) {
						if (timestamp > participant.mostRecentDatum.timestamp) {
                                                        participant.mostRecentDatum.type = "Point of interest proximity";
                                                        participant.mostRecentDatum.timestamp = timestamp;
                                                }
                                                if (timestamp < participant.firstDatum.timestamp) {
                                                        participant.firstDatum.type = "Point of interest proximity";
                                                        participant.firstDatum.timestamp = timestamp;
                                                }
						participant.pointOfInterestProximityData.push({
							id : data.payload.pointOfInterestProximityData[i].id,
							timestamp : new Date(data.payload.pointOfInterestProximityData[i].timestamp.substr(0, data.payload.pointOfInterestProximityData[i].timestamp.length - 3).replace(' ','T')+'Z'),
							protocolId : data.payload.pointOfInterestProximityData[i].protocolid,
						});
					}
				}

				if (data.payload.protocolReportData != null) {
					participant.protocolReportData = [];
					for (var i = 0; i < data.payload.protocolReportData.length; i += 1) {
						if (timestamp > participant.mostRecentDatum.timestamp) {
                                                        participant.mostRecentDatum.type = "Protocol report";
                                                        participant.mostRecentDatum.timestamp = timestamp;
                                                }
                                                if (timestamp < participant.firstDatum.timestamp) {
                                                        participant.firstDatum.type = "Protocol report";
                                                        participant.firstDatum.timestamp = timestamp;
                                                }
						participant.protocolReportData.push({
							id : data.payload.protocolReportData[i].id,
							timestamp : new Date(data.payload.protocolReportData[i].timestamp.substr(0, data.payload.protocolReportData[i].timestamp.length - 3).replace(' ','T')+'Z'),
							protocolId : data.payload.protocolReportData[i].protocolid,
						});
					}
				}

				if (data.payload.screenData != null) {
					participant.screenData = [];
					for (var i = 0; i < data.payload.screenData.length; i += 1) {
						if (timestamp > participant.mostRecentDatum.timestamp) {
                                                        participant.mostRecentDatum.type = "Screen";
                                                        participant.mostRecentDatum.timestamp = timestamp;
                                                }
                                                if (timestamp < participant.firstDatum.timestamp) {
                                                        participant.firstDatum.type = "Screen";
                                                        participant.firstDatum.timestamp = timestamp;
                                                }
						participant.screenData.push({
							id : data.payload.screenData[i].id,
							timestamp : new Date(data.payload.screenData[i].timestamp.substr(0, data.payload.screenData[i].timestamp.length - 3).replace(' ','T')+'Z'),
							protocolId : data.payload.screenData[i].protocolid,
						});
					}
				}

				if (data.payload.smsData != null) {
					participant.smsData = [];
					for (var i = 0; i < data.payload.smsData.length; i += 1) {
						if (timestamp > participant.mostRecentDatum.timestamp) {
                                                        participant.mostRecentDatum.type = "SMS";
                                                        participant.mostRecentDatum.timestamp = timestamp;
                                                }
                                                if (timestamp < participant.firstDatum.timestamp) {
                                                        participant.firstDatum.type = "SMS";
                                                        participant.firstDatum.timestamp = timestamp;
                                                }
						participant.smsData.push({
							id : data.payload.smsData[i].id,
							timestamp : new Date(data.payload.smsData[i].timestamp.substr(0, data.payload.smsData[i].timestamp.length - 3).replace(' ','T')+'Z'),
							protocolId : data.payload.smsData[i].protocolid,
						});
					}
				}

				if (data.payload.soundData != null) {
					participant.soundData = [];
					for (var i = 0; i < data.payload.soundData.length; i += 1) {
						if (timestamp > participant.mostRecentDatum.timestamp) {
                                                        participant.mostRecentDatum.type = "Sound";
                                                        participant.mostRecentDatum.timestamp = timestamp;
                                                }
                                                if (timestamp < participant.firstDatum.timestamp) {
                                                        participant.firstDatum.type = "Sound";
                                                        participant.firstDatum.timestamp = timestamp;
                                                }
						participant.soundData.push({
							id : data.payload.soundData[i].id,
							timestamp : new Date(data.payload.soundData[i].timestamp.substr(0, data.payload.soundData[i].timestamp.length - 3).replace(' ','T')+'Z'),
							protocolId : data.payload.soundData[i].protocolid,
						});
					}
				}

				if (data.payload.speedData != null) {
					participant.speedData = [];
					for (var i = 0; i < data.payload.speedData.length; i += 1) {
						if (timestamp > participant.mostRecentDatum.timestamp) {
                                                        participant.mostRecentDatum.type = "Speed";
                                                        participant.mostRecentDatum.timestamp = timestamp;
                                                }
                                                if (timestamp < participant.firstDatum.timestamp) {
                                                        participant.firstDatum.type = "Speed";
                                                        participant.firstDatum.timestamp = timestamp;
                                                }
						participant.speedData.push({
							id : data.payload.speedData[i].id,
							timestamp : new Date(data.payload.speedData[i].timestamp.substr(0, data.payload.speedData[i].timestamp.length - 3).replace(' ','T')+'Z'),
							protocolId : data.payload.speedData[i].protocolid,
						});
					}
				}

				if (data.payload.telephonyData != null) {
					participant.telephonyData = [];
					for (var i = 0; i < data.payload.telephonyData.length; i += 1) {
						if (timestamp > participant.mostRecentDatum.timestamp) {
                                                        participant.mostRecentDatum.type = "Telephony";
                                                        participant.mostRecentDatum.timestamp = timestamp;
                                                }
                                                if (timestamp < participant.firstDatum.timestamp) {
                                                        participant.firstDatum.type = "Telephony";
                                                        participant.firstDatum.timestamp = timestamp;
                                                }
						participant.telephonyData.push({
							id : data.payload.telephonyData[i].id,
							timestamp : new Date(data.payload.telephonyData[i].timestamp.substr(0, data.payload.telephonyData[i].timestamp.length - 3).replace(' ','T')+'Z'),
							protocolId : data.payload.telephonyData[i].protocolid,
						});
					}
				}
				
				if (data.payload.wlanData != null) {
					participant.wlanData = [];
					for (var i = 0; i < data.payload.wlanData.length; i += 1) {
						if (timestamp > participant.mostRecentDatum.timestamp) {
                                                        participant.mostRecentDatum.type = "WLAN";
                                                        participant.mostRecentDatum.timestamp = timestamp;
                                                }
                                                if (timestamp < participant.firstDatum.timestamp) {
                                                        participant.firstDatum.type = "WLAN";
                                                        participant.firstDatum.timestamp = timestamp;
                                                }
						participant.wlanData.push({
							id : data.payload.wlanData[i].id,
							timestamp : new Date(data.payload.wlanData[i].timestamp.substr(0, data.payload.wlanData[i].timestamp.length - 3).replace(' ','T')+'Z'),
							protocolId : data.payload.wlanData[i].protocolid,
						});
					}
				}
				participant.firstDatum.timestamp.setHours(participant.firstDatum.timestamp.getHours()+4);
				/*
				participant.timeSinceMostRecentDatum = participant.mostRecentDatum.timestamp - Date.now();
				if (participant.timeSinceMostRecentDatum > $scope.study.activeDataLowWarningThreshold) {
					// TODO create new log entry to record missing data
				} else if (participant.timeSinceMostRecentDatum > $scope.study.activeDataMidWarningThreshold) {

				} else if (participant.timeSinceMostRecentDatum > $scope.study.activeDataHighWarningThreshold) {

				}*/
				if ($scope.filterText != "Script" && $scope.filterText != "None" && $scope.filterText != "Log Entries") {
					$scope.createPlots($scope.filterText, participant);
				}
	 			participant.mostRecentDatum.timestamp = participant.mostRecentDatum.timestamp - 14400000;
				
			} else if (data.error != null) {
				if (data.error.type == "session" && data.error.message == "doesnotexist") {
					$location.path('/login');
				} else {
					alert(data.error.toString());
				}
			} else {
				alert (data.toString());
			}
		});
        };

	$scope.createScriptPlot = function(filter) {
		var participantIdentifiers = [];
		var responseRates = [];
		for (var participant of $scope.participants.registered.active) {
                        participantIdentifiers.push(participant.identifier);
			if (filter == "Confirmed run") {
				responseRates.push(participant.overallScriptResponseRate * 100);
			} else if (filter == "Ideal") {
				var rate = participant.scriptData.length / (participant.participantDays.length *  7) * 100;
				responseRates.push(rate);
			}
		}
		var trace = {
			x: participantIdentifiers,
			y: responseRates,
			type: 'bar',
			mode: 'markers',
		};
		var plot = [trace];

                var layout = {
			xaxis: {
				type: 'category',
				title: "Participant"
			},
			yaxis: {
				range: [0, 100],
				title: "Response Rate (%)"
			}
                };

                Plotly.newPlot("ScriptPlot", plot, layout);
		document.getElementById("AllPlot").style.display = "block";
		document.getElementById("ScriptPlot").style.display = "block";
		var plotDiv = document.getElementById("ScriptPlot");
		Plotly.redraw(plotDiv);
        };
	$scope.createPlot = function(filter) {
		var dataPointTimes = [];
                var participantIdentifiers = [];
		for (var participant of $scope.participants.registered.active) {
			if (participant.identifier / participant.identifier != 1)
				continue;
			for (var j = 0; j < participant[filter.toLowerCase() + 'Data'].length; j += 1) {
				dataPointTimes.push(participant[filter.toLowerCase() + 'Data'][j].timestamp);
				participantIdentifiers.push(participant.identifier);
			}
		}
                var plot = [{
                        x: dataPointTimes,
                        y: participantIdentifiers,
                        type: 'scatter',
                        mode: 'markers'
                }];
		var layout = {
	  		title: " ",
	  		yaxis: {
				type: 'category',
				categoryarray: participantIdentifiers,
				ticks: '',
				showticklabels: false
	    		}
		};
               	Plotly.newPlot(String(filter) + "Plot", plot, layout);
	};
	$scope.createPlots = function(filter, participant) {
		var dataPointTimes = [];
		var dataPoints = [];
		for (var j = 0; j < participant[filter.toLowerCase() + 'Data'].length; j += 1) {
			dataPointTimes.push(participant[filter.toLowerCase() + 'Data'][j].timestamp);
			dataPoints.push(filter);
		}
		if (dataPointTimes.length == 0 || dataPoints.length == 0) {
			return;
		}
		var plot = [{
			x: dataPointTimes,
			y: dataPoints,
			type: 'scatter',
			mode: 'markers'
		}];
		var layout = {
			yaxis: {
				type: 'category',
				categoryarray: dataPoints
			}
		};
		Plotly.newPlot(participant.identifier + String(filter) + "Plot", plot, layout);
	}
	$scope.createScriptPlots = function(participant) {
		setInterval(function() {
			for (var i = 0; i < participant.scriptNames.length; i += 1) {
				var scriptTimes = [];
				var scriptStatuses = [];
				for (var j = 0; j < participant.scriptRunData.length; j += 1) {
					if (participant.scriptRunData[j].scriptName == String(participant.scriptNames[i])) {
						scriptTimes.push(participant.scriptRunData[j].timestamp);
						scriptStatuses.push("Run");
					}
				}
				for (var k = 0; k < participant.scriptData.length; k += 1) {
					if (participant.scriptData[k].scriptName == String(participant.scriptNames[i])) {
						scriptTimes.push(participant.scriptData[k].timestamp);
						scriptStatuses.push("Completed");
					}
				}
				var plot = [{
					x: scriptTimes,
					y: scriptStatuses,
					type: 'scatter',
					mode: 'markers'
				}];
				var layout = {
					yaxis: {
						type: 'category',
						categoryarray: scriptStatuses
					}
				};
				Plotly.newPlot(participant.identifier + String(participant.scriptNames[i]), plot, layout);
			}
		}, 1);
	}

	var findActiveParticipantById = function(id) {
		for (var participant of $scope.participants.registered.active) {
			if (participant.id == id)
				return participant;
		}
	}

        $scope.logEntries = {
                'list' : [],
                'message' : ''
        };
	$scope.loadLogEntries = function() {
                $http({
                        method : 'GET',
                        url : 'http://ec2-184-72-207-243.compute-1.amazonaws.com/app-Wes/ajax/load_logentries.php',
                        dataType : "json",
                        context : document.body
                }).success(function(data) {
                        if (data.payload == null) {
                                $scope.logEntries.message = 'No entries found.';
                        }
                        else if (data.error == null && data.payload != null) {
                                for (var i = 0; i < data.payload.length; i += 1) {
                                        $scope.logEntries.list.push({
                                                id : data.payload[i].id,
                                                studyId : data.payload[i].studyid,
                                                studyTitle : data.payload[i].studytitle,
                                                participantId : data.payload[i].participantid,
						timestamp : new Date(data.payload[i].timestamp.substr(0, data.payload[i].timestamp.length - 3).replace(' ','T')+'Z'),
                                                message : data.payload[i].message,
                                        });
					if (data.payload[i].participantid != null) {
						var participant = findActiveParticipantById(data.payload[i].participantid);
						if (participant != null) {
							participant.logEntries.push({
								id : data.payload[i].id,
								studyId : data.payload[i].studyid,
								studyTitle : data.payload[i].studytitle,
								participantId : data.payload[i].participantid,
								timestamp : new Date(data.payload[i].timestamp.substr(0, data.payload[i].timestamp.length - 3).replace(' ','T')+'Z'),
								message : data.payload[i].message,
							});
						}
					}
                                }
                        } else if (data.error != null) {
                                if (data.error.type == "session" && data.error.message == "doesnotexist") {
                                        $location.path('/login');
                                } else {
                                        alert(data.error.toString());
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

	
	$scope.formData = [];

	$scope.registerParticipant = function(participant) {
		var data = 'participant1identifier=' + participant.identifier;
		httpHandler.post('http://ec2-184-72-207-243.compute-1.amazonaws.com/app-Wes/ajax/register_participants.php', data).then(function(data) {
			if (data.error == null && data.payload == null) {
                                $route.reload();
                        } else if (data.error != null) {
                                if (data.error.type == "session" && data.error.message == "doesnotexist") {
                                        $location.path('/login');
                                }
                        }
		});
	};

	$scope.registerAllParticipants = function() {
		var data = '';
                var count = 1;
		for (var participant of $scope.participants.unregistered) {
			if (participant.identifier != '') {
				data += 'participant' + count + 'identifier=' + participant.identifier + '&';
			}
			count += 1;
		}
		data = data.substring(0,data.length - 1);
		httpHandler.post('http://ec2-184-72-207-243.compute-1.amazonaws.com/app-Wes/ajax/register_participants.php', data).then(function(data) {
			if (data.error == null && data.payload == null) {
				$route.reload();
			} else if (data.error != null) {
				if (data.error.type == "session" && data.error.message == "doesnotexist") {
					$location.path('/login');
				}
			}
		});
	};

	$scope.refreshFilterData = function() {
		$scope.setFilter($scope.filterText);
	};

	$scope.refreshUnregisteredParticipants = function() {
		$scope.participants.unregistered = [];
		$scope.loadUnregisteredParticipants();
	};

	$(document).ready(function () {
		sessionHandler.refresh();

                $scope.loadStudy();
                $scope.loadParticipants();
                $scope.loadUnregisteredParticipants();
                var tabs = document.getElementsByClassName("unregistered_participant_tab");
                for (var i = 0; i < tabs.length; i++) {
                        tabs[i].style.display = "none";
                }
                setTimeout(function() {
                        tabs = document.getElementsByClassName("tab");
                        for (var i = 0; i < tabs.length; i++) {
                                tabs[i].style.display = "none";
                        }
                }, 200);
                setTimeout(function() {
                        $scope.loadLogEntries();
                }, 300);
                setTimeout(function() {
                        $scope.setFilter("None");
                }, 400);

		$rootScope.navigationStackMenu.length = 0;
                $rootScope.navigationStackMenu.push("Studies");
        });
}]);
