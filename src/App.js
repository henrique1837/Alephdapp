import React,{Component} from 'react';
import ReactDOM from 'react-dom';
import Web3 from "web3";
import Authereum from 'authereum'
import $ from 'jquery';
import {Button,Form,Table,Tabs,Tab,Container,Row,Col,Alert,Nav,Navbar,Card,Modal,Collapse} from 'react-bootstrap';
import {
  BrowserRouter as Router,
  Link,
  Route,
  Switch,
  Redirect
} from 'react-router-dom';

import EditProfile from '3box-profile-edit-react';
import ChatBox from '3box-chatbox-react';
import ThreeBoxComments from '3box-comments-react';
import ProfileHover from 'profile-hover';

import Home from './components/Home.js';
import Menu from './components/Menu.js';
import Profile from './components/Profile.js';
import PublicChat from './components/PublicChat.js';
import Users from './components/Users.js';
import "./App.css";
import "./assets/scss/argon-dashboard-react.scss";

const IdentityWallet = require('identity-wallet');
const bip39 = require('bip39');
const Box = require('3box');
const AppName = 'Alephdapp_test0';
const usersRegistered = 'users_registered';
const chatThreadName = 'aleph_chat';
const admin = "did:3:bafyreiecus2e6nfupnqfbajttszjru3voolppqzhyizz3ysai6os6ftn3m";
const Web3Socket = 'wss://goerli.infura.io/ws/v3/946ef1ac897f4ad6a6a6cb426595d3a0'


class App extends Component {
  state = {
    hasWeb3:false,
    web3: null,
    coinbase: null,
    box: null,
    space: null,
    threeIdProvider: null,
    doingLogin:false,
   };
  constructor(props){
    super(props)

    this.logout = this.logout.bind(this);
    this.login = this.login.bind(this);
    this.openSpace = this.openSpace.bind(this);

    this.setWeb3Injected = this.setWeb3Injected.bind(this);
    this.setAuthereum = this.setAuthereum.bind(this);
    this.createWallet = this.createWallet.bind(this);
    this.importWallet = this.importWallet.bind(this);

    this.setRedirect = this.setRedirect.bind(this);
    this.renderRedirect = this.renderRedirect.bind(this);
  }
  componentDidMount = async () => {

    if(window.ethereum){
      this.setState({
        hasWeb3:true
      })
      await this.setWeb3Injected();
    }

  };

  login = async function(){
    try {
      // Get network provider and web3 instance.
      const web3 = this.state.web3;
      this.setState({
        doingLogin: true
      });

      ReactDOM.render(
        <p>Aprove access to your 3Box account</p>,
        document.getElementById("loading_status")
      );
      let coinbase
      let box
      if(window.ethereum && !this.state.threeIdProvider){
        console.log(window.ethereum)
        coinbase = await web3.eth.getCoinbase();
        box = await Box.openBox(coinbase,window.ethereum);
      } else if(this.state.threeIdProvider){
        console.log(this.state.threeIdProvider)
        box = await Box.openBox(null,this.state.threeIdProvider);
        coinbase = this.state.idWallet._keyring._rootKeys.managementKey.address
        console.log(coinbase)
      }
      ReactDOM.render(
        <p>Syncing your profile</p>,
        document.getElementById("loading_status")
      );
      await box.syncDone;

      this.setState({
        web3:web3,
        coinbase:coinbase,
        box: box
      });
      await this.openSpace();
    } catch (error) {
      // Catch any errors for any of the above operations.

      this.setState({
        doingLogin: false
      });
      console.error(error);
    }
  }
  logout = function(){
    this.setState({
      coinbase: null,
      box: null,
      space: null,
      threeIdProvider: null
    })
    return
  };


