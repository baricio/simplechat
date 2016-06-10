/**
 * Created by Fabricio on 18/05/16.
 */

window.fbAsyncInit = function() {
    FB.init({
        appId      : '967720380015624',
        cookie     : true,
        xfbml      : true,
        version    : 'v2.6'
    });

    FB.Event.subscribe('auth.authResponseChange', function(response) {
        if (response.status === 'connected') {
            console.log('Connected to Facebook');
            //SUCCESS
        }
        else if (response.status === 'not_authorized') {
            console.log('Failed to Connect');
            //FAILED
        }
        else {
            console.log('Logged Out');
            //UNKNOWN ERROR
        }
    });
};

(function(d, s, id){
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {return;}
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));
