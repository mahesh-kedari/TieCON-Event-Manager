import React, { Component } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Input, InputGroup, InputGroupText, InputGroupAddon, Row, Col,
  Card, CardBody, Button, Label, FormGroup
} from 'reactstrap';
import Select from 'react-select';
import * as firebase from 'firebase';
import 'firebase/firestore';
import { DBUtil } from '../../services';
import { ToastContainer, toast } from 'react-toastify';
import Avatar from 'react-avatar';
import QRCode from 'qrcode'
const data = require('../../../public/attendeeData/attendeeData.json');

class Registration extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: {
        id: '',
        firstName: '',
        lastName: '',
        email: '',
        contactNo: '',
        address: '',
        profileServices: [],
        registrationType: '',
        briefInfo: '',
        info: '',
        profileImageURL: '',
        sessionId: '',
        linkedInURL: '',
        roleName: ''
      },
      submitted: false,
      invalidEmail: false,
      invalidContact: false,
      invalidProfile: false,
      emailError: '',
      contactError: '',
      profileDropDown: [],
      attendeeId: '',
      attendeeLabel: '',
      counter: '',
      attendeeCountId: '',
      delCount: '',
      totalCount: '',
      updateflag: false
    };
    this.changeFunction = this.changeFunction.bind(this);
    this.submitFunction = this.submitFunction.bind(this);
    this.updateFunction = this.updateFunction.bind(this);
    this.resetField = this.resetField.bind(this);
    this.onHandleValidations = this.onHandleValidations.bind(this);
    this.handleSelectChange = this.handleSelectChange.bind(this);
    this.setInputToAlphabets = this.setInputToAlphabets.bind(this);
    this.setInputToNumeric = this.setInputToNumeric.bind(this);
    this.bulkUpload = this.bulkUpload.bind(this);
    this.checkPreviuosCount = this.checkPreviuosCount.bind(this);
    this.createAttendee = this.createAttendee.bind(this);
    this.updateCount = this.updateCount.bind(this);
  }

  // Method For render/set default profile data
  componentWillMount() {
    let thisRef = this;
    if (this.props.match.params.id != undefined) {
      this.setState({ updateflag: true })
      var docRef = DBUtil.getDocRef("Attendee").doc(this.props.match.params.id);
      docRef.get().then(function (doc) {
        if (doc.exists) {
          let attendeeData = doc.data();
          thisRef.setState({
            user: {
              id: doc.id,
              firstName: attendeeData.firstName,
              lastName: attendeeData.lastName,
              email: attendeeData.email,
              contactNo: attendeeData.contactNo,
              profileServices: attendeeData.profileServices,
              address: attendeeData.address,
              briefInfo: attendeeData.briefInfo,
              info: attendeeData.info,
              profileImageURL: attendeeData.profileImageURL,
              linkedInURL: attendeeData.linkedInURL
            },
          });
          thisRef.setState({ value: attendeeData.profileServices });
        }
        else {
          toast.error("Invalid data.", {
            position: toast.POSITION.BOTTOM_RIGHT,
          });
        }
      }).catch(function (error) {
        toast.error("Invalid data.", {
          position: toast.POSITION.BOTTOM_RIGHT,
        });
      });
    }

    let componentRef = this;
    DBUtil.addChangeListener("UserProfiles", function (objectList) {
      let profiles = [], profileList = [], profileIDs = [];
      objectList.forEach(function (doc) {
        profiles.push(doc.data());
        profileIDs.push(doc.id);
      });
      for (var i = 0; i < profiles.length; i++) {
        profileList.push({ label: profiles[i].profileName, value: profiles[i].profileName });
      }
      componentRef.setState({ profileDropDown: profileList })
    });
  }

  //Method for bulk uploading Attendee data
  bulkUpload() {
    var dataArray = data;
    for (var index in dataArray) {
      let collectionName = index;
      for (var doc in dataArray[index]) {
        if (dataArray[index].hasOwnProperty(doc)) {
          DBUtil.getDocRef(collectionName).doc(doc)
            .set(dataArray[index][doc])
            .then(() => {
              // console.log('Document is successed adding to firestore!');
            })
            .catch(error => {
              // console.log(error);
            });
        }
      }
    }
  }

  // Method to set textbox values
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

  // Method for handling form validation
  onHandleValidations(user) {
    if (user.email == "") {
      user.email = null;
    }
    if (user.contactNo == "") {
      user.contactNo = null;
    }
    if (user.email != null) {
      let lastAtPos = user.email.lastIndexOf('@');
      let lastDotPos = user.email.lastIndexOf('.');
      if (!(lastAtPos < lastDotPos && lastAtPos > 0 && user.email.indexOf('@@') == -1 && lastDotPos > 2 && (user.email.length - lastDotPos) > 2)) {
        this.state.invalidEmail = true;
        this.setState({ emailError: "*Invalid Email" });
      }
      else {
        this.state.invalidEmail = false;
        this.setState({ emailError: " " });
      }
    }
    else if (user.email == null || user.email != " ") {
      this.state.invalidEmail = true;
      this.setState({ emailError: "*Required" });
    }

    if (user.contactNo != null && (user.contactNo.length < 10 || user.contactNo.length > 10)) {
      this.state.invalidContact = true;
      this.setState({ contactError: "*Invalid Contact No" });
    }
    else if (user.contactNo == null || user.contactNo == "") {
      this.state.invalidContact = true;
      this.setState({ contactError: "*Required " });
    }
    else {
      this.state.invalidContact = false;
      this.setState({ contactError: " " });
    }
  }

  submitFunction(event) {
    event.preventDefault();
    let compRef = this;
    this.setState({ submitted: true });
    const { user } = this.state;
    let attendeeLabel;
    let profileArray = [];
    let length = user.profileServices.length;
    if (length) {
      let lastElement = user.profileServices[length - 1]
      profileArray = lastElement.split(',');
      attendeeLabel = profileArray[0].substring(0, 3).toUpperCase();
      compRef.setState({ attendeeLabel: attendeeLabel });
    }
    compRef.onHandleValidations(user);

    compRef.checkPreviuosCount(attendeeLabel);
  }


  // Method for update attendee details
  updateFunction() {
    let compRef = this;
    this.setState({ submitted: true });
    const { user } = this.state;

    let profileArray = [];
    let length = user.profileServices.length;
    if (length) {
      let lastElement = user.profileServices[length - 1]
      profileArray = lastElement.split(',');
    }
    let attendeeLabel = profileArray[0].substring(0, 3).toUpperCase();
    compRef.setState({ attendeeLabel: attendeeLabel });
    compRef.onHandleValidations(user);

    if (user.firstName && user.lastName && !this.state.invalidEmail && !this.state.invalidContact) {
      let tblAttendance = "Attendance", tblAttendee = "Attendee";
      if (user.profileServices.length > 0) {
        let length = user.profileServices.length;
        let serviceString = user.profileServices[length - 1]
        if (serviceString == "") {
          this.state.user.profileServices = [];
          this.state.user.roleName = '';
        }
        else {
          let serviceArray = serviceString.split(',');
          this.state.user.profileServices = serviceArray;
          this.state.user.roleName = serviceArray[0];
        }
      }

      DBUtil.getDocRef(tblAttendee).doc(user.id).update({
        "firstName": user.firstName,
        "lastName": user.lastName,
        "email": user.email,
        "contactNo": user.contactNo,
        "address": user.address,
        "profileServices": user.profileServices,
        "timestamp": new Date(),
        "registrationType": 'On Spot Registration',
        "briefInfo": user.briefInfo,
        "info": user.info,
        "profileImageURL": user.profileImageURL,
        "linkedInURL": user.linkedInURL,
        "fullName": user.firstName + ' ' + user.lastName,
        "roleName": user.roleName,
        "displayName": user.firstName + " " + user.lastName,
      }).then(function () {
        toast.success("User updated successfully.", {
          position: toast.POSITION.BOTTOM_RIGHT,
        });
        setTimeout(() => {
          compRef.props.history.push('/attendee');
        }, 2000);
      });
    }
  }

  //Method for attendee creation
  createAttendee() {
    let attendeeCount = this.state.attendeeCount;
    let delCount = this.state.delCount;
    let totalCount = this.state.totalCount;
    const { user } = this.state;
    let compRef = this;
    let attendeeLabel = this.state.attendeeLabel;
    let attendeeCountId = this.state.attendeeCountId;

    if (user.firstName && user.lastName && !this.state.invalidEmail && !this.state.invalidContact) {
      let tblAttendance = "Attendance", tblAttendee = "Attendee";
      let randomstring = 'ES' + Math.floor(1000 + Math.random() * 9000);

      if (user.profileServices.length > 0) {
        let length = user.profileServices.length;
        let serviceString = user.profileServices[length - 1]
        if (serviceString == "") {
          this.state.user.profileServices = [];
          this.state.user.roleName = '';
        }
        else {
          let serviceArray = serviceString.split(',');
          this.state.user.profileServices = serviceArray;
          this.state.user.roleName = serviceArray[0];
        }
      }

      fetch('https://us-central1-tie-con-management.cloudfunctions.net/registerUser', {
        method: 'POST',
        mode: 'no-cors',
        headers: new Headers({
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }),
        body: JSON.stringify(
          {
            firstName: user.firstName,
            lastName: user.lastName,
            userEmail: user.email,
            password: randomstring,
            contactNo: user.contactNo,
            roleName: user.roleName,
            address: user.address,
            displayName: user.firstName + " " + user.lastName,
            fullName: user.firstName + " " + user.lastName,
            profileServices: user.profileServices,
            timestamp: new Date(),
            registrationType: 'On Spot Registration',
            briefInfo: user.briefInfo,
            info: user.info,
            attendeeCount: attendeeCount,
            attendeeLabel: attendeeLabel,
            attendanceId: '',
            sessionId: '',
            linkedInURL: user.linkedInURL,
            profileImageURL: user.profileImageURL,
          }
        )
      })
        .then(response => {
          this.updateCount(attendeeCountId, totalCount, delCount);
          toast.success("User Registered Successfully", {
            position: toast.POSITION.BOTTOM_RIGHT,
          });
          this.resetField();
          setTimeout(() => {
            this.props.history.push('/attendee');
          }, 1000);
        }
        ).catch(function (error) {
          toast.error("Registration failed", {
            position: toast.POSITION.BOTTOM_RIGHT,
          });
        });
    }
  }


  updateCount(attendeeCountId, totalCount, delCount) {
    DBUtil.getDocRef("AttendeeCount").doc(attendeeCountId).update({
      "totalCount": totalCount,
      "delCount": delCount
    }).then(function () {
      //console.log("updated successfully");
    })
  }

  //Method to check previous count of attendee
  checkPreviuosCount(attendeeLabel) {
    let compRef = this;
    let nextCount;
    var docRef = DBUtil.getDocRef("AttendeeCount");
    docRef.get().then(function (snapshot) {
      let totalCount;
      let delCount;
      let attendeeCountId;
      snapshot.forEach(function (doc) {
        attendeeCountId = doc.id;
        totalCount = doc.data().totalCount;
        delCount = doc.data().delCount;
      });
      if (attendeeLabel == "DEL") {
        nextCount = delCount + 1;
        delCount = delCount + 1;
      }
      else {
        nextCount = totalCount + 1;
        totalCount = totalCount + 1;
      }
      compRef.setState({
        attendeeCount: nextCount,
        delCount: delCount,
        totalCount: totalCount,
        attendeeCountId: attendeeCountId
      });
      compRef.createAttendee();
    })
  }

  // Method for reset all fields
  resetField(resetFlag) {
    this.setState({
      user: {
        firstName: '',
        lastName: '',
        email: '',
        contactNo: '',
        profileServices: [],
        address: '',
        briefInfo: '',
        info: '',
        profileImageURL: '',
        linkedInURL: ''
      },
      invalidContact: false,
      invalidEmail: false,
      submitted: false
    });
    this.handleSelectChange(null);
  }

  // Method for select/deselect profile data
  handleSelectChange(value) {
    if (value != null) {
      this.state.user.profileServices.push(value);
    }
    this.setState({ value });
  }

  // Method for set only alphabets
  setInputToAlphabets(e) {
    const re = /[a-zA-Z]+/g;
    if (!re.test(e.key)) {
      e.preventDefault();
    }
  }

  // Method for set only Numeric
  setInputToNumeric(e) {
    const re = /[0-9]+/g;
    if (!re.test(e.key)) {
      e.preventDefault();
    }
  }

  render() {
    const { user, submitted, value } = this.state;
    const options = this.state.profileDropDown;
    this.headerText = '';
    if (this.state.updateflag) {
      this.headerText = "Attendee";
      this.buttons = <Button type="submit" size="md" color="success" onClick={this.updateFunction} ><i className="icon-note"></i> Update</Button>
    }
    else {
      this.headerText = "Registration";
      this.buttons = <Button type="submit" size="md" color="success" onClick={this.submitFunction} ><i className="icon-note"></i> Register</Button>
    }
    return (
      <div className="animated fadeIn">
        <Row className="justify-content-left">
          <Col md="8">
            <Card className="mx-6">
              <CardBody className="p-4">
                <h1>{this.headerText}</h1>
                <FormGroup row>
                  <Col xs="12" md="6" className={(submitted && !user.firstName ? ' has-error' : '')}  >
                    <InputGroup className="mb-3">
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText>
                          <i className="icon-user"></i>
                        </InputGroupText>
                      </InputGroupAddon>
                      <Input type="text" placeholder="First Name" name="firstName" onKeyPress={(e) => this.setInputToAlphabets(e)} value={this.state.user.firstName} onChange={this.changeFunction} required />
                      {submitted && !user.firstName &&
                        <div className="help-block" style={{ color: "red" }}>*Required</div>
                      }
                    </InputGroup>
                  </Col>
                  <Col md="6" className={(submitted && !user.lastName ? ' has-error' : '')} >
                    <InputGroup className="mb-3">
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText>
                          <i className="icon-user"></i>
                        </InputGroupText>
                      </InputGroupAddon>
                      <Input type="text" placeholder="Last Name" name="lastName" onKeyPress={(e) => this.setInputToAlphabets(e)} value={this.state.user.lastName} onChange={this.changeFunction} required />
                      {submitted && !user.lastName &&
                        <div style={{ color: "red" }} className="help-block" >*Required</div>
                      }
                    </InputGroup>
                  </Col>
                </FormGroup>
                <FormGroup row>
                  <Col xs="12" md="6" className={(submitted && this.state.invalidEmail ? ' has-error' : '')}>
                    <InputGroup className="mb-3">
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText>@</InputGroupText>
                      </InputGroupAddon>
                      <Input type="text" disabled={this.state.updateflag} placeholder="Email" name="email" value={this.state.user.email} onChange={this.changeFunction} required />
                      {submitted && this.state.invalidEmail &&
                        <div style={{ color: "red" }} className="help-block">{this.state.emailError} </div>
                      }
                    </InputGroup>
                  </Col>
                  <Col md="6" className={(submitted && this.state.invalidContact ? ' has-error' : '')}  >
                    <InputGroup className="mb-3">
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText><i className="icon-phone"></i></InputGroupText>
                      </InputGroupAddon>
                      <Input type="text" placeholder="Contact" maxLength={10} name="contactNo" onKeyPress={(e) => this.setInputToNumeric(e)} value={this.state.user.contactNo} onChange={this.changeFunction} required />
                      {submitted && this.state.invalidContact &&
                        <div style={{ color: "red" }} className="help-block">{this.state.contactError} </div>
                      }
                    </InputGroup>
                  </Col>
                </FormGroup>
                <FormGroup row>
                  <Col xs="12" md="6">
                    <InputGroup className="mb-3">
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText><i className="fas fa-address-book"></i></InputGroupText>
                      </InputGroupAddon>
                      <Input type="text" placeholder="Address" name="address" value={this.state.user.address} onChange={this.changeFunction} required />
                    </InputGroup>
                  </Col>
                  <Col xs="12" md="6" className={(submitted && this.state.invalidProfile ? ' has-error' : '')}>
                    <FormGroup>
                      <Select
                        name='Profiles'
                        multi
                        onChange={this.handleSelectChange}
                        placeholder="Select Profile"
                        simpleValue
                        value={value}
                        options={options}
                      />
                    </FormGroup>
                    {submitted && this.state.invalidProfile && <div className="help-block" style={{ color: "red" }}>*Please select Speakers</div>}
                  </Col>
                </FormGroup>
                <FormGroup row>
                  <Col xs="12" md="6"  >
                    <InputGroup className="mb-3">
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText><i className="fa fa-image"></i></InputGroupText>
                      </InputGroupAddon>
                      <Input type="text" placeholder="Image URL" name="profileImageURL" value={this.state.user.profileImageURL} onChange={this.changeFunction} required />
                    </InputGroup>
                  </Col>
                  <Col xs="12" md="6">
                    <InputGroup className="mb-3">
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText><i className="fa fa-linkedin"></i></InputGroupText>
                      </InputGroupAddon>
                      <Input type="text" placeholder="LinkedIn URL" name="linkedInURL" value={this.state.user.linkedInURL} onChange={this.changeFunction} />
                    </InputGroup>
                  </Col>
                </FormGroup>
                <FormGroup row>
                  <Col xs="12" md="6">
                    <InputGroup className="mb-3">
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText><i className="fa fa-info"></i></InputGroupText>
                      </InputGroupAddon>
                      <Input type="text" placeholder="Brief Info" name="briefInfo" value={this.state.user.briefInfo} onChange={this.changeFunction} />
                    </InputGroup>
                  </Col>
                  <Col xs="12" md="6">
                    <InputGroup className="mb-3">
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText><i className="fa fa-info"></i></InputGroupText>
                      </InputGroupAddon>
                      <Input type="textarea" placeholder="Info" name="info" value={this.state.user.info} onChange={this.changeFunction} required />
                    </InputGroup>
                  </Col>
                </FormGroup>
                <FormGroup row>
                  <Col xs="12" md="12">
                    {this.buttons}
                    &nbsp;&nbsp;
                    <Button onClick={this.resetField} type="reset" size="md" color="danger" ><i className="fa fa-ban"></i> Reset</Button>
                    <ToastContainer autoClose={2000} />
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


