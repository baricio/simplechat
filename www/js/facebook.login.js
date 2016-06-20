/**
 * Created by Fabrício on 18/05/16.
 */

/*
function Login()
{
    FB.login(function(response) {
        if (response.authResponse) {
            getUserInfo();
        }
        else {
            alert('Não foi possível logar no facebook, tente novamente mais tarde.');
        }
    },{ scope: 'email, public_profile' });
}*/

function statusChangeCallback(response) {
    console.log('statusChangeCallback');
    console.log(response);

    if (response.status === 'connected') {
        getUserInfo();
    } else if(response.status === 'not_authorized') {
        alert('Faça login no facebook para iniciar o chat');
    } else {
        alert('Faça login no facebook para iniciar o chat');
    }
}

function Login()
{
    FB.getLoginStatus(function(response) {
        statusChangeCallback(response);
    });
}

function getUserInfo(site) {

    FB.api('/me', function(response) {
        emit('login',response);
    });

}
