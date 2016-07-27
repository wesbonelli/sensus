'use strict';

angular.module('SensusPortal.CreateStudyPage', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/CreateStudyPage', {
    templateUrl: 'Views/CreateStudyPage.html',
    controller: 'CreateStudyPageCtrl'
  });
}])

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
	
	$scope.user = {
		'emailAddress' : ''
	};

	$scope.formData = {};
	
        $scope.logout = function() {
                $http({
                        method : 'GET',
                        url : 'http://ec2-54-227-229-48.compute-1.amazonaws.com/app/ajax/logout.php',
                        dataType : "json",
                        context : document.body
                }).success(function(data) {
                        if (data.error == null) {
                                $location.path('/LoginPage');
                        } else {
				alert(data.error.toString());
			}
                });
        }

	$scope.createStudy = function() {
		if (Date.parse($scope.formData.studyStartDate) >= Date.parse($scope.formData.studyEndDate)) {
			alert("Start date must precede end date.");
		} else {
			$http({
  				method  : 'POST',
  				url     : 'http://ec2-54-227-229-48.compute-1.amazonaws.com/app/ajax/create_study.php',
  				data    : $.param($scope.formData),
  				headers	: { 'Content-type': 'application/x-www-form-urlencoded' },
 			})
  			.success(function(data) {
				if (data.payload == null && data.error == null) {
					$location.path('/StudiesPage');
				} else if (data.error != null) {
                                	if (data.error.type == "session" && data.error.message == "doesnotexist") {
                                        	$location.path('/LoginPage');
                                	} else {
                                        	alert(data.error.toString());
                                	}
                        	} else {
                                	alert(data.toString());
                        	}
			});
		}
  	};
  	
  	$scope.back = function() {
    		$location.path('/StudiesPage');
  	};

        $(document).ready(function() {
                $http({
                        method : 'GET',
                        url : 'http://ec2-54-227-229-48.compute-1.amazonaws.com/app/ajax/get_session_information.php',
                        dataType : "json",
                        context : document.body
                }).success(function(data) {
                        if (data.payload != null && data.error == null) {
                                $scope.user.emailAddress = data.payload.email_address;
                        } else if (data.error != null) {
                                if (data.error.type == "session" && data.error.message == "doesnotexist") {
                                        $location.path('/LoginPage');
                                } else {
                                        alert(data.error.toString());
                                }
                        } else {
                                alert(data.toString());
                        }
                });
        });
});
