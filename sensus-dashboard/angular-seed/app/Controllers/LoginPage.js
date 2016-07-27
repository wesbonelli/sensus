'use strict';

angular.module('SensusPortal.LoginPage', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/LoginPage', {
    templateUrl: 'Views/LoginPage.html',
    controller: 'LoginPageCtrl'
  });
}])

.controller('LoginPageCtrl', function($scope, $http, $location, $route) {
	
	$scope.formData = {};

	// tries to authenticate the form and, if valid, switches to StudyLandingPage
	$scope.login = function() {
		$scope.emailAddress = 
                $http({
                        method  : 'POST',
                        url     : 'http://ec2-54-227-229-48.compute-1.amazonaws.com/app/ajax/login.php',
                        data    : $.param($scope.formData),
                        headers : { 'Content-type': 'application/x-www-form-urlencoded' },
                }).success(function(data) {
			if (data.error == null && data.payload.authenticate == 'pass') {
				$location.path('/StudiesPage');
           		} else if (data.error == null && data.payload.authenticate == 'fail') {
				alert("Bad email address or password");
			} else if (data.error != null) {
				alert("error: " + data.error.type.toString() + " - " + data.error.message.toString());
			} else {
				alert(data.toString());
			}
                });
        };

	// switch to RegisterResearcherPage
	$scope.register = function() {
		$location.path('/RegisterResearcherPage');
	}
});
