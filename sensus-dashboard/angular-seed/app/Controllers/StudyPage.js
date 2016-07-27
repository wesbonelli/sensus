'use strict';

angular.module('SensusPortal.StudyPage', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/StudyPage', {
    templateUrl: 'Views/StudyPage.html',
    controller: 'StudyPageCtrl'
  });
}])

.controller('StudyPageCtrl', function($scope, $http, $location) {
        
	$scope.user = {
		'emailAddress' : '',
		'viewedStudy' : ''
	};

	$scope.study = {
		'name' : '',
		'startDate' : '',
		'endDate' : '',
		'description' : ''
	};

	$scope.participants = {
		'list' : [],
		'message' : '',
		'total' : 0,
		'active' : 0,
		'inactive' : 0
	};

	$scope.logEntries = {
		'list' : [],
		'message' : ''
	};

        $scope.logout = function() {
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
        }

	$scope.loadStudy = function() {
                $http({
                        method : 'GET',
                        url : 'http://ec2-54-227-229-48.compute-1.amazonaws.com/app/ajax/load_study.php',
                        dataType : "json",
                        context : document.body
                }).success(function(data) {
                        if (data.error == null && data.payload != null) {
                                $scope.study.name = data.payload[0].name;
                                $scope.study.startDate = Date.parse(data.payload[0].startdate.toString().split("+")[0]);
                                $scope.study.endDate = Date.parse(data.payload[0].enddate.toString().split("+")[0]);
                                $scope.study.description = data.payload[0].description;
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

	$scope.loadParticipants = function() {
                $http({
                        method : 'GET',
                        url : 'http://ec2-54-227-229-48.compute-1.amazonaws.com/app/ajax/load_participants.php',
                        dataType : "json",
                        context : document.body
                }).success(function(data) {
                        if (data.payload == null) {
                                $scope.participants.message = 'No participants found.';
                        }
                        else if (data.error == null && data.payload != null) {
                                for (var i = 0; i < data.payload.length; i += 1) {
                                        var startDate = Date.parse(data.payload[i].startdate.toString().split("+")[0]);
                                        var endDate = Date.parse(data.payload[i].enddate.toString().split("+")[0]);
                                        $scope.participants.list.push({
                                                emailAddress : data.payload[i].emailaddress,
                                                startDate : startDate,
                                                endDate : endDate,
						color : startDate < Date.now() && endDate > Date.now() ? 'green' : 'red'
					});
				}
                                $scope.participants.total = $scope.participants.list.length;
                                for (let participant of $scope.participants.list) {
                                        if (participant.color == 'green')
                                                $scope.participants.active += 1;
                                        if (participant.color == 'red')
                                                $scope.participants.inactive += 1;
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
                                        var timeStamp = Date.parse(data.payload[i].timestamp.toString().split("+")[0]);
                                        $scope.logEntries.list.push({
                                                sourceStudyName : data.payload[i].sourcestudyname,
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

	$scope.refreshLogEntries = function() {
		$scope.logEntries = {
			'list' : [],
			'message' : ''
		};
		$scope.loadLogEntries();
	}

	$scope.viewParticipant = function(participant) {
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

	$scope.viewLogEntry = function(logEntry) {
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

	$scope.viewStudyDetails = function() {
		$location.path('/StudyDetailsPage');
	};
        
	$scope.editParticipants = function() {
		$location.path('/EditParticipantsPage');
	}

	$scope.back = function() {
                $location.path('/StudiesPage');
        };

        $(document).ready(function() {
                $http({ 
                        method : 'GET',
                        url : 'http://ec2-54-227-229-48.compute-1.amazonaws.com/app/ajax/get_session_information.php',
                        dataType : "json",
                        context : document.body
                }).success(function(data) {
                        if (data.error == null && data.payload != null) {
                                $scope.user.emailAddress = data.payload.email_address;
                                $scope.user.viewedStudy = data.payload.viewed_study;
                		$scope.loadStudy();
                		$scope.loadParticipants();
                		$scope.loadLogEntries();
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
        });
});
