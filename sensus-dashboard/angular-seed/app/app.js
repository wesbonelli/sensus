'use strict';
	
angular.module('myApp', [
	  	'ngRoute',
		'myApp.LoginPage',
		'myApp.RegisterResearcherPage',
		'myApp.StudyLandingPage',
		'myApp.CreateStudyPage',
		'myApp.SelectedStudyPage',
	  	'myApp.RegisterParticipantPage',
		'myApp.version'
	])
.config(['$routeProvider', function($routeProvider) {
  	$routeProvider.otherwise({redirectTo: '/LoginPage'});
}]);
