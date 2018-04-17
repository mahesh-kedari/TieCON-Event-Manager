import React, { Component } from 'react';
import { Button } from 'reactstrap';
import { Link } from 'react-router-dom';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
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
    }

    // Method for get all Attendees data 
    componentWillMount() {
        let componentRef = this;
        DBUtil.addChangeListener("Attendee", function (objectList) {
            let attendeeItems = [];
            let attendeeId;
            let array = []
            objectList.forEach(function (doc) {
                attendeeId = doc.id;
                if (doc.data().isDelete != true) {
                    attendeeItems.push({
                        id: doc.id,
                        name: doc.data().firstName + ' ' + doc.data().lastName,
                        email: doc.data().email,
                        contactNo: doc.data().contactNo,
                        timestamp: doc.data().timestamp,
                        registrationType: doc.data().registrationType,
                        attendeeLabel: doc.data().attendeeLabel,
                        attendeeCount: doc.data().attendeeCount,
                        briefInfo: doc.data().briefInfo
                    });
                }
            });

            componentRef.setState({ attendee: attendeeItems });
        });
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
        newWindow.document.write("<div style='width:394px;height:490px;text-align:center;margin-left:0;margin-top:0;'>")
        newWindow.document.write("<div style='height:100%;'>")
        //layer1
        newWindow.document.write("<div style='height:29%;'> </div>")
        //layer2
        newWindow.document.write("<div style='padding: 0 30px;'><h1 style='font-size: 1.8rem;font-family:'Arial';padding: 10px 0 0 0;margin: 0;margin-bottom:-10px;'>" + user.name + "</h1>")
        newWindow.document.write("<p style='margin-top:-16px;font-size: 1.2rem;font-family:'Avenir-Book';'>" + CompanyName + "</p>")
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
            <Button type="button" color="primary"><i className="fa fa-pencil"></i> Edit</Button>
        </Link>
    }

    // Method for print individual QR code
    onPrintAttendeeQRCode(cell, row) {
        let componentRef = this;
        return <Button type="button" onClick={() => componentRef.onGenerateQRcode(row)} color="success">
            <i className="icon-note"></i>Print</Button>
    }

    // Method for get selected row keys for print all QR Code
    getSelectedRowKeys() {
        // Not implemented 
        //alert("We got Selected Row Keys");
    }


    render() {
        // Define constant for sorting
        const options = {
            defaultSortName: 'name',
            defaultSortOrder: 'asc'
        };
        // Define constant for checkbox      
        const selectRowProp = {
            mode: 'checkbox'
        };

        return (
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
                </Button>
                <BootstrapTable ref='table' data={this.state.attendee} pagination={true} search={true}
                    selectRow={selectRowProp} options={options}>
                    <TableHeaderColumn dataField='id' headerAlign='left' isKey hidden>Id</TableHeaderColumn>
                    <TableHeaderColumn dataField='name' headerAlign='left' width='200' dataSort>Name</TableHeaderColumn>
                    <TableHeaderColumn dataField='email' headerAlign='left' width='250'>Email</TableHeaderColumn>
                    <TableHeaderColumn dataField='contactNo' headerAlign='left' width='150'>Contact No</TableHeaderColumn>
                    <TableHeaderColumn dataField='registrationType' headerAlign='left' width='200'>Registration Type</TableHeaderColumn>
                    <TableHeaderColumn dataField='edit' dataFormat={this.onEditAttendee.bind(this)} headerAlign='left'>Edit</TableHeaderColumn>
                    <TableHeaderColumn dataField='print' dataFormat={this.onPrintAttendeeQRCode.bind(this)} headerAlign='left'>Print</TableHeaderColumn>
                </BootstrapTable>
            </div>
        )
    }
}

export default AttendeeList;