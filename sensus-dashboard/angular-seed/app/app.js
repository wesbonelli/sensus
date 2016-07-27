'use strict';
	
angular.module('SensusPortal', [
	  	'ngRoute',
		'SensusPortal.LoginPage',
		'SensusPortal.RegisterResearcherPage',
		'SensusPortal.StudiesPage',
		'SensusPortal.CreateStudyPage',
		'SensusPortal.StudyPage',
		'SensusPortal.StudyDetailsPage',
		'SensusPortal.ParticipantPage',
	  	'SensusPortal.EditParticipantsPage',
		'SensusPortal.version'
])
.config(['$routeProvider', function($routeProvider) {
  	$routeProvider.otherwise({redirectTo: '/LoginPage'});
}]);
