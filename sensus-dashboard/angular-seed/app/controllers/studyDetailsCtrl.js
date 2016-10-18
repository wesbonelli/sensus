'use strict';

angular.module('SensusPortal.studyDetailsCtrl', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/study_details', {
    templateUrl: 'views/study_details.html',
    controller: 'studyDetailsCtrl'
  });
}])

.controller('studyDetailsCtrl', ['$scope', '$rootScope', '$http', '$location', '$route', 'httpHandler', 'sessionHandler', 'headerMenuHandler', function($scope, $rootScope, $http, $location, $route, httpHandler, sessionHandler, headerMenuHandler) {

        $scope.study = {
                'id' : '',
                'title' : '',
		'startDate' : '',
		'endDate' :'',
		'description' : '',
		'researchers' : []
        };
        $scope.loadStudy = function() {
		httpHandler.get('http://ec2-184-72-207-243.compute-1.amazonaws.com/app-Wes/ajax/load_study.php', 'json').then(function(data) {
                        if (data.error == null && data.payload != null) {
				var startDate = data.payload[0].startdate != null ? new Date(data.payload[0].startdate.substr(0, data.payload[0].startdate.length - 3).replace(' ','T')+'Z') : null;
                                var endDate = data.payload[0].enddate != null ? new Date(data.payload[0].enddate.substr(0, data.payload[0].enddate.length - 3).replace(' ','T')+'Z') : null;
                                $scope.study.id = data.payload[0].id;
                                $scope.study.title = data.payload[0].title;
				$scope.study.startDate = startDate;
                                $scope.study.endDate = endDate;
                                $scope.study.description = data.payload[0].description;

				$rootScope.navigationStackMenu.push($scope.study.title);
				$rootScope.navigationStackMenu.push("Details");
                        } else if (data.error != null) {
                                if (data.error.type == "session") {
                                        if (data.error.message == "expired" || data.error.message == "doesnotexist") {
                                                $location.path('/LoginPage');
                                        }
                                }
                        }
                });
        };

	$scope.detailsFormData = {};
	$scope.researcherFormData = {};
	$scope.researcherSearchResults = [];
	$scope.addResearcherButtonText = '';
	$scope.submitAddResearcherButtonText = 'Search';

	$scope.loadResearchers = function() {
		$scope.study.researchers = [];
		httpHandler.get('http://ec2-184-72-207-243.compute-1.amazonaws.com/app-Wes/ajax/load_researchers.php', 'json').then(function(data) {
                        if (data.error == null && data.payload != null) {
                                for (var i = 0; i < data.payload.length; i += 1)
                                {
                                        $scope.study.researchers.push({
                                                id : data.payload[i].id,
                                                firstName : data.payload[i].firstname,
                                                lastName : data.payload[i].lastname,
                                                emailAddress : data.payload[i].emailaddress
                                        });
                                }
                        } else if (data.error != null) {
                                if (data.error.type == "session") {
                                        if (data.error.message == "expired" || data.error.message == "doesnotexist") {
                                                $location.path('/LoginPage');
                                        }
                                }
                        }
                });
        };
	$scope.addResearcher = function(researcher) {
		var data = '';
                data += 'userId=' + researcher.userId;
		httpHandler.post('http://ec2-184-72-207-243.compute-1.amazonaws.com/app-Wes/ajax/add_researcher.php', $.param($scope.researcherFormData)).then(function(data) {
                        if (data.payload == null && data.error == null) {
                                $scope.showHideAddResearcherTab();
                                $scope.loadResearchers();
                        } else if (data.error != null) {
                                if (data.error.type == "session") {
                                        if (data.error.message == "expired" || data.error.message == "doesnotexist") {
                                                $location.path('/LoginPage');
                                        }
                                }
                        }
                });
	};
	$scope.removeResearcher = function(researcher) {
		var data = '';
                data += 'id=' + researcher.id;
		httpHandler.post('http://ec2-184-72-207-243.compute-1.amazonaws.com/app-Wes/ajax/remove_researcher.php', data).then(function(data) {
                        if (data.payload == null && data.error == null) {
                                $scope.loadResearchers();
                        } else if (data.error != null) {
                                if (data.error.type == "session") {
                                        if (data.error.message == "expired" || data.error.message == "doesnotexist") {
                                                $location.path('/LoginPage');
                                        }
                                }
                        }
                });
	};
	$scope.submitAddResearcher = function() {
		if ($scope.submitAddResearcherButtonText == 'Search') {
			$scope.researcherSearchResults = [];
			httpHandler.post('http://ec2-184-72-207-243.compute-1.amazonaws.com/app-Wes/ajax/search_researchers.php', $.param($scope.researcherFormData)).then(function(data) {
				if (data.payload != null && data.error == null) {
					for (var i = 0; i < data.payload.length; i += 1)
					{
						$scope.researcherSearchResults.push({
							userId : data.payload[i].id,
							firstName : data.payload[i].firstname,
							lastName : data.payload[i].lastname,
							emailAddress : data.payload[i].emailaddress
						});
					}
				} else if (data.error != null) {
					if (data.error.type == "session") {
						if (data.error.message == "expired" || data.error.message == "doesnotexist") {
							$location.path('/LoginPage');
						}
					}
				}
			});
		} else if ($scope.submitAddResearcherButtonText == 'Add') {
			// TODO call add_researcher.php
		}
	};

	$scope.showHideAddResearcherTab = function() {
                var tabs = document.getElementsByClassName("researcher_tab");
                for (var i = 0; i < tabs.length; i++) {
                        tabs[i].style.display = "none";
                }
		if ($scope.addResearcherButtonText == '' || $scope.addResearcherButtonText == 'Cancel') {
			$scope.addResearcherButtonText = 'Add';
			document.getElementById("addResearcherTab").style.display = "none";
		} else if ($scope.addResearcherButtonText == 'Add') {
			$scope.addResearcherButtonText = 'Cancel';
			document.getElementById("addResearcherTab").style.display = "block";
		} else {
			$route.reload();
		}
        }
	
	$scope.editStudyDetails = function() {
		$scope.detailsMenuTab("editDetailsMenu");
		$scope.detailsSectionTab("editDetailsSection");
	}

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
	$scope.saveStudyDetailsChanges = function() {
		httpHandler.post('http://ec2-184-72-207-243.compute-1.amazonaws.com/app-Wes/ajax/update_study.php', $.param($scope.detailsFormData)).then(function(data) {
                        if (data.payload == null && data.error == null) {
                                alert("Study details changed successfully.");
				$route.reload();
                        } else if (data.error != null) {
                                if (data.error.type == "session") {
                                        if (data.error.message == "expired" || data.error.message == "doesnotexist") {
                                                $location.path('/LoginPage');
                                        }
                                }
                        }
                });
	};
	$scope.discardStudyDetailsChanges = function() {
		$scope.detailsMenuTab("displayDetailsMenu");
		$scope.detailsSectionTab("displayDetailsSection");
	}

	/* when page loads */

	$(document).ready(function() {
                sessionHandler.refresh();

                $rootScope.navigationStackMenu.length = 0;
                $rootScope.navigationStackMenu.push("Studies");

                $scope.loadStudy();
                $scope.loadResearchers();
                $scope.detailsMenuTab("displayDetailsMenu");
                $scope.detailsSectionTab("displayDetailsSection");
                $scope.showHideAddResearcherTab()
        });
}]);
