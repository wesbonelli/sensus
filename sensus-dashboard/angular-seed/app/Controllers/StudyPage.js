'use strict';

angular.module('SensusPortal.StudyPage', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/StudyPage', {
    templateUrl: 'Views/StudyPage.html',
    controller: 'StudyPageCtrl'
  });
}])

.controller('StudyPageCtrl', function($scope, $http, $location, $route) {
        
	/* content */

	$scope.user = {
		'emailAddress' : '',
		'viewedStudy' : ''
	};

	$scope.studyDetails = {
		'title' : '',
		'startDate' : '',
		'endDate' : '',
		'description' : ''
	};

	$scope.studyParticipants = {
		'active' : [],
		'inactive' : [],
		'total' : 0,
		'message' : '',
	};

	$scope.studyLogEntries = {
		'list' : [],
		'message' : ''
	};

	/* actions */

	$scope.loadUser = function() {
		$http({
                        method : 'GET',
                        url : 'http://ec2-54-227-229-48.compute-1.amazonaws.com/app/ajax/get_session_information.php',
                        dataType : "json",
                        context : document.body
                }).success(function(data) {
                        if (data.error == null && data.payload != null) {
                                $scope.user.emailAddress = data.payload.email_address;
                                $scope.user.viewedStudy = data.payload.viewed_study;
                        } else if (data.error != null) {
                                if (data.error.type == "session") {
                                        if (data.error.message == "expired" || data.error.message == "doesnotexist") {
                                                $location.path('/LoginPage');
                                        }
                                } else {
                                        alert(data.error.toString());
                                }
                        } else {
                                alert(data.toString());
                        }
                });
	};

	$scope.loadStudyDetails = function() {
                $http({
                        method : 'GET',
                        url : 'http://ec2-54-227-229-48.compute-1.amazonaws.com/app/ajax/load_study.php',
                        dataType : "json",
                        context : document.body
                }).success(function(data) {
                        if (data.error == null && data.payload != null) {
                                $scope.studyDetails.title = data.payload[0].title;
                                $scope.studyDetails.startDate = Date.parse(data.payload[0].startdate.toString().split("+")[0]);
                                $scope.studyDetails.endDate = Date.parse(data.payload[0].enddate.toString().split("+")[0]);
                                $scope.studyDetails.description = data.payload[0].description;
                        } else if (data.error != null) {
                                if (data.error.type == "session") {
                                        if (data.error.message == "expired" || data.error.message == "doesnotexist") {
                                                $location.path('/LoginPage');
                                        }
                                } else {
                                        alert(data.error.toString());
                                }
                        } else {
                                alert(data.toString());
                        }
                });
	};

	$scope.loadStudyParticipants = function() {
                $http({
                        method : 'GET',
                        url : 'http://ec2-54-227-229-48.compute-1.amazonaws.com/app/ajax/load_participants.php',
                        dataType : "json",
                        context : document.body
                }).success(function(data) {
                        if (data.payload == null) {
                                $scope.studyParticipants.message = 'No participants found.';
                        }
                        else if (data.error == null && data.payload != null) {
                                for (var i = 0; i < data.payload.length; i += 1) {
                                        var startDate = Date.parse(data.payload[i].startdate.toString().split("+")[0]);
                                        var endDate = Date.parse(data.payload[i].enddate.toString().split("+")[0]);
					if (startDate < Date.now() && endDate > Date.now()) {
						$scope.studyParticipants.active.push({
                                                	emailAddress : data.payload[i].emailaddress,
                                                	startDate : startDate,
                                                	endDate : endDate
                                                	// TODO do this for data collection status instead:
                                                	// color : startDate < Date.now() && endDate > Date.now() ? 'darkseagreen' : 'indianred'
                                                });
					} else {
						$scope.studyParticipants.inactive.push({
                                                        emailAddress : data.payload[i].emailaddress,
                                                        startDate : startDate,
                                                        endDate : endDate
                                                        // TODO do this for data collection status instead:
                                                        // color : startDate < Date.now() && endDate > Date.now() ? 'darkseagreen' : 'indianred'
                                               	});
                                        }
				}
                                $scope.studyParticipants.total = $scope.studyParticipants.active.length + $scope.studyParticipants.inactive.length;
			} else if (data.error != null) {
                                if (data.error.type == "session") {
                                        if (data.error.message == "expired" || data.error.message == "doesnotexist") {
                                                $location.path('/LoginPage');
                                        }
                                } else {
                                        alert(data.error.toString());
                                }
			} else {
				alert(data.toString());
			}
		});
	};

	$scope.loadStudyLogEntries = function() {
                $http({
                        method : 'GET',
                        url : 'http://ec2-54-227-229-48.compute-1.amazonaws.com/app/ajax/load_logentries.php',
                        dataType : "json",
                        context : document.body
                }).success(function(data) {
                        if (data.payload == null) {
                                $scope.studyLogEntries.message = 'No entries found.';
                        }
                        else if (data.error == null && data.payload != null) {
                                for (var i = 0; i < data.payload.length; i += 1) {
                                        var timeStamp = Date.parse(data.payload[i].timestamp.toString().split("+")[0]);
                                        $scope.studyLogEntries.list.push({
                                                sourceStudyTitle : data.payload[i].sourcestudytitle,
                                                sourceParticipantEmailAddress : data.payload[i].sourceparticipantemailaddress,
                                                timestamp : timeStamp.toString(),
                                                message : data.payload[i].message
                                        });
                                }
                        } else if (data.error != null) {
				if (data.error.type == "session") {
					if (data.error.message == "expired" || data.error.message == "doesnotexist") {
						$location.path('/LoginPage');
					}
				} else {
					alert(data.error.toString());
				}
                        } else {
				alert(data.toString());
			}
                });
	};

	$scope.refreshStudyLogEntries = function() {
                $scope.studyLogEntries = {
                        'list' : [],
                        'message' : ''
                };
                $scope.loadStudyLogEntries();
        }

	/* when page loads */

        $(document).ready(function() {
		$scope.loadUser();
                $scope.loadStudyDetails();
                $scope.loadStudyParticipants();
		$scope.loadStudyLogEntries();
        });

	/* navigation */

	$scope.goToAccount = function() {
                $location.path('/AccountPage');
        };

        $scope.signOut = function() {
                $http({
                        method : 'GET',
                        url : 'http://ec2-54-227-229-48.compute-1.amazonaws.com/app/ajax/logout.php',
                        dataType : "json",
                        context : document.body
                }).success(function(data) {
                        if (data.error == null) {
                                $location.path('/LoginPage');
                        } else {
                                alert(data.error.toString());
                        }
                });
        };

        $scope.goToStudies = function() {
                $location.path('/StudiesPage');
        };

        $scope.goToCreateStudy = function() {
                $location.path('/CreateStudyPage');
        };

	$scope.goToLogEntries = function() {
                $location.path('/LogEntriesPage');
        };

        $scope.goToLogEntry = function(logEntry) {
		var data = '';
                data += 'logEntryTimestamp=' + logEntry.timestamp;
                $http({
                        method : 'POST',
                        url : 'http://ec2-54-227-229-48.compute-1.amazonaws.com/app/ajax/update_session_information.php',
                        data : data,
                        headers : { 'Content-type': 'application/x-www-form-urlencoded' },
                }).success(function(data) {
                        if (data.payload == null && data.error == null) {
                                $location.path('/LogEntryPage');
                        } else if (data.error != null) {
                                if (data.error.type == "session") {
                                        if (data.error.message == "expired" || data.error.message == "doesnotexist") {
                                                $location.path('/LoginPage');
                                        }
                                } else {
                                        alert(data.error.toString());
                                }
                        } else {
                                alert(data.toString());
                        }
                });
        };

        $scope.goToStudy = function(study) {
                $location.path('/StudyPage');
        };

        $scope.goToDetails = function() {
                $location.path('/StudyDetailsPage');
        };

        $scope.goToDeployment = function() {
                $location.path('/DeploymentPage');
        };

        $scope.goToParticipants = function() {
                $location.path('/ParticipantsPage');
        };

        $scope.goToParticipant = function(participant) {
		var data = '';
                data += 'viewedParticipant=' + participant.emailAddress;
                $http({
                        method : 'POST',
                        url : 'http://ec2-54-227-229-48.compute-1.amazonaws.com/app/ajax/update_session_information.php',
                        data : data,
                        headers : { 'Content-type': 'application/x-www-form-urlencoded' },
                }).success(function(date) {
                        if (data.payload == null && data.error == null) {
                                $location.path('/ParticipantPage');
                        } else if (data.error != null) {
                                if (data.error.type == "session") {
                                        if (data.error.message == "expired" || data.error.message == "doesnotexist") {
                                                $location.path('/LoginPage');
                                        }
                                } else {
                                        alert(data.error.toString());
                                }
                        } else {
                                alert(data.toString());
                        }
                });
        };

        $scope.goToProtocols = function() {
                $location.path('/ProtocolsPage');
        };

        $scope.goToProtocol = function(participant) {
                $location.path('/ProtocolPage');
        };

        $scope.reload = function() {
                $route.reload();
        };
});
