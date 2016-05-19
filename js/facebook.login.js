/**
 * Created by Fabrício on 18/05/16.
 */

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
}

function getUserInfo() {

    FB.api('/me', function(response) {
        response.session = user.session;
        socket.emit('login', response);
        $('#boxlogin').hide('fast');
        $('#boxmessage').show('fast');
    });

}