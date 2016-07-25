'use strict';

angular.module('myApp.StudyLandingPage', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/StudyLandingPage', {
    templateUrl: 'Views/StudyLandingPage.html',
    controller: 'StudyLandingPageCtrl'
  });
}])

.controller('StudyLandingPageCtrl', function($scope, $http, $location, $route) {
	// list studies
	$scope.studies = [];
	$scope.message = '';

	// query database for studies when page loads
	$(document).ready(function() {
		$http({
			method : 'GET',
			url : 'http://ec2-54-227-229-48.compute-1.amazonaws.com/app/ajax/load_studies.php',
			dataType : "json",
			context : document.body
		}).success(function(data) {
			if (data.indexOf('br') > -1) {
				$scope.message = 'No studies found.';
			}
			else if (data != null && !data.toString().contains("status")) {
				for (var i = 0; i < data.length; i += 1) {
					$scope.studies.push({
						name : data[i].name,
						color : (Date.parse(data[i].startdate.toString().split("+")[0]) < Date.now() && Date.parse(data[i].enddate.toString().split("+")[0]) > Date.now()) ? 'green' : 'red'
					});
				}
			} else {
				alert(data.toString());
			}
		});
	});

	// end session and switch to LoginPage
	$scope.onLogout = function() {
		$http({
                        method : 'GET',
                        url : 'http://ec2-54-227-229-48.compute-1.amazonaws.com/app/ajax/logout.php',
                        dataType : "json",
                        context : document.body
                }).success(function(data) {
                        if (data == '' || data.includes("status:session:expired")) {
				$location.path('/LoginPage');
			} else {
				alert(data);
				$location.path('/LoginPage');
			}
                });
	}

	// update session and switch to SelectedStudyPage
	$scope.onSelect = function(study) {
		var data = '';
                data += 'studyName=' + study.name;
                $http({
                        method  : 'POST',
                        url : 'http://ec2-54-227-229-48.compute-1.amazonaws.com/app/ajax/update_session_viewed_study.php',
                        data    : data,
                        headers : { 'Content-type': 'application/x-www-form-urlencoded' },
                }).success(function(data) {
			if (data == '') {
                        	$location.path('/SelectedStudyPage');
			} else {
				alert(data);
			}
                });
	};

	// delete study from database and reload page
	$scope.onDelete = function(study) {
		var data = '';
                data += 'studyName=' + study.name;
                $http({
                        method  : 'POST',
                        url : 'http://ec2-54-227-229-48.compute-1.amazonaws.com/app/ajax/delete_study.php',
                        data    : data,
                        headers : { 'Content-type': 'application/x-www-form-urlencoded' },
		}).success(function(data) {
			if (data == '') {
                        	$route.reload();
			} else {
				alert(data);
			}
                });
	};

	// switch to CreateStudyPage
	$scope.onCreate = function() {
		$location.path('/CreateStudyPage');
	};
});
