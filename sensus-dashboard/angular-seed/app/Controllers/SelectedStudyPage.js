'use strict';

angular.module('myApp.SelectedStudyPage', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/SelectedStudyPage', {
    templateUrl: 'Views/SelectedStudyPage.html',
    controller: 'SelectedStudyPageCtrl'
  });
}])

.controller('SelectedStudyPageCtrl', function($scope, $http, $location) {
        // list participants
	$scope.participants = [];
        $scope.message = '';

	// query database for participants when page loads
	$(document).ready(function() {
                $http({
                        method : 'GET',
                        url : 'http://ec2-54-227-229-48.compute-1.amazonaws.com/app/ajax/load_participants.php',
                        dataType : "json",
                        context : document.body
                }).success(function(data) {
                        if (data.indexOf('br') > -1) {
                                $scope.message = 'No participants found.';
                        }
                        else if (data != null && !data.toString().contains("status")) {
                                for (var i = 0; i < data.length; i += 1) {
                                        $scope.participants.push({
                                                name : data[i].id,
                                                color : (Date.parse(data[i].startdate.toString().split("+")[0]) < Date.now() && Date.parse(data[i].enddate.toString().split("+")[0]) > Date.now()) ? 'green' : 'red'
                                        });
                                }
                        } else {
                                alert(data.toString());
                        }
                });
        });

	// end session and switch to LoginPage
        $scope.onLogout = function() {
                $http({
                        method : 'GET',
                        url : 'http://ec2-54-227-229-48.compute-1.amazonaws.com/app/ajax/logout.php',
                        dataType : "json",
                        context : document.body
                }).success(function(data) {
                        if (data == '') {
                                $location.path('/LoginPage');
                        } else {
				alert(data);
			}
                });
        }

	// update session
	$scope.onSelect = function(participant) {
                var data = '';
                data += 'participantId=' + participant.id;
                $http({
                	method : 'POST',
                	url : 'http://ec2-54-227-229-48.compute-1.amazonaws.com/app/ajax/update_session_viewed_participant.php',
                	data : data,
                	headers : { 'Content-type': 'application/x-www-form-urlencoded' },
                }).success(function() {
        		$location.path('/SelectedParticipantPage');
		});
	};
        
	// switch to RegisterParticipantPage	
	$scope.onRegister = function() {
		$location.path('/RegisterParticipantPage');
	}

	// switch to StudyLandingPage
	$scope.onBack = function() {
                $location.path('/StudyLandingPage');
        };
});
