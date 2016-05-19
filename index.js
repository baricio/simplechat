/**
 * Created by Fabício on 18/05/16.
 */
var express = require('express');
var app = express();
var http = require('http');
var http_server = http.Server(app);
var io = require('socket.io')(http_server);
var base64 = require('node-base64-image');

app.use('/js',express.static(__dirname + '/js'));
app.get('/', function(req, res){
    res.sendFile(__dirname + '/chat.html');
});

io.on('connection', function(socket){
    console.log('a user connected');

    io.sockets.connected[socket.id].emit('current_user', socket.id);

    socket.on('disconnect', function(){
        console.log('user disconnected');
    });

    socket.on('message', function(data){
        var text = data.message;
        io.emit('message', text);
    });

    socket.on('login', function(login){
        console.log(login);
        base64.base64encoder('http://graph.facebook.com/'+ login.id +'/picture', {string: true}, function(err,image) {
            if (!err){
                login.avatar = image;
                io.sockets.connected[login.session].emit('login', login);
                io.emit('welcome', login.name + ' entrou na sala');
            }
        });

    });

});

http_server.listen(3000, function(){
    console.log('listening on *:3000');
});
