'use strict';

angular.module('myApp.LoginPage', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/LoginPage', {
    templateUrl: 'Views/LoginPage.html',
    controller: 'LoginPageCtrl'
  });
}])

.controller('LoginPageCtrl', function($scope, $http, $location, $route) {
	// input fields
	$scope.formData = {};
	
	// authenticate and, if valid, update session and switch to StudyLandingPage
	$scope.onLogin = function() {
                $http({
                        method  : 'POST',
                        url     : 'http://ec2-54-227-229-48.compute-1.amazonaws.com/app/ajax/check_login_credentials.php',
                        data    : $.param($scope.formData),
                        headers : { 'Content-type': 'application/x-www-form-urlencoded' },
                }).success(function(data) {
			if (data == 'authenticate:pass') {
				$http({
                        		method : 'GET',
                        		url : 'http://ec2-54-227-229-48.compute-1.amazonaws.com/app/ajax/update_session_login_status.php',
                        		dataType : "json",
                        		context : document.body
                		}).success(function(data) {
					if (data == '') {
						$location.path('/StudyLandingPage');
					} else {
						alert(data);
					}
                		});
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
