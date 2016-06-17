/**
 * Created by Fabício on 18/05/16.
 */

var database    = require('./database.js');
var striptags   = require('striptags');
var express     = require('express');
var app         = express();
var http        = require('http');
var http_server = http.Server(app);
var io          = require('socket.io')(http_server);
var base64      = require('node-base64-image');
var user        = {};
var site        = '';


app.use('/css',express.static(__dirname + '/www/css'));
app.use('/js',express.static(__dirname + '/www/js'));
app.use('/lib',express.static(__dirname + '/bower_components'));
app.get('/:site', function(req, res){
    if(req.params.site){
        res.sendFile(__dirname + '/www/chat.html');
        site = req.params.site;
    }else{
        res.status(400);
        res.send('fail to load');
    }
});

app.get('/admin/:site', function(req, res){
    if(req.params.site){
        res.sendFile(__dirname + '/www/chat.html');
        site = req.params.site;
    }else{
        res.status(400);
        res.send('fail to load');
    }
});

var getMessages = function(io,socket){
    database.getMessages(site,function(err, data){
        if(!err){
            io.sockets.connected[socket.id].emit('history',data);
        }
    });
};

var getCensura = function(io){
    database.getCensura(site,function(err, data){
        if(!err){
            io.emit('listaCensura',data);
        }
    });
}

var getUsers = function(io){
    database.getUsers(site,function(err, data){
        if(!err){
            io.emit('listaUser',data);
        }
    });
}

var getBanidos = function(io){
    database.getBanidos(site,function(err, data){
        if(!err){
            io.emit('listaBanidos',data);
        }
    });
}

io.on('connection', function(socket){
    console.log('a user connected');

    getMessages(io,socket);
    getCensura(io);
    getUsers(io);
    getBanidos(io);

    socket.on('disconnect', function(){
        console.log('user disconnected');
    });

    socket.on('message', function(content){
        var dados = {};
        dados.user = user[content.id];
        dados.message = striptags(content.message);
        io.emit('message', dados);
        database.saveMessage(
            site,
            content.id,
            dados.user.name,
            dados.user.avatar,
            dados.message,
            function (err) {
                if (err) {
                    console.log(err);
                } else {
                    database.limitMessages(site);
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

    socket.on('saveCensura', function(palavra){
        database.saveCensura(
            site,
            palavra,
            function (err) {
                if (err) {
                    console.log(err);
                } else {
                    database.getCensura(site,function(err, data){
                        if(!err){
                            io.emit('listaCensura',data);
                        }
                    })
                }
            }
        );
    });

    socket.on('removeCensura', function(palavra){
        database.removeCensura(site,palavra,function(err){
            if(err){
                console.log(err);
            }else{
                console.log('Removido '+ palavra);
            }
        });
    });

    socket.on('banir', function(user){
        database.banir(site,user,function(err){
            if(err){
                console.log(err);
            }else{
                getUsers(io);
                getBanidos(io);
            }
        });
    });

    socket.on('ativar', function(user){
        database.ativar(site,user,function(err){
            if(err){
                console.log(err);
            }else{
                getUsers(io);
                getBanidos(io);
            }
        });
    });

});

http_server.listen(3000, function(){
    console.log('listening on *:3000');
});
