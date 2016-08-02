'use strict';

angular.module('SensusPortal.AccountPage', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/AccountPage', {
    templateUrl: 'Views/AccountPage.html',
    controller: 'AccountPageCtrl'
  });
}])

.controller('AccountPageCtrl', function($scope, $http, $location, $route) {

        $scope.user = {
                'emailAddress' : '',
		'firstName' : '',
		'lastName' : ''
        };

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
		$http({
                        method : 'GET',
                        url : 'http://ec2-54-227-229-48.compute-1.amazonaws.com/app/ajax/load_researcher.php',
                        dataType : "json",
                        context : document.body
                }).success(function(data) {
                        if (data.error == null && data.payload != null) {
				$scope.user.firstName = data.payload[0].firstname;
				$scope.user.lastName = data.payload[0].lastname;
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

	$(document).ready(function() {
                $scope.loadUser();
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
        }

        $scope.goToProtocol = function(participant) {
                $location.path('/ProtocolPage');
        };

        $scope.reload = function() {
                $route.reload();
        };
});
