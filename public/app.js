// Socket
var socket;
if (location.hostname.indexOf('localhost') > -1) {
  socket = io('http://localhost');
} else {
  socket = io('http://syncsp.in');
}

// Ghetto
var uuid = Math.floor(Math.random() * 1000000); // This is not actually a uuid

angular.module('syncspin', [
  'ui.router',
])
  .config(function($locationProvider, $stateProvider, $urlRouterProvider) {
    $locationProvider.html5Mode(true);
    $stateProvider
      .state('create', {
        url: '/create',
        templateUrl: '/templates/create.html',
        controller: 'CreateCtrl'
      })
      .state('host', {
        url: '/:roomId/host',
        templateUrl: '/templates/host.html',
        controller: 'HostCtrl'
      })
      .state('vote', {
        url: '/{roomId:[\\w\\-]+}',
        templateUrl: '/templates/vote.html',
        controller: 'VoteCtrl'
      });
    $urlRouterProvider.otherwise('/create');
  })
  .controller('CreateCtrl', function($scope, $location) {
    $scope.createRoom = function() {
      var roomId = colors[Math.floor(Math.random() * colors.length)] + '-' + landforms[Math.floor(Math.random() * landforms.length)]
      $location.url('/' + roomId + '/host');
    };
    $scope.joinRoom = function() {
      var roomId = $scope.roomToJoin;
      $location.url('/' + roomId);
    };
  })
  .controller('HostCtrl', function($scope, $stateParams, $http) {
    $scope.room = {};
    $http.get('/api/' + $stateParams.roomId).success(function(data) {
      $scope.room = data;
      $scope.room.count = 0;
    });
    vizInit();
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

    socket.on('count', function(roomCount) {
      if ($scope.room.id !== roomCount.room) {
        console.log($scope.room.id + ' !== ' + roomCount.room);
        return;
      }
      $scope.room.count = roomCount.count;
      $scope.$apply();
    });
  })
  .controller('RoomsCtrl', function($scope, $stateParams, $http) {
    $http.get('/api/rooms').success(function(data) {
      $scope.rooms = data;
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
  })
  .controller('VoteCtrl', function($scope, $stateParams, $http) {
    $scope.room = {};
    $http.get('/api/' + $stateParams.roomId).success(function(data) {
      $scope.room = data;
      socket.emit('join', {
        id: $scope.room.id
      });
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
