'use strict';

angular.module('SensusPortal.logEntriesCtrl', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/log_entries', {
    templateUrl: 'views/log_entries.html',
    controller: 'logEntriesCtrl'
  });
}])

.controller('logEntriesCtrl', function($scope, $http, $location, $route) {

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
                'emailAddress' : '',
                'firstName' : '',
                'lastName' : ''
        };

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
			if ($scope.session.loggedIn && $scope.user.emailAddress != null)
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

	$scope.participants = {
                'running' : [],
                'inactive' : [],
                'message' : '',
                'total' : 0
        };

        $scope.loadParticipants = function() {
                $http({
                        method : 'GET',
                        url : 'http://ec2-184-72-207-243.compute-1.amazonaws.com/app-Wes/ajax/load_participants.php',
                        dataType : "json",
                        context : document.body
                }).success(function(data) {
                        if (data.payload == null) {
                                $scope.participants.message = 'No participants found.';
                        }
                        else if (data.error == null && data.payload != null) {
                                for (var i = 0; i < data.payload.length; i += 1) {
                                        var startDate = data.payload[i].startdate != null ? Date.parse(data.payload[i].startdate.toString().split("+")[0]) : '';
                                        var endDate = data.payload[i].enddate != null ? Date.parse(data.payload[i].enddate.toString().split("+")[0]) : '';
                                        if (startDate < Date.now() && endDate > Date.now()) {
                                                $scope.participants.running.push({
                                                        id : data.payload[i].id,
                                                        identifier : data.payload[i].identifier,
                                                        studyId : data.payload[i].studyid,
                                                        emailAddress : data.payload[i].emailaddress,
                                                        startDate : startDate,
                                                        endDate : endDate
                                                });
                                        } else {
                                                $scope.participants.inactive.push({
                                                        id : data.payload[i].id,
                                                        identifier : data.payload[i].identifier,
                                                        studyId : data.payload[i].studyid,
                                                        emailAddress : data.payload[i].emailaddress,
                                                        startDate : startDate,
                                                        endDate : endDate
                                                });
                                        }
                                }
                                $scope.participants.total = $scope.participants.running.length + $scope.participants.inactive.length;
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
                                        $scope.logEntries.list.push({
                                                id : data.payload[i].id,
                                                studyId : data.payload[i].studyid,
						studyTitle : data.payload[i].studytitle,
                                                participantId : data.payload[i].participantid,
                                                participantIdentifier : data.payload[i].participantidentifier != null ? data.payload[i].participantidentifier : "None",
                                                timestamp : Date.parse(data.payload[i].timestamp.toString().split("+")[0]).toString(),
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

	/* actions */

	$(document).ready(function () {
		$scope.loadSession();
                $scope.loadUser();
                $scope.loadLogEntries();
		$scope.loadParticipants();
        });

	/* navigation */

	$scope.goToAccount = function() {
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

	$scope.goToLogEntry = function(logEntry) {
                $scope.updateSession($scope.session.loggedIn, $scope.session.userId, $scope.session.userRole, 0, 0, logEntry.id);
		$location.path('/LogEntryPage');
        };

        $scope.goToStudy = function(study) {
                $location.path('/StudyPage');
        };

        $scope.goToStudies = function() {
                $location.path('/StudiesPage');
        };

        $scope.reload = function() {
                $route.reload();
        };

});
