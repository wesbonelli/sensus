'use strict';
	
angular.module('SensusPortal', [
	  	'ngRoute',
		'SensusPortal.loginCtrl',
		'SensusPortal.createAccountCtrl',
		'SensusPortal.accountCtrl',
		'SensusPortal.studiesCtrl',
		'SensusPortal.createStudyCtrl',
		'SensusPortal.studyCtrl',
		'SensusPortal.studyDetailsCtrl',
		'SensusPortal.studyDataCtrl',
		'SensusPortal.participantDataCtrl',
		'SensusPortal.participantCtrl',
	  	'SensusPortal.participantsCtrl',
		'SensusPortal.logEntryCtrl',
		'SensusPortal.logEntriesCtrl',
		'SensusPortal.version'
])

/* not much to do here besides set the login page as default */
.config(['$routeProvider', function($routeProvider) {
  	$routeProvider.otherwise({redirectTo: '/login'});
}])

/* services */
.factory('httpHandler', ['$http', function($http) {
        return {
                get: function(url, type) {
                        return $http({
                                method : 'GET',
                                url : url,
                                dataType : type,
                                context : document.body
                        }).then(function(response) {
                                return response.data;
                        });
                },
                post: function(url, payload) {
                        return $http({
                                method : 'POST',
                                url : url,
                                data : payload,
                                headers : { 'Content-type': 'application/x-www-form-urlencoded' }
                        }).then(function(response) {
                                return response.data;
                        });
                }
        };
}])
/* TODO websocket handler */
.factory('sessionHandler', ['$rootScope', 'httpHandler', function($rootScope, httpHandler) {
        return {
                load: function() {
                        return httpHandler.get('http://ec2-184-72-207-243.compute-1.amazonaws.com/app-Wes/ajax/load_session_information.php', 'json');
                },
                update: function(loggedIn, userId, userEmailAddress, userRole, studyId, participantId, logEntryId) {
			/* update the root scope */
                        $rootScope.session.loggedIn = loggedIn;
                        $rootScope.session.userId = userId;
                        $rootScope.session.userEmailAddress = userEmailAddress;
                        $rootScope.session.userRole = userRole;
                        $rootScope.session.studyId = studyId;
                        $rootScope.session.participantId = participantId;
                        $rootScope.session.logEntryId = logEntryId;
			/* update the php session */
                        var payload = 'loggedIn=' + loggedIn + '&';
                        payload += 'userId=' + userId + '&';
                        payload += 'userEmailAddress=' + userEmailAddress + '&';
                        payload += 'userRole=' + userRole + '&';
                        payload += 'studyId=' + studyId + '&';
                        payload += 'participantId=' + participantId + '&';
                        payload += 'logEntryId=' +logEntryId;
                        return httpHandler.post('http://ec2-184-72-207-243.compute-1.amazonaws.com/app-Wes/ajax/update_session_information.php', payload);
                },
                refresh: function() {
                        httpHandler.get('http://ec2-184-72-207-243.compute-1.amazonaws.com/app-Wes/ajax/load_session_information.php', 'json').then(function(data) {
                                $rootScope.session.loggedIn = data.payload.logged_in;
                                $rootScope.session.userId = data.payload.user_id;
                                $rootScope.session.userEmailAddress = data.payload.user_email_address;
                                $rootScope.session.userRole = data.payload.user_role;
                                $rootScope.session.studyId = data.payload.study_id;
                                $rootScope.session.participantId = data.payload.participant_id;
                                $rootScope.session.logEntryId = data.payload.log_entry_id;
                        });

                }
        };
}])
.factory('headerMenuHandler', ['$rootScope', function($rootScope) {
        return {
                toggleUserMenu: function() {
                        if (document.getElementById("userMenu").style.display == "block") {
                                document.getElementById("userMenu").style.display = "none";
                        } else {
                                document.getElementById("userMenu").style.display = "block"
                        }
                },
        };
}])

