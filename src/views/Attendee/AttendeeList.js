import { Row, Col, Card, CardBody, Table, Button } from 'reactstrap';
import React, { Component } from 'react';
import { BrowserRouter as Router, Link, Switch, Route, Redirect } from 'react-router-dom';
import { IntlProvider, FormattedDate, FormattedTime } from 'react-intl';
import * as firebase from 'firebase';
import 'firebase/firestore';
import { DBUtil } from '../../services';
import QRCode from 'qrcode'

class AttendeeList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            attendee: []
        }
        this.onGenerateQRcode = this.onGenerateQRcode.bind(this);
        this.openWin = this.openWin.bind(this);
    }

    // Method for get all Attendees data 
    componentWillMount() {
        let componentRef = this;
        DBUtil.addChangeListener("Attendee", function (objectList) {
            let attendeeItems = []; let attendeeIDs = [];
            objectList.forEach(function (doc) {
                if (doc.data().isDelete != true) {
                    attendeeItems.push({
                        attendeeIDs: doc.id,
                        attendeeItems: doc.data()
                    });
                }
            });
            componentRef.setState({ attendee: attendeeItems })
        });
    }

    //function to print Idcard
    openWin(user) {
        let attendeeLabel = user.attendeeItems.attendeeLabel;
        let attendeeCount = user.attendeeItems.attendeeCount;
        let attendeeCode = attendeeLabel + "-" + attendeeCount;
        var newWindow = window.open('', '', 'width=1000,height=1000');
        newWindow.document.writeln("<html>");
        newWindow.document.writeln("<body>");
        newWindow.document.write("<div style='width:394px;height:490px;text-align:center;margin-left:0;margin-top:0;'>")
        newWindow.document.write("<div style='height:100%;'>")
        //layer1
        newWindow.document.write("<div style='height:29%;'> </div>")
        //layer2
        newWindow.document.write("<div style='padding: 0 30px;'><h1 style='font-size: 1.8rem;font-family:'Arial';padding: 10px 0 0 0;margin: 0;margin-bottom:-10px;'>" + user.attendeeItems.firstName + " " + user.attendeeItems.lastName + "</h1>")
        newWindow.document.write("<p style='margin-top:-16px;font-size: 1.2rem;font-family:'Avenir-Book';'>Eternus Solutions Pvt Ltd</p>")
        newWindow.document.write("</div>")
        //layer2a
        newWindow.document.write("<div style='text-align: left;padding: 30px 30px;padding-bottom:0;margin-top:45px;'>")
        newWindow.document.write("<img style='width:60px;height:60px;margin-left:-4px;margin-bottom:-4px;' src='" + this.state.Qrurl + "'/>")
        newWindow.document.write("<div style='text-align:left;font-weight:bold;font-size:13px;font-family:'Arial';margin-top:-4px;padding: 0 0px;padding-right:0px;margin-left:4px;'>" + attendeeCode + "</div> <br/>")
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

    //function to generate Qrcode
    onGenerateQRcode(user) {
        let generatedQR;
        let compRef = this;
        let id = user.attendeeIDs;
        QRCode.toDataURL("TIECON:" + id)
            .then(url => {
                generatedQR = url;
                compRef.setState({ Qrurl: url })
                setTimeout(() => {
                    compRef.openWin(user);
                }, 250);
            })
    }

    render() {
        let componentRef = this;
        this.rows = this.state.attendee.map(function (row) {
            return <tr key={row.attendeeIDs}>
                <td>{row.attendeeItems.firstName + ' ' + row.attendeeItems.lastName}</td>
                <td>{row.attendeeItems.email == undefined ? '' : row.attendeeItems.email}</td>
                <td>{row.attendeeItems.contactNo == undefined ? '' : row.attendeeItems.contactNo}</td>
                <td>{row.attendeeItems.timestamp == undefined ? '' : <FormattedDate value={row.attendeeItems.timestamp.toString()} />}</td>
                <td>{row.attendeeItems.registrationType == undefined ? '' : row.attendeeItems.registrationType}</td>
                <td><Link to={`${componentRef.props.match.url}/registration/${row.attendeeIDs}`} >
                    <Button type="button" color="primary"><i className="fa fa-pencil"></i> Edit</Button></Link></td>
                <td><Button type="button" onClick={() => componentRef.onGenerateQRcode(row)} color="success"><i className="icon-note"></i>Print</Button></td>
            </tr>
        });
        return (
            <div className="animated fadeIn">
                <IntlProvider locale="en">
                    <Row>
                        <Col md="12" >
                            <Card>
                                <CardBody className="p-4">
                                    <h1>Attendee List</h1>
                                    <Table responsive>
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Email</th>
                                                <th>Contact No</th>
                                                <th>Date</th>
                                                <th>Registration type </th>
                                                <th>Action </th>
                                                <th>       </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {this.rows}
                                        </tbody>
                                    </Table>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </IntlProvider>
            </div>
        )
    }
}

export default AttendeeList;