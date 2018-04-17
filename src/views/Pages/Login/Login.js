import React, { Component } from 'react';
import { Container, Row, Col, CardGroup, Card, CardBody, Link, Button, Input, InputGroup, InputGroupAddon, InputGroupText } from 'reactstrap';
import { Auth } from '../../../services/Authentication/Auth';
import * as firebase from 'firebase';
import 'firebase/firestore';
import { DBUtil } from '../../../services/datastore/Datastore';
import { ToastContainer, toast } from 'react-toastify';
class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: {
        emailId: "",
        Password: ""
      },
      loginMessage: "",
      isAdmin :false
    }
    this.handleChange = this.handleChange.bind(this);
    this.onLoginBtn = this.onLoginBtn.bind(this);
    this.onForgetPassword = this.onForgetPassword.bind(this);
    this.onDisplayQuestion = this.onDisplayQuestion.bind(this);
  }
  handleChange(event) {
    const { name, value } = event.target;
    const { user } = this.state;
    this.setState({
      user: {
        ...user,
        [name]: value
      }
    });
  }
  onLoginBtn() {
    let thisRef = this;
    let email = this.state.user.emailId;
    let pwd = this.state.user.Password;
    if (email && pwd) {
      DBUtil.getDocRef('Attendee')
        .where('email', '==', email)
        .get()
        .then((response) => {
          if(response.size > 0){
            response.forEach(doc => {
              let profile = doc.data().profileServices;
              profile.forEach(pItem => {
                if (pItem == 'Admin') {
                  thisRef.setState({
                    isAdmin : true
                  })
                }
              })
            })
            if(thisRef.state.isAdmin ==  true){
              thisRef.loginToPortal(email, pwd);
            }
            else{
              thisRef.setState({ loginMessage: "You do not have admin rights..." });
            }
          }
          else{
            thisRef.setState({ loginMessage: "Please register before logging in..." });
          }
        })
        .catch((error) => {
          console.log("no", error);
        })
    }
    else {
      thisRef.setState({ loginMessage: "Please enter email id and password" });
    }
  }
  loginToPortal(email, password) {
    let thisRef = this;
    Auth.login(email, password, function (resp) {
     thisRef.props.history.push({
      pathname: '/dashboard',
      state: { authUser : thisRef.state.user }
    });
    },
      function (err) {
        thisRef.setState({ loginMessage: "Invalid Email/Password" });
      });
  }
  onForgetPassword() {
    let thisRef = this;
    let email = this.state.user.emailId;
    if (email) {
      Auth.resetPassword(email, function (resp) {
        thisRef.setState({ loginMessage: "Reset password link has been sent to you registered email id" });
      },
        function (err) {
          thisRef.setState({ loginMessage: err.message });
        });
    }
    else {
      thisRef.setState({ loginMessage: "Please enter Email Id" });
    }
  }
  onDisplayQuestion (){
    this.props.history.push( '/sessionQuestions');
  }

  render() {
    return (
      <div className="app flex-row align-items-center">
        <Container>
          <Row className="justify-content-center">
            <Col md="8">
              <CardGroup>
                <Card className="p-4">
                  <CardBody>
                    <h1>Login</h1>
                    <p className="text-muted">Sign In to your account</p>
                    <InputGroup className="mb-3">
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText>
                          <i className="icon-user"></i>
                        </InputGroupText>
                      </InputGroupAddon>
                      <Input type="email" placeholder="Email Id" name="emailId" onChange={this.handleChange} />
                    </InputGroup>
                    <InputGroup className="mb-4">
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText>
                          <i className="icon-lock"></i>
                        </InputGroupText>
                      </InputGroupAddon>
                      <Input type="password" placeholder="Password" name="Password" onChange={this.handleChange} />
                    </InputGroup>
                    {
                      this.state.loginMessage &&
                      <div className="alert alert-danger" role="alert">
                        <span className="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span>
                        <span className="sr-only">Error:</span>
                        &nbsp;{this.state.loginMessage}

                      </div>
                    }

                    <Row>
                      <Col xs="6">
                        <Button color="primary" className="px-4" onClick={this.onLoginBtn}>Login</Button>
                      </Col>
                      <Col xs="6" className="text-right">
                        <Button color="link" onClick={this.onForgetPassword} className="px-0">Forgot password?</Button>
                      </Col>
                    </Row>
                  </CardBody>
                </Card>
                <Card className="text-white bg-primary py-5 d-md-down-none" style={{ width: 44 + '%' }}>
                  <CardBody className="text-center">
                    <div>
                      <h2>Questions</h2>
                      <p>Display questions for the onGoing session</p>
                      <Button color="primary" className="mt-3" onClick={this.onDisplayQuestion} active>Display Questions</Button>
                    </div>
                  </CardBody>
                </Card>
              </CardGroup>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}
export default Login;
