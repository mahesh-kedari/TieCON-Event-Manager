import React, { Component } from 'react';
import { Link, Switch, Route, Redirect } from 'react-router-dom';
import * as firebase from 'firebase';
import 'firebase/firestore';
import { DBUtil } from '../../services';
import Select from 'react-select';
import 'react-select/dist/react-select.css';
import QuestionsForm from '../Questions/QuestionsForm';
import {
    InputGroup, Row, Col, Button, ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem, Dropdown, Card, CardHeader, CardFooter, CardBody,
    Form, FormGroup, FormText, Label, Input, Container, InputGroupAddon, InputGroupText, Modal, ModalHeader, ModalBody, ModalFooter
} from 'reactstrap';
import { ToastContainer, toast } from 'react-toastify';
import BigCalendar from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css'

BigCalendar.setLocalizer(
    BigCalendar.momentLocalizer(moment)
);

const Sessions = "Sessions";

class SessionForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            EventObj: {
                eventID: '',
                eventName: '',
                room: '',
                description: '',
                extraServices: '',
                speakers: [],
                volunteers: [],
                startTime: '',
                endTime: '',
                sessionCapacity: '',
                //isBreak: false,
                sessionType: ''
                // isRegrequired: false
            },
            EventgetObj: [],
            submitted: false,
            speakersValue: '',
            speakerData: [],
            volunteersValue: '',
            volunteerData: [],
            roomsValue: '',
            roomData: [],
            clickBigFlag: true,
            myEventsList: [],
            slotStartTime: '',
            slotEndTime: '',
            modalIsOpen: false,
            editDeleteFlag: false,
            createFlag: true,
            SlotalertMessage: '',
            SlotconfirmMessage: '',
            submitted: false,
            selectedRoom: '',
            deletePopupFlag: false,
            slotPopupFlag: false,
            addQPopupFlag: false,
            invalidSpeaker: false,
            invalidVolunteer: false
        };
        this.changeFunction = this.changeFunction.bind(this);
        this.submitFunction = this.submitFunction.bind(this);
        this.resetField = this.resetField.bind(this);
        this.toggleChange = this.toggleChange.bind(this);
        this.multichangeSpeakers = this.multichangeSpeakers.bind(this);
        this.multichangeVolunteers = this.multichangeVolunteers.bind(this);
        this.changeRoom = this.changeRoom.bind(this);
        this.getAllList = this.getAllList.bind(this);
        this.ToggleSelectclick = this.ToggleSelectclick.bind(this);
        this.deleteEvent = this.deleteEvent.bind(this);
        this.updateEvent = this.updateEvent.bind(this);
        this.alertAction = this.alertAction.bind(this);
        this.getMainroom = this.getMainroom.bind(this);
        this.validateSlot = this.validateSlot.bind(this);
        this.deleteConfirmPopup = this.deleteConfirmPopup.bind(this);
        this.slotConfirmPopup = this.slotConfirmPopup.bind(this);
        this.addQPopup = this.addQPopup.bind(this);
        this.slotConfirmSuccess = this.slotConfirmSuccess.bind(this);
        this.handleValidations = this.handleValidations.bind(this);
        //this.breakOutSessionChange = this.breakOutSessionChange.bind(this);
        this.onChangeSessionType = this.onChangeSessionType.bind(this);
    }

    //Method to get session data from MainRoom onload
    componentDidMount() {
        this.getAllList();
        let thisRef = this;
        DBUtil.addChangeListener(Sessions, function (list) {
            let listItem = [];

            list.forEach(function (document) {
                if (document.data().room == thisRef.state.EventObj.room)
                { listItem.push({ eventId: document.id, eventInfo: document.data() }) }
            });
            thisRef.setState({ EventgetObj: listItem });
            let eventArray = []
            listItem.forEach(function (data) {
                eventArray.push({
                    id: data.eventId, title: data.eventInfo.eventName, start: data.eventInfo.startTime,
                    end: data.eventInfo.endTime, room: data.eventInfo.room, sessionCapacity: data.eventInfo.sessionCapacity,
                    extraServices: data.eventInfo.extraServices, description: data.eventInfo.description,
                    speakers: data.eventInfo.speakers, volunteers: data.eventInfo.volunteers, //isBreak:data.eventInfo.isBreak,
                    sessionType: data.eventInfo.sessionType
                });
                //  isRegrequired: data.eventInfo.isRegrequired
                thisRef.setState({ myEventsList: eventArray });
            })
        })
    }

    //Method to get mainRoom name
    getMainroom() {
        let thisRef = this;
        let mainRoom = [];
        let firstRoom;
        DBUtil.addChangeListener("Rooms", function (response) {
            response.forEach(function (Roomdoc) {
                mainRoom.push(Roomdoc.id)
                firstRoom = mainRoom[0];
            })
            const room = 'room';
            const EventObj = thisRef.state.EventObj;
            EventObj[room] = firstRoom;
            thisRef.setState(
                { EventObj: EventObj });
        })
        return firstRoom;
    }

    //Method to populate room, volunteer and speaker dropdown
    getAllList() {
        let thisRef = this;
        let listSpeakers = [];
        let listVolunteers = [];
        let listRooms = []
        let i, j, k;
        let mainRoom = [];
        let m = 0;
        let firstRoom;
        let speakerName;
        let speakerId;
        let volunteerId;
        let speakerServices;
        let volunteerName;

        DBUtil.addChangeListener("Attendee", function (response) {
            response.forEach(function (doc) {
                if (doc.data().profileServices) { 

                    let length = doc.data().profileServices.length || 0;
                    for (var i = 0; i < length; i++) {                           
                        if (doc.data().profileServices[i] == "Speaker") {
                                speakerName = doc.data().firstName + " " + doc.data().lastName;
                                listSpeakers.push({ label: speakerName, value: doc.id })
                        }
                        if (doc.data().profileServices[i] == "Volunteer") {
                                volunteerName = doc.data().firstName + " " + doc.data().lastName;
                                listVolunteers.push({ label: volunteerName, value: doc.id })   
                        }
                    }
                }
            });
            thisRef.setState(
                {
                    speakerData: listSpeakers,
                    volunteerData: listVolunteers
                });
        })
        DBUtil.addChangeListener("Rooms", function (response) {
            response.forEach(function (Roomdoc) {
                mainRoom.push(Roomdoc.id)
                firstRoom = mainRoom[0];
                listRooms.push({ label: Roomdoc.id, value: Roomdoc.id })
            })
            const room = 'room';
            const EventObj = thisRef.state.EventObj;
            EventObj[room] = firstRoom;
            thisRef.setState(
                {
                    roomData: listRooms,
                    EventObj: EventObj
                });
        })
    }

    changeFunction(event) {
        const { name, value } = event.target;
        const { EventObj } = this.state;
        this.setState({
            EventObj: {
                ...EventObj,
                [name]: value
            }
        });
    }

    //Method for form validation
    handleValidations() {
        const EventObj = this.state.EventObj;
        let length = EventObj.speakers.length;
        if (length) {
            let lastElement = EventObj.speakers[length - 1]
            let speakerArray = lastElement.split(',');
            this.state.EventObj.speakers = speakerArray;
        }
        let len = EventObj.volunteers.length;
        if (len) {
            let lastEle = EventObj.volunteers[len - 1]
            let volunteersArray = lastEle.split(',');
            this.state.EventObj.volunteers = volunteersArray;
        }
    }

    //Method to create session
    submitFunction(event) {
        event.preventDefault();
        this.setState({ submitted: true });
        const EventObj = this.state.EventObj;
        this.handleValidations();
        if (EventObj.eventName && EventObj.startTime && EventObj.endTime) {
            let compRef = this;
            let tableName = Sessions;
            let docName = EventObj.eventName;
            let doc = {
                eventName: EventObj.eventName,
                room: EventObj.room,
                sessionCapacity: EventObj.sessionCapacity,
                description: EventObj.description,
                extraServices: EventObj.extraServices,
                speakers: EventObj.speakers,
                volunteers: EventObj.volunteers,
                startTime: EventObj.startTime,
                endTime: EventObj.endTime,
                // isBreak: EventObj.isBreak,
                sessionType: EventObj.sessionType
            }
            //  isRegrequired: EventObj.isRegrequired
            // let isRegrequired = this.state.EventObj.isRegrequired;
            DBUtil.addObj(tableName, doc, function (response) {
                toast.success("Session added successfully.", {
                    position: toast.POSITION.BOTTOM_RIGHT,
                });
                let EventObj = compRef.state.EventObj;
                const eventID = 'eventID';
                EventObj[eventID] = response.id;
                compRef.setState({ EventObj: EventObj });
                let SlotalertMessage = compRef.state.SlotalertMessage;
                SlotalertMessage = '';
                compRef.setState({ SlotalertMessage: SlotalertMessage })
                // if (isRegrequired == true)
                // {compRef.addQPopup();}
                compRef.resetField();
            }, function (err) { });
        }
    }

    //method to delete session
    deleteEvent() {
        let compRef = this;
        DBUtil.getDocRef(Sessions).doc(this.state.EventObj.eventID).delete().then(function (response) {
            toast.success("Session deleted successfully.", {
                position: toast.POSITION.BOTTOM_RIGHT,
            });
            compRef.resetField();
            compRef.setState({
                createFlag: true,
                editDeleteFlag: false,
                deletePopupFlag: false
            });
        });
    }

    deleteConfirmPopup() {
        this.setState({
            deletePopupFlag: !this.state.deletePopupFlag
        });
    }

    addQPopup() {
        this.setState({
            addQPopupFlag: !this.state.addQPopupFlag
        });
    }

    slotConfirmPopup() {
        this.setState({
            slotPopupFlag: !this.state.slotPopupFlag
        });
    }

    slotConfirmSuccess() {
        var SlotconfirmMessage = this.state.SlotconfirmMessage;
        SlotconfirmMessage = `Start Time : ${this.state.slotStartTime.toLocaleString()} ` +
            `,\r\n End Time: ${this.state.slotEndTime.toLocaleString()}`;
        this.setState({ SlotconfirmMessage: SlotconfirmMessage })
        const startTime = 'startTime';
        const endTime = 'endTime'
        const EventObj = this.state.EventObj;
        EventObj[startTime] = this.state.slotStartTime;
        EventObj[endTime] = this.state.slotEndTime;
        this.setState({ EventObj: EventObj });
        this.setState({
            createFlag: true,
            editDeleteFlag: false,
            slotPopupFlag: false
        });
    }

    //Method to update session
    updateEvent() {
        this.setState({ submitted: true });
        const EventObj = this.state.EventObj;
        this.handleValidations();
        if (EventObj.eventName && EventObj.startTime && EventObj.endTime) {
            let compRef = this;
            //let isRegrequired = this.state.EventObj.isRegrequired;
            DBUtil.getDocRef(Sessions).doc(EventObj.eventID).update({
                "eventName": EventObj.eventName,
                "room": EventObj.room,
                "description": EventObj.description,
                "sessionCapacity": EventObj.sessionCapacity,
                "extraServices": EventObj.extraServices,
                "speakers": EventObj.speakers,
                "volunteers": EventObj.volunteers,
                "startTime": EventObj.startTime,
                "endTime": EventObj.endTime,
                "sessionType": EventObj.sessionType
            })
                //"isBreak": EventObj.isBreak,
                //    "isRegrequired": EventObj.isRegrequired
                .then(function () {
                    toast.success("Session updated successfully.", {
                        position: toast.POSITION.BOTTOM_RIGHT,
                    });
                    // if (isRegrequired == true)
                    // { compRef.addQPopup(); }
                    compRef.resetField();
                    compRef.setState({
                        createFlag: true,
                        editDeleteFlag: false
                    })
                });
        }
    }

    resetField() {
        this.setState({
            EventObj: {
                eventName: '',
                extraServices: '',
                speakers: [],
                volunteers: [],
                // isRegrequired: false,
                description: '',
                sessionCapacity: '',
                //isBreak: false,
                sessionType: ''
            },
            removeSelected: true,
            speakersValue: '',
            volunteersValue: '',
            clickBigFlag: true,
            submitted: false,
            SlotconfirmMessage: ''
        });
    }

    //Method to get session data on selecting room
    changeRoom(item) {
        let thisRef = this;
        let roomsValue = item.target.value;
        let selectedRoom = this.state.selectedRoom;
        const room = 'room';
        const EventObj = this.state.EventObj;
        EventObj[room] = roomsValue;
        selectedRoom = item.target.value;

        this.setState({
            EventObj: EventObj,
            selectedRoom: selectedRoom
        });
        this.setState({ roomsValue });

        DBUtil.addChangeListener(Sessions, function (list) {
            let listItem = [];
            list.forEach(function (document) {
                let room = document.data().room;
                if (room == roomsValue)
                { listItem.push({ eventId: document.id, eventInfo: document.data() }) }
                else
                { listItem.push({ eventId: '', eventInfo: '' }) }
            });
            thisRef.setState({ EventgetObj: listItem });
            let eventArray = []

            listItem.forEach(function (data) {
                eventArray.push({
                    id: data.eventId, title: data.eventInfo.eventName, start: data.eventInfo.startTime,
                    end: data.eventInfo.endTime, room: data.eventInfo.room, sessionCapacity: data.eventInfo.sessionCapacity,
                    extraServices: data.eventInfo.extraServices, description: data.eventInfo.description,
                    speakers: data.eventInfo.speakers, volunteers: data.eventInfo.volunteers, //isBreak:data.eventInfo.isBreak,
                    sessionType: data.eventInfo.sessionType
                });
                // , isRegrequired: data.eventInfo.isRegrequired
                thisRef.setState({ myEventsList: eventArray });
            })
        })
    }

    multichangeSpeakers(speakersValue) {
        this.state.EventObj.speakers.push(speakersValue);
        this.setState({ speakersValue });
        this.state.invalidSpeaker = false;
    }

    multichangeVolunteers(volunteersValue) {
        this.state.EventObj.volunteers.push(volunteersValue);
        this.setState({ volunteersValue });
        this.state.invalidVolunteer = false;
    }

    toggleChange() {
        // const isRegrequired = 'isRegrequired';
        // const EventObj = this.state.EventObj;
        // EventObj[isRegrequired] = !this.state.EventObj.isRegrequired;
        // this.setState({ EventObj: EventObj });
    }

    // breakOutSessionChange() {
    //     const isBreak = 'isBreak';
    //     const EventObj = this.state.EventObj;
    //     EventObj[isBreak] = !this.state.EventObj.isBreak;
    //     this.setState({ EventObj: EventObj });
    // }

    onChangeSessionType(e) {
        const EventObj = this.state.EventObj;
        this.setState({
            EventObj: {
                ...EventObj,
                sessionType: e.target.value
            }
        });
    }


    validateSlot(Currentroom, slotStart, slotEnd) {
        let startArray = [];
        let endArray = [];
        let thisRef = this;
        startArray.push(slotStart.getDate(), slotStart.getMonth(), slotStart.getFullYear(), parseInt(slotStart.getHours()));
        endArray.push(slotEnd.getDate(), slotEnd.getMonth(), slotEnd.getFullYear(), parseInt(slotEnd.getHours()))

        DBUtil.addChangeListener(Sessions, function (list) {
            let listItem = [];
            list.forEach(function (document) {
                listItem.push({ eventId: document.id, eventInfo: document.data() })
            });
            listItem.forEach(function (data) {

                let date = data.eventInfo.startTime.getDate();
                let month = data.eventInfo.startTime.getMonth();
                let year = data.eventInfo.startTime.getFullYear();
                let statrtHrs = data.eventInfo.startTime.getHours();
                let endHrs = data.eventInfo.endTime.getHours();
                if (
                    date == startArray[0] &&
                    month == startArray[1] && year == startArray[2]
                    && parseInt(statrtHrs) <= startArray[3] && parseInt(endHrs) >= endArray[3]) {
                    if (data.eventInfo.room == Currentroom) {
                        thisRef.setState({ clickBigFlag: false })
                    }
                }
            })
        })
    }

    //Method for selecting slots
    ToggleSelectclick(slotStart, slotEnd) {
        let Currentroom = this.state.EventObj.room;
        let startSlot = slotStart;
        let endSlot = slotEnd;
        if (Currentroom == undefined) {
            if (this.state.selectedRoom != '') {
                Currentroom = this.state.selectedRoom;
                const room = 'room';
                const EventObj = this.state.EventObj;
                EventObj[room] = Currentroom;
                this.setState(
                    { EventObj: EventObj });
            }
            else {
                Currentroom = this.getMainroom();
            }
        }
        setTimeout(() => {
            this.validateSlot(Currentroom, startSlot, endSlot)
        }, 250);
    }

    dateSelected(slotInfo) {
        this.ToggleSelectclick(slotInfo.start, slotInfo.end)
        setTimeout(() => {
            this.alertAction(slotInfo)
        }, 500);
    }

    alertAction(slotInfo) {
        let slotStartTime = this.state.slotStartTime;
        let slotEndTime = this.state.slotEndTime;

        if (this.state.clickBigFlag) {
            var SlotalertMessage = this.state.SlotalertMessage;
            SlotalertMessage = `Start Time : ${slotInfo.start.toLocaleString()} ` +
                `, End Time: ${slotInfo.end.toLocaleString()}`;
            SlotalertMessage = "Confirm slot :" + " " + " " + "Start Time :" + " " + slotInfo.start.toLocaleString() + " " + "and " + "" + "End Time :" + "" + slotInfo.end.toLocaleString()
            this.setState({ SlotalertMessage: SlotalertMessage })
            this.setState({ slotStartTime: slotInfo.start });
            this.setState({ slotEndTime: slotInfo.end })
            this.slotConfirmPopup();
        }
    }
    //method for editing session onclick
    formAction(event) {
        let editobj = {};
        const EventObj = this.state.EventObj;
        EventObj.eventID = event.id;
        EventObj.eventName = event.title;
        EventObj.startTime = event.start;
        EventObj.endTime = event.end;
        EventObj.description = event.description;
        EventObj.sessionCapacity = event.sessionCapacity,
            EventObj.extraServices = event.extraServices;
        EventObj.speakers = event.speakers;
        EventObj.volunteers = event.volunteers;
        EventObj.room = event.room;
        //  EventObj.isRegrequired = event.isRegrequired;
        //EventObj.isBreak = event.isBreak;
        EventObj.sessionType = event.sessionType;
        let SlotalertMessage = this.state.SlotalertMessage;
        SlotalertMessage = '';
        this.setState({ SlotalertMessage: SlotalertMessage })
        this.setState({ EventObj: EventObj });
        this.setState({ roomsValue: EventObj.room })
        this.setState({ volunteersValue: EventObj.volunteers })
        this.setState({ speakersValue: EventObj.speakers })
        this.setState({
            createFlag: false,
            editDeleteFlag: true
        })
    }

    render() {
        const { EventObj, speakersValue, volunteersValue, speakerData, volunteerData, roomsValue, roomData, editDeleteFlag, createFlag, submitted } = this.state;
        let options = speakerData;
        let volunteerOptions = volunteerData;
        let roomOptions = roomData;
        let optionItems = roomOptions.map((roomOption) =>
            <option key={roomOption.value}>{roomOption.value}</option>
        );
        return (
            <div>
                <ToastContainer autoClose={1000} />
                <div>
                    <Modal isOpen={this.state.addQPopupFlag} toggle={this.addQPopup} className="modal-lg">
                        <ModalHeader toggle={this.addQPopup}>  </ModalHeader>
                        <ModalBody>
                            <QuestionsForm sessionName={EventObj.eventName} sessionId={EventObj.eventID} addQPopup={this.addQPopup} />
                        </ModalBody>

                    </Modal>
                </div>
                <div>
                    <FormGroup row>
                        <Col xs="12" md="2">
                            <FormGroup>
                                <Label> Room :</Label>
                                <Input type="select" value={roomsValue} onChange={this.changeRoom}> {optionItems}
                                </Input>
                            </FormGroup>
                        </Col>
                    </FormGroup>
                </div>
                <Row>
                    <Col md='8'>
                        <div>
                            <BigCalendar events={this.state.myEventsList} defaultView="week" selectable={true} defaultDate={new Date()} onSelectEvent={event => this.formAction(event)} onSelectSlot={(slotInfo) => this.dateSelected(slotInfo)}
                                min={new Date('2018, 1, 1, 08:00')} max={new Date('2018, 1, 1, 20:00')} step={15} />
                        </div>
                    </Col>
                    <Col md='4'>
                        <div className="animated fadeIn">
                            <div> <span style={{ color: "red" }}>{this.state.SlotconfirmMessage}</span></div>
                            <Container>
                                <Row className="justify-content-center">
                                    <Col md="12">
                                        <Card className="sessionCard">
                                            <CardHeader className="sessionCardHeader">
                                                Session Form
                                    <Col className={(submitted && !EventObj.startTime ? ' has-error' : '')}>
                                                    {submitted && !EventObj.startTime && !EventObj.endTime &&
                                                        <div className="help-block sessionErrorBlock" style={{ color: "red" }}>*Please select slot</div>}
                                                </Col>
                                            </CardHeader>
                                            <CardBody className="sessionCardBody">
                                                <form name="form" onSubmit={this.submitFunction}>
                                                    <FormGroup row>
                                                        <Col xs="12" className={(submitted && !EventObj.eventName ? ' has-error' : '')}>
                                                            <InputGroup>
                                                                <InputGroupAddon addonType="prepend">
                                                                    <InputGroupText>
                                                                        <i className="icon-microphone"></i>
                                                                    </InputGroupText>
                                                                </InputGroupAddon>
                                                                <Input type="text" placeholder="Session Name" name="eventName" value={this.state.EventObj.eventName} onChange={this.changeFunction} />

                                                            </InputGroup>
                                                            <Row>
                                                                <Col>
                                                                    {submitted && !EventObj.eventName &&
                                                                        <div className="help-block" style={{ color: "red" }}>*Session Name is required</div>
                                                                    }
                                                                </Col>
                                                            </Row>
                                                        </Col>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Row>
                                                            <Col xs="12">
                                                                <Label> Speakers : </Label>
                                                                <Select multi onChange={this.multichangeSpeakers} placeholder="--Select--" simpleValue value={speakersValue} options={options} />
                                                            </Col>
                                                        </Row>
                                                        <Row>
                                                        </Row>
                                                    </FormGroup>

                                                    <FormGroup>
                                                        <Row>
                                                            <Col xs="12">
                                                                <Label>Volunteers : </Label>
                                                                <Select multi onChange={this.multichangeVolunteers} placeholder="--Select--" simpleValue value={volunteersValue} options={volunteerOptions} />
                                                            </Col>
                                                        </Row>
                                                        <Row>
                                                        </Row>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Row>
                                                            <Col xs="12">
                                                                <Label> Session Capacity : </Label>
                                                                <Input type="number" placeholder="Session Capacity" name="sessionCapacity" value={this.state.EventObj.sessionCapacity} onChange={this.changeFunction} />
                                                            </Col>
                                                        </Row>
                                                        <Row>
                                                        </Row>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Row>
                                                            <Col xs="12">
                                                                <Label> Description : </Label>
                                                                <Input type="textarea" placeholder="Description" name="description" value={this.state.EventObj.description} onChange={this.changeFunction} />
                                                            </Col>
                                                        </Row>
                                                        <Row>
                                                        </Row>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Row>
                                                            <Col xs="12">
                                                                <Label> Extra Services : </Label>
                                                                <Input type="textarea" placeholder="Extra Services" name="extraServices" value={this.state.EventObj.extraServices} onChange={this.changeFunction} />
                                                            </Col>
                                                        </Row>
                                                        <Row>

                                                        </Row>
                                                    </FormGroup>
                                                    <FormGroup>
                                                        <Row>
                                                            <Col xs="12">
                                                                <Input type="select" name="sessionType" multiple={false} value={this.state.EventObj.sessionType} id='sessionType' placeholder="SessionType" onChange={(e) => this.onChangeSessionType(e)} >
                                                                    <option value='Select Session Type'>Select Session Type</option>
                                                                    <option value="break">Break </option>
                                                                    <option value="keynote">Keynote</option>
                                                                    <option value="deepdive">Deep Dive</option>
                                                                    <option value="panel">Panel Discussion</option>
                                                                    <option value="breakout">Break Out</option>
                                                                </Input>
                                                            </Col>
                                                        </Row>
                                                    </FormGroup>
                                                    {/* <Row>
                                                        <Col xs="12">
                                                            <FormGroup>
                                                                <Label> Break out session &nbsp;
                                                                <input type="checkbox" checked={this.state.EventObj.isBreak} onChange={this.breakOutSessionChange} />
                                                                </Label>
                                                            </FormGroup>
                                                        </Col>
                                                    </Row>  */}
                                                    {/* <Row>
                                                        <Col xs="12">
                                                            <FormGroup>
                                                                <input type="checkbox" checked={this.state.EventObj.isRegrequired} onChange={this.toggleChange} />
                                                                <Label> Registration Required </Label>
                                                            </FormGroup>
                                                        </Col>
                                                    </Row> */}
                                                    {editDeleteFlag &&
                                                        <div>
                                                            <Row>
                                                                <Col sm="12">
                                                                    <Button name="update" onClick={this.updateEvent} color="success">Update</Button>
                                                                    &nbsp;&nbsp;
                                                    <Button onClick={this.deleteConfirmPopup} color="danger">Delete</Button>
                                                                    &nbsp;&nbsp;
                                                    <Button onClick={this.resetField} color="primary"><i className="fa fa-ban"></i> Reset</Button>
                                                                </Col>
                                                            </Row>
                                                        </div>
                                                    } {createFlag &&
                                                        <Row sm={{ size: 'auto', offset: 2 }}>

                                                            <Col md="12">
                                                                <Button type="submit" color="primary">Create Session</Button>
                                                                &nbsp;&nbsp;
                                                <Button onClick={this.resetField} color="danger"><i className="fa fa-ban"></i>Reset</Button>
                                                            </Col>
                                                        </Row>
                                                    }
                                                </form>
                                            </CardBody>
                                        </Card>
                                        <Modal isOpen={this.state.deletePopupFlag} toggle={this.deleteConfirmPopup} className={'modal-lg ' + this.props.className}>
                                            <ModalHeader toggle={this.deleteConfirmPopup}>Confirm</ModalHeader>
                                            <ModalBody>
                                                <div>
                                                    <span> Are you sure you want to permanently delete this session ?</span>
                                                </div>
                                            </ModalBody>
                                            <ModalFooter>
                                                <Button color="success" onClick={this.deleteEvent}>Confirm</Button>&nbsp;
                                    <Button color="danger" onClick={this.deleteConfirmPopup}>Cancel</Button>
                                            </ModalFooter>
                                        </Modal>

                                        <Modal isOpen={this.state.slotPopupFlag} toggle={this.slotConfirmPopup} className={'modal-lg ' + this.props.className}>
                                            <ModalHeader toggle={this.slotConfirmPopup}>Confirm</ModalHeader>
                                            <ModalBody>
                                                <div>
                                                    <span>{this.state.SlotalertMessage}</span>
                                                </div>
                                            </ModalBody>
                                            <ModalFooter>
                                                <Button color="success" onClick={this.slotConfirmSuccess}>Confirm</Button>&nbsp;
                                    <Button color="danger" onClick={this.slotConfirmPopup}>Cancel</Button>
                                            </ModalFooter>
                                        </Modal>

                                    </Col>
                                </Row>
                            </Container>
                        </div>
                    </Col>
                </Row>
                <br />
            </div>
        )
    }
}
export default SessionForm;