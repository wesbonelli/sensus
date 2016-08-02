'use strict';

angular.module('SensusPortal.StudiesPage', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/StudiesPage', {
    templateUrl: 'Views/StudiesPage.html',
    controller: 'StudiesPageCtrl'
  });
}])

.controller('StudiesPageCtrl', function($scope, $http, $location, $route) {
	
	/* content */

	$scope.user = {
		'emailAddress' : ''
	};

	$scope.studies = {
		'active' : [],
		'inactive' : [],
		'message' : ''
	};

	$scope.logEntries = {
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
                        } else if (data.error != null) {
                                if (data.error.type == "session" && data.error.message == "doesnotexist") {
                                        $location.path('/LoginPage');
                                } else {
                                        alert(data.error.toString());
                                }
                        } else {
                                alert(data.toString());
                        }
                });
	};

        $scope.loadStudies = function() {
                $http({
                        method : 'GET',
                        url : 'http://ec2-54-227-229-48.compute-1.amazonaws.com/app/ajax/load_studies.php',
                        dataType : "json",
                        context : document.body
                }).success(function(data) {
                        if (data.payload == null) {
                                $scope.studies.message = 'No studies found.';
                        }
                        else if (data.error == null && data.payload != null) {
                                for (var i = 0; i < data.payload.length; i += 1) {
                                        var startDate = Date.parse(data.payload[i].startdate.toString().split("+")[0]);
                                        var endDate = Date.parse(data.payload[i].enddate.toString().split("+")[0]);
					if (startDate < Date.now() && endDate > Date.now()) {
						$scope.studies.active.push({
                                                	title : data.payload[i].title,
                                                	startdate : startDate,
                                                	enddate : endDate,
							description : data.payload[i].description
                                        	});
					} else {
						$scope.studies.inactive.push({
							title : data.payload[i].title,
							startdate : startDate,
							enddate : endDate,
							description : data.payload[i].description
						});
					}
                                }
                        } else if (data.error != null) {
                                if (data.error.type == "session" && data.error.message == "doesnotexist") {
                                        $location.path('/LoginPage');
                                } else {
                                        alert(data.error.toString());
                                }
                        } else {
                                alert(data.toString());
                        }
                });
        };

        $scope.loadLogEntries = function() {
                $http({
                        method : 'GET',
                        url : 'http://ec2-54-227-229-48.compute-1.amazonaws.com/app/ajax/load_logentries.php',
                        dataType : "json",
                        context : document.body
                }).success(function(data) {
                        if (data.payload == null) {
                                $scope.logEntries.message = 'No entries found.';
                        }
                        else if (data.error == null && data.payload != null) {
                                for (var i = 0; i < data.payload.length; i += 1) {
                                        $scope.logEntries.list.push({
                                                sourceStudyTitle : data.payload[i].sourcestudytitle,
                                                sourceParticipantEmailAddress : data.payload[i].sourceparticipantemailaddress,
                                                timestamp : Date.parse(data.payload[i].timestamp.toString().split("+")[0]).toString(),
                                                message : data.payload[i].message,
                                        });
                                }
                        } else if (data.error != null) {
                                if (data.error.type == "session" && data.error.message == "doesnotexist") {
                                        $location.path('/LoginPage');
                                } else {
                                        alert(data.error.toString());
                                }
                        } else {
                                alert (data.toString());
                        }
                });
        };

        $scope.refreshLogEntries = function() {
                $scope.logEntries = {
                        'list' : [],
                        'message' : ''
                };
                $scope.loadLogEntries();
        };

	$scope.refreshStudies = function() {
		$scope.studies = {
			'active' : [],
			'inactive' : [],
			'message' : ''
		};
		$scope.loadStudies();
	};

	$scope.viewLogEntry = function(logEntry) {
                var data = '';
                data += 'viewed_logentry=' + logEntry.timestamp;
                $http({
                        method  : 'POST',
                        url : 'http://ec2-54-227-229-48.compute-1.amazonaws.com/app/ajax/update_session_information.php',
                        data    : data,
                        headers : { 'Content-type': 'application/x-www-form-urlencoded' },
                }).success(function(data) {
                        if (data.error == null) {
                                $location.path('/LogEntryPage');
                        } else {
                                if (data.error.type == "session" && data.error.message == "doesnotexist") {
                                        $location.path('/LoginPage');
                                } else {
                                        alert(data.error.toString());
                                }
                        }
                });
        };

	/* when page loads */

        $(document).ready(function() {
		$scope.loadUser();
		$scope.loadStudies();
		$scope.loadLogEntries();
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
		var data = '';
                data += 'viewedStudy=' + study.title;
                $http({
                        method  : 'POST',
                        url : 'http://ec2-54-227-229-48.compute-1.amazonaws.com/app/ajax/update_session_information.php',
                        data    : data,
                        headers : { 'Content-type': 'application/x-www-form-urlencoded' },
                }).success(function(data) {
                        if (data.error == null) {
                                $location.path('/StudyPage');
                        } else {
                                if (data.error.type == "session" && data.error.message == "doesnotexist") {
                                        $location.path('/LoginPage');
                                } else {
                                        alert(data.error.toString());
                                }
                        }
                });
        };

        $scope.goToDetails = function() {
                $location.path('/StudyDetailsPage');
        };

        $scope.goToDeployment = function() {
                $location.path('/DeploymentPage');
        };

	$scope.goToParticipants = function() {
                $location.path('/StudyParticipantsPage');
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
