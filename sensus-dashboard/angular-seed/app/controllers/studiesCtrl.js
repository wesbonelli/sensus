'use strict';

angular.module('SensusPortal.studiesCtrl', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/studies', {
    templateUrl: 'views/studies.html',
    controller: 'studiesCtrl'
  });
}])

.controller('studiesCtrl', ['$scope', '$rootScope', '$http', '$location', '$route', 'httpHandler', 'sessionHandler', 'headerMenuHandler', function($scope, $rootScope, $http, $location, $route, httpHandler, sessionHandler, headerMenuHandler) {

        $scope.logEntries = {
                'list' : [],
                'message' : ''
        };
        $scope.loadLogEntries = function() {
                $http({
                        method : 'GET',
                        url : 'http://ec2-184-72-207-243.compute-1.amazonaws.com/app-Wes/ajax/load_logentries.php',
                        dataType : "json",
                        context : document.body
                }).success(function(data) {
                        if (data.payload == null) {
                                $scope.logEntries.message = 'No entries found.';
                        }
                        else if (data.error == null && data.payload != null) {
                                for (var i = 0; i < data.payload.length; i += 1) {
					var timestamp = data.payload[i].timestamp != null ? new Date(data.payload[i].timestamp.substr(0, data.payload[i].timestamp.length - 3).replace(' ','T')+'Z') : null;
                                        $scope.logEntries.list.push({
                                                id : data.payload[i].id,
                                                studyId : data.payload[i].studyid,
                                                studyTitle : data.payload[i].studytitle,
                                                participantId : data.payload[i].participantid,
                                                participantIdentifier : data.payload[i].participantidentifier,
                                                timestamp : timestamp,
                                                message : data.payload[i].message,
                                        });
                                }
                        } else if (data.error != null) {
                                if (data.error.type == "session" && data.error.message == "doesnotexist") {
                                        $location.path('/LoginPage');
                                } else {
                                        alert(data.error.toString());
                                }
                        }
                });
        };

        $scope.administratorStudies = {
		'active' : [],
		'inactive' : []
	};
	$scope.participantStudies = {
		'active' : [],
		'inactive' : []
	};
	$scope.loadAdministratorRoles = function() {
		httpHandler.get('http://ec2-184-72-207-243.compute-1.amazonaws.com/app-Wes/ajax/load_administrator_roles.php', 'json').then(function(data) {
                        if (data.error == null && data.payload != null) {
				for (var i = 0; i < data.payload.length; i += 1){
					var startDate = data.payload[i].startdate != null ? new Date(data.payload[i].startdate.substr(0, data.payload[i].startdate.length - 3).replace(' ','T')+'Z') : null;
                                        var endDate = data.payload[i].enddate != null ? new Date(data.payload[i].enddate.substr(0, data.payload[i].enddate.length - 3).replace(' ','T')+'Z') : null;
					if (startDate < Date.now() && endDate > Date.now()) {
						$scope.administratorStudies.active.push({
							id : data.payload[i].id,
							title : data.payload[i].title,
							description : data.payload[i].description,
							startDate : startDate,
							endDate : endDate
						});
					} else {
						$scope.administratorStudies.inactive.push({
							id : data.payload[i].id,
							title : data.payload[i].title,
                                                        description : data.payload[i].description,
							startDate : startDate,
							endDate : endDate
						});
					}
				}
                        } else if (data.error != null) {
                                if (data.error.type == "session" && data.error.message == "doesnotexist") {
                                        $location.path('/LoginPage');
                                }
                        }
                });
	};
	$scope.loadParticipantRoles = function() {
		httpHandler.get('http://ec2-184-72-207-243.compute-1.amazonaws.com/app-Wes/ajax/load_participant_roles.php', 'json').then(function(data) {
                        if (data.error == null && data.payload != null) {
                                for (var i = 0; i < data.payload.length; i += 1) {
					var startDate = Date.parse(data.payload[i].startdate.toString().split("+")[0]);
                                        var endDate = Date.parse(data.payload[i].enddate.toString().split("+")[0]);
                                        if (startDate < Date.now() && endDate > Date.now()) {
                                                $scope.participantStudies.active.push({
							id : data.payload[i].id,
                                                        title : data.payload[i].title,
                                                        description : data.payload[i].description,
                                                        startDate : startDate,
                                                        endDate : endDate
                                                });
                                        } else {
                                                $scope.participantStudies.inactive.push({
							id : data.payload[i].id,
                                                        title : data.payload[i].title,
                                                        description : data.payload[i].description,
                                                        startDate : startDate,
                                                        endDate : endDate
                                                });
                                        }
                                }
                        } else if (data.error != null) {
                                if (data.error.type == "session" && data.error.message == "doesnotexist") {
                                        $location.path('/login');
                                }
                        }
                });
	};
	$scope.studiesFilterMenuText = "Active";
	$scope.toggleStudiesFilterMenu = function() {
		if (document.getElementById("studiesFilterMenu").style.display == "block") {
                        document.getElementById("studiesFilterMenu").style.display = "none";
                } else {
                        document.getElementById("studiesFilterMenu").style.display = "block"
                }
	};
	$scope.selectActiveStudies = function() {
		$scope.studiesFilterMenuText = "Active";
		document.getElementById("inactiveStudies").style.display = "none";
		document.getElementById("activeStudies").style.display = "block";
	};
	$scope.selectInactiveStudies = function() {
		$scope.studiesFilterMenuText = "Inactive";
		document.getElementById("activeStudies").style.display = "none";
                document.getElementById("inactiveStudies").style.display = "block";
	};
	$scope.toggleUserRoleMenu = function() {
		if (document.getElementById("userRoleMenu").style.display == "block") {
                        document.getElementById("userRoleMenu").style.display = "none";
                } else {
                        document.getElementById("userRoleMenu").style.display = "block"
                }
	};
	$scope.selectAdministratorRole = function() {
		sessionHandler.update($rootScope.session.loggedIn, $rootScope.session.userId, $rootScope.session.userEmailAddress, "Administrator", null, null, null);
		document.getElementById("participantStudies").style.display = "none";
                document.getElementById("administratorStudies").style.display = "block";
	};
	$scope.selectParticipantRole = function() {
		sessionHandler.update($rootScope.session.loggedIn, $rootScope.session.userId, $rootScope.session.userEmailAddress, "Participant", null, null, null);
		document.getElementById("administratorStudies").style.display = "none";
                document.getElementById("participantStudies").style.display = "block";
	};

        $scope.refreshLogEntries = function() {
                $scope.logEntries = {
                        'list' : [],
                        'message' : ''
                };
                $scope.loadLogEntries();
        };

	$(document).ready(function() {
                sessionHandler.refresh();

                $rootScope.navigationStackMenu.length = 0;
                $rootScope.navigationStackMenu.push("Studies");

                $scope.loadAdministratorRoles();
                $scope.loadParticipantRoles();
                $scope.loadLogEntries();
        });
}])

.directive('studylist', function() {
	return {
		restrict: 'E',
		scope: {
			handle: '=handle'
		},
		templateUrl:'directives/study_list.html'
	};
});
