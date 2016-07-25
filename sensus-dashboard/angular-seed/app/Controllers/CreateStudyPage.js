'use strict';

angular.module('myApp.CreateStudyPage', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/CreateStudyPage', {
    templateUrl: 'Views/CreateStudyPage.html',
    controller: 'CreateStudyPageCtrl'
  });
}])

// enables datepicker widget
.directive('jqdatepicker', function () {
        return {
                restrict: 'A',
                require: 'ngModel',
                link: function (scope, element, attrs, ngModelCtrl) {
                        element.datepicker();
                }
        };
})

.controller('CreateStudyPageCtrl', function($scope, $http, $location) {
	// input fields
	$scope.formData = {};
	
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

	// update database and switch to StudyLandingPage
	$scope.onCreate = function() {
		if (Date.parse($scope.formData.studyStartDate) >= Date.parse($scope.formData.studyEndDate)) {
			alert("Start date must precede end date.");
		} else {
			var create;
			$http({
  				method  : 'POST',
  				url     : 'http://ec2-54-227-229-48.compute-1.amazonaws.com/app/ajax/create_study.php',
  				data    : $.param($scope.formData),
  				headers	: { 'Content-type': 'application/x-www-form-urlencoded' },
 			})
  			.success(function(data) {
				if (data == '') {
					$location.path('/StudyLandingPage');
				} else {
					alert(data);
				}
			});
		}
  	};
  	
  	$scope.onCancel = function() {
    		$location.path('/StudyLandingPage');
  	};
});
