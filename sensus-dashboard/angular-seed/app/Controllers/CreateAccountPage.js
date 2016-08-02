'use strict';

angular.module('SensusPortal.CreateAccountPage', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/CreateAccountPage', {
    templateUrl: 'Views/CreateAccountPage.html',
    controller: 'CreateAccountPageCtrl'
  });
}])

.controller('CreateAccountPageCtrl', function($scope, $http, $location) {
	
        $scope.formData = {};

        $scope.register = function() {
                var create;
                $http({
                        method  : 'POST',
                        url     : 'http://ec2-54-227-229-48.compute-1.amazonaws.com/app/ajax/register_researcher.php',
                        data    : $.param($scope.formData),
                        headers : { 'Content-type': 'application/x-www-form-urlencoded' },
                })
                .success(function(data) {
			if (data == '') {
				$location.path('/StudyLandingPage');
			} else {
				alert(data);
			}
                });
        };

        $scope.cancel = function() {
                $location.path('/LoginPage');
        };
});
