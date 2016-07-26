'use strict';

angular.module('myApp.StudyLandingPage', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/StudyLandingPage', {
    templateUrl: 'Views/StudyLandingPage.html',
    controller: 'StudyLandingPageCtrl'
  });
}])

.controller('StudyLandingPageCtrl', function($scope, $http, $location, $route) {
	
	$scope.userEmailAddress = '';
	$scope.studies = [];
	$scope.studiesMessage = '';
	$scope.alerts = [];
	$scope.alertsMessage = '';

	// get current user, then query database for studies and alerts when page loads
	$(document).ready(function() {
		$http({
                        method : 'GET',
                        url : 'http://ec2-54-227-229-48.compute-1.amazonaws.com/app/ajax/get_session_login_status.php',
                        dataType : "json",
                        context : document.body
                }).success(function(data) {
                        if (data != null && !data.toString().contains("status")) {
                                $scope.userEmailAddress = data.toString().replace("data", "");
                        } else {
                                alert(data.toString());
                        }
                });
		$http({
			method : 'GET',
			url : 'http://ec2-54-227-229-48.compute-1.amazonaws.com/app/ajax/load_studies.php',
			dataType : "json",
			context : document.body
		}).success(function(data) {
			if (data.indexOf('br') > -1) {
				$scope.studiesMessage = 'No studies found.';
			}
			else if (data != null && !data.toString().contains("status")) {
				for (var i = 0; i < data.length; i += 1) {
					var startDate = Date.parse(data[i].startdate.toString().split("+")[0]);
					var endDate = Date.parse(data[i].enddate.toString().split("+")[0])
					$scope.studies.push({
						name : data[i].name,
						startdate : startDate,
						enddate : endDate,
						color : startDate < Date.now() && endDate > Date.now() ? 'green' : 'red'
					});
				}
			} else {
				alert(data.toString());
			}
		});
		$http({
                        method : 'GET',
                        url : 'http://ec2-54-227-229-48.compute-1.amazonaws.com/app/ajax/load_alerts.php',
                        dataType : "json",
                        context : document.body
                }).success(function(data) {
                        if (data.indexOf('br') > -1) {
                                $scope.alertsMessage = 'No alerts found.';
                        }
                        else if (data != null && !data.toString().contains("status")) {
			        for (var i = 0; i < data.length; i += 1) {
                                        var timeStamp = Date.parse(data[i].timestamp.toString().split("+")[0]);
                                        $scope.alerts.push({
                                                sourcestudyname : data[i].sourcestudyname,
						sourceparticipantemailaddress : data[i].sourceparticipantemailaddress,
                                                timestamp : timeStamp.toString(),
                                                message : data[i].message,
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
	$scope.onViewStudy = function(study) {
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
	$scope.onDeleteStudy = function(study) {
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

	// update session and switch to SelectedAlertPage
	$scope.onViewAlert = function(alert) {
                var data = '';
                data += 'alertTimestamp=' + alert.timestamp;
                $http({
                        method  : 'POST',
                        url : 'http://ec2-54-227-229-48.compute-1.amazonaws.com/app/ajax/update_session_viewed_alert.php',
                        data    : data,
                        headers : { 'Content-type': 'application/x-www-form-urlencoded' },
                }).success(function(data) {
                        if (data == '') {
                                $location.path('/SelectedAlertPage');
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