  setWeb3Injected = async function(){
    try{
      await window.ethereum.enable();
      const web3 = new Web3(window.ethereum);
      this.setState({
        web3: web3
      });
      await this.login();
    } catch(err){

    }
  }
  setAuthereum = async function(){
    try{
      const authereum = new Authereum('mainnet');
      const provider = await authereum.getProvider()
      const web3 = new Web3(provider);
      await provider.enable();
      this.setState({
        web3: web3
      });
      await this.login();
    } catch(err){
      console.log(err)
    }
  }
  createWallet = async function(){
    const web3 = new Web3(Web3Socket);

    const mnemonic = bip39.generateMnemonic()
    const seed = '0x'+(await bip39.mnemonicToSeed(mnemonic)).toString('hex');
    console.log(seed)


    console.log(seed)
    //const idWallet = new IdentityWallet(async () => true, {seed: web3.utils.sha3(account.privateKey)})
    const idWallet = new IdentityWallet(async () => true, {seed: seed})
    await idWallet.authenticate(['3Box',AppName]);
    const threeIdProvider = idWallet.get3idProvider();
    console.log(idWallet)
    console.log(threeIdProvider)
    this.setState({
      web3: web3,
      threeIdProvider: threeIdProvider,
      idWallet: idWallet
    });
    alert("Save your mnemonic phrase: "+mnemonic)
    await this.login();

  }

  importWallet = async function(){
    const web3 = new Web3(Web3Socket);
    try{
      const mnemonic = prompt("Enter your mnemonic phrase", "");
      if(!mnemonic){
        return
      }
      if(!bip39.validateMnemonic(mnemonic)){
        alert("Invalid mnemonic phrase")
      }
      const seed = '0x'+(await bip39.mnemonicToSeed(mnemonic)).toString('hex');



      const idWallet = new IdentityWallet(async() => true, {seed:seed})
      const threeIdProvider = idWallet.get3idProvider()
      console.log(threeIdProvider)
      this.setState({
        web3: web3,
        threeIdProvider: threeIdProvider,
        idWallet: idWallet
      });
      await this.login();
    } catch(err){
      alert("Invalid mnemonic phrase")
    }
  }

  openSpace = async function(){

    const box = this.state.box;

    ReactDOM.render(
      <p>Aprove access to open your Alephdapp Space</p>,
      document.getElementById("loading_status")
    );
    $("#alert_info").show();
    const space = await box.openSpace(AppName);

    ReactDOM.render(
      <p>Opening your profile</p>,
      document.getElementById("loading_status")
    );

    await space.syncDone;
    const coinbase = this.state.coinbase;
    const thread = await space.joinThread(usersRegistered,{firstModerator:admin});
    const addr = await space.public.get('address');

    if(!addr){
      await space.public.set('address',coinbase)
    }
    let oldPostId = await space.private.get('registration');
    if(oldPostId){
      await thread.deletePost(oldPostId);
    }
    await space.syncDone;
    const profile = await space.public.all();
    const postId = await thread.post(profile);
    await space.private.set('registration',postId);




    this.setState({
      profile: profile,
      space: space,
      doingLogin: false
    });
    $("#alert_info").hide();
    this.setRedirect();
    return;
  }


