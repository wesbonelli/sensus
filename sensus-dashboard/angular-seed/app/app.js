'use strict';
	
angular.module('SensusPortal', [
	  	'ngRoute',
		'SensusPortal.LoginPage',
		'SensusPortal.CreateAccountPage',
		'SensusPortal.AccountPage',
		'SensusPortal.StudiesPage',
		'SensusPortal.CreateStudyPage',
		'SensusPortal.StudyPage',
		'SensusPortal.StudyDetailsPage',
		'SensusPortal.ParticipantPage',
	  	'SensusPortal.ParticipantsPage',
		'SensusPortal.version'
])

.config(['$routeProvider', function($routeProvider) {
  	$routeProvider.otherwise({redirectTo: '/LoginPage'});
}])

.directive('jqdatepicker', function () {
        return {
                restrict: 'A',
                require: 'ngModel',
                link: function (scope, element, attrs, ngModelCtrl) {
                        element.datepicker();
                }
        };
});
