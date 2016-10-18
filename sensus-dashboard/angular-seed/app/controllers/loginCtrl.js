'use strict';

angular.module('SensusPortal.loginCtrl', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/login', {
    templateUrl: 'views/login.html',
    controller: 'loginCtrl'
  });
}])

.controller('loginCtrl', ['$scope', '$rootScope', '$http', '$location', '$route', 'httpHandler', 'sessionHandler', 'headerMenuHandler', function($scope, $rootScope, $http, $location, $route, httpHandler, sessionHandler, headerMenuHandler) {
	
	$scope.formData = {};
	
	$scope.submit = function() {
		httpHandler.post('http://ec2-184-72-207-243.compute-1.amazonaws.com/app-Wes/ajax/login.php', $.param($scope.formData)).then(function(data) {
			if (data.error == null && data.payload.authenticate == 'pass') {
				sessionHandler.update(true, data.payload.userId, $scope.formData.loginEmailAddress, "Administrator", null, null, null);
                                $location.path('/studies');
                        } else if (data.error == null && data.payload.authenticate == 'fail') {
                                alert("Email address or password is incorrect.");
                        } else if (data.error != null) {
                                alert("error: " + data.error.type.toString() + " - " + data.error.message.toString());
                        }
		});
        };

	$(document).ready(function() {
		sessionHandler.update(false, null, null, null, null, null, null);
		$rootScope.navigationStackMenu.length = 0;
        });

	$scope.createAccount = function() {
		$location.path('/create_account');
	};
}]);
