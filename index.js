var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');

app.use('/', express.static('./public'));

io.on('connection', function(socket){
    socket.on('upvote', function(vote){
        io.emit('upvote', vote);
    });
    socket.on('downvote', function(vote){
        io.emit('downvote', vote);
    });
    socket.on('joinRoom', function(username){
        // io.emit('joinroom'
    });
    socket.on('leaveRoom', function(){
        // io.emit('joinroom', 
    });
});

io.on('connection', function(socket){

});

http.listen(3000, function(){
    console.log('listening on *:3000');
});
