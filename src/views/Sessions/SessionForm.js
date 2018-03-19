import React, { Component } from 'react';
import { Link, Switch, Route, Redirect } from 'react-router-dom';
import Modal from 'react-modal';
import * as firebase from 'firebase';
import 'firebase/firestore';
import { DBUtil } from '../../services';
import Select from 'react-select';
import 'react-select/dist/react-select.css';
import Registration from '../Registration/Registration'
import {
  InputGroup,
  Row,
  Col,
  Button,
  ButtonDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Dropdown,
  Card,
  CardHeader,
  CardFooter,
  CardBody,
  Form,
  FormGroup,
  FormText,
  Label,
  Input,
  Container,
  InputGroupAddon,
  InputGroupText
} from 'reactstrap';


import BigCalendar from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css'

BigCalendar.setLocalizer(
  BigCalendar.momentLocalizer(moment)
);
const customStyles = {
  content : {
    height                : '700px',
    width                 : '1000px',
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)'
  }
};


class SessionForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      EventObj: {
        eventID: '',
        eventName: '',
        room: '',
        extraServices: '',
        speakers: [],
        volunteers: [],
        startTime: '',
        endTime: '',
        isRegrequired: false
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
      modalIsOpen: false,
      editDeleteFlag: false,
      createFlag : true,
      SlotalertMessage : '',
       submitted: false,
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
    this.openModal = this.openModal.bind(this);
    this.afterOpenModal = this.afterOpenModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.getMainroom = this.getMainroom.bind(this);
    this.validateSlot = this.validateSlot.bind(this);
  }


  componentWillMount() {
    Modal.setAppElement('body');
   
    this.getAllList();
    
    let thisRef = this;
    DBUtil.addChangeListener("Event", function (list) {
      let listItem = [];
     
      list.forEach(function (document) {
         if(document.data().room == thisRef.state.EventObj.room)
        {listItem.push({ eventId: document.id, eventInfo: document.data()})}
         });

     
      thisRef.setState({ EventgetObj: listItem });
     
      let eventArray = []

      listItem.forEach(function (data) {

        eventArray.push({
          id: data.eventId, title: data.eventInfo.eventName, start: data.eventInfo.startTime, end: data.eventInfo.endTime,
          room: data.eventInfo.room, extraServices: data.eventInfo.extraServices, speakers: data.eventInfo.speakers, volunteers: data.eventInfo.volunteers, isRegrequired: data.eventInfo.isRegrequired
        });
        thisRef.setState({ myEventsList: eventArray });

      })
    })

    
  }

 openModal() {
    this.setState({modalIsOpen: true});
  }

  afterOpenModal() {
    this.subtitle.style.color = '#f00';
  }

  closeModal() {
    this.setState({modalIsOpen: false});
  }

  getMainroom()
  {
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
  }
  
  getAllList() {
    let thisRef = this;
    let listSpeakers = [];
    let listVolunteers = [];
    let listRooms = []
    let i, j, k;
    let mainRoom = [];
    let m=0;
    let firstRoom;

    //for speaker multiselect
    DBUtil.addChangeListener("Speakers", function (list) {
      list.forEach(function (document) {

        for (var i = 0; i < document.data().speaker.length; i++) {
          listSpeakers.push({ label: document.data().speaker[i], value: document.data().speaker[i] })
        }
      });

      thisRef.setState(
        { speakerData: listSpeakers });
    })


    ///for volunteer multiselect
    DBUtil.addChangeListener("Volunteers", function (listResponse) {
      listResponse.forEach(function (doc) {

        for (var j = 0; j < doc.data().volunteer.length; j++) {
          listVolunteers.push({ label: doc.data().volunteer[j], value: doc.data().volunteer[j] })
        }
      });

      thisRef.setState(
        { volunteerData: listVolunteers });
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
        { roomData: listRooms,
          EventObj: EventObj });
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


  
  submitFunction(event) {
    event.preventDefault();

    this.setState({ submitted: true });
    const EventObj = this.state.EventObj;
  if(EventObj.eventName && EventObj.speakers.length && EventObj.volunteers.length
      && EventObj.extraServices && EventObj.startTime && EventObj.endTime)
  {
    let compRef = this;
    let length = EventObj.speakers.length;
    let lastElement = EventObj.speakers[length - 1]
    let speakerArray = lastElement.split(',');
    this.state.EventObj.speakers = speakerArray;


    let len = EventObj.volunteers.length;
    let lastEle = EventObj.volunteers[len - 1]
    let volunteersArray = lastEle.split(',');
    this.state.EventObj.volunteers = volunteersArray;


    let tableName = "Event";
    let docName = EventObj.eventName;
    let doc = {
      eventName: EventObj.eventName,
      room: EventObj.room,
      extraServices: EventObj.extraServices,
      speakers: EventObj.speakers,
      volunteers: EventObj.volunteers,
      startTime: EventObj.startTime,
      endTime: EventObj.endTime,
      isRegrequired: EventObj.isRegrequired
    }
    let isRegrequired = this.state.EventObj.isRegrequired;
    DBUtil.addDoc(tableName, docName, doc, function (response) {         
      alert("added successfully")
     
  
     let SlotalertMessage = compRef.state.SlotalertMessage;
     SlotalertMessage ='';
     compRef.setState({SlotalertMessage:SlotalertMessage})
     if(isRegrequired==true)
      { compRef.openModal();}
     
     
       
      compRef.resetField();
      
    },
      function (err) {
     
      });

    
  }
      
  }

  deleteEvent() {
    let compRef = this;
  
   DBUtil.getDocRef("Event").doc(this.state.EventObj.eventID).delete().then(function (response) {
        alert("session deleted successfully")
        compRef.setState({createFlag:true,
          editDeleteFlag: false })
         compRef.resetField();
          compRef.setState({createFlag:true,
                          editDeleteFlag: false })
    });

  }

  updateEvent() {
    const { EventObj } = this.state;
    let compRef = this;

    DBUtil.getDocRef("Event").doc(EventObj.eventID).update({
      "eventName": EventObj.eventName,
      "room": EventObj.room,
      "extraServices": EventObj.extraServices,
      "speakers": EventObj.speakers,
      "volunteers": EventObj.volunteers,
      "startTime": EventObj.startTime,
      "endTime": EventObj.endTime,
      "isRegrequired": EventObj.isRegrequired
    })
      .then(function () {
        alert("session successfully updated!");
        compRef.resetField();
        compRef.setState({createFlag:true,
                          editDeleteFlag: false })
      });
  }


  resetField() {
    this.setState({
      EventObj: {
        eventName: '',
        extraServices: '',
        speakers: [],
        volunteers: [],
        isRegrequired: false
      },

      removeSelected: true,
      speakersValue: '',
      volunteersValue: '',
      clickBigFlag: true,
       submitted: false,
       SlotalertMessage:''

    });
  }


  changeRoom(item) {
     let thisRef = this;
    let roomsValue = item.target.value;
    const room = 'room';
    const EventObj = this.state.EventObj;
    EventObj[room] = roomsValue;
    this.setState({ EventObj: EventObj });

    this.setState({ roomsValue });

    DBUtil.addChangeListener("Event", function (list) {
      let listItem = [];

      list.forEach(function (document) {
      let room = document.data().room;
       if (room == roomsValue) {
          listItem.push({ eventId: document.id, eventInfo: document.data() })
        }
      });

      thisRef.setState({ EventgetObj: listItem });
      let eventArray = []

      listItem.forEach(function (data) {
     eventArray.push({
          id: data.eventId, title: data.eventInfo.eventName, start: data.eventInfo.startTime, end: data.eventInfo.endTime,
          room: data.eventInfo.room, extraServices: data.eventInfo.extraServices, speakers: data.eventInfo.speakers, volunteers: data.eventInfo.volunteers, isRegrequired: data.eventInfo.isRegrequired
        });
        thisRef.setState({ myEventsList: eventArray });
        //thisRef.resetField(); 
      })
    })
 }



  multichangeSpeakers(speakersValue) {
    this.state.EventObj.speakers.push(speakersValue);
    this.setState({ speakersValue });

  }

  multichangeVolunteers(volunteersValue) {
    this.state.EventObj.volunteers.push(volunteersValue);
    this.setState({ volunteersValue });

  }

  toggleChange() {
    const isRegrequired = 'isRegrequired';
    const EventObj = this.state.EventObj;
    EventObj[isRegrequired] = !this.state.EventObj.isRegrequired;
    this.setState({ EventObj: EventObj });
  }

  
  validateSlot(Currentroom, slotStart, slotEnd)
  {
    let startArray = [];
    let endArray = [];
    let thisRef = this;
    startArray.push(slotStart.getDate(), slotStart.getMonth(), slotStart.getFullYear(), parseInt(slotStart.getHours()));
    endArray.push(slotEnd.getDate(), slotEnd.getMonth(), slotEnd.getFullYear(), parseInt(slotEnd.getHours()))
  

    DBUtil.addChangeListener("Event", function (list) {
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
          && parseInt(statrtHrs) <= startArray[3] && parseInt(endHrs) >= endArray[3]) 
          {
             if(data.eventInfo.room == Currentroom) 
          {
          thisRef.setState({ clickBigFlag: false })
         }
        }

      })

    })


  }

  ToggleSelectclick(slotStart, slotEnd) {

    let Currentroom = this.state.EventObj.room;
    let startSlot = slotStart;
    let endSlot = slotEnd;
    if(Currentroom==undefined)
      {
       this.getMainroom();
   
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
    if (this.state.clickBigFlag) {

      if(confirm(`Are you sure, You want to book this slot ?: \n\nStart Time : ${slotInfo.start.toLocaleString()} ` +
        `\nEnd Time: ${slotInfo.end.toLocaleString()}` )) 
      {
      var SlotalertMessage = this.state.SlotalertMessage;
       SlotalertMessage = `Start Time : ${slotInfo.start.toLocaleString()} ` + 
      `, End Time: ${slotInfo.end.toLocaleString()}`;
        // SlotalertMessage = "selected slots :"+ "" + "<br/>" + "start Time :" + "" + slotInfo.start.toLocaleString() + ""+ "<br/>" + "end Time :" +"" + slotInfo.end.toLocaleString()
      
    
    
        this.setState({SlotalertMessage:SlotalertMessage})
      const startTime = 'startTime';
      const endTime = 'endTime'
      const EventObj = this.state.EventObj;
      EventObj[startTime] = slotInfo.start;
      EventObj[endTime] = slotInfo.end;
      this.setState({ EventObj: EventObj });
      this.setState({createFlag:true,
                    editDeleteFlag:false});
      }
    }
   
  }

  formAction(event) {
  
    let editobj = {};

    const EventObj = this.state.EventObj;

    EventObj.eventID = event.id;
    EventObj.eventName = event.title;
    EventObj.startTime = event.start;
    EventObj.endTime = event.end;
    EventObj.extraServices = event.extraServices;
    EventObj.speakers = event.speakers;
    EventObj.volunteers = event.volunteers;
    EventObj.room = event.room;
    EventObj.isRegrequired = event.isRegrequired;

    let SlotalertMessage = this.state.SlotalertMessage;
    SlotalertMessage ='';
    this.setState({SlotalertMessage:SlotalertMessage})
    

    this.setState({ EventObj: EventObj });
    this.setState({ roomsValue: EventObj.room })
    this.setState({ volunteersValue: EventObj.volunteers })
    this.setState({ speakersValue: EventObj.speakers })
    this.setState({createFlag:false,
                  editDeleteFlag: true })

  }



  render() {
    const { EventObj, speakersValue, volunteersValue, speakerData, volunteerData, roomsValue, roomData, editDeleteFlag, createFlag , submitted} = this.state;
    let options = speakerData;
    let volunteerOptions = volunteerData;
    let roomOptions = roomData;
    let optionItems = roomOptions.map((roomOption) =>
    <option key={roomOption.value}>{roomOption.value}</option>
 );

 

    return (

      <div>
       
       <div>
        <Modal
          isOpen={this.state.modalIsOpen}
          onAfterOpen={this.afterOpenModal}
          onRequestClose={this.closeModal}
          style={customStyles}
          contentLabel="Example Modal"
        >

          <h6 ref={subtitle => this.subtitle = subtitle}></h6>
          <Button color="danger" onClick={this.closeModal}>X</Button>
         <Registration/>
        </Modal>
      </div>
    <div>
          

          <FormGroup row>
            <Col xs="12">
              <FormGroup>
                <Label> Select Room  :</Label>
          <Input type="select"    value={roomsValue}  onChange={this.changeRoom}>
                                                {optionItems}
          </Input>
          </FormGroup>
            </Col>
          </FormGroup>

        </div>

        <Row>
          <Col md='8'>
            <div>
              <BigCalendar
                events={this.state.myEventsList}
                defaultView="week"
                selectable={true}
                defaultDate={new Date()}
                onSelectSlot={(slotInfo) => this.dateSelected(slotInfo)}
                onSelectEvent={event => this.formAction(event)}


              />
            </div>
          </Col>



          <Col md='4'>
            <div className="animated fadeIn">
              <br />
              <br />
               <Row>
                <Col className={(submitted && !EventObj.startTime ? ' has-error' : '')}>
                 {submitted && !EventObj.startTime && !EventObj.endTime &&
                  <div className="help-block" style={{ color: "red" }}>please select slot</div> }
                 </Col>
              </Row>

              <div> <span style={{color: "red"}}>{this.state.SlotalertMessage}</span></div>
              <br/>
              <Container>
                <Row className="justify-content-center">
                  <Col md="12">
                    <Card className="mx-4">
                      <CardHeader>
                        <i className="fa fa-align-justify"></i>
                        Session Form
                     </CardHeader>
                      <CardBody className="p-4">


                        <form name="form" onSubmit={this.submitFunction}>
                          <FormGroup row>
                            <Col xs="12" className={(submitted && !EventObj.eventName ? ' has-error' : '')} >
                              <InputGroup>
                                <InputGroupAddon addonType="prepend">
                                  <InputGroupText>
                                    <i className="icon-user"></i>
                                  </InputGroupText>
                                </InputGroupAddon>
                                <Input type="text" placeholder="Session Name" name="eventName" value={this.state.EventObj.eventName} onChange={this.changeFunction} />

                              </InputGroup>
                              <Row>
                        <Col >
                          {submitted && !EventObj.eventName &&
                            <div className="help-block" style={{ color: "red" }}>*Required</div>
                          }
                        </Col>
                      </Row>
                            </Col>
                          </FormGroup>
                          <br />


                          <Row>
                            <Col xs="12" className={(submitted && !EventObj.speakers ? ' has-error' : '')}>

                              <Label> Select Speakers : </Label>
                              <Select
                                multi
                                onChange={this.multichangeSpeakers}
                                placeholder="-----Select speakers-------"
                                simpleValue
                                value={speakersValue}
                                options={options}
                              />
                            </Col>
                            
                          </Row>
                         <Row>
                        <Col>
                          {submitted && !EventObj.speakers.length &&
                            <div className="help-block" style={{ color: "red" }}>*Required</div>
                          }
                        </Col>
                      </Row>
                          <br />


                          <Row>
                            <Col xs="12" className={(submitted && !EventObj.volunteers ? ' has-error' : '')}>
                              <FormGroup>
                                <Label> select volunteers </Label>
                                <Select
                                  multi
                                  onChange={this.multichangeVolunteers}
                                  placeholder="---Select---"
                                  simpleValue
                                  value={volunteersValue}
                                  options={volunteerOptions}
                                />
                              </FormGroup>
                            </Col>
                          </Row>
                     <Row>
                        <Col >
                          {submitted && !EventObj.volunteers.length &&
                            <div className="help-block" style={{ color: "red" }}>*Required</div>
                          }
                        </Col>
                      </Row>
                          <br />
                          <Row>
                            <Col xs="12" className={(submitted && !EventObj.extraServices ? ' has-error' : '')}>
                              <FormGroup>
                                <Label> Extra Services : </Label>
                                <Input type="textarea" placeholder="extra services" name="extraServices" value={this.state.EventObj.extraServices} onChange={this.changeFunction} />
                              </FormGroup>
                            </Col>
                          </Row>
                       <Row>
                        <Col>
                          {submitted && !EventObj.extraServices &&
                            <div className="help-block" style={{ color: "red" }}>*Required</div>
                          }
                        </Col>
                      </Row>
                          <br />
                          <Row>
                            <Col xs="12">
                              <FormGroup>
                                <input type="checkbox" checked={this.state.EventObj.isRegrequired} onChange={this.toggleChange} />
                                <Label> Registration required </Label>
                              </FormGroup>
                            </Col>
                          </Row>

                          <Row>
                            <Col xs="12">
                              <h1>   </h1>
                              <br />
                            </Col>
                          </Row>
                         

                          { editDeleteFlag &&
                          <div>
                            <Row>

                            <Col sm={{ size: 'auto', offset: 0}}>
                              <Button onClick={this.updateEvent} color="primary">update</Button>
                            </Col>

                            <Col sm={{ size: 'auto', offset: 1 }}>
                              <Button  onClick={() => {if(confirm('Are you sure you want to permanently delete this session ?')) {this.deleteEvent()};}} color="danger">delete</Button>
                            </Col>

                             <Col sm={{ size: 'auto', offset: 1 }}>
                              <Button onClick={this.resetField} color="secondary">Reset</Button>
                            </Col>
                         </Row>
                         </div>
                        }

                      
                       
                       {createFlag &&
                          <Row  sm={{ size: 'auto', offset: 2 }}>
                          
                            <Col >
                              <Button type="submit" color="primary">Create Session</Button>
                            </Col>
                           
                            <Col sm={{ size: 'auto', offset: 0 }}>
                              <Button onClick={this.resetField} color="secondary">Reset</Button>
                            </Col>
                            </Row>
                       }
                          
                       </form>
                      </CardBody>
                    </Card>
                  </Col>
                </Row>
              </Container>
            </div>
          </Col>
        </Row>
      </div>
    )
  }
}

export default SessionForm;