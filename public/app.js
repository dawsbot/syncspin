// Socket
var socket = io('http://localhost');

// Ghetto
var uuid = Math.floor(Math.random() * 1000000); // This is not actually a uuid

angular.module('syncspin', [
  'ui.router'
])
  .config(function($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('create', {
        url: '/create',
        templateUrl: 'templates/create.html',
        controller: 'CreateCtrl'
      })
      .state('host', {
        url: '/:roomId/host',
        templateUrl: 'templates/host.html',
        controller: 'HostCtrl'
      })
      .state('vote', {
        url: '/:roomId',
        templateUrl: 'templates/vote.html',
        controller: 'VoteCtrl'
      });
    $urlRouterProvider.otherwise('/create');
  })
  .controller('CreateCtrl', function($scope, $location) {
    $scope.createRoom = function() {
      var roomId = 'Loon';
      $location.url('/' + roomId + '/host');
    };
  })
  .controller('HostCtrl', function($scope, $stateParams) {
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
    $scope.roomId = $stateParams.roomId;
  })
  .controller('VoteCtrl', function($scope, $stateParams, $http) {
    $scope.room = {};
    $http.get('/api/' + $stateParams.roomId).success(function(data) {
      $scope.room = data;
    });

    socket.on('vote', function(vote) {
      if (vote.uuid === uuid) {
        return;
      }
      var songs = $scope.room.songs;
      for (var i = 0; i < songs.length; i++) {
        if (songs[i].id === vote.id) {
          songs[i].votes += vote.change;
        }
      }
      $scope.$apply();
    });

    function changeVotes(song, amt) {
      song.votes += amt;
      socket.emit('vote', {
        id: song.id,
        room: $scope.room.id,
        change: amt,
        uuid: uuid
      });
    }

    $scope.upvoteSong = function(song) {
      if (song.vote === 1) {
        changeVotes(song, -1);
        song.vote = 0;
      } else if (song.vote === -1) {
        changeVotes(song, 2);
        song.vote = 1;
      } else {
        changeVotes(song, 1);
        song.vote = 1;
      }
    };

    $scope.downvoteSong = function(song) {
      if (song.vote === -1) {
        changeVotes(song, 1);
        song.vote = 0;
      } else if (song.vote === 1) {
        changeVotes(song, -2);
        song.vote = -1;
      } else {
        changeVotes(song, -1);
        song.vote = -1;
      }
    };
  });
