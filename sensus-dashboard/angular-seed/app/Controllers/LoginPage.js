'use strict';

angular.module('myApp.LoginPage', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/LoginPage', {
    templateUrl: 'Views/LoginPage.html',
    controller: 'LoginPageCtrl'
  });
}])

.controller('LoginPageCtrl', function($scope, $http, $location, $route) {
	
	$scope.formData = {};

	// tries to authenticate the form and, if valid, switches to StudyLandingPage
	$scope.onLogin = function() {
		$scope.emailAddress = 
                $http({
                        method  : 'POST',
                        url     : 'http://ec2-54-227-229-48.compute-1.amazonaws.com/app/ajax/login.php',
                        data    : $.param($scope.formData),
                        headers : { 'Content-type': 'application/x-www-form-urlencoded' },
                }).success(function(data) {
			if (data == 'authenticate:pass') {
				$location.path('/StudyLandingPage');
           		} else if (data == 'authenticate:fail') {
				alert("Bad email address or password");
			} else {
				alert(data);
			}
                });
        };

	// switch to RegisterResearcherPage
	$scope.onRegister = function() {
		$location.path('/RegisterResearcherPage');
	}
});
