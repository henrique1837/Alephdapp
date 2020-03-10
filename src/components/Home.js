import React,{Component} from 'react';
import {Button,Form,Table,Tabs,Tab,Container,Row,Col,Alert,Nav,Navbar,Card,Modal,Collapse} from 'react-bootstrap';
class Home extends Component {
  state = {
    tutorial: false
  }

  render(){
    if(this.state.tutorial){
      return(
        <Card>
              <Card.Header as="h3">Tutorial</Card.Header>
              <Card.Body>
                <Card.Title>How to use this dapp?</Card.Title>
                <Card.Text>
                  <p>We are under construction, come back later</p>
                 </Card.Text>
                <Button variant='primary' onClick={()=>{
                  this.setState({
                    tutorial: false
                  });
                }}>HomePage</Button>
              </Card.Body>
             </Card>
      );
    }
    return(
      <Container>

            <Card>
            <Card.Header as="h3">Welcome to Alephdapp</Card.Header>
            {
              /*
              <Card.Body>
                <Row>
                  <Col sm={4}>
                    <Card>
                      <Card.Body>
                        <Card.Title>Decentralized storage</Card.Title>
                        <Card.Text>Everything is stored in <a href='https://ipfs.io' target='_blank' title='Interplanetary File System'>IPFS</a> using <a href='https://orbitdb.org/' target='_blank' title='OrbitDB'>OrbitDB</a> and linked to your decentralized identity thanks to <a href="https://3box.com" target='_blank' title='3Box'>3Box</a></Card.Text>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col sm={4}>
                    <Card>

                      <Card.Body>
                        <Card.Title>Share same data in multiple dapps</Card.Title>
                        <Card.Text>Every dapp that uses 3Box can request same data you input here.</Card.Text>
                      </Card.Body>
                    </Card>
                    <h4></h4>

                  </Col>
                  <Col sm={4}>
                  <Card>

                    <Card.Body>
                      <Card.Title>Receive jobs offers</Card.Title>
                      <Card.Text>Talk directly with employers with no middleman! No fees to use it for both parties!</Card.Text>
                    </Card.Body>
                  </Card>

                  </Col>
                </Row>
              </Card.Body>
              */
            }
            </Card>
            <hr/>
            <Card>
            <Card.Header as="h3">Informations</Card.Header>
            <Card.Body>
              <Row>
                <Col sm={6}>
                  <Card>

                    <Card.Body>
                      <Card.Title>How to use it?</Card.Title>
                      <Card.Text>Step by step on how to use Alephdapp</Card.Text>
                      <Button variant="primary" onClick={()=>{
                        this.setState({
                          tutorial: true
                        });
                      }}>Tutorial</Button>
                    </Card.Body>
                  </Card>
                </Col>

              </Row>
            </Card.Body>
            </Card>
          </Container>
    )
  }
}
export default Home;
