var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');

// Memory is the new Redis
var rooms = {};

// Get the room from a room id
function getRoom(roomId) {
  var room = rooms[roomId];
  if (!room) {
    room = rooms[roomId] = {
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

app.use('/', express.static('./public'));

io.on('connection', function(socket) {

  socket.on('vote', function(vote) {
    var song;
    var songs = getRoom(vote.room).songs;
    for (var i = 0; i < songs.length; i++ ) {
      if (songs[i].id === vote.id) {
        song = songs[i];
      }
    }
    song.votes += vote.change;
    io.emit('vote', vote);
  });

  socket.on('joinRoom', function(username) {
    // io.emit('joinroom'
  });

  socket.on('leaveRoom', function() {
    // io.emit('joinroom', 
  });

});

http.listen(3000, function() {
  console.log('listening on *:3000');
});
