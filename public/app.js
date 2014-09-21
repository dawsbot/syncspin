var timezone = '-0500';

// Socket
var base;
if (location.hostname === 'localhost') {
  base = 'http://localhost:3000/';
} else {
  base = 'http://www.syncsp.in/';
}
var socket = io(base);

// Ghetto
var uuid = Math.floor(Math.random() * 1000000); // This is not actually a uuid

angular.module('syncspin', [
  'ui.router',
  'ui.bootstrap'
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
      var client_id = 'ytuyn29p9e5b4udwtgwmughe';
      window.location = ('https://partner.api.beatsmusic.com/v1/oauth2/authorize?state=xyz]&response_type=token&client_id=' + client_id + '&redirect_uri=' + base + roomId + '/host');
    };
    $scope.joinRoom = function() {
      var roomId = $scope.roomToJoin;
      $location.url('/' + roomId);
    };
  })
  .controller('HostCtrl', function($scope, $stateParams, $http, $location) {

    // Host ctrl
    $scope.room = {};
    $http.get('/api/' + $stateParams.roomId).success(function(data) {
      $scope.room = data;
      $scope.room.count = 0;
      _.forEach($scope.room.songs, function(song) {
        (function(sng) {
          var artist = sng.artist;
          var name = sng.name;
          $http.get('http://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=4715e5e59b0d1f7153025ed7e0ccc627&artist=' + artist + '&track=' + name + '&format=json')
            .success(function(data) {
              try {
                sng.artwork = data.track.album.image[2]['#text'];
              } catch (e) {}
            });
        })(song);
      });
      $scope.sentence = data.sentence;
      if ($scope.room.songs.length > 0) {
        playNextSong();
        setTimeout(initVis, 1000);
      }
    });
    $scope.playing = {};

    // Audio stuff
    var bam = $scope.bam = new BeatsAudioManager('SyncSpin');

    bam.on('error', function(value) {
      console.log('Error: ' + value);
    });

    bam.on('ended', playNextSong);

    $scope.paused = false;
    $scope.controls = {
      play: function() {
        bam.play();
        $scope.paused = false;
        $scope.$apply();
      },
      pause: function() {
        bam.pause();
        $scope.paused = true;
        $scope.$apply();
      },
      next: function() {
        playNextSong();
      }
    };

    function playNextSong() {
      if ($scope.room.songs.length < 5) {
        updatePlaylist($scope.sentence);
        console.log('should update');
      }

      var run = function() {
        window.runStart = true;
        bam.clientId = 'ytuyn29p9e5b4udwtgwmughe';
        bam.authentication = {
          access_token: getToken(),
          user_id: 'liam.t.sargent'
        };

        // The next song to play

        $scope.room.songs.sort(function(a, b) {
          if (a.votes < b.votes) {
            return 1;
          } else if (a.votes > b.votes) {
            return -1;
          } else {
            return 0;
          }
        });
        var nextup = $scope.room.songs.splice(0, 1)[0];
        $scope.playing = nextup;

        var nextId = nextup.id;

        socket.emit('play', {
          room: $scope.room.id,
          song: nextId
        });

        setInterval(function() {
          initVis();
          console.log('HELLYEA');
        }, 1000);
        $scope.room.playedSongs.push(nextId);
        bam.identifier = nextId;
        bam.load();
        $scope.$apply();
      };

      if (!bam.playing) {
        bam.on('ready', run);
        // HACK
        setTimeout(function() {
          if (!window.runStart) {
            run();
          }
        }, 500);
      } else {
        run();
      }
    };

    function pad(num) {
      var s = "000000000" + num;
      return s.substr(s.length - 2);
    }

    // Update seek
    $scope.seekTime = '0:00 / 0:00';

    setInterval(function() {
      var theBam = $scope.bam;
      if (!theBam || theBam.readyState === 0) {
        return;
      }

      var time = Math.floor(theBam.currentTime);
      var secs = time % 60;
      var mins = (time - secs) / 60;

      var total = Math.floor(theBam.duration);
      var totalSecs = total % 60;
      var totalMins = (total - totalSecs) / 60;

      $scope.seekTime = mins + ':' + pad(secs) + ' / ' + totalMins + ':' + pad(totalSecs);
      $scope.$apply();
    }, 500);

    // PLAYLIST CRAP
    function getToken() {
      return $location.search().access_token;
    }

    function updatePlaylist(sentence) {
      var token = getToken();
      $http({
        url: 'https://partner.api.beatsmusic.com/v1/api/me',
        type: 'GET',
        headers: {
          Authorization: 'Bearer ' + token
        }
      }).success(function(data) {
        var user_id = data.result.user_context;

        function idOf(type, display) {
          return _.find($scope.options[type], function(opt) {
            return opt.display === display;
          }).id;
        }

        var place = idOf('places', sentence.place);
        var activity = idOf('activities', sentence.activity);
        var people = idOf('people', sentence.people);
        var genre = idOf('genres', sentence.genre);

        var token = getToken();

        $http.post(
          'https://partner.api.beatsmusic.com/v1/api/users/' + user_id + '/recs/the_sentence?place=' + place + '&activity=' + activity + '&people=' + people + '&genre=' + genre + '&time_zone=' + timezone + '&access_token=' + token
        ).success(function(data) {
          var array = data.data;
          for (ii = 0; ii < array.length; ii++) {

            var sidd = array[ii].id;
            var name = array[ii].title;
            var artist = array[ii].artist_display_name;

            var sng = {
              id: sidd,
              name: name,
              artist: artist,
              votes: 0
            };
            $scope.room.songs.push(sng);

            (function(sng) {
              $http.get('http://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=4715e5e59b0d1f7153025ed7e0ccc627&artist=' + artist + '&track=' + name + '&format=json')
                .success(function(data) {
                  try {
                    sng.artwork = data.track.album.image[2]['#text'];
                  } catch (e) {}
                });
            })(sng);
          }
          socket.emit('newSongs', {
            room: $scope.room.id,
            songs: $scope.room.songs
          });
          playNextSong();
        });
      });
    }

    $scope.generatePlaylist = function() {
      var s = $scope.sentence; // Get sentence
      // dafuq this doesnt need to be realtime yolo
      socket.emit('setSentence', {
        room: $scope.room.id,
        sentence: s
      });
      updatePlaylist(s);
    };

    $scope.sentence = {};

    $scope.options = {
      places: [{
        id: "78",
        "display": "in the car"
      }, {
        id: "44",
        "display": "out and about"
      }, {
        id: "43",
        "display": "at my computer"
      }, {
        id: "50",
        "display": "in the shower"
      }, {
        id: "53",
        "display": "at a party"
      }, {
        id: "54",
        "display": "in class"
      }, {
        id: "55",
        "display": "at home"
      }, {
        id: "59",
        "display": "at work"
      }, {
        id: "58",
        "display": "fashionably late"
      }, {
        id: "75",
        "display": "in bed"
      }, {
        id: "77",
        "display": "in the air"
      }, {
        id: "79",
        "display": "in the club"
      }, {
        id: "80",
        "display": "slacking off"
      }, {
        id: "81",
        "display": "bored as hell"
      }, {
        id: "106",
        "display": "thawing out"
      }, {
        id: "107",
        "display": "on a rooftop"
      }, {
        id: "108",
        "display": "in my underwear"
      }, {
        id: "109",
        "display": "on the subway"
      }, {
        id: "178",
        "display": "at the gym"
      }],

      activities: [{
        id: "67",
        "display": "entertaining"
      }, {
        id: "212",
        "display": "dreaming"
      }, {
        id: "214",
        "display": "breaking stuff"
      }, {
        id: "47",
        "display": "being sad"
      }, {
        id: "46",
        "display": "going outside"
      }, {
        id: "48",
        "display": "celebrating"
      }, {
        id: "49",
        "display": "chilling out"
      }, {
        id: "52",
        "display": "starting a riot"
      }, {
        id: "60",
        "display": "humming along"
      }, {
        id: "61",
        "display": "cooking"
      }, {
        id: "62",
        "display": "partying hard"
      }, {
        id: "66",
        "display": "driving"
      }, {
        id: "68",
        "display": "jetsetting"
      }, {
        id: "71",
        "display": "making love"
      }, {
        id: "73",
        "display": "going back in time"
      }, {
        id: "84",
        "display": "kicking back"
      }, {
        id: "85",
        "display": "making bad choices"
      }, {
        id: "112",
        "display": "gaming"
      }, {
        id: "113",
        "display": "dancing"
      }, {
        id: "114",
        "display": "taking a selfie"
      }, {
        id: "115",
        "display": "getting naked"
      }, {
        id: "116",
        "display": "pre-partying"
      }, {
        id: "117",
        "display": "breaking something"
      }, {
        id: "119",
        "display": "romancing"
      }, {
        id: "120",
        "display": "running"
      }, {
        id: "121",
        "display": "saving the world"
      }, {
        id: "123",
        "display": "studying"
      }, {
        id: "126",
        "display": "wasting time"
      }, {
        id: "127",
        "display": "waking up"
      }, {
        id: "128",
        "display": "working out"
      }, {
        id: "129",
        "display": "working"
      }],

      people: [{
        id: "88",
        "display": "your mom"
      }, {
        id: "86",
        "display": "my BFF"
      }, {
        id: "51",
        "display": "myself"
      }, {
        id: "87",
        "display": "my boo"
      }, {
        id: "90",
        "display": "my co-workers"
      }, {
        id: "91",
        "display": "the boys"
      }, {
        id: "93",
        "display": "strangers"
      }, {
        id: "94",
        "display": "no regrets"
      }, {
        id: "96",
        "display": "my boss"
      }, {
        id: "97",
        "display": "extraterrestrials"
      }, {
        id: "98",
        "display": "my lover"
      }, {
        id: "99",
        "display": "my pets"
      }, {
        id: "100",
        "display": "my thoughts"
      }, {
        id: "111",
        "display": "beautiful people"
      }, {
        id: "118",
        "display": "a stiff drink"
      }, {
        id: "122",
        "display": "my girls"
      }, {
        id: "132",
        "display": "your ex"
      }, {
        id: "134",
        "display": "my friends"
      }, {
        id: "135",
        "display": "my haters"
      }],

      genres: [{
        id: "8",
        "display": "Classic Rock"
      }, {
        id: "1",
        "display": "90s Pop-Rock"
      }, {
        id: "2",
        "display": "Alt Rock"
      }, {
        id: "3",
        "display": "Americana"
      }, {
        id: "7",
        "display": "Classic Country"
      }, {
        id: "9",
        "display": "Country"
      }, {
        id: "10",
        "display": "The 2000s"
      }, {
        id: "11",
        "display": "Disco"
      }, {
        id: "13",
        "display": "Dance"
      }, {
        id: "14",
        "display": "Electronic"
      }, {
        id: "16",
        "display": "Hair Metal"
      }, {
        id: "17",
        "display": "Rock"
      }, {
        id: "18",
        "display": "Hardcore Hip-Hop"
      }, {
        id: "19",
        "display": "Hardcore"
      }, {
        id: "21",
        "display": "Indie"
      }, {
        id: "22",
        "display": "Jazz Vocals"
      }, {
        id: "23",
        "display": "Jazz"
      }, {
        id: "24",
        "display": "Metal"
      }, {
        id: "25",
        "display": "Musica Mexicana"
      }, {
        id: "26",
        "display": "Musica Tropical"
      }, {
        id: "27",
        "display": "New Wave"
      }, {
        id: "28",
        "display": "Old School Hip-Hop"
      }, {
        id: "29",
        "display": "Old Skool Dance"
      }, {
        id: "30",
        "display": "Oldies"
      }, {
        id: "31",
        "display": "Pop Latino"
      }, {
        id: "32",
        "display": "Pop"
      }, {
        id: "33",
        "display": "Punk"
      }, {
        id: "34",
        "display": "Reggae & Dancehall"
      }, {
        id: "36",
        "display": "Seminal Indie"
      }, {
        id: "37",
        "display": "Smooth Jazz"
      }, {
        id: "38",
        "display": "Soft Rock"
      }, {
        id: "39",
        "display": "Sounds of the 70s"
      }, {
        id: "40",
        "display": "The 60s"
      }, {
        id: "41",
        "display": "The 80s"
      }, {
        id: "42",
        "display": "Vintage Soul & Funk"
      }, {
        id: "136",
        "display": "Hip-Hop"
      }, {
        id: "137",
        "display": "R&B"
      }]
    };

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
        return;
      }
      $scope.room.count = roomCount.count;
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

      _.each(data.songs, function(song) {
        (function(sng) {
          $http.get('http://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=4715e5e59b0d1f7153025ed7e0ccc627&artist=' + song.artist + '&track=' + song.name + '&format=json')
            .success(function(data) {
              try {
                sng.artwork = data.track.album.image[2]['#text'];
              } catch (e) {}
            });
        })(song);
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

    socket.on('play', function(play) {
      $scope.room.songs = _.filter($scope.room.songs, function(song) {
        return song.id !== play.song;
      });
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
    
    setupAccelerometer();
  });
