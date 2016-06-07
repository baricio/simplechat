var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');

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