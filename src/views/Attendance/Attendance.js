import React, {Component} from 'react';
import { Row, Col, Card, CardBody, CardHeader, 
         CardFooter, FormGroup
       } from 'reactstrap';
import Select from 'react-select';
import 'react-select/dist/react-select.css';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';

import * as firebase from 'firebase';
import 'firebase/firestore';
import { DBUtil } from '../../services';
import { IntlProvider, FormattedDate ,FormattedTime } from 'react-intl';

class Attendance extends React.Component {
    constructor() {
        super();
        this.state = {
            attendanceList: [],
            eventDropDown: [],
            attendee: [],
            attendanceData: []
        }

        this.handleSelectChange = this.handleSelectChange.bind(this);
        this.getAttendeeDetails = this.getAttendeeDetails.bind(this);
    }

    // Method for get attendance data
    componentWillMount() {
        let componentRef = this;

        DBUtil.getDocRef("Sessions")
        .get().then((snapshot) => {
           let events  = [], eventList = [], eventsID = [];
           snapshot.forEach(function (doc) {
                eventList.push({                    
                    label: doc.data().eventName,
                    value: doc.id
                });
            });   
            componentRef.setState({eventDropDown : eventList});
        });
    }


    // Method For handle changed value of dropdown & fill attendance list table
    handleSelectChange(value) {
        let attendanceList = [], attendeeList = [], attendanceData = [];
        this.setState({
            value           
        });
        if(value != null){
            // Query for get attendance data by session Id
            DBUtil.getDocRef("Attendance")
            .where("sessionId", "==", value)
            .get().then((snapshot) => {
                snapshot.forEach(function (doc) {
                    attendanceList.push({                    
                        id: doc.id,
                        data: doc.data()
                    });
                });   
                if(attendanceList.length > 0){
                    // Method for get attendee data by using attendance userId
                    this.getAttendeeDetails(attendanceList);    
                }
                else{
                    // Set default value for current state
                    this.setState({attendanceData : attendanceData});
                }
            });
        }
        else {
            // Set default value for current state
            this.setState({attendanceData : attendanceData});
        }
    }

    getAttendeeDetails(attendanceList){
        let componentRef = this;
        let attendee = [], attendanceData = [], profileString = '';
        // Loop for set multiple attendee's data to attendanceData state
        for(var i= 0;i< attendanceList.length; i++){
            // Query for get attendee by using attendance user Id
            var docRef =  DBUtil.getDocRef("Attendee").doc(attendanceList[i].data.userId);
            docRef.get().then(function(doc) {
                attendee = doc.data();
                let serviceString = '', serviceArray = '';
                if(attendee.profileServices != undefined){
                    if (attendee.profileServices.length > 0) {
                        for(var t = 0; t< attendee.profileServices.length; t++){
                            serviceString = serviceString + attendee.profileServices[t]+", ";
                        }
                    }
                }

                if(serviceString != ''){
                    serviceArray = serviceString.slice(0, serviceString.length - 2); 
                    profileString = serviceArray;
                }
                else{
                    profileString = '';
                }

                var fullName = '';
                if(attendee.fullName != undefined) {
                    fullName = attendee.fullName;
                }
                // Push data to attendanceData
                attendanceData.push({
                    id: doc.id,
                    fullName: fullName,
                    profiles: profileString
                });
                componentRef.setState({attendanceData : attendanceData});
            });
        }
    }

    render() {
        const { value } = this.state; 
        const options = this.state.eventDropDown;

        // Define constant for sorting
        const sortingOptions = {
            defaultSortName: 'fullName',
            defaultSortOrder: 'asc'
        };

        return (
            <div>
                <div className="animated fadeIn">
                    <Row>
                        <Col xs="12" lg="12">
                            <Card>
                                <CardHeader>
                                    <FormGroup row className="marginBottomZero">
                                            <Col xs="12" md="9">
                                                <h1 className="regHeading paddingTop8">Attendance List</h1>
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
                                    <BootstrapTable ref='table' data={this.state.attendanceData} pagination={true} options={sortingOptions}>
                                        <TableHeaderColumn dataField='id' headerAlign='left' isKey hidden>ID</TableHeaderColumn>
                                        <TableHeaderColumn dataField='fullName' headerAlign='left' width='200' dataSort>Name</TableHeaderColumn>
                                        <TableHeaderColumn dataField='profiles' headerAlign='left' width='250'>Profile Name</TableHeaderColumn>
                                    </BootstrapTable>
                                </CardBody> 
                            </Card>
                        </Col>   
                    </Row>
                </div>
            </div>
        )
    }
}
export default Attendance;
