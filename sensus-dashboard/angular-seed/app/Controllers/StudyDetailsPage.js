'use strict';

angular.module('SensusPortal.StudyDetailsPage', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/StudyDetailsPage', {
    templateUrl: 'Views/StudyDetailsPage.html',
    controller: 'StudyDetailsPageCtrl'
  });
}])

.controller('StudyDetailsPageCtrl', function($scope, $http, $location) {

        $scope.user = {
                'emailAddress' : ''
        };

        $scope.study = {
                'name' : '',
		'startDate' : '',
		'endDate' : '',
		'description' : ''
        };

        $scope.logout = function() {
                $http({
                        method : 'GET',
                        url : 'http://ec2-54-227-229-48.compute-1.amazonaws.com/app/ajax/logout.php',
                        dataType : "json",
                        context : document.body
                }).success(function(data) {
                        if (data.error != null) {
                                alert(data.error.toString());
                        }
                        $location.path('/LoginPage');
                });
        };

        $scope.loadStudy = function() {
                $http({
                        method : 'GET',
                        url : 'http://ec2-54-227-229-48.compute-1.amazonaws.com/app/ajax/load_study.php',
                        dataType : "json",
                        context : document.body
                }).success(function(data) {
                        if (data.error == null && data.payload != null) {
                                $scope.study.name = data.payload[0].name;
                        } else if (data.error != null) {
                                if (data.error.type == "session") {
                                        if (data.error.message == "expired" || data.error.message == "doesnotexist") {
                                                $location.path('/LoginPage');
                                        }
                                } else {
                                        alert(data.error.toString());
                                }
                        } else {
                                alert(data.toString());
                        }
                });
        };

        $scope.back = function() {
                $location.path('/StudyPage');
        };

        $(document).ready(function () {
                $http({
                        method : 'GET',
                        url : 'http://ec2-54-227-229-48.compute-1.amazonaws.com/app/ajax/get_session_information.php',
                        dataType : "json",
                        context : document.body
                }).success(function(data) {
                        if (data.error == null && data.payload != null) {
                                $scope.user.emailAddress = data.payload.email_address;
                                $scope.loadStudy();
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
