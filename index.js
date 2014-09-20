var _ = require('lodash');
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');

// Memory is the new Redis
var rooms = {};
var users = {};

// Get the room from a room id
function getRoom(roomId) {
  var room = rooms[roomId];
  if (!room) {
    room = rooms[roomId] = {
      users: [],
      id: roomId,
      songs: [{
        id: 'asdf',
        name: 'Recess',
        artist: 'Skrillex',
        artwork: 'http://upload.wikimedia.org/wikipedia/en/archive/5/52/20140314115000!RecessSkrillex.jpg',
        votes: 0
      }, {
        id: 'asdff',
        name: 'Play it Again',
        artist: 'Luke Bryan',
        artwork: 'http://tonefunk.com/wp-content/uploads/2014/03/UMG_cvrart_00602537511556_01_RGB72_1500x1500_13UAAIM59985.170x170-75.jpg',
        votes: 0
      }]
    };
  }
  return room;
}

// This route populates the initial data of a room.
app.route('/api/:roomId').get(function(req, res) {
  res.json(getRoom(req.params.roomId));
});
app.route('/api/rooms').get(function(req, res) {
  res.json(rooms);
});

app.use(express.static('./public'));

io.on('connection', function(socket) {

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
    io.emit('count', {
      room: room.id,
      count: userCt
    });
  });

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

http.listen(3000, function() {
  console.log('listening on *:3000');
});
