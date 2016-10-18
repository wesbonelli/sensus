'use strict';

angular.module('SensusPortal.accountCtrl', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/account', {
    templateUrl: 'views/account.html',
    controller: 'accountCtrl'
  });
}])

.controller('accountCtrl', ['$scope', '$rootScope', '$http', '$location', '$route', 'httpHandler', 'sessionHandler', 'headerMenuHandler', function($scope, $rootScope, $http, $location, $route, httpHandler, sessionHandler, headerMenuHandler) {

	$scope.user = {
                'firstName' : '',
                'lastName' : ''
        };
	$scope.loadUser = function() {
                httpHandler.get('http://ec2-184-72-207-243.compute-1.amazonaws.com/app-Wes/ajax/load_user.php', 'json').then(function(data) {
                        if (data.error == null && data.payload != null) {
                                $scope.user.firstName = data.payload[0].firstname;
                                $scope.user.lastName = data.payload[0].lastname;
                        } else if (data.error != null) {
                                if (data.error.type == "session") {
                                        if (data.error.message == "expired" || data.error.message == "doesnotexist") {
                                                $location.path('/LoginPage');
                                        }
                                }
                        }
                });
        };

	$scope.editDetails = function() {
		$scope.detailsMenuTab("editDetailsMenu");
                $scope.detailsSectionTab("editDetailsSection");
	};
	$scope.detailsMenuTab = function(id) {
                var tabs = document.getElementsByClassName("menu_tab");
                for (var i = 0; i < tabs.length; i++) {
                        tabs[i].style.display = "none";
                }
                document.getElementById(id).style.display = "block";
        }
        $scope.detailsSectionTab = function(id) {
                var tabs = document.getElementsByClassName("tab");
                for (var i = 0; i < tabs.length; i++) {
                        tabs[i].style.display = "none";
                }
                document.getElementById(id).style.display = "block";
        };
	$scope.saveDetailsChanges = function() {
		httpHandler.post('http://ec2-184-72-207-243.compute-1.amazonaws.com/app-Wes/ajax/update_researcher.php', $.param($scope.formData)).then(function(data) {
                        if (data.payload == null && data.error == null) {
				alert("Account details changed successfully.");
                                $route.reload();
                                $scope.detailsMenuTab("displayDetailsMenu");
                                $scope.detailsSectionTab("displayDetailsSection");
                        } else if (data.error != null) {
                                if (data.error.type == "session") {
                                        if (data.error.message == "expired" || data.error.message == "doesnotexist") {
                                                $location.path('/LoginPage');
                                        }
                                }
                        }
                });
        };
        $scope.discardDetailsChanges = function() {
                $scope.detailsMenuTab("displayDetailsMenu");
                $scope.detailsSectionTab("displayDetailsSection");
        }

	$(document).ready(function() {
                sessionHandler.refresh();

		$rootScope.navigationStackMenu.length = 0;
                $rootScope.navigationStackMenu.push("Account");

		$scope.loadUser();
	
		$scope.detailsMenuTab("displayDetailsMenu");
                $scope.detailsSectionTab("displayDetailsSection");
        });
}]);
