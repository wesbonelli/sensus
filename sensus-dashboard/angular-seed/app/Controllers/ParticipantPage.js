'use strict';

angular.module('SensusPortal.ParticipantPage', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/ParticipantPage', {
    templateUrl: 'Views/ParticipantPage.html',
    controller: 'ParticipantPageCtrl'
  });
}])

.controller('ParticipantPageCtrl', function($scope, $http, $location) {

        $scope.user = {
                'emailAddress' : ''
        };

        $scope.study = {
                'name' : ''
        };

        $scope.participant = {
		'logEntries' : [],
                'emailAddress' : '',
		'startDate' : '',
		'endDate' : '',
		'color' : ''
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

        $scope.loadStudy = function() {
                $http({
                        method : 'GET',
                        url : 'http://ec2-54-227-229-48.compute-1.amazonaws.com/app/ajax/load_study.php',
                        dataType : "json",
                        context : document.body
                }).success(function(data) {
                        if (data.error == null && data.payload != null) {
                                $scope.study.name = data.payload[0].name;
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

	$scope.loadParticipant = function() {
                $http({
                        method : 'GET',
                        url : 'http://ec2-54-227-229-48.compute-1.amazonaws.com/app/ajax/load_participant.php',
                        dataType : "json",
                        context : document.body
                }).success(function(data) {
                        if (data.error == null && data.payload != null) {
                                $scope.participant.id = data.payload[0].id;
				$scope.participant.startDate = Date.parse(data.payload[0].startdate.toString().split("+")[0]);
                                $scope.participant.endDate = Date.parse(data.payload[0].enddate.toString().split("+")[0]);
				$scope.participant.color = $scope.participant.startDate < Date.now() && $scope.participant.endDate > Date.now() ? 'green' : 'red';
                        } else if (data.error != null) {
                                if (data.error.type == "session") {
                                        if (data.error.message == "expired" || data.error.message == "doesnotexist") {
                                                $location.path('/LoginPage');
                                        }
                                } else {
                                        alert(data.error.toString());
                                }
                        } else {
                                alert(data.error.toString());
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

        $scope.back = function() {
                $location.path('/StudyPage');
        };

        $(document).ready(function () {
                $http({
                        method : 'GET',
                        url : 'http://ec2-54-227-229-48.compute-1.amazonaws.com/app/ajax/get_session_information.php',
                        dataType : "json",
                        context : document.body
                }).success(function(data) {
                        if (data.error == null && data.payload != null) {
                                $scope.user.emailAddress = data.payload.email_address;
				$scope.participant.emailAddress = data.payload.viewed_participant;
                                $scope.loadStudy();
                                $scope.loadParticipant();
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
