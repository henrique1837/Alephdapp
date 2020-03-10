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

const Box = require('3box');
const AppName = 'Alephdapp_test0';
const usersRegistered = 'users_registered';
const admin = "did:3:bafyreiecus2e6nfupnqfbajttszjru3voolppqzhyizz3ysai6os6ftn3m";



class PrivateChat extends Component {
  state = {
    space: null,
    thread: null,
    posts: []
  }

  constructor(props){
    super(props);
    this.addMsg = this.addMsg.bind(this);
  }


  componentDidMount = async ()  => {
    const thread = await this.props.space.joinThreadByAddress(this.props.threadAddress);

    this.setState({
      thread: thread,
      space: this.props.space
    })
    const posts = await this.state.thread.getPosts();
    this.setState({posts});
    console.log(posts)
    this.state.thread.onUpdate(async()=> {
       const posts = await this.state.thread.getPosts();
       this.setState({posts});
    });
  };
  addMsg = async function(){
    const msg = {
      from: this.props.coinbase,
      url: $("#input_url").val(),
      content: $("#input_msg").val()
    }
    await this.state.thread.post(msg);
    $("#input_msg").val("");
    $("#input_url").val("");
    $("#input_msg").html("");
    $("#input_url").html("");
    return;
  };



  fileUpload = function(){
    try{
      var file = $("#input_file")[0].files[0];
      var reader  = new FileReader();
      var fileName = file.name;
      var fileType = file.type;
      console.log(file)
      reader.onload = function(e) {
        // The file's text will be printed here
        console.log(e.target.result);
        $("#item_img").html(JSON.stringify({
          fileName: fileName,
          fileType: fileType,
          content: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    } catch(err){
      console.log(err)
      $("#item_img").html("");
    }
  }
  render(){
    const that = this;
    if(this.state.thread){
      return(
        <div>
                <h4>Messages</h4>
                <div style={{height: '300px',overflowY:'scroll'}}>
                  {
                    this.state.posts.map(function(post){
                      const msg = post.message;
                      const from = msg.from;
                      const url = msg.url;
                      const content = msg.content;
                      return(
                        <div>
                          <Row>
                            <Col lg={4}>
                              <ProfileHover
                                      address={from}
                                      orientation="bottom"
                                      noCoverImg
                              />

                            </Col>
                            <Col lg={8}>
                              <p><a href={url} target="_blank">{url}</a></p>
                              <p>
                                {
                                  content
                                }
                              </p>
                            </Col>

                          </Row>
                        </div>
                      )

                    })
                  }
                </div>
                <div>
                  <h4>Post a job</h4>
                  <Form>
                    <Form.Group>
                      <Form.Label>Url</Form.Label>
                      <Form.Control placeholder="Url" id='input_url'/>
                      <Form.Label>Description</Form.Label>
                      <Form.Control placeholder="Description" id='input_msg'/>
                      <Button onClick={this.addMsg}>Send</Button>
                    </Form.Group>
                  </Form>
                </div>
        </div>
      )
    }
    return(
      <div>Loading ...</div>
    )
  }

}

export default PrivateChat;
