/**
 * Created by Fabício on 18/05/16.
 */

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
    res.sendFile(__dirname + '/chat.html');
});

io.on('connection', function(socket){
    console.log('a user connected');

    socket.on('disconnect', function(){
        console.log('user disconnected');
    });

    socket.on('message', function(data){
        var text = data.nick +': '+ data.message;
        io.emit('message', text);
    });

    socket.on('login', function(login){
        var text = login + ' entrou na sala';
        io.emit('login', text);
    });

});

http.listen(3000, function(){
    console.log('listening on *:3000');
});