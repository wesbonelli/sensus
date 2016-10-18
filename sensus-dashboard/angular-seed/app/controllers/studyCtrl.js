'use strict';

angular.module('SensusPortal.studyCtrl', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/study', {
    templateUrl: 'views/study.html',
    controller: 'studyCtrl'
  });
}])

.controller('studyCtrl', ['$scope', '$rootScope', '$http', '$location', '$route', 'httpHandler', 'sessionHandler', 'headerMenuHandler', function($scope, $rootScope, $http, $location, $route, httpHandler, sessionHandler, headerMenuHandler) {        

        $scope.study = {
                'id' : null,
                'title' : null,
		'startDate' : null,
		'endDate' : null,
		'description' : null,
		'dataStorageType' : null,
		'databaseType' : null
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
				$scope.study.dataStorageType = data.payload[0].datastoragetype;
				$scope.study.databaseType = data.payload[0].databasetype;

				$rootScope.navigationStackMenu.push($scope.study.title);
                        } else if (data.error != null) {
                                if (data.error.type == "session") {
                                        if (data.error.message == "expired" || data.error.message == "doesnotexist") {
                                                $location.path('/login');
                                        }
                                }
                        }
                });
        };

	$scope.researchers = [];
        $scope.loadResearchers = function() {
                httpHandler.get('http://ec2-184-72-207-243.compute-1.amazonaws.com/app-Wes/ajax/load_researchers.php', 'json').then(function(data) {
                        if (data.error == null && data.payload != null) {
                                for (var i = 0; i < data.payload.length; i += 1) {
                                        $scope.researchers.push({
                                                id : data.payload[i].id,
                                                firstName : data.payload[i].firstname,
                                                lastName : data.payload[i].lastname,
                                                emailAddress : data.payload[i].emailaddress
                                        });
                                }
                        } else if (data.error != null) {
                                if (data.error.type == "session") {
                                        if (data.error.message == "expired" || data.error.message == "doesnotexist") {
                                                $location.path('/login');
                                        }
                                }
                        }
                });
        };

	$scope.dataSource = {
		'type' : null,
		's3Bucket' : null
	};
	$scope.loadDataSource = function() {
		httpHandler.get('http://ec2-184-72-207-243.compute-1.amazonaws.com/app-Wes/ajax/load_data_source.php', 'json').then(function(data) {
                        if (data.error == null && data.payload != null) {
                                $scope.dataSource.type = data.payload[0].type;
                                $scope.dataSource.s3Bucket = data.payload[0].s3bucket;
                        } else if (data.error != null) {
                                if (data.error.type == "session") {
                                        if (data.error.message == "expired" || data.error.message == "doesnotexist") {
                                                $location.path('/login');
                                        }
                                }
                        }
                });
        };

	$scope.database = {
		'type' : null,
		'pgHost' : null,
		'pgPort' : null,
		'pgName' : null,
	};
	$scope.loadDatabase = function() {
		httpHandler.get('http://ec2-184-72-207-243.compute-1.amazonaws.com/app-Wes/ajax/load_database.php', 'json').then(function(data) {
                        if (data.error == null && data.payload != null) {
                                $scope.database.type = data.payload[0].type;
				$scope.database.pgHost = data.payload[0].pghost;
				$scope.database.pgPort = data.payload[0].pgport;
				$scope.database.pgName = data.payload[0].pgname;
                        } else if (data.error != null) {
                                if (data.error.type == "session") {
                                        if (data.error.message == "expired" || data.error.message == "doesnotexist") {
                                                $location.path('/LoginPage');
                                        }
                                }
                        }
                });
        };

	$scope.participants = {
		'active' : [],
		'inactive' : [],
                'total' : 0
        };
	$scope.loadParticipants = function() {
		httpHandler.get('http://ec2-184-72-207-243.compute-1.amazonaws.com/app-Wes/ajax/load_participants.php', 'json').then(function(data) { 
                        if (data.error == null && data.payload != null) {
				for (var i = 0; i < data.payload.length; i += 1) {
					var startDate = data.payload[i].startdate != null ? new Date(data.payload[i].startdate.substr(0, data.payload[i].startdate.length - 3).replace(' ','T')+'Z') : null;
                                        var endDate = data.payload[i].enddate != null ? new Date(data.payload[i].enddate.substr(0, data.payload[i].enddate.length - 3).replace(' ','T')+'Z') : null;
                                        if (startDate < Date.now() && endDate > Date.now()) {
                                                $scope.participants.active.push({
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
                                $scope.participants.total = $scope.participants.active.length + $scope.participants.inactive.length;
                        } else if (data.error != null) {
                                if (data.error.type == "session") {
                                        if (data.error.message == "expired" || data.error.message == "doesnotexist") {
                                                $location.path('/login');
                                        }
                                }
                        }
                });
        };

        $scope.logEntries = {
                'list' : [],
        };
        $scope.loadLogEntries = function() {
		httpHandler.get('http://ec2-184-72-207-243.compute-1.amazonaws.com/app-Wes/ajax/load_logentries.php', 'json').then(function(data) {
                        if (data.error == null && data.payload != null) {
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
                                        $location.path('/login');
                                }
                        }
                });
        };
	$scope.refreshLogEntries = function() {
                $scope.logEntries = {
                        'list' : [],
                };
                $scope.loadLogEntries();
        };

	$scope.studyFilterMenuText = "Details";
	$scope.toggleStudyFilterMenu = function() {
		if (document.getElementById("studyFilterMenu").style.display == "block") {
                        document.getElementById("studyFilterMenu").style.display = "none";
                } else {
                        document.getElementById("studyFilterMenu").style.display = "block"
                }
	};
	$scope.selectStudyDetails = function() {
		$scope.studyFilterMenuText = "Details";
                document.getElementById("studyDataLayer").style.display = "none";
		document.getElementById("studyParticipants").style.display = "none";
                document.getElementById("studyDetails").style.display = "block";
	};
	$scope.selectStudyDataLayer = function() {
		$scope.studyFilterMenuText = "Data Layer";
                document.getElementById("studyDetails").style.display = "none";
                document.getElementById("studyParticipants").style.display = "none";
                document.getElementById("studyDataLayer").style.display = "block";
	};
	$scope.selectStudyParticipants = function() {
		$scope.studyFilterMenuText = "Participants";
                document.getElementById("studyDataLayer").style.display = "none";
                document.getElementById("studyDetails").style.display = "none";
                document.getElementById("studyParticipants").style.display = "block";
	};

	$scope.participantFilterMenuText = "Active";
	$scope.toggleParticipantFilterMenu = function() {
                if (document.getElementById("participantFilterMenu").style.display == "block") {
                        document.getElementById("participantFilterMenu").style.display = "none";
                } else {
                        document.getElementById("participantFilterMenu").style.display = "block"
                }
        };
	$scope.selectActiveParticipants = function() {
                $scope.participantFilterMenuText = "Active";
		document.getElementById("inactiveParticipants").style.display = "none";
                document.getElementById("activeParticipants").style.display = "block";
        };
        $scope.selectInactiveParticipants = function() {
                $scope.participantFilterMenuText = "Inactive";
                document.getElementById("activeParticipants").style.display = "none";
                document.getElementById("inactiveParticipants").style.display = "block";
        };

        $(document).ready(function() {
		sessionHandler.refresh();

		$rootScope.navigationStackMenu.length = 0;
                $rootScope.navigationStackMenu.push("Studies");
                
		$scope.loadStudy();
		$scope.loadDataSource();
                $scope.loadDatabase();
		$scope.loadResearchers();
                $scope.loadParticipants();
		$scope.loadLogEntries();
        });
}])

.directive('participantlist', function() {
        return {
                restrict: 'E',
                scope: {
                        handle: '=handle'
                },
                templateUrl:'directives/participant_list.html'
        };
});
