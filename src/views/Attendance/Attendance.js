import React, {Component} from 'react';
import { Row, Col, Card, CardBody, Table } from 'reactstrap';
import * as firebase from 'firebase';
import 'firebase/firestore';
import { DBUtil } from '../../services';
import { IntlProvider, FormattedDate ,FormattedTime } from 'react-intl';

class Attendance extends React.Component {
    constructor() {
        super();
        this.state = {
            attendance: []
        }
    }

    // Method for get attendance data
    componentWillMount() {
        let componentRef = this;
        DBUtil.addChangeListener("Attendance", function (objectList) {
            let attendanceList = [], attendanceIds = [], attendanceItems;

            objectList.forEach(function (doc) {
               attendanceList.push({
                    attendanceIds: doc.id,
                    attendanceItems: doc.data()
                });
            });
            componentRef.setState({attendance: attendanceList})
        });
    }

    render() {
        this.rows = this.state.attendance.map(function (row) {
            return <tr key={row.attendanceIds}>
                        <td>{row.attendanceItems.fullName}</td>
                        <td>{row.attendanceItems.sessionId}</td>
                        <td><FormattedDate value={row.attendanceItems.timestamp.toString()}/></td>
                   </tr>
        });

        return (
            <div className="animated fadeIn">
                <IntlProvider locale="en">
                    <Row>
                        <Col md="12" >
                            <Card>
                                <CardBody className="p-4">
                                <h1>Attendance List</h1>
                                    <Table responsive>
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Session</th>
                                                <th>Date</th>
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
export default Attendance;
