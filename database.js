var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log('mongo conectado');
});

var Message = mongoose.model('Message', {
    site: String,
    message: [
        {
            user_id: Number,
            nome: String,
            avatar:String,
            text: String
        }
    ]
});

module.exports = {
    saveMessage : function(site,user_id,user_name,img64,message,callback){

        Message.find({"site": site}, function(err,docs){

            if (docs.length){
                Message.update(
                    {"site":site},
                    {"$push":{
                            "message":{
                                id: user_id,
                                nome: user_name,
                                avatar: img64,
                                text: message
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
                            id: user_id,
                            nome: user_name,
                            avatar: img64,
                            text: message
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
                        console.log(item.text);
                    });

                    doc.save();

                }

            });
    }

}
