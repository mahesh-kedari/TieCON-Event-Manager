import React, {Component} from 'react';
import {
      Row, Col,Card, CardHeader, CardBody, CardFooter, Button, Label,
      Table, FormGroup, Modal, ModalHeader, ModalBody, ModalFooter
  } from 'reactstrap';

  import Select from 'react-select';
  import 'react-select/dist/react-select.css';
  import * as firebase from 'firebase';
  import 'firebase/firestore';
  import { DBUtil } from '../../services';
  import Avatar from 'react-avatar';
  import { ToastContainer, toast } from 'react-toastify';

class RegistrationList extends Component{
    constructor(props){
        super(props);
        this.state = {  
            users: [],        
            eventDropDown: [],
            selectFlag: true
        };

        this.getRegistrationResponse = this.getRegistrationResponse.bind(this);
        this.handleSelectChange = this.handleSelectChange.bind(this);
        this.setApporveRejectButtonByStatus = this.setApporveRejectButtonByStatus.bind(this);
        this.onApproved = this.onApproved.bind(this);
        this.onRejected = this.onRejected.bind(this);      
    }

    // Method For render/set default data
    componentWillMount() {
        let componentRef = this;
        DBUtil.getDocRef("Sessions")
        .where("isRegrequired", "==", true)
        .get().then((snapshot) => {
           let events  = [], eventList = [], eventsID = [];
           snapshot.forEach(function (doc) {
                events.push(doc.data());
                eventsID.push(doc.id);
            });   
            for (var i = 0; i < events.length; i++) {
                eventList.push({label : events[i].eventName , value : eventsID[i] });
            }
            componentRef.setState({eventDropDown : eventList}) 
        });
        this.getRegistrationResponse();
    }

    // Method For get users data
    getRegistrationResponse(){
        let componentRef = this;
        DBUtil.addChangeListener("RegistrationResponse", function (objectList) {
            let users  = [], userList = [], userIDs = [];
            objectList.forEach(function (doc) {
                users.push(doc.data());
                userIDs.push(doc.id);
            });            
            for (var i = 0; i < users.length; i++) {
                userList.push({id : userIDs[i] , users : users[i] });
            }
            componentRef.setState({users : userList}) 
        });
    }

    // Method For approve registration
    onApproved (e,id,ddlValue) {
        this.state.users.map(function(row){
            if(row.id == id){
                let param = [{
                    id : id,
                    status: 'Going'
                }];
                 DBUtil.approvedRejectDocById("RegistrationResponse",param)
                 toast.success("User approved successfully.", {
                    position: toast.POSITION.BOTTOM_RIGHT,
                  });
                setTimeout(() => {
                    this.getRegistrationResponse()
                    this.handleSelectChange(ddlValue);
                }, 2000);
            }
        },this)
    }

    // Method For reject registration
    onRejected (e,id,ddlValue) {
        //var tempThis = this.state;
        this.state.users.map(function(row){
            if(row.id == id){
                let param = [{
                    id : id,
                    status: 'Denied'
                }];
                 DBUtil.approvedRejectDocById("RegistrationResponse",param)
                 toast.success("User rejected successfully.", {
                    position: toast.POSITION.BOTTOM_RIGHT,
                  });
                setTimeout(() => {
                    this.getRegistrationResponse()
                    this.handleSelectChange(ddlValue);
                }, 2000);
            }
        },this)
    }

    // Method For handle changed value of dropdown
    handleSelectChange(value) {
        if(value != null){
            this.setState({
                value,
                selectFlag : false
            });
        
            //var tempThis = this.state; 
            var hasSessionId = false;
            this.state.users.forEach(function (doc){
                if (value == doc.users.sessionId){
                    hasSessionId = true
                }
            })
            if (hasSessionId == true){
                this.rowComponents  = this.state.users.map(function(row){
                    if(row.users.sessionId != undefined && row.users.sessionId == value){
                        let setApporveRejectButton = this.setApporveRejectButtonByStatus(row.users.status,row.id,value);
                        return <Table responsive>
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr key ={row.users.attendee.firstName + ' '+ row.users.attendee.lastName}>
                                            <td key={row.users.attendee.firstName + ' '+ row.users.attendee.lastName}>
                                                <Avatar name={row.users.attendee.firstName + ' '+ row.users.attendee.lastName} size={40} round={true} />&nbsp; 
                                                {row.users.attendee.firstName + ' '+ row.users.attendee.lastName}
                                            </td>
                                            <td>
                                                {setApporveRejectButton} 
                                            </td>
                                        </tr>
                                    </tbody>
                                </Table>
                    }
                },this);  
            }
            else{
                this.rowComponents  = <span> No records found..!! </span>
            }
        }
        else{
            this.setState({
                value,
                selectFlag : true
            });
        }
    }
 
    // Method For render apporve & reject buttons
    setApporveRejectButtonByStatus(status,id,ddlValue){
        let userStatus ='';
        if(status == "Pending"){
           return userStatus = 
           (<div>
                <Button color="success" onClick={(e) =>this.onApproved(e,id,ddlValue)}>Apporve</Button>&nbsp;
                <Button color="danger" onClick={(e) =>this.onRejected(e,id,ddlValue)}>Reject</Button>
            </div>)
        }
        else if(status == "Going"){
            return userStatus = (
                <div>
                    <span>Approved</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    <Button color="danger" onClick={(e) => this.onRejected(e,id,ddlValue)}>Reject</Button>
                </div>
            )
        }
        else if(status == "Denied"){
            return userStatus = (
                <div>
                    <Button color="success" onClick={(e) => this.onApproved(e,id,ddlValue)}>Apporve</Button>&nbsp;
                    <span>Rejected</span>
                </div>
            )
        }
    }

    render(){
        const { value } = this.state; 
        const options = this.state.eventDropDown;
        let loadData  = '';

        if(this.state.selectFlag == true){
            loadData = (<span>Please select session..!!</span>)
        }
        else{
            loadData = 
            (<div>
                {this.rowComponents}
             </div>)
        }
        return (
            <div className="animated fadeIn">
                <Row>
                    <Col xs="12" lg="12">
                        <Card>
                        <CardHeader>
                            <FormGroup row className="marginBottomZero">
                                    <Col xs="12" md="9">
                                        <h1 className="regHeading paddingTop8">Registration List</h1>
                                    </Col>
                                    <Col xs="12" md="3">
                                        <Select
                                            placeholder="Select Session"
                                            simpleValue
                                            value={value}
                                            options={options}
                                            onChange={this.handleSelectChange}
                                            />
                                    </Col>
                            </FormGroup>
                        </CardHeader>
                        <CardBody>
                            {loadData}
                            <ToastContainer autoClose={2000} />
                        </CardBody>
                        </Card>
                    </Col>   
                </Row>
            </div>
        );
    }
}

export default RegistrationList;