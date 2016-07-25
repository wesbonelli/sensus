'use strict';

angular.module('myApp.RegisterResearcherPage', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/RegisterResearcherPage', {
    templateUrl: 'Views/RegisterResearcherPage.html',
    controller: 'RegisterResearcherPageCtrl'
  });
}])

.controller('RegisterResearcherPageCtrl', function($scope, $http, $location) {
	// input fields
        $scope.formData = {};

	// update database and switch to StudyLandingPage
        $scope.onRegister = function() {
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

	// switch to LoginPage
        $scope.onCancel = function() {
                $location.path('/LoginPage');
        };
});
