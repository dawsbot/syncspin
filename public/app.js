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
  .controller('VoteCtrl', function($scope) {
    $scope.songs = [{
      name: 'Recess',
      artist: 'Skrillex',
      artwork: 'http://upload.wikimedia.org/wikipedia/en/archive/5/52/20140314115000!RecessSkrillex.jpg',
      votes: 0
    }, {
      name: 'Play it Again',
      artist: 'Luke Bryan',
      artwork: 'http://tonefunk.com/wp-content/uploads/2014/03/UMG_cvrart_00602537511556_01_RGB72_1500x1500_13UAAIM59985.170x170-75.jpg',
      votes: 0
    }];

    $scope.upvoteSong = function(song) {
      if (song.vote === 1) {
        song.votes--;
        song.vote = 0;
      } else if (song.vote === -1) {
        song.votes += 2;
        song.vote = 1;
      } else {
        song.votes++;
        song.vote = 1;
      }
    };

    $scope.downvoteSong = function(song) {
      if (song.vote === -1) {
        song.votes++;
        song.vote = 0;
      } else if (song.vote === 1) {
        song.votes -= 2;
        song.vote = -1;
      } else {
        song.votes--;
        song.vote = -1;
      }
    };
  });
