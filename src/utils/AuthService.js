import { EventEmitter } from 'events'
import { isTokenExpired } from './jwtHelper'
import Auth0Lock from 'auth0-lock'
import { browserHistory } from 'react-router'
import axios from 'axios'

export default class AuthService extends EventEmitter {
  constructor(clientId, domain) {
    super()

    this.delegate = {
      client_id:clientId,
      grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer',
      scope:'open_id',
      api_type:'aws'
    }

    this.auth0Endpoint = domain;

    // Configure Auth0
    this.lock = new Auth0Lock(clientId, domain, {
      auth: {
        redirectUrl: `${window.location.origin}/login`,
        responseType: 'token'
      }
    })
    // Add callback for lock `authenticated` event
    this.lock.on('authenticated', this._doAuthentication.bind(this))
    // Add callback for lock `authorization_error` event
    this.lock.on('authorization_error', this._authorizationError.bind(this))
    // binds login functions to keep this context
    this.login = this.login.bind(this)
  }
  /*
  getOptionsForRole(isAdmin, token) {
    if(isAdmin) {
      // TODO: update roles and principals based upon your account settings.
      return {
        "id_token": token,
        "role":"arn:aws:iam::012345678901:role/auth0-api-role",
        "principal": "arn:aws:iam::012345678901:saml-provider/auth0"

      };
    }
    else {
      return {
        "id_token": token,
        "role":"arn:aws:iam::012345678901:role/auth0-api-social-role",
        "principal": "arn:aws:iam::012345678901:saml-provider/auth0"
      };
    }
  }
  */
  _doAuthentication(authResult){
    console.log("Go");
    console.log(authResult)
    var ctrl = this;
    // Saves the user token
    this.setToken(authResult.idToken)
    // navigate to the home route
    browserHistory.replace('/home')
    // Async loads the user profile data
    console.log( this.lock);
    this.lock.getProfile(authResult.idToken, (error, profile) => {
      if (error) {
        console.log('Error loading the Profile', error)
      } else {
        this.setProfile(profile)
        /*
        var webAuth = new auth0.WebAuth({
          domain:       'pfernandom.auth0.com',
          clientID:     profile.clientID
        });
        //profile.isAdmin = !profile.identities[0].isSocial;
        profile.isAdmin = true;

        var options = ctrl.getOptionsForRole(profile.isAdmin, authResult.idToken);
        console.log(webAuth);
        webAuth.getToken(options)
            .then(
                function(delegation)  {
                  console.log(delegation);
                  //store.set('awstoken', delegation.Credentials);  //add to local storage
                  //$location.path("/");
                },
                function(err) {
                  console.log('failed to acquire delegation token', err);
                });
        */
      }
    })

    let serialize = function(obj) {
      var str = [];
      for(var p in obj)
        if (obj.hasOwnProperty(p)) {
          str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        }
      return str.join("&");
    }

    axios({
      method: 'get',
      url: "https://"+this.auth0Endpoint+"/delegation?"+serialize(Object.assign({id_token:authResult.idToken},this.delegate))
    })
    .then((res) => {
      localStorage.setItem('awstoken', JSON.stringify(res.data.Credentials))
      console.log(res.data)
    });
  }



  _authorizationError(error){
    // Unexpected authentication error
    console.log('Authentication Error', error)
  }

  login() {
    // Call the show method to display the widget.
    this.lock.show()
  }

  loggedIn(){
    // Checks if there is a saved token and it's still valid
    const token = this.getToken()
    return !!token && !isTokenExpired(token)
  }

  setProfile(profile){
    // Saves profile data to localStorage
    localStorage.setItem('profile', JSON.stringify(profile))
    // Triggers profile_updated event to update the UI
    this.emit('profile_updated', profile)
  }

  getProfile(){
    // Retrieves the profile data from localStorage
    const profile = localStorage.getItem('profile')
    return profile ? JSON.parse(localStorage.profile) : {}
  }

  setToken(idToken){
    // Saves user token to localStorage
    localStorage.setItem('id_token', idToken)
  }

  getToken(){
    // Retrieves the user token from localStorage
    return localStorage.getItem('id_token')
  }

  logout(){
    // Clear user token and profile data from localStorage
    localStorage.removeItem('id_token');
    localStorage.removeItem('profile');
    localStorage.removeItem('awstoken');
  }
}
