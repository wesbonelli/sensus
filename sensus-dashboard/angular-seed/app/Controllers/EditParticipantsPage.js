'use strict';

angular.module('SensusPortal.EditParticipantsPage', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/EditParticipantsPage', {
    templateUrl: 'Views/EditParticipantsPage.html',
    controller: 'EditParticipantsPageCtrl'
  });
}])

.controller('EditParticipantsPageCtrl', function($scope, $http, $location) {
	
        $scope.user = {
                'emailAddress' : ''
        };

	$scope.study = {
		'name' : ''
	};

        $scope.participants = {
                'list' : [],
                'message' : '',
		'active' : 0,
		'inactive' : 0,
		'total' : 0
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
                                $scope.loadStudy();
				$scope.loadParticipants();
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
