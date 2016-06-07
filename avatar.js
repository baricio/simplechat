var fs = require('fs');
var mime = require('mime');

module.exports = {
	getImageData : function(imgPath){
		return {
			data:fs.readFileSync(imgPath),
			contentType:mime.lookup(imgPath)
		};
	}
}