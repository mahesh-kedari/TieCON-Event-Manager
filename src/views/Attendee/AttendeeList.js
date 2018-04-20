import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import {
    Row, Col, Card, CardBody, CardHeader,
    CardFooter, FormGroup, Button, Label
} from 'reactstrap';
import Select from 'react-select';
import 'react-select/dist/react-select.css';
import moment from "moment";
import 'react-bootstrap-table/dist/react-bootstrap-table.min.css';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import * as firebase from 'firebase';
import 'firebase/firestore';
import { DBUtil } from '../../services';
import QRCode from 'qrcode'

class AttendeeList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            profileDropDown: [],
            attendeeData: [],
            attendeeCount: 0
        }

        this.handleSelectChange = this.handleSelectChange.bind(this);
        this.deleteAttendee = this.deleteAttendee.bind(this);
    }

    // Method for get all Attendees data 
    componentWillMount() {
        let componentRef = this;

        DBUtil.getDocRef("UserProfiles")
            .get().then((snapshot) => {
                let profileList = [];
                snapshot.forEach(function (doc) {
                    profileList.push({
                        label: doc.data().profileName,
                        value: doc.data().profileName
                    });
                });
                componentRef.setState({ profileDropDown: profileList });
            });
    }


    deleteAttendee(userId) {
        var x = confirm("Are you sure you want to delete?");
        if (x) {
            let compRef = this;
            DBUtil.getDocRef("Attendee").doc(userId).delete().then(function (response) {
                alert("Deleted Successfully");
            });
        }
        else
            return false;
    }
    // Method for print ID card
    openWin(user) {
        let briefInfo;
        let CompanyName = '';
        let attendeeLabel = '';
        let attendeeCount = '';
        let attendeeCode = ''
        if (user.attendeeLabel)
            attendeeLabel = user.attendeeLabel;
        if (user.attendeeCount)
            attendeeCount = user.attendeeCount;
        attendeeCode = attendeeLabel + "-" + attendeeCount;
        if (user.briefInfo != undefined) {
            briefInfo = user.briefInfo;
            CompanyName = briefInfo.split('\n')[0];
        }
        else {
            CompanyName = '';
        }

        var newWindow = window.open('', '', 'width=1000,height=1000');
        setTimeout(() => newWindow.document.title = '' + attendeeCode + '', 0);
        newWindow.document.writeln("<html>");
        newWindow.document.writeln("<body>");
        newWindow.document.write("<div style='width:4in;height:5in;text-align:center;margin-left:0;margin-top:0;'>")
        newWindow.document.write("<div style='height:100%;'>")
        //layer1
        newWindow.document.write("<div style='height:29%;'> </div>")
        //layer2
        newWindow.document.write("<div style='margin-top:30px;padding: 0 30px;max-height:150px;height:150px;margin-left:-15px;'><h1 style='font-size: 2.2rem;font-family:'Arial';padding: 10px 0 0 0;margin-top:40px;margin-bottom:-10px;'>" + user.name + "</h1>")
        newWindow.document.write("<p style='margin-top:-16px;font-size: 1.5rem;font-family:'Avenir-Book';'>" + CompanyName + "</p>")
        //newWindow.document.write("<p style='margin-top:-16px;font-size: 1.5rem;font-family:'Avenir-Book';'>MarketAxis Consulting</p>")
        newWindow.document.write("</div>")
        //layer2a
        newWindow.document.write("<div style='text-align: left;padding: 30px 30px;padding-bottom:0;margin-top:-20px;position:fixed;'>")
        newWindow.document.write("<img style='width:90px;height:90px;margin-left:-14px;margin-bottom:-4px;' src='" + this.state.Qrurl + "'/>")
        newWindow.document.write("<div style='text-align:left;font-weight:bold;font-size:13px;font-family:'Arial';margin-top:-4px;padding: 0 0px;padding-right:0px;padding-left:50px;'>" + attendeeCode + "</div> <br/>")
        newWindow.document.write("</div>")
        //layer3
        newWindow.document.write("<div style='border-left:1px solid #666;border-right:1px solid #666;'>")
        newWindow.document.write("</div>")
        newWindow.document.write("</div>")
        newWindow.document.write("</div>")
        newWindow.document.writeln("</body></html>");
        newWindow.document.close();

        setTimeout(function () {
            newWindow.print();
            newWindow.close();
        }, 500);
    }

    // Method for generate QR code
    onGenerateQRcode(user) {
        let generatedQR;
        let compRef = this;
        let id = user.id;
        let Label = user.attendeeLabel
        let Count = user.attendeeCount;
        let AttendeeCode = Label + "-" + Count;
        QRCode.toDataURL("TIE" + ":" + AttendeeCode + ":" + id)
            .then(url => {
                generatedQR = url;
                compRef.setState({ Qrurl: url })
                setTimeout(() => {
                    compRef.openWin(user);
                }, 250);
            })
    }

    // Method for edit attendee (Screen redirect from attendee to registration module)
    onEditAttendee(cell, row) {
        let componentRef = this;
        return <Link to={`${componentRef.props.match.url}/registration/${row.id}`}>
            <i className="fa fa-pencil"></i>
        </Link>
    }
    onDeleteAttendee(cell, row) {
        let componentRef = this;
        return <Link to={this} onClick={() => componentRef.deleteAttendee(row.id)}>
            <i class="fa fa-trash"></i>
        </Link>
    }
    // Method for print individual QR code
    onPrintAttendeeQRCode(cell, row) {
        let componentRef = this;
        return <Link to={this} onClick={() => componentRef.onGenerateQRcode(row)}>
            <i className="fa fa-print"></i>
        </Link>
    }

    // Method for get selected row keys for print all QR Code
    getSelectedRowKeys() {
        //alert("We got Selected Row Keys");
    }

    handleSelectChange(value) {
        let attendeeList = [], attendeeData = [];
        this.setState({
            value
        });
        if (value != null) {
            // Query for get attendance data by session Id
            DBUtil.getDocRef("Attendee")
                .get().then((snapshot) => {
                    snapshot.forEach(function (doc) {
                        let attendeeObj = doc.data();
                        if ((attendeeObj.profileServices instanceof Array
                            && attendeeObj.profileServices.includes(value)) || (attendeeObj.profileServices[0] == value)) {
                            attendeeData.push({
                                id: doc.id,
                                name: attendeeObj.firstName + ' ' + attendeeObj.lastName,
                                email: attendeeObj.email,
                                password: attendeeObj.password != undefined ? attendeeObj.password : '',
                                contactNo: attendeeObj.contactNo,
                                timestamp: attendeeObj.timestamp != undefined ? moment(attendeeObj.timestamp).format('DD-MMM HH:SS') : '',
                                attendeeLabel: attendeeObj.attendeeLabel,
                                attendeeCount: attendeeObj.attendeeCount,
                                attendeeCode: attendeeObj.attendeeLabel != undefined && attendeeObj.attendeeCount != undefined ? attendeeObj.attendeeLabel + "-" + attendeeObj.attendeeCount : '',
                                briefInfo: attendeeObj.briefInfo,
                                profileServices: value
                            });
                        }
                    });

                    this.setState({ attendeeData: attendeeData, attendeeCount: attendeeData.length});
                });
        }
        else {
            // Set default value for current state
            this.setState({ attendeeData: attendeeData, attendeeCount: 0 });
        }
    }

    render() {

        const { value } = this.state;
        const profileOptions = this.state.profileDropDown;

        // Define constant for sorting
        const options = {
            defaultSortName: 'attendeeCode',
            defaultSortOrder: 'asc',
            sizePerPageList: [{
                text: '250', value: 250
            }, {
                text: '500', value: 500
            }, {
                text: '1000', value: 1000
            }, {
                text: 'All', value: this.state.attendeeData.length
            }], // you can change the dropdown list for size per page
            sizePerPage: 250,  // which size per page you want to locate as default
        };
        // Define constant for checkbox      
        const selectRowProp = {
            mode: 'checkbox'
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
                                            <h1 className="regHeading paddingTop8">Attendee List</h1>
                                        </Col>
                                        <Col xs="12" md="3">
                                            <Select
                                                placeholder="Select Profile"
                                                simpleValue
                                                value={value}
                                                options={profileOptions}
                                                onChange={this.handleSelectChange}
                                            />
                                        </Col>
                                    </FormGroup>
                                </CardHeader>
                                <CardBody>
                                    <div>
                                        <Link to={`${this.props.match.url}/registration`}>
                                            <Button type="button" color="primary">
                                                <i className="fa fa-plus"></i>
                                                Add Attendee
                                            </Button>
                                        </Link> &nbsp;&nbsp;
                                        <Button type="button" onClick={this.getSelectedRowKeys.bind(this)} color="success">
                                            <i className="fa fa-print"></i>
                                            Print QR Code For All
                                        </Button> &nbsp;&nbsp;
                                        <Label>Count : </Label> {this.state.attendeeCount}
                                        <br/><br/>
                                        <BootstrapTable ref='table' data={this.state.attendeeData} pagination={true} search={true}
                                            selectRow={selectRowProp} options={options} exportCSV={ true } >
                                            <TableHeaderColumn dataField='id' headerAlign='left' isKey hidden>Id</TableHeaderColumn>
                                            <TableHeaderColumn dataField='attendeeCode' headerAlign='left' width='100' dataSort csvHeader='Code'>Code</TableHeaderColumn>
                                            <TableHeaderColumn dataField='password' headerAlign='left' width='120' dataSort csvHeader='Password'>Password</TableHeaderColumn>
                                            <TableHeaderColumn dataField='name' headerAlign='left' width='160' dataSort csvHeader='Name'>Name</TableHeaderColumn>
                                            <TableHeaderColumn dataField='email' headerAlign='left' width='160' csvHeader='Email'>Email</TableHeaderColumn>
                                            <TableHeaderColumn dataField='edit' dataFormat={this.onEditAttendee.bind(this)} headerAlign='left' width='30' export={false}></TableHeaderColumn>
                                            <TableHeaderColumn dataField='print' dataFormat={this.onPrintAttendeeQRCode.bind(this)} headerAlign='left' width='30' export={false}></TableHeaderColumn>
                                        </BootstrapTable>
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </div>
            </div>
        )
    }
}
export default AttendeeList;