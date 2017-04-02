import React, { PropTypes as T } from 'react'
import {Button} from 'react-bootstrap'
import AuthService from 'utils/AuthService'
import styles from './styles.module.css'
import axios from 'axios'

import TacoApiClient from 'utils/TacoApiClient'

export class Home extends React.Component {
  static contextTypes = {
    router: T.object
  }

  static propTypes = {
    auth: T.instanceOf(AuthService)
  }

  constructor(props, context) {
    super(props, context)
    this.state = {
      profile: props.auth.getProfile(),
    }
    props.auth.on('profile_updated', (newProfile) => {
      this.setState({profile: newProfile})
    })
  }

  logout(){
    this.props.auth.logout()
    this.context.router.push('/login');
  }

  testPublic(){
    var config = {};
    axios.get(
        'https://jawcw787ud.execute-api.us-east-2.amazonaws.com/dev/helloPublic',
        config
    ).then( ( response ) => {
          console.log( response )
          this.setState({
            hello:JSON.stringify(response.data)
          })
        } )
        .catch()
  }

  testAuth0(){
    var token = localStorage.getItem('id_token');
    var config = {
      headers: {'Authorization': "Bearer " + token}
    };
    axios.get(
        'https://jawcw787ud.execute-api.us-east-2.amazonaws.com/dev/helloAuth0',
        config
    ).then( ( response ) => {
          console.log( response )
          //This is where you would put a success callback
          this.setState({
            hello:JSON.stringify(response.data)
          })
        } )
        .catch()
  }

  testIAM(){
    var awstoken = JSON.parse(localStorage.getItem('awstoken'));

    let client = new TacoApiClient({
      accessKey: awstoken.AccessKeyId,
      secretKey: awstoken.SecretAccessKey,
      sessionToken: awstoken.SessionToken,
      region: 'us-east-2' // The region you are working out of.
    })


    var params = {
      //This is where any header, path, or querystring request params go. The key is the parameter named as defined in the API
    };
    var body = {
      //This is where you define the body of the request
    };
    var additionalParams = {
      //If there are any unmodeled query parameters or headers that need to be sent with the request you can add them here
      headers: {
      },
      queryParams: {
       }
    };

    client.helloGet(params, body, additionalParams)
        .then(result => {
          console.log(result)
          //This is where you would put a success callback
          this.setState({
            hello:JSON.stringify(result.data)
          })
        }).catch( result => {
          console.error(result)
      //This is where you would put an error callback
    });
  }

  render(){
    const { profile, hello } = this.state
    return (
      <div className={styles.root}>
        <h2>Home</h2>
        <p>Welcome {profile.name}!</p>
        <Button onClick={this.testIAM.bind(this)}>Test IAM</Button>
        <Button onClick={this.testAuth0.bind(this)}>Test Auth0</Button>
        <Button onClick={this.testPublic.bind(this)}>Test Public</Button>
        <Button onClick={this.logout.bind(this)}>Logout</Button>
        <pre>{hello}</pre>
      </div>
    )
  }
}

export default Home;
