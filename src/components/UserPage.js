import React,{Component} from 'react';
import ReactDOM from 'react-dom';
import Web3 from "web3";
import $ from 'jquery';
import {Button,Form,Table,Tabs,Tab,Container,Row,Col,Alert,Nav,Navbar,Card,Modal,Collapse} from 'react-bootstrap';
//import getWeb3 from "./components/getWeb3.js";
//import * as Box from '3box';
import EditProfile from '3box-profile-edit-react';
import ChatBox from '3box-chatbox-react';
import ThreeBoxComments from '3box-comments-react';
import ProfileHover from 'profile-hover';
import PrivateChat from './PrivateChat.js'

const Box = require('3box');
const AppName = 'Alephdapp_test0';
const usersRegistered = 'users_registered';
const admin = "did:3:bafyreiecus2e6nfupnqfbajttszjru3voolppqzhyizz3ysai6os6ftn3m";



class UserPage extends Component {
  state = {
    confidentialThreadName: null,
    threadAdmin: null,
    space: null,
    coinbase: null,
  }
  constructor(props){
    super(props);
    this.addContact = this.addContact.bind(this);
    this.setChannel = this.setChannel.bind(this);
  }
  componentDidMount = async function(){

    if(this.props.box){
      await this.setChannel();
    }

  }
  setChannel = async function(){
    const space = await this.props.box.openSpace(AppName);
    await space.syncDone;
    await this.setState({
      space: space,
      coinbase: this.props.coinbase
    });
    console.log("contacts_"+this.props.profile.address)
    console.log(this.props.coinbase)
    const isContact = await space.private.get("contact_"+this.props.profile.address);
    console.log(isContact);
    if(!isContact){
      const thread = await space.joinThread("contacts_"+this.props.profile.address,{firstModerator:this.props.profile.address});
      console.log(thread);
      const postId = await thread.post(this.props.coinbase);
      console.log(postId);
      await space.private.set("contact_"+this.props.profile.address,postId);
    }
    console.log("Getting profile");
    const userProfile = await Box.getSpace(this.props.profile.address,AppName);
    const threadAddressByUser = userProfile['contactThread_'+this.props.coinbase];
    console.log(threadAddressByUser);
    if(threadAddressByUser){
      const confidentialThreadNameByUser = "contact_"+this.props.profile.address+"_"+this.props.coinbase;
      await space.public.set('contactThread_'+this.props.profile.address,threadAddressByUser);
      const thread = await space.joinThreadByAddress(threadAddressByUser)
      //console.log(await thread.getPosts());
      await space.syncDone;
      this.setState({
        confidentialThreadName: confidentialThreadNameByUser,
        threadAdmin: this.props.profile.address,
        threadAddress: thread.address
      });
    } else {
      const confidentialThreadName = "contact_"+this.props.coinbase+"_"+this.props.profile.address;
      let threadAddress = await space.public.get('contactThread_'+this.props.profile.address);
      console.log(threadAddress)
      if(!threadAddress){
        //const thread = await space.createConfidentialThread(confidentialThreadName);
        const thread = await space.joinThread(confidentialThreadName,{firstModerator:this.props.coinbase,members: true});
        const members = await thread.listMembers();

        if(members.length == 0){
          await thread.addMember(this.props.profile.address);
          console.log("member added");
        }
        threadAddress = thread.address

        await space.public.set('contactThread_'+this.props.profile.address,threadAddress);

      }


      this.setState({
        confidentialThreadName: confidentialThreadName,
        threadAdmin: this.props.coinbase,
        threadAddress: threadAddress
      });
    }
    return
  }
  addContact = async function(){
    const space = await this.props.box.openSpace(AppName);
    await space.syncDone;
    console.log("contacts_"+this.props.profile.address)
    await space.private.remove("contactAdded_"+this.props.profile.address);
    const isContactAdded = await space.private.get("contactAdded_"+this.props.profile.address);
    console.log(isContactAdded)
    console.log("contactsAdded_"+this.props.coinbase);
    if(!isContactAdded){
      const thread = await space.joinThread("contactsAdded_"+this.props.coinbase,{firstModerator:this.props.coinbase});
      const postId = await thread.post(this.props.profile.address);
      await space.private.set("contactAdded_"+this.props.profile.address,postId);
    }
    alert('saved')
    return
  }

  render(){
    const profile = this.props.profile
    console.log(this.state);
    if(!this.props.box){
      return(
        <div>
               <h5>{profile.name}</h5>
               <p>{profile.description}</p>
               <p>Techs: {profile.techs}</p>
        </div>
      )

    }
    if(this.state.confidentialThreadName){

        return(
          <div>
                <Tabs defaultActiveKey="portfolio" className="nav-fill flex-column flex-md-row">
                  <Tab eventKey="portfolio" title="Profile" style={{paddingTop:'10px'}}>
                    <h5>{profile.name}</h5>
                    <p>{profile.description}</p>
                    <p>Techs: {profile.techs}</p>
                    <Button variant="primary" onClick={this.addContact}>Add contact</Button>
                  </Tab>
                  <Tab eventKey="privMessage" title="Private message" style={{paddingTop:'10px'}}>
                    <h5>Private message</h5>
                    <PrivateChat threadAddress={this.state.threadAddress} space={this.state.space} coinbase={this.state.coinbase} />
                  </Tab>
                </Tabs>
          </div>
        )
    }

    return(
      <div>Loading ... </div>
    )
  }
}

export default UserPage;
