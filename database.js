var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log('mongo conectado');
});

var Message = mongoose.model('Message', {
    site: String,
    censura: [],
    banidos: [],
    online:  [
        {
            user_id: Number,
            nome: String,
        }
    ],
    message: [
        {
            user_id: Number,
            nome: String,
            avatar:String,
            text: String,
            cssclass: String
        }
    ]
});

module.exports = {
    saveMessage : function(site,user_id,user_name,img64,message,cssclass,callback){

        Message.find({"site": site}, function(err,docs){

            if (docs.length){
                Message.update(
                    {"site":site},
                    {"$push":{
                            "message":{
                                user_id: user_id,
                                nome: user_name,
                                avatar: img64,
                                text: message,
                                cssclass: cssclass
                            }
                        }
                    },
                    {multi:false},
                    callback
                );
            }else{
                var msg = new Message({
                    site: site,
                    message: [
                        {
                            user_id: user_id,
                            nome: user_name,
                            avatar: img64,
                            text: message,
                            cssclass: cssclass
                        }
                    ]
                });

                msg.save(callback);

            }
        });

    },

    getMessages : function(site,callback){
        Message
        .findOne({site: site})
        .select()
        .exec(callback);
    },

    saveCensura : function(site,palavra,callback){

        Message.findOneAndUpdate(
            {site: site},
            {$addToSet:{censura:palavra}},
            callback
        );

    },

    getCensura : function(site,callback){
        Message
        .findOne({site: site})
        .select("censura")
        .exec(callback);
    },

    removeCensura : function(site,palavra,callback){
        Message.findOneAndUpdate(
            {site: site},
            {$pull:{censura:palavra}},
            callback
        );
    },

    getUsers : function(site,callback){
        Message.aggregate([
            {"$match": {site:site}},
            {"$unwind":"$message"},
            {"$group" : {_id : {"user_id":"$message.user_id","nome":"$message.nome" } }}
        ],callback);
    },

    banir: function(site,user,callback){
        Message.findOneAndUpdate(
            {site: site},
            {$push:{banidos: user}},
            callback
        );
    },

    getBanidos : function(site,callback){
        Message
        .findOne({site: site})
        .select('banidos')
        .exec(callback);
    },

    ativar: function(site, user, callback){
        Message.update(
            {site:site},
            {"$pull":{"banidos": {"user_id":user.user_id} } },
            callback
        );
    },

    limitMessages : function(site){

        console.log('entrou no limite message');
        var limit_message = 20;

        Message
            .findOne({site: site})
            .select()
            .exec(function(err,doc){

                if(!doc){return false;}

                if(doc.message.length > limit_message){
                    var i, total_remove = doc.message.length - limit_message;

                    doc.message.forEach(function(item){
                        if(total_remove <= 0) return false;
                        doc.message.pull({"_id":item._id});
                        total_remove--;
                    });

                    doc.save();

                }

            });
    }

}
