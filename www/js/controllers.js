angular.module("controller", [])
.controller("AdminCtrl", function ($scope,$rootScope) {

	$scope.adminShow = false;
	$scope.showCensura = true;
	$scope.showBanir = false;

    $scope.lista_censura = [];
    $scope.lista_banir = [];
    $scope.lista_banidos = [];

    var compareBanidos = function(){
        $scope.lista_banidos;
        angular.forEach($scope.lista_banidos,function(banido,banido_key){
            angular.forEach($scope.lista_banir,function(user,user_key){
                if(banido.user_id === user._id.user_id){
                    $(".lista_banir li[userid="+ banido.user_id +"]").hide();
                }
            })
        });
    }

    $scope.close = function(){
        $scope.adminShow = false;
    }

    $scope.open = function(){
        $scope.adminShow = true;
    }

    $rootScope.$on('openAdmin', function(event, data) {
        $scope.adminShow = !$scope.adminShow;
    });

	$scope.tabCensura = function(){
		$scope.showCensura = true;
		$scope.showBanir = false;
	}

	$scope.submitCensura = function(envent){
		event.preventDefault();
		emit('saveCensura', $scope.censura_palavra);
	}

	$scope.tabBanir = function(){
        compareBanidos();
		$scope.showCensura = false;
		$scope.showBanir = true;
	}

    $scope.removeCensura = function(event,palavra){
        $(event.currentTarget).parent().remove();
        emit('removeCensura', palavra);
    }

    $scope.banir = function(envet, user){
        $(event.currentTarget).parent().parent().remove();
        $scope.lista_banidos.push({user_id:user._id.user_id,nome:user._id.nome});
        emit('banir', {user_id:user._id.user_id,nome:user._id.nome});
    }

    $scope.ativar = function(envet, user){
        $(event.currentTarget).parent().parent().remove();
        pos = $scope.lista_banidos.map(function(e) { return e.user_id; }).indexOf(user.user_id);
        $scope.lista_banidos.splice(pos,1);
        emit('ativar', {user_id:user.user_id,nome:user.nome});
    }

	socket.on('listaCensura',function(dados){
        if(dados){
		  $scope.lista_censura = dados.censura;
		  $scope.$apply();
        }
	});

    socket.on('listaUser',function(dados){
        if(dados){
          $scope.lista_banir = dados;
          $scope.$apply();
          compareBanidos()
        }
    });

    socket.on('listaBanidos',function(dados){
        if(dados){
          $scope.lista_banidos = dados.banidos;
          $scope.$apply();
          compareBanidos()
        }
    });

})
.controller("AppCtrl", function ($scope, $rootScope, svAdmin, fcIcons) {

    $scope.user_id       = null;
    $scope.showEmojis    = false;
    $scope.showEmojis    = false;
    $scope.messages      = [];
    $scope.lista_censura = [];
    $scope.lista_banidos = [];
    $scope.icones        = fcIcons.data;

    if(angular.element('#boxadmin').length ) {
        emit('dataAdmin',{admin:true});
    }

    socket.on('listaCensura',function(dados){
        if(dados){
            $scope.lista_censura = dados.censura;
            $scope.$apply();
        }
    });

    socket.on('listaBanidos',function(dados){
        if(dados){
          $scope.lista_banidos = dados.banidos;
          $scope.$apply();
        }
    });

    socket.on('message', function(dados){
        var msg = message(dados.user.avatar, dados.user.name, dados.message);
        $scope.messages.push(msg);
        $scope.$apply();
        scroll();
    });

    socket.on('welcome', function(msg){
        if(svAdmin.usuarioBanido($scope.lista_banidos, $scope.user_id)){
            return false;
        }
        $scope.messages.push(msg);
        scroll();
    });

    socket.on('login', function(id){
        $scope.showLogin = false;
        $scope.user_id = id;

        $scope.$apply();
        if(svAdmin.usuarioBanido($scope.lista_banidos, $scope.user_id)){
            alert('Você está banido e não pode enviar mensagens');
            return false;
        }else{
            sendMessage();
        }

    });

    socket.on('history', function(history){
        if(history){
            $.each(history.message,function(key,data){
                $scope.messages.push(message(data.avatar, data.nome, data.text));
            });
            $scope.$apply();
            scroll();
        }
    });

    $scope.openAdmin = function(event){
        event.preventDefault();
        $rootScope.$emit('openAdmin', true);
    }

    $scope.submitMessage = function(event){
        event.preventDefault();
        $scope.showEmojis = false;
        sendMessage();
    }

    $scope.submitMessageAdmin = function(event){
        event.preventDefault();
        $scope.showEmojis = false;
        sendMessageAdmin();
    }

    var sendMessage = function(){

        if($scope.user_id === null){
            $scope.showLogin = true;
            return false;
        }

        if(svAdmin.censura($scope.lista_censura,$('#m').val())){
            alert('Sua mensagem contem palavras censuradas, verifique sua mensagem');
            return false;
        }

        if(svAdmin.usuarioBanido($scope.lista_banidos, $scope.user_id)){
            alert('Você está banido e não pode enviar mensagens');
            return false;
        }

        emit('message', {
            class: 'user',
            message: $('#m').val(),
            id: $scope.user_id
        });

        $('#m').val('');
        return false;
    }

    var sendMessageAdmin = function(){
        emit('message', {
            class: 'admin',
            message: $('#m').val(),
            id: 0
        });

        $('#m').val('');
    }

    $scope.addEmoji = function(event){

        var icon = $(event.target).attr('title');

        if (typeof icon == 'undefined'){
            return false;
        }

        var text = $('#m').val();
        if(text.length > 0 ){
            $('#m').val(text + ' ' + icon);
        }else{
            $('#m').val(icon);
        }

    }

});