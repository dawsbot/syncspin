angular.module('syncspin', [
  'ui.router'
])
  .config(function($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('vote', {
        url: '/vote',
        templateUrl: 'templates/vote.html',
        controller: 'VoteCtrl'
      });
    $urlRouterProvider.otherwise('/vote');
  })
  .controller('VoteCtrl', function($scope) {});
