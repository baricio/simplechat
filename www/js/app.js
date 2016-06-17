var user_id = null;
var socket = io();

function scroll(){
  var box = $('#messages');
  var height = box[0].scrollHeight;
  box.scrollTop(height);
}

function message(avatar,name,message){
    var img = '<img alt="Embedded Image" src="data:image/png;base64,' + avatar +'">';
    return img + name + ' diz: ' + message;
}

angular.module("app", ["dbaq.emoji","ngSanitize","controller","services"])
.config(function(emojiConfigProvider) {
    emojiConfigProvider.addAlias("smile", ":)");
});