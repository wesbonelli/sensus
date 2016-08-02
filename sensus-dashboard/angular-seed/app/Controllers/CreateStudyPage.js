'use strict';

angular.module('SensusPortal.CreateStudyPage', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/CreateStudyPage', {
    templateUrl: 'Views/CreateStudyPage.html',
    controller: 'CreateStudyPageCtrl'
  });
}])

.controller('CreateStudyPageCtrl', function($scope, $http, $location, $route) {
	
	/* content */

	$scope.user = {
		'emailAddress' : ''
	};

	$scope.formData = {};

	$scope.tab = {
		'current' : '',
		'submitText' : 'Next'
	}

	/* actions */

	$scope.getUser = function() {
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
	};

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

	$scope.tabSubmitTextDefault = function() {
		if ($scope.tab.submitText != 'Next') {
                        $scope.tab.submitText = 'Next';
                }
	};
  	
	$scope.detailsTab = function() {
		$scope.openTab('details');
		$scope.tabSubmitTextDefault();
	};

	$scope.protocolsTab = function() {
		$scope.openTab('protocols');
		$scope.tabSubmitTextDefault();
	};

	$scope.participantsTab = function() {
		$scope.openTab('participants');
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
                if ($scope.tab.current == 'protocols') {
                        $scope.detailsTab();
                }
                else if ($scope.tab.current == 'participants') {
                        $scope.protocolsTab();
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
			$scope.protocolsTab();
		}
		else if ($scope.tab.current == 'protocols') {
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
		$scope.getUser();
                $scope.detailsTab();
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
	}

	$scope.goToProtocol = function(participant) {
                $location.path('/ProtocolPage');
        };

        $scope.reload = function() {
                $route.reload();
        };

});
