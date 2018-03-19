import React, { Component } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Container, Input, InputGroup, InputGroupText, InputGroupAddon, Badge, Row, Col, Progress, Dropdown, DropdownToggle,
  DropdownMenu, DropdownItem, Card, CardHeader, CardBody, CardFooter, CardTitle, Button, ButtonToolbar,
  ButtonGroup, ButtonDropdown, Label, Table, Form, FormGroup, FormText,
} from 'reactstrap';
import { createBrowserHistory } from 'history';
import * as firebase from 'firebase';
import 'firebase/firestore';
import { DBUtil } from '../../services';
var history = createBrowserHistory();

class Registration extends Component {
  constructor(props) {
    super(props);
    var history = { history }
    this.state = {
      user: {
        firstName: '',
        lastName: '',
        Email: '',
        City: '',
        Contact: '',
        Conference: '',
        Role: '',
        RegistrationType: ''
      },
      submitted: false,
      invalidEmail: false,
      invalidContact: false,
      emailError : '',
      contactError : ''

    };
    this.changeFunction = this.changeFunction.bind(this);
    this.submitFunction = this.submitFunction.bind(this);
    this.resetField = this.resetField.bind(this);
    this.onGenerateQRcode = this.onGenerateQRcode.bind(this);
    this.openWin = this.openWin.bind(this);
    this.onHandleValidations = this.onHandleValidations.bind(this);
  }

  changeFunction(event) {
    const { name, value } = event.target;
    const { user } = this.state;
    this.state.invalidContact = false;
    this.state.invalidEmail = false;
    this.setState({
      user: {
        ...user,
        [name]: value
      }
    });
  }
onHandleValidations(user){
  if(user.Email == ""){
    user.Email = null;
  }
  if(user.Contact == ""){
    user.Contact = null;
  }

  if (user.Email != null ) {
    let lastAtPos = user.Email.lastIndexOf('@');
    let lastDotPos = user.Email.lastIndexOf('.');
    if (!(lastAtPos < lastDotPos && lastAtPos > 0 && user.Email.indexOf('@@') == -1 && lastDotPos > 2 && (user.Email.length - lastDotPos) > 2)) {
      this.state.invalidEmail = true;
      this.setState({emailError : "*Invalid Email"});
    }
    else {
      this.state.invalidEmail = false;
      this.setState({emailError : " "});
    }
  }
  else if (user.Email == null ||  user.Email != " ") {
    this.state.invalidEmail = true;
    this.setState({emailError : "*Required"});
  }

  if (user.Contact != null && ( user.Contact.length < 10 || user.Contact.length > 10)) {
    this.state.invalidContact = true;
    this.setState({contactError : "*Invalid Contact"});
  }
  else if(user.Contact == null || user.Contact == ""){
    this.state.invalidContact = true;
    this.setState({contactError : "*Required "});
  }
  else {
    this.state.invalidContact = false;
    this.setState({contactError : " "});
  }

}

  onGenerateQRcode() {
    const { user } = this.state;
    this.onHandleValidations(user , this.state.submitted = true);

    if (user.firstName && user.lastName && !this.state.invalidEmail && !this.state.invalidContact) {
      let fname = user.firstName;
      let lname = user.lastName;
      let contactNo = user.Contact;
      let emailid = user.Email;
      let role = user.Role;

      let cardDetails = {
        version: '3.0',
        lastName: lname,
        firstName: fname,
        organization: 'Eternus Solutions',
        cellPhone: contactNo,
        role: role,
        email: emailid
      };

      let generatedQR = qrCode.createVCardQr(cardDetails, { typeNumber: 12, cellSize: 2 });
      //console.log(generatedQR);
      this.setState({ Qrurl: generatedQR })
      setTimeout(() => {
        this.openWin(user)
      }, 250);
    }
  }

  openWin(user) {
    //console.log("hello form openwin")
    let fname = user.firstName;
    let lname = user.lastName;
    let name = fname + " " + lname;
    let contactNo = user.Contact;
    let emailid = user.Email;
    let role = user.Role;


    var newWindow = window.open('', '', 'width=1000,height=1000');
    newWindow.document.writeln("<html>");
    newWindow.document.writeln("<body>");
    newWindow.document.writeln("<div> QR code : <br/> <br/></div>")
    newWindow.document.writeln("" + this.state.Qrurl + "");
    newWindow.document.writeln("<div> Name : " + "" + name + "</div>" + "<br/>")
    newWindow.document.writeln("<div> Email Id: " + "" + emailid + "</div>" + "<br/>")
    newWindow.document.writeln("<div> Contact No : " + "" + contactNo + "</div>" + "<br/>")
    newWindow.document.writeln("<div> Profile : " + "" + role + "</div>" + "<br/>")
    newWindow.document.writeln("</body></html>");
    newWindow.document.close();

    setTimeout(function () {
      newWindow.print();
      newWindow.close();
    }, 1000);
  }





