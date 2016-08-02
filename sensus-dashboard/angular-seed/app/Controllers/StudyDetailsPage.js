'use strict';

angular.module('SensusPortal.StudyDetailsPage', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/StudyDetailsPage', {
    templateUrl: 'Views/StudyDetailsPage.html',
    controller: 'StudyDetailsPageCtrl'
  });
}])

.controller('StudyDetailsPageCtrl', function($scope, $http, $location, $route) {

	/* content */

	$scope.formData = {};

        $scope.user = {
                'emailAddress' : ''
        };

        $scope.study = {
                'title' : '',
		'startDate' : '',
		'endDate' : '',
		'description' : ''
        };

	/* actions */

	$scope.loadUser = function() {
		$http({
                        method : 'GET',
                        url : 'http://ec2-54-227-229-48.compute-1.amazonaws.com/app/ajax/get_session_information.php',
                        dataType : "json",
                        context : document.body
                }).success(function(data) {
                        if (data.error == null && data.payload != null) {
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
	}

        $scope.loadStudy = function() {
                $http({
                        method : 'GET',
                        url : 'http://ec2-54-227-229-48.compute-1.amazonaws.com/app/ajax/load_study.php',
                        dataType : "json",
                        context : document.body
                }).success(function(data) {
                        if (data.error == null && data.payload != null) {
                                $scope.study.title = data.payload[0].title;
				$scope.study.startDate = Date.parse(data.payload[0].startdate.toString().split("+")[0]);
                                $scope.study.endDate = Date.parse(data.payload[0].enddate.toString().split("+")[0]);
                                $scope.study.description = data.payload[0].description;
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
		$http({
                        method : 'POST',
                        url : 'http://ec2-54-227-229-48.compute-1.amazonaws.com/app/ajax/update_study.php',
                        data : $.param($scope.formData),
                        headers : { 'Content-type': 'application/x-www-form-urlencoded' },
                }).success(function(data) {
                        if (data.payload == null && data.error == null) {
				$scope.loadStudy();
                                alert("Study details changed successfully.");
				$scope.detailsMenuTab("displayDetailsMenu");
                		$scope.detailsSectionTab("displayDetailsSection");
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

	$scope.discardStudyDetailsChanges = function() {
		$scope.detailsMenuTab("displayDetailsMenu");
		$scope.detailsSectionTab("displayDetailsSection");
	}

	/* when page loads */

        $(document).ready(function () {
		$scope.loadUser();
		$scope.loadStudy();
		$scope.detailsMenuTab("displayDetailsMenu");
		$scope.detailsSectionTab("displayDetailsSection");             
        });

	/* navigation */

	$scope.goToAccount = function() {
                $location.path('/AccountPage');
        };

        $scope.signOut = function() {
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
        };

        $scope.goToStudies = function() {
                $location.path('/StudiesPage');
        };

        $scope.goToCreateStudy = function() {
                $location.path('/CreateStudyPage');
        };

        $scope.goToLogEntries = function() {
                $location.path('/LogEntriesPage');
        };

	$scope.goToLogEntry = function(logEntry) {
                var data = '';
                data += 'logEntryTimestamp=' + logEntry.timestamp;
                $http({
                        method : 'POST',
                        url : 'http://ec2-54-227-229-48.compute-1.amazonaws.com/app/ajax/update_session_information.php',
                        data : data,
                        headers : { 'Content-type': 'application/x-www-form-urlencoded' },
                }).success(function(data) {
                        if (data.payload == null && data.error == null) {
                                $location.path('/LogEntryPage');
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

        $scope.goToStudy = function(study) {
                $location.path('/StudyPage');
        };

        $scope.goToDetails = function() {
                $location.path('/StudyDetailsPage');
        };

        $scope.goToDeployment = function() {
                $location.path('/DeploymentPage');
        };

        $scope.goToParticipants = function() {
                $location.path('/StudyParticipantsPage');
        };

	$scope.goToParticipant = function(participant) {
                var data = '';
                data += 'viewedParticipant=' + participant.emailAddress;
                $http({
                        method : 'POST',
                        url : 'http://ec2-54-227-229-48.compute-1.amazonaws.com/app/ajax/update_session_information.php',
                        data : data,
                        headers : { 'Content-type': 'application/x-www-form-urlencoded' },
                }).success(function(date) {
                        if (data.payload == null && data.error == null) {
                                $location.path('/ParticipantPage');
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

        $scope.goToProtocols = function() {
                $location.path('/ProtocolsPage');
        };

        $scope.goToProtocol = function(participant) {
                $location.path('/ProtocolPage');
        };

        $scope.reload = function() {
                $route.reload();
        };
});