/* root scope properties and functions */
.run(function($rootScope, $location, $route, httpHandler, sessionHandler) {

	/* global properties */
    	$rootScope.session = {
                'loggedIn' : false,
                'userId' : null,
		'userEmailAddress' : null,
                'userRole' : null,
                'studyId' : null,
                'participantId' : null,
                'logEntryId' : null
     	};
	$rootScope.studies = [];
	$rootScope.currentStudy = {
		'id' : '',
                'title' : '',
                'startDate' : '',
                'endDate' : '',
                'description' : '',
                'dataStorageType' : '',
                'databaseType' : '',
		'participants' : [],
		'logEntries' : []
	};
	/* reference:
	 * 
	 * 	participant
	 *		id
	 *		identifier
	 *		startDate
	 *		endDate
	 *		logEntries[]
	 *		TODO how to handle data?
	 *		mostRecentDatum
	 *			type
	 *			timestamp
	 *
	 * 	log entry
	 * 		id
	 * 		timestamp
	 * 		message
	 */

	/* header menu user submenu */
	$rootScope.toggleUserMenu = function() {
		if (document.getElementById("userMenu").style.display == "block") {
			document.getElementById("userMenu").style.display = "none";
		} else {
			document.getElementById("userMenu").style.display = "block"
		}
	};
	window.onclick = function(e) {
                if (!e.target.matches('.header_dropdown_button') && !e.target.matches('.dropdown_button')) {
			var elements = document.getElementsByClassName('dropdown_content');
			for (var element of elements) {
				element.style.display = 'none';
			}
                }
        };

	/* header menu navigation stack submenu */
	$rootScope.navigationStackMenu = [];

	/* subpage navigation */
	$rootScope.signOut = function() {
		httpHandler.get('http://ec2-184-72-207-243.compute-1.amazonaws.com/app-Wes/ajax/signout.php', 'json').then(function() {
			$location.path('/login');
		});
	};
	$rootScope.navTo = function(target) {
		if (target == "Studies" ||
			target == "Participants" ||
			target == "Log Entries" ||
			target == "Account" ||
			target == "Study Data" ||
			target == "Create Study") {
			eval("$rootScope.navTo" + target.replace(/\s+/g, '') + "()");
		} else {
			$route.reload();
		}
	};
	$rootScope.navToAccount = function() {
		if ($location.path() == '/account') {
			$route.reload();
		} else {
			$location.path('/account');
		}
	};
	$rootScope.navToCreateStudy = function() {
		if ($location.path() == '/create_study') {
                        $route.reload();
                } else {
                        $location.path('/create_study');
                }
	};
	$rootScope.navToStudies = function() {
		if ($location.path() == '/studies') {
                        $route.reload();
                } else {
			sessionHandler.update($rootScope.session.loggedIn, $rootScope.session.userId, $rootScope.session.userEmailAddress, $rootScope.session.userRole, null, null, null);
                        $location.path('/studies');
                }
	};
	$rootScope.navToStudyParticipants = function() {
		if ($location.path() == '/participants') {
                        $route.reload();
                } else {
			sessionHandler.update($rootScope.session.loggedIn, $rootScope.session.userId, $rootScope.session.userEmailAddress, $rootScope.session.userRole, $rootScope.session.studyId, null, null);
                        $location.path('/participants');
                }
	};
	$rootScope.navToLogEntries = function() {
		if ($location.path() == '/study') {
                        $route.reload();
                } else {
                        $location.path('/study');
			$rootScope.navigationStackMenu.length = 0;
			$rootScope.navigationStackMenu.push("Studies");
			if (study != null)
				$rootScope.navigationStackMenu.push(study.title);
			$rootScope.navigationStackMenu.push("Participants");
			if (participant != null)
				$rootScope.navigationStackMenu.push(participant.identifier);
			$rootScope.navigationStackMenu.push("Log Entries");
                }
	};
	$rootScope.navToStudy = function(study) {
		if ($location.path() == '/study') {
                        $route.reload();
                } else {
			sessionHandler.update($rootScope.session.loggedIn, $rootScope.session.userId, $rootScope.session.userEmailAddress, $rootScope.session.userRole, study.id, null, null);
                        $location.path('/study');
                }
	};
	$rootScope.navToStudyDetails = function() {
		if ($location.path() == '/study_details') {
                        $route.reload();
                } else {
			sessionHandler.update($rootScope.session.loggedIn, $rootScope.session.userId, $rootScope.session.userEmailAddress, $rootScope.session.userRole, $rootScope.session.studyId, null, null);
                        $location.path('/study_details');
                }
        };
        $rootScope.navToStudyData = function() {
		if ($location.path() == '/study_data') {
                        $route.reload();
                } else {
			sessionHandler.update($rootScope.session.loggedIn, $rootScope.session.userId, $rootScope.session.userEmailAddress, $rootScope.session.userRole, study.id, null, null);
                        $location.path('/study_data');
			$rootScope.navigationStackMenu.length = 0;
			$rootScope.navigationStackMenu.push("Studies");
                        $rootScope.navigationStackMenu.push(study.title);
                        $rootScope.navigationStackMenu.push("Data");
                }
        };
	$rootScope.navToParticipant = function(participant) {
		if ($location.path() == '/participant') {
                        $route.reload();
                } else {
			sessionHandler.update($rootScope.session.loggedIn, $rootScope.session.userId, $rootScope.session.userEmailAddress, $rootScope.session.userRole, $rootScope.session.studyId, participant.id, null);
                        $location.path('/participant');
                }
	};
	$rootScope.navToLogEntry = function(study, participant, logEntry) {
		if ($location.path() == '/log_entry') {
                        $route.reload();
                } else {
			sessionHandler.update($rootScope.session.loggedIn, $rootScope.session.userId, $rootScope.session.userEmailAddress, $rootScope.session.userRole, study != null ? study.id : null, participant != null ? participant.id : null, logEntry.id);
                        $location.path('/log_entry');
			$rootScope.navigationStackMenu.length = 0;
                        $rootScope.navigationStackMenu.push("Studies");
			if (study != null)
				$rootScope.navigationStackMenu.push(study.title);
			if (participant != null) {
				$rootScope.navigationStackMenu.push("Participants");
                        	$rootScope.navigationStackMenu.push(participant.identifier);
			}
			$rootScope.navigationStackMenu.push("Log Entries");
			$rootScope.navigationStackMenu.push(logEntry.id);
                }
	};
})

/* directives */
.directive('jqdatepicker', function () {
        return {
                restrict: 'A',
                require: 'ngModel',
                link: function (scope, element, attrs, ngModelCtrl) {
                        element.datepicker();
                }
        };
})
.directive('logentrylist', function() {
        return {
                restrict: 'E',
                scope: {
                        handle: '=handle'
                },
                templateUrl:'directives/log_entry_list.html'
        };
});