  submitFunction(event) {
    event.preventDefault();
    this.setState({ submitted: true });
    const { user } = this.state;
    this.onHandleValidations(user);
    // if (user.Email != null || user.Email != undefined) {
    //   let lastAtPos = user.Email.lastIndexOf('@');
    //   let lastDotPos = user.Email.lastIndexOf('.');
    //   if (!(lastAtPos < lastDotPos && lastAtPos > 0 && user.Email.indexOf('@@') == -1 && lastDotPos > 2 && (user.Email.length - lastDotPos) > 2)) {
    //     this.state.invalidEmail = true;
    //   }
    //   else {
    //     this.state.invalidEmail = false;
    //   }
    // }
    // else if (user.Email == null) {
    //   this.state.invalidEmail = true;
    // }

    // if (user.Contact == null || user.Contact.length < 10 || user.Contact.length > 10) {
    //   this.state.invalidContact = true;
    // }
    // else {
    //   this.state.invalidContact = false;
    // }

    if (user.firstName && user.lastName && !this.state.invalidEmail && !this.state.invalidContact) {
      let componentRef = this;
      let tableName = "Attendance";
      let docName = user.firstName + " " + user.lastName;
      let doc = {
        firstName: user.firstName,
        lastName: user.lastName,
        Email: user.Email,
        City: user.City,
        confRoom: user.Conference,
        Role: user.Role,
        timesteamp: new Date(),
        RegistrationType: 'On Spot Registration'
      }

      DBUtil.addDoc(tableName, docName, doc, function () {          //add doc to firebase
        //console.log('added');
        alert('Registered Successfully');
        //componentRef.onGenerateQRcode(doc);
        componentRef.props.history.push('/login');
      },
        function (err) {
          console.log('Error', err);
        });
    }
  }
  resetField() {
    this.setState({
      user: {
        firstName: '',
        lastName: '',
        Email: '',
        City: '',
        Contact: "",
        Conference: "",
        Role: ''
      },
      invalidContact: false,
      invalidEmail: false,
      submitted: false
    });
  }
  // toggleChange() {
  //   this.setState({ isChecked: !this.state.isChecked })
  //  // console.log("chekbox", this.state.isChecked)
  // }
  render() {
    const { user, submitted } = this.state;
    return (
      <div className="animated fadeIn">
        
          <Row className="justify-content-left">
            <Col md="8">
              <Card className="mx-6">
                <CardBody className="p-4">
                  <h1>Register</h1>
                  {/* <p className="text-muted">Create your account</p> */}
                  <FormGroup row>
                    <Col xs="12" md="6" className={(submitted && !user.firstName ? ' has-error' : '')}  >
                      <InputGroup className="mb-3">
                        <InputGroupAddon addonType="prepend">
                          <InputGroupText>
                            <i className="icon-user"></i>
                          </InputGroupText>
                        </InputGroupAddon>
                        <Input type="text" placeholder="First Name" name="firstName" value={this.state.user.firstName} onChange={this.changeFunction} required />
                      </InputGroup>
                      <Row>
                        <Col md="6">
                          {submitted && !user.firstName &&
                            <div className="help-block" style={{ color: "red" }}>*Required</div>
                          }
                        </Col>
                      </Row>
                    </Col>
                    <Col md="6" className={(submitted && !user.lastName ? ' has-error' : '')} >
                      <InputGroup className="mb-3">
                        <InputGroupAddon addonType="prepend">
                          <InputGroupText>
                            <i className="icon-user"></i>
                          </InputGroupText>
                        </InputGroupAddon>
                        <Input type="text" placeholder="Last Name" name="lastName" value={this.state.user.lastName} onChange={this.changeFunction} required />

                      </InputGroup>
                      <Row>
                        <Col md="6">
                          {submitted && !user.lastName &&
                            <div style={{ color: "red" }} className="help-block" >*Required</div>
                          }
                        </Col>
                      </Row>
                    </Col>
                  </FormGroup>
                  <FormGroup row>
                    <Col xs="12" md="6" className={(submitted && this.state.invalidEmail ? ' has-error' : '')}>
                      <InputGroup className="mb-3">
                        <InputGroupAddon addonType="prepend">
                          <InputGroupText>@</InputGroupText>
                        </InputGroupAddon>
                        <Input type="text" placeholder="Email" name="Email" value={this.state.user.Email} onChange={this.changeFunction} required />
                      </InputGroup>
                      <Row>
                        <Col md="6">
                          {submitted && this.state.invalidEmail &&
                            <div style={{ color: "red" }} className="help-block">{this.state.emailError} </div>
                          }
                        </Col>
                      </Row>

                    </Col>
                    <Col md="6" className={(submitted && this.state.invalidContact ? ' has-error' : '')}  >
                      <InputGroup className="mb-3">
                        <InputGroupAddon addonType="prepend">
                          <InputGroupText><i className="icon-phone"></i></InputGroupText>
                        </InputGroupAddon>
                        <Input type="number" placeholder="Contact" name="Contact" value={this.state.user.Contact} onChange={this.changeFunction} required />
                      </InputGroup>
                      <Row>
                        <Col md="6">
                          {submitted && this.state.invalidContact &&
                            <div style={{ color: "red" }} className="help-block">{this.state.contactError} </div>
                          }
                        </Col>
                      </Row>
                    </Col>
                  </FormGroup>
                  <FormGroup row>
                    <Col xs="12" md="6"  >
                      <InputGroup className="mb-3">
                        <Input type="select" name="City" id="City" placeholder="City" checked={this.state.user.City} onChange={this.changeFunction}>
                          <option value=" ">Select City</option>
                          <option value="Mumbai">Mumbai</option>
                          <option value="Pune">Pune</option>
                          <option value="Nashik">Nashik</option>
                        </Input>
                      </InputGroup>
                    </Col>
                    <Col xs="12" md="6" className={(submitted && user.Conference ? ' has-error' : '')}>
                      <InputGroup className="mb-3">
                        <Input type="select" name="Conference" id="Conference" placeholder="Conference" checked={this.state.user.Conference} onChange={this.changeFunction}>
                          <option value=" " defaultValue=" ">Select Conference</option>
                          <option value="Conference 1">Conference 1</option>
                          <option value="Conference 2">Conference 2</option>
                          <option value="Conference 3">Conference 3</option>
                        </Input>
                      </InputGroup>
                      {/* <Row>
                      <Col md="6">
                      {submitted && user.Conference && 
                          <div style={{color: "red"}} className="help-block">*Please select atleast 1 Conference </div>
                        }
                        </Col>
                        </Row> */}
                    </Col>
                  </FormGroup>
                  <FormGroup row>
                    <InputGroup className="mb-3">
                      <Col md="1">
                        <Label className="roleLabel"><b>Role </b></Label>
                      </Col>
                      <Col md="5">
                        <FormGroup check inline>
                          <Input className="form-check-input" type="radio" id="inline-radio1" name="Role" value="Delegate" onChange={this.changeFunction} checked={this.state.user.Role === "Delegate"} />
                          <Label className="form-check-label" check htmlFor="inline-radio1">Delegate</Label>
                        </FormGroup>
                        <FormGroup check inline>
                          <Input className="form-check-input" type="radio" id="inline-radio2" name="Role" value="Media" onChange={this.changeFunction} checked={this.state.user.Role === "Media"} />
                          <Label className="form-check-label" check htmlFor="inline-radio2">Media</Label>
                        </FormGroup>
                        <FormGroup check inline>
                          <Input className="form-check-input" type="radio" id="inline-radio3" name="Role" value="Guest" onChange={this.changeFunction} checked={this.state.user.Role === "Guest"} />
                          <Label className="form-check-label" check htmlFor="inline-radio3">Guest</Label>
                        </FormGroup>
                      </Col>
                    </InputGroup>
                  </FormGroup>
                  <FormGroup row>
                    <Col xs="6" md="2" >
                      <Button type="submit" size="md" color="primary" onClick={this.submitFunction} ><i className="icon-note"></i> Register</Button>
                    </Col>
                    <Col md="2">
                      <Button size="md" color="success" onClick={this.onGenerateQRcode} >Print QR code</Button>
                    </Col>
                    <Col md="2">
                      <Button onClick={this.resetField} type="reset" size="md" color="danger" ><i className="fa fa-ban"></i> Reset</Button>
                    </Col>
                   
                  </FormGroup>
                </CardBody>
              </Card>
            </Col>
          </Row>
        
      </div>
    )
  }
}

export default Registration;


