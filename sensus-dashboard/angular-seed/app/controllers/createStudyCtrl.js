'use strict';

angular.module('SensusPortal.createStudyCtrl', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/create_study', {
    templateUrl: 'views/create_study.html',
    controller: 'createStudyCtrl'
  });
}])

.controller('createStudyCtrl', ['$scope', '$rootScope', '$http', '$location', '$route', 'httpHandler', 'sessionHandler', 'headerMenuHandler', function($scope, $rootScope, $http, $location, $route, httpHandler, sessionHandler, headerMenuHandler) {	

	$scope.formData = {
		'studyTitle' : null,
		'studyStartDate' : null,
		'studyEndDate' : null,
		'studyDescription' : null,
		'dataSourceType' : null,
                'databaseType' : null,
		's3Bucket' : null,
		'postgreSQLHost' : null,
		'postgreSQLPort' : null,
		'postgreSQLName' : null,
		'postgreSQLUser' : null,
		'postgreSQLPassword' : null,
	};

	$scope.tab = {
		'current' : null,
		'submitText' : 'Next'
	}

	$scope.createStudy = function() {
		alert(1);
		if (Date.parse($scope.formData.studyStartDate) >= Date.parse($scope.formData.studyEndDate)) {
			alert("Start date must precede end date.");
		} else {
			httpHandler.post('http://ec2-184-72-207-243.compute-1.amazonaws.com/app-Wes/ajax/create_study.php', $.param($scope.formData)).then(function(data) {
				if (data.payload == null && data.error == null) {
					$location.path('/StudiesPage');
				} else if (data.error != null) {
                                	if (data.error.type == "session" && data.error.message == "doesnotexist") {
                                        	$location.path('/login');
                                	}
                        	}
			});
		}
  	};

	$scope.tabSubmitTextDefault = function() {
		if ($scope.tab.submitText != 'Next') {
                        $scope.tab.submitText = 'Next';
                }
	};

	$scope.showHideDataSourceMenu = function() {
		if (document.getElementById("dataSourceMenu").style.display == "block") {
			document.getElementById("dataSourceMenu").style.display = "none";
		} else {
			document.getElementById("dataSourceMenu").style.display = "block";
		}
	};

	$scope.setS3DataSource = function() {
		$scope.formData.dataSourceType = 'Amazon S3';
		$scope.showHideDataSourceMenu();
	};

	$scope.showHideDatabaseMenu = function() {
                if (document.getElementById("databaseMenu").style.display == "block") {
                        document.getElementById("databaseMenu").style.display = "none";
                } else {
                        document.getElementById("databaseMenu").style.display = "block";
                }
        };

	$scope.setPostgreSQLDatabase = function() {
                $scope.formData.databaseType = 'PostgreSQL';
                $scope.showHideDatabaseMenu();
        };
 	
	$scope.detailsTab = function() {
		$scope.openTab('details');
		$scope.tabSubmitTextDefault();
	};

  	$scope.distributionTab = function() {
		$scope.openTab('distribution');
		$scope.tabSubmitTextDefault();
  	};

	$scope.reviewTab = function() {
		$scope.openTab('review');
		$scope.tab.submitText = 'Create';
        };

	$scope.openTab = function(id) {
		$scope.tab.current = id;
		var tabs = document.getElementsByClassName("tab");
                for (var i = 0; i < tabs.length; i++) {
                        tabs[i].style.display = "none";
                }
		document.getElementById(id).style.display = "block";
	};

	$scope.back = function() {
                if ($scope.tab.current == 'participants') {
                        $scope.detailsTab();
                }
                else if ($scope.tab.current == 'distribution') {
                        $scope.participantsTab();
                }
                else if ($scope.tab.current == 'review') {
                        $scope.distributionTab();
                }
	};

	$scope.submit = function() {
		if ($scope.tab.current == 'details') {
			$scope.participantsTab();
		}
		else if ($scope.tab.current == 'participants') {
			$scope.distributionTab();
                }
		else if ($scope.tab.current == 'distribution') {
			$scope.reviewTab();
                }
		else if ($scope.tab.current == 'review') {
			$scope.createStudy();
                }
	};

	/* when page loads */

        $(document).ready(function() {
		sessionHandler.refresh();

                $rootScope.navigationStackMenu.length = 0;
		$rootScope.navigationStackMenu.push("Studies");
                $rootScope.navigationStackMenu.push("Create Study");

		$scope.detailsTab();
        });
}]);
