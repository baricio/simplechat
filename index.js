/**
 * Created by Fabício on 18/05/16.
 */

var database = require('./database.js');
var striptags = require('striptags');
var express = require('express');
var app = express();
var http = require('http');
var http_server = http.Server(app);
var io = require('socket.io')(http_server);
var base64 = require('node-base64-image');
var user = {};


app.use('/css',express.static(__dirname + '/www/css'));
app.use('/js',express.static(__dirname + '/www/js'));
app.use('/lib',express.static(__dirname + '/bower_components'));
app.get('/', function(req, res){
    res.sendFile(__dirname + '/www/chat.html');
});

io.on('connection', function(socket){
    console.log('a user connected');

    database.getMessages('teste.com',function(err, data){
        if(!err){
            io.sockets.connected[socket.id].emit('history',data);
        }
    });

    socket.on('disconnect', function(){
        console.log('user disconnected');
    });

    socket.on('message', function(content){
        var dados = {};
        dados.user = user[content.id];
        dados.message = striptags(content.message);
        io.emit('message', dados);
        database.saveMessage(
            'teste.com',
            content.id,
            dados.user.name,
            dados.user.avatar,
            dados.message,
            function (err) {
                if (err) {
                    console.log(err);
                } else {
                    database.limitMessages('teste.com');
                    console.log('saved message');
                }
            }
        );
    });

    socket.on('login', function(login){
        base64.base64encoder('http://graph.facebook.com/'+ login.id +'/picture', {string: true}, function(err,image) {
            if (!err){
                user[login.id] = {name:login.name,avatar:image,id:login.id};
                io.emit('welcome', login.name + ' entrou na sala');
                io.sockets.connected[socket.id].emit('login',login.id);
            }
        });

    });

});

http_server.listen(3000, function(){
    console.log('listening on *:3000');
});
