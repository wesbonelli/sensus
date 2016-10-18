'use strict';

angular.module('SensusPortal.logEntryCtrl', ['ngRoute'])


.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/log_entry', {
    templateUrl: 'views/log_entry.html',
    controller: 'logEntryCtrl'
  });
}])

.controller('logEntryCtrl', function($scope, $http, $location, $route) {

	       /* session */

	$scope.session = {
                'loggedIn' : false,
                'userId' : '',
                'userRole' : '',
                'studyId' : '',
                'participantId' : '',
                'logEntryId' : ''
        };

        $scope.setupMenuBar = function() {
                var id = ($scope.session.loggedIn ? "signedInItems" : "signedOutItems");
                var tabs = document.getElementsByClassName("header_menu_actions_cont right");
                for (var i = 0; i < tabs.length; i++) {
                        tabs[i].style.display = "none";
                }
                document.getElementById(id).style.display = "block";
        }

        $scope.loadSession = function() {
                $http({
                        method : 'GET',
                        url : 'http://ec2-184-72-207-243.compute-1.amazonaws.com/app-Wes/ajax/get_session_information.php',
                        dataType : "json",
                        context : document.body
                }).success(function(data) {
                        if (data.error == null && data.payload != null) {
                                $scope.session.loggedIn = data.payload.logged_in;
                                $scope.session.userId = data.payload.user_id;
                                $scope.session.userRole = data.payload.user_role;
                                $scope.session.studyId = data.payload.study_id;
                                $scope.session.participantId = data.payload.participant_id;
                                $scope.session.logEntryId = data.payload.logentry_id;
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

        $scope.updateSession = function(loggedIn, userId, userRole, studyId, participantId, logEntryId) {
                var data = '';
                data += 'loggedIn=' + loggedIn + '&';
                data += 'userId=' + userId + '&';
                data += 'userRole=' + userRole + '&';
                data += 'studyId=' + studyId + '&';
                data += 'participantId=' + participantId + '&';
                data += 'logEntryId=' +logEntryId;
                $http({
                        method : 'POST',
                        url : 'http://ec2-184-72-207-243.compute-1.amazonaws.com/app-Wes/ajax/update_session_information.php',
                        data : data,
                        headers : { 'Content-type': 'application/x-www-form-urlencoded' },
                }).success(function(data) {
                        if (data.error != null) {
                                if (data.error.type == "session") {
                                        if (data.error.message == "expired" || data.error.message == "doesnotexist") {
                                                $location.path('/LoginPage');
                                        }
                                } else {
                                        alert(data.error.toString());
                                }
                        }
                });
        };
	
        /* user */

        $scope.user = {
                'id' : '',
                'emailAddress' : null,
                'firstName' : '',
                'lastName' : ''
        };

        $scope.setupMenuBar = function() {
                var id = ($scope.user.emailAddress != null ? "signedInItems" : "signedOutItems");
                var tabs = document.getElementsByClassName("header_menu_actions_cont right");
                for (var i = 0; i < tabs.length; i++) {
                        tabs[i].style.display = "none";
                }
                document.getElementById(id).style.display = "block";
        }

        $scope.loadUser = function() {
                $http({
                        method : 'GET',
                        url : 'http://ec2-184-72-207-243.compute-1.amazonaws.com/app-Wes/ajax/load_user.php',
                        dataType : "json",
                        context : document.body
                }).success(function(data) {
                        if (data.error == null && data.payload != null) {
                                $scope.user.id = data.payload[0].id;
                                $scope.user.firstName = data.payload[0].firstname;
                                $scope.user.lastName = data.payload[0].lastname;
                                $scope.user.emailAddress = data.payload[0].emailaddress;
                                $scope.setupMenuBar();
                        } else if (data.error != null) {
                                if (data.error.type == "session") {
                                        if (data.error.message == "expired" || data.error.message == "doesnotexist") {
                                                $location.path('/LoginPage');
                                        }
                                } else {
                                        alert(data.error.toString());
                                }
                        }
                });
        };

        /* studies */

        $scope.studies = {
                'active' : [],
                'inactive' : [],
                'message' : ''
        };

        $scope.loadStudies = function() {
                $http({
                        method : 'GET',
                        url : 'http://ec2-184-72-207-243.compute-1.amazonaws.com/app-Wes/ajax/load_studies.php',
                        dataType : "json",
                        context : document.body
                }).success(function(data) {
                        if (data.payload == null) {
                                $scope.studies.message = 'No studies found.';
                        }
                        else if (data.error == null && data.payload != null) {
                                for (var i = 0; i < data.payload.length; i += 1) {
                                        var startDate = Date.parse(data.payload[i].startdate.toString().split("+")[0]);
                                        var endDate = Date.parse(data.payload[i].enddate.toString().split("+")[0]);
                                        if (startDate < Date.now() && endDate > Date.now()) {
                                                $scope.studies.active.push({
                                                        id : data.payload[i].id,
                                                        title : data.payload[i].title,
                                                        startdate : startDate,
                                                        enddate : endDate,
                                                        description : data.payload[i].description
                                                });
                                        } else {
                                                $scope.studies.inactive.push({
                                                        id : data.payload[i].id,
                                                        title : data.payload[i].title,
                                                        startdate : startDate,
                                                        enddate : endDate,
                                                        description : data.payload[i].description
                                                });
                                        }
                                }
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

        /* study */

        $scope.study = {
                'id' : '',
                'title' : ''
        };

        $scope.loadStudy = function() {
                $http({
                        method : 'GET',
                        url : 'http://ec2-184-72-207-243.compute-1.amazonaws.com/app-Wes/ajax/load_study.php',
                        dataType : "json",
                        context : document.body
                }).success(function(data) {
                        if (data.error == null && data.payload != null) {
                                $scope.study.id = data.payload[0].id;
                                $scope.study.title = data.payload[0].title;
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

        /* log entries */

        $scope.logEntries = {
                'list' : []
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
                                        $scope.logEntries.list.push({
                                                id : data.payload[i].id,
                                                studyId : data.payload[i].studyid,
                                                participantId : data.payload[i].participantid,
						timestamp : Date.parse(data.payload[i].timestamp.toString().split("+")[0]).toString(),
                                                message : data.payload[i].message,
						studyTitle : data.payload[i].studytitle,
                                                participantEmailAddress : (data.payload[i].participantemailaddress != null? data.payload[i].participantemailaddress : 'None')
                                        });
                                }
                        } else if (data.error != null) {
                                if (data.error.type == "session" && data.error.message == "doesnotexist") {
                                        $location.path('/LoginPage');
                                } else {
                                        alert(data.error.toString());
                                }
                        } else {
                                alert (data.toString());
                        }
                });
        };

	$scope.logEntry = {
		'id' : '',
		'timestamp' : '',
		'message' : '',
		'studyId' : '',
		'participantId' : '',
		'participantIdentifier' : '',
		'studyTitle' : '',
	};

        $scope.loadlog_entry = function() {
                $http({
                        method : 'GET',
                        url : 'http://ec2-184-72-207-243.compute-1.amazonaws.com/app-Wes/ajax/load_logentry.php',
                        dataType : "json",
                        context : document.body
                }).success(function(data) {
                        if (data.error == null && data.payload != null) {
				$scope.logEntry.id = data.payload.id;
                                $scope.logEntry.timestamp = data.payload.timestamp;
                                $scope.logEntry.message = data.payload.message
                                $scope.logEntry.studyId = data.payload.studyid;
                                $scope.logEntry.studyTitle = data.payload.studytitle;
                                $scope.logEntry.participantId = data.payload.participantid;
                                $scope.logEntry.participantIdentifier = data.payload.participantidentifier != null ? data.payload.participantidentifier : "None";
                        } else if (data.error != null) {
                                if (data.error.type == "session" && data.error.message == "doesnotexist") {
                                        $location.path('/LoginPage');
                                } else {
                                        alert(data.error.toString());
                                }
                        } else {
                                alert (data.toString());
                        }
                });
        };

	/* actions */

	$(document).ready(function() {
		$scope.loadSession();
                $scope.loadUser();
                $scope.loadlog_entry();
        });

	/* navigation */

	$scope.goToAccount = function() {
		$scope.updateSession($scope.session.loggedIn, $scope.session.userId, $scope.session.userRole, $scope.session.studyId, $scope.session.participantId, scope.session.logEntryId);
                $location.path('/AccountPage');
        };

        $scope.signOut = function() {
                $http({
                        method : 'GET',
                        url : 'http://ec2-184-72-207-243.compute-1.amazonaws.com/app-Wes/ajax/logout.php',
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

	$scope.goToLogEntries = function() {
		$scope.updateSession($scope.session.loggedIn, $scope.session.userId, $scope.session.userRole, $scope.session.studyId, $scope.session.participantId, 0);
		$location.path('/LogEntriesPage');
	};

	$scope.goToStudy = function(study) {
		$scope.updateSession($scope.session.loggedIn, $scope.session.userId, $scope.session.userRole, $scope.session.studyId, 0, 0);
                $location.path('/StudyPage');
        };

        $scope.goToStudies = function() {
		$scope.updateSession($scope.session.loggedIn, $scope.session.userId, $scope.session.userRole, 0, 0, 0);
                $location.path('/StudiesPage');
        };

	$scope.reload = function() {
                $route.reload();
        };


});
