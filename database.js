var mongoose = require('mongoose');
mongoose.connect('mongodb://root:bitnami@localhost/admin');

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
console.log(docs);
			if (docs.length){
			console.log('banco existe');
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
console.log('atualiza dados')
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
		})

	},

	getMessages : function(callback){
		Message
		.findOne()
		.sort({"_id":-1})
		.select()
		.exec(callback);
	}
}
