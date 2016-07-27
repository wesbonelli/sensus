'use strict';

angular.module('SensusPortal.StudiesPage', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/StudiesPage', {
    templateUrl: 'Views/StudiesPage.html',
    controller: 'StudiesPageCtrl'
  });
}])

.controller('StudiesPageCtrl', function($scope, $http, $location, $route) {
	
	$scope.user = {
		'emailAddress' : ''
	};

	$scope.studies = {
		'list' : [],
		'message' : ''
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
                        if (data.error != null) {
                                alert(data.error.toString());
                        }
                        $location.path('/LoginPage');
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
                                        $scope.studies.list.push({
                                                name : data.payload[i].name,
                                                startdate : startDate,
                                                enddate : endDate,
                                                color : startDate < Date.now() && endDate > Date.now() ? 'green' : 'red'
                                        });
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
                                                sourceStudyName : data.payload[i].sourcestudyname,
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

	$scope.viewStudy = function(study) {
		var data = '';
                data += 'viewedStudy=' + study.name;
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

        $scope.createStudy = function() {
                $location.path('/CreateStudyPage');
        };

	$scope.deleteStudy = function(study) {
		var data = '';
                data += 'studyName=' + study.name;
                $http({
                        method  : 'POST',
                        url : 'http://ec2-54-227-229-48.compute-1.amazonaws.com/app/ajax/delete_study.php',
                        data    : data,
                        headers : { 'Content-type': 'application/x-www-form-urlencoded' },
		}).success(function(data) {
			if (data.error == null) {
				$scope.refreshStudies();
			} else {
                                if (data.error.type == "session" && data.error.message == "doesnotexist") {
                                        $location.path('/LoginPage');
                                } else {
                                        alert(data.error.toString());
                                }
			}
                });
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

        $(document).ready(function() {
                $http({
                        method : 'GET',
                        url : 'http://ec2-54-227-229-48.compute-1.amazonaws.com/app/ajax/get_session_information.php',
                        dataType : "json",
                        context : document.body
                }).success(function(data) {
                        if (data.error == null && data.payload != null) {
                                $scope.user.emailAddress = data.payload.email_address;
				$scope.loadStudies();
                		$scope.loadLogEntries();
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
        });
});
