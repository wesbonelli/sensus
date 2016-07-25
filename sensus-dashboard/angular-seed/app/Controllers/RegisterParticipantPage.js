'use strict';

angular.module('myApp.RegisterParticipantPage', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/RegisterParticipantPage', {
    templateUrl: 'Views/RegisterParticipantPage.html',
    controller: 'RegisterParticipantPageCtrl'
  });
}])

.controller('RegisterParticipantPageCtrl', function($scope, $http, $location) {
	// input fields
	$scope.formData = {};

	// update database and switch to SelectedStudyPage
	$scope.onRegister = function() {
                var create;
                $http({
                        method  : 'POST',
                        url     : 'http://ec2-54-227-229-48.compute-1.amazonaws.com/app/ajax/register_participant.php',
                        data    : $.param($scope.formData),
                        headers : { 'Content-type': 'application/x-www-form-urlencoded' },
                })
                .success(function(data) {
                        if (data == '') {
                                $location.path('/SelectedStudyPage');
                        } else {
                                alert(data);
                        }
                });
        };

	// switch to SelectedStudyPage
	$scope.onCancel = function() {
                $location.path('/SelectedStudyPage');
        };
});