  setRedirect = () => {
    this.setState({
      redirect: true
    })
  }
  renderRedirect = () => {
    if (this.state.redirect) {
      return(
        <Redirect to='/home' />
      );
    }
  }
  render() {
    if(this.state.doingLogin){
      return(
        <div>
          <Navbar collapseOnSelect expand="lg" bg="primary" variant="dark" >
            <Navbar.Brand href="#home">Alephdapp</Navbar.Brand>
            <Navbar.Toggle />
          </Navbar>
          <Container className="themed-container" fluid={true}>

            <Alert variant="default" style={{textAlign: "center"}}>
              <h4>Loading dapp ...</h4>
              <div id="loading_status"></div>

            </Alert>
          </Container>
          <footer style={{marginTop: '20px'}}>
                    <Row>
                      <Col lg={4}>
                        <p>Proudly done using <a href="https://3box.com" target='_blank' title='3Box'>3Box</a></p>
                      </Col>
                      <Col lg={4}>
                        <p>Support by using <a href="https://brave.com/?ref=hen956" target='_blank' title='Brave Browser'>Brave Browser</a> or donating</p>
                      </Col>
                      <Col lg={4}>
                        <p>Use a private,fast and secure browser</p>
                        <p>Earn rewards in BAT token while browsing</p>
                        <p>Install <a href="https://brave.com/?ref=hen956" target='_blank' title='Brave Browser'>Brave Browser</a></p>
                      </Col>
                    </Row>
          </footer>
        </div>
      );
    }

    return (
      <div>
        <Router>
          {this.renderRedirect()}
          <Menu box={this.state.box}
                space={this.state.space}
                hasWeb3={this.state.hasWeb3}
                doingLogin={this.state.doingLogin} />

          <Container className="themed-container" fluid={true}>

           <Alert variant="default" style={{textAlign: "center",display:"none"}} id='alert_info'>
                <h4>Loading dapp ...</h4>
                <div id="loading_status"></div>
            </Alert>

            <Switch>
                  <Route path="/home" component={Home} />
                  <Route path="/profile" render={() => {
                    if(!this.state.space){
                      return(
                        <Redirect to="/home" />
                      )
                    }
                    return(
                      <Profile box={this.state.box} space={this.state.space} coinbase={this.state.coinbase} />
                    )
                  }} />
                  <Route path="/users" render={() => {

                    return(
                      <Users box={this.state.box} coinbase={this.state.coinbase} />
                    )
                    }} />
                  <Route path="/comments" render={() => {

                    return(
                      <PublicChat coinbase={this.state.coinbase} space={this.state.space} threadName={chatThreadName}/>
                    )
                  }} />
                  <Route path="/loginNoWeb3" render={() => {
                    return(
                      <Row style={{paddingTop: '50px'}}>
                            <Col lg={3}>
                               <Button variant="primary"  onClick={this.createWallet}>Create new wallet</Button>
                             </Col>
                             <Col lg={3}>
                               <Button variant="primary"  onClick={this.importWallet}>Import wallet</Button>
                             </Col>
                             <Col lg={3}>
                               <Button variant="primary"  onClick={this.setAuthereum}>Authereum</Button>
                             </Col>
                      </Row>
                    )
                  }} />
                  <Route path="/login" render={() => {
                    if(!this.state.hasWeb3){
                      return(
                        <Redirect to="/loginNoWeb3" />
                      );
                    }

                    return(
                      <Row style={{paddingTop: '50px'}}>
                          <Col lg={3}>
                            <Button variant="primary" onClick={this.setWeb3Injected}>Injected web3</Button>
                          </Col>
                      </Row>
                    )
                  }} />
                  <Route path="/logout" render={() => {
                    if(!this.state.space){
                      return(
                        <Redirect to="/home" />
                      );
                    }
                    return(
                      this.logout()
                    );
                  }}/>

                  <Route render={() => {
                    return(
                      <Redirect to="/home" />
                    );
                  }} />
            </Switch>

          </Container>
        </Router>
        <footer style={{paddingTop: '50px'}}>
                  <Row>
                    <Col lg={4}>
                      <p>Proudly done using <a href="https://3box.com" target='_blank' title='3Box'>3Box</a></p>
                    </Col>
                    <Col lg={4}>
                      <p>Support by using <a href="https://brave.com/?ref=hen956" target='_blank' title='Brave Browser'>Brave Browser</a> or donating</p>
                    </Col>
                    <Col lg={4}>
                      <p>Use a private,fast and secure browser</p>
                      <p>Earn rewards in BAT token while browsing</p>
                      <p>Install <a href="https://brave.com/?ref=hen956" target='_blank' title='Brave Browser'>Brave Browser</a></p>
                    </Col>
                  </Row>
         </footer>
      </div>
    );


  }
}

export default App;
