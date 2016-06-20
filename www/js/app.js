var user_id = null;
var siteRef = '';
var socket  = io();

function scroll(){
  var box = $('#messages');
  var height = box[0].scrollHeight;
  box.scrollTop(height);
}

function message(avatar,name,message){
    var img = '<img alt="Embedded Image" src="data:image/png;base64,' + avatar +'">';
    return img + name + ' diz: ' + message;
}

function emit(ref,data){
    socket.emit(ref, {site:siteRef,data:data});
}

socket.on('connect',function(mySite){
	var arrray_path = window.location.pathname.split('/');

	if(arrray_path[1] === 'admin'){
		siteRef = arrray_path[2];
	}else{
		siteRef = arrray_path[1];
	}

	emit('init',{init:true});

});

angular.module("app", ["dbaq.emoji","ngSanitize","controller","services"])
.config(function(emojiConfigProvider) {
    emojiConfigProvider.addAlias("smile", ":)");
});