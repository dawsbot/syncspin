var _ = require('lodash');
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');

// Memory is the new Redis
var rooms = {};
var users = {};

// Dupe removal garbage collector hack
setInterval(function() {
  _.forEach(rooms, function(room) {
    var found = [];
    room.songs = _.filter(room.songs, function(song) {
      var res = !_.contains(found, song.id);
      if (res) {
        // collected garbage
      }
      return res;
    });
  });
}, 500);

// Get the room from a room id
function getRoom(roomId) {
  var room = rooms[roomId];
  if (!room) {
    room = rooms[roomId] = {
      users: [],
      id: roomId,
      songs: [],
      nodes: [],
      playedSongs: [],
      sentence: {}
    };
  }

  room.count = _.filter(users, function(user) {
    return user.room === room.id;
  }).length;
  return room;
}

// This route populates the initial data of a room.
app.route('/api/:roomId').get(function(req, res) {
  res.json(getRoom(req.params.roomId));
});
app.route('/api/rooms').get(function(req, res) {
  res.json(rooms);
});

app.use('/', express.static('./public'));

app.route('/*').get(function(req, res) {
  res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', function(socket) {

  socket.on('setSentence', function(setSentence) {
    getRoom(setSentence.room).sentence = setSentence.sentence;
  });

  socket.on('vote', function(vote) {
    var song;
    var songs = getRoom(vote.room).songs;
    for (var i = 0; i < songs.length; i++) {
      if (songs[i].id === vote.id) {
        song = songs[i];
      }
    }
    song.votes += vote.change;
    io.emit('vote', vote);
  });

  socket.on('join', function(room) {
    var user = {
      room: room.id,
      id: socket.id
    };
    users[socket.id] = user;

    var userCt = _.filter(users, function(user) {
      return user.room === room.id;
    }).length;
    rooms[room.id].nodes.push({
      "name": "user" + user.id,
      "group": Math.floor(Math.random() * userCt)
    });
    io.emit('count', {
      room: room.id,
      count: userCt,
      nodes: room.nodes
    });
  });

  socket.on('newSongs', function(newSongs) {
    var room = getRoom(newSongs.room);
    _.each(newSongs.songs, function(song) {
      room.songs.push(song);
    });
    io.emit('newSongs', newSongs);
  });

  socket.on('play', function(play) {
    var room = getRoom(play.room);
    room.songs = _.filter(room.songs, function(song) {
      return song.id !== play.song;
    });
    io.emit('play', play);
  });

  var digest = {};
  socket.on('activity', function(activity) {
    console.log('Received activity level of ' + activity.level + ' from ' + socket.id + '.');
    digest[socket.id] = {
      level: activity.level,
      room: users[socket.id].room
    };
  });
  setInterval(function() {
    io.emit('activityDigest', digest);
    digest = {};
  }, 1000);

  socket.on('disconnect', function() {
    var usr = _.clone(users[socket.id]);
    delete users[socket.id];

    if (usr) {
      var userCt = _.filter(users, function(user) {
        return user.room === usr.room;
      }).length;
      io.emit('count', {
        room: usr.room,
        count: userCt
      });
    }
  });

});

var port = process.env.PORT || 3000;
http.listen(port, function() {
  console.log('listening on *:' + port);
});
