/**
 * Created by Fabício on 18/05/16.
 */

var database      = require('./database.js');
var striptags     = require('striptags');
var express       = require('express');
var app           = express();
var http          = require('http');
var http_server   = http.Server(app);
var io            = require('socket.io')(http_server);
var base64        = require('node-base64-image');
var user          = {};


app.use('/css',express.static(__dirname + '/www/css'));
app.use('/js',express.static(__dirname + '/www/js'));
app.use('/lib',express.static(__dirname + '/bower_components'));

app.get('/favicon.ico', function(req, res) {
    res.status(200);
    res.send('');
});

app.get('/:site', function(req, res){
    if(req.params.site){
        res.sendFile(__dirname + '/www/chat.html');
    }else{
        res.status(400);
        res.send('fail to load');
    }
});

app.get('/admin/:site', function(req, res){
    if(req.params.site){
        res.sendFile(__dirname + '/www/admin.html');
        sendSite(req.params.site);
    }else{
        res.status(400);
        res.send('fail to load');
    }
});

var getMessages = function(io,socket,site){
    database.getMessages(site,function(err, data){
        if(!err){
            io.sockets.in(site).connected[socket.id].emit('history',data);
        }
    });
};

var getCensura = function(io,site){
    database.getCensura(site,function(err, data){
        if(!err){
            io.sockets.in(site).emit('listaCensura',data);
        }
    });
}

var getUsers = function(io,site){
    database.getUsers(site,function(err, data){
        if(!err){
            io.sockets.in(site).emit('listaUser',data);
        }
    });
}

var getBanidos = function(io,site){
    database.getBanidos(site,function(err, data){
        if(!err){
            io.sockets.in(site).emit('listaBanidos',data);
        }
    });
}

io.on('connection', function(socket){
    console.log('a user connected');

    socket.on('disconnect', function(){
        console.log('user disconnected');
    });

    socket.on('init', function(content){
        console.log('init');
        console.log(content);
        socket.join(content.site);
        getCensura(io,content.site);
        getUsers(io,content.site);
        getBanidos(io,content.site);
        getMessages(io,socket,content.site);
    });

    socket.on('messageAdmin', function(message){
        var dados = {};

        var content = message.data;

        dados.user = user[content.id];
        dados.message = striptags(content.message);
        dados.class = content.class;
        io.sockets.in(message.site).emit('message', dados);
        database.saveMessage(
            message.site,
            content.id,
            dados.user.name,
            dados.user.avatar,
            dados.message,
            dados.class,
            function (err) {
                if (err) {
                    console.log(err);
                } else {
                    database.limitMessages(message.site);
                }
            }
        );
    });

    socket.on('message', function(message){
        var dados = {};

        var content = message.data;

        dados.user = user[content.id];
        dados.message = striptags(content.message);
        dados.class = content.class;
        io.sockets.in(message.site).emit('message', dados);
        database.saveMessage(
            message.site,
            content.id,
            dados.user.name,
            dados.user.avatar,
            dados.message,
            dados.class,
            function (err) {
                if (err) {
                    console.log(err);
                } else {
                    database.limitMessages(message.site);
                }
            }
        );
    });

    socket.on('login', function(content){
        var login = content.data;
        base64.base64encoder('http://graph.facebook.com/'+ login.id +'/picture', {string: true}, function(err,image) {
            if (!err){
                user[login.id] = {name:login.name,avatar:image,id:login.id};
                io.sockets.in(content.site).emit('welcome', login.name + ' entrou na sala');
                io.sockets.in(content.site).connected[socket.id].emit('login',login.id);
            }
        });

    });

    socket.on('saveCensura', function(content){
        var palavra = content.data;
        database.saveCensura(
            content.site,
            palavra,
            function (err) {
                if (err) {
                    console.log(err);
                } else {
                    database.getCensura(content.site,function(err, data){
                        if(!err){
                            io.sockets.in(content.site).emit('listaCensura',data);
                        }
                    })
                }
            }
        );
    });

    socket.on('removeCensura', function(content){
        var palavra = content.data;
        database.removeCensura(content.site,palavra,function(err){
            if(err){
                console.log(err);
            }else{
                console.log('Removido '+ palavra);
            }
        });
    });

    socket.on('banir', function(content){
        var user = content.data;
        database.banir(content.site,user,function(err){
            if(err){
                console.log(err);
            }else{
                getUsers(io,content.site);
                getBanidos(io,content.site);
            }
        });
    });

    socket.on('ativar', function(content){
        var user = content.data;
        database.ativar(content.site,user,function(err){
            if(err){
                console.log(err);
            }else{
                getUsers(io,content.site);
                getBanidos(io,content.site);
            }
        });
    });

});

http_server.listen(3000, function(){
    console.log('listening on *:3000');
});
