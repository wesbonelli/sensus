'use strict';

angular.module('SensusPortal.createAccountCtrl', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/create_account', {
    templateUrl: 'views/create_account.html',
    controller: 'createAccountCtrl'
  });
}])

.controller('createAccountCtrl', ['$scope', '$rootScope', '$http', '$location', '$route', 'httpHandler', 'sessionHandler', 'headerMenuHandler', function($scope, $rootScope, $http, $location, $route, httpHandler, sessionHandler, headerMenuHandler) {	

        $scope.formData = {};

        $scope.submit = function() {
		httpHandler.post('http://ec2-184-72-207-243.compute-1.amazonaws.com/app-Wes/ajax/register_useraccount.php', $.param($scope.formData)).then(function(data) {
			if (data.error == null || (data.error.type == "session" && data.error.message == "doesnotexist")) {
				$location.path('/login');
			} else if (data.error.type == "database" && data.error.message == "duplicateemailaddress") {
				alert("Duplicate email address.");
			}
		});
        };

        $scope.cancel = function() {
                $location.path('/login');
        };
}]);
