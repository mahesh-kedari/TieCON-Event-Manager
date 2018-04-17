import React, { Component } from 'react';
import {
    CardGroup, Container, Row, Col, Card, CardHeader, CardBody, CardFooter, Button, Label,
    Table, FormGroup, Modal, ModalHeader, ModalBody, ModalFooter
} from 'reactstrap';
import Select from 'react-select';
import 'react-select/dist/react-select.css';
import * as firebase from 'firebase';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import 'firebase/firestore';
import { DBUtil } from '../../services';
import Avatar from 'react-avatar';
import { ToastContainer, toast } from 'react-toastify';
import HeaderQue from '../../components/Header/HeaderQue';
import FooterQueScreen from '../../components/Footer/FooterQueScreen';

const questionTable = "AskedQuestions";
class SessionQuestions extends Component {
    constructor(props) {
        super(props);
        this.state = {
            sessionList: [],
            sessionValue: '',
            categoryValue: '',
            questionData: []
        };
        this.onCategorySelect = this.onCategorySelect.bind(this);
        this.onSessionSelect = this.onSessionSelect.bind(this);
        this.getQuestions = this.getQuestions.bind(this);
    }

    // Method For render/set default data
    componentWillMount() {
        let thisRef = this;
        let sessionData = [];
        DBUtil.getDocRef("Sessions")
            .get().then((snapshot) => {
                if (snapshot.size > 0) {
                    snapshot.forEach(doc => {
                        if (doc.data().sessionType != 'break') {
                            sessionData.push({ label: doc.data().eventName, value: doc.id });
                        }
                    })
                    thisRef.setState({
                        sessionList: sessionData
                    })
                }
            }).catch((error) => {

            });
    }
    onCategorySelect(value) {
        if (value != null) {
            this.setState({
                categoryValue: value.value
            });
            let filter = value.value;
            let session = this.state.sessionValue;
            this.getQuestions(session, filter);
        }
        else {
            this.setState({
                categoryValue: ''
            });
        }
    }
    onSessionSelect(value) {
        if (value != null) {
            this.setState({
                sessionValue: value.value
            });
            let session = value.value;
            let filter = this.state.categoryValue;
            this.getQuestions(session, filter);
        }
        else {
            this.setState({
                sessionValue: '',
                questionData: []
            });
        }
    }
    getQuestions(session, filter) {

        let thisRef = this;
        let sessionId = session;
        let questionSet = [];
        if (filter == "" || filter == undefined) {
            filter = 'timestamp'
        }
        let filterParam = filter;
        DBUtil.getDocRef(questionTable)
            .where("SessionId", "==", sessionId)
            .orderBy(filterParam, 'desc')
            .onSnapshot((snapshot) => {
                if (snapshot.size > 0) {
                    snapshot.forEach(question => {
                        questionSet.push({
                            Question: question.data().Question,
                            askedBy: question.data().askedBy.fullName,
                            voteCount: question.data().voteCount
                        })
                    });
                    thisRef.setState({
                        questionData: questionSet
                    })
                }
                else {
                    thisRef.setState({
                        questionData: []
                    })
                }
            });
    }
    render() {
        const { sessionList, sessionValue, categoryValue } = this.state;
        let sessionOptions = sessionList;
        let categoryOptions = [
            { label: 'Recent', value: 'timestamp' },
            { label: 'Top', value: 'voteCount' }
        ]
        if(this.state.questionData.length > 0){
            this.renderQuestions = this.state.questionData.map(question => {
                return (
                    <CardGroup style={{ marginLeft: -508, alignSelf: 'center' }}>
                        <Card>
                            <Row className="justify-content-center">
                                <text style={{fontSize :20, fontWeight: 'bold' }}>{question.Question}</text>
                            </Row>
                            <Row className="justify-content-center">
                                {question.askedBy}
                            </Row>
                        </Card>
                    </CardGroup >
                )
            })
        }
        else{
            this.renderQuestions = null;
        }
        return (
            <div className="app">
                <HeaderQue />
                <div className="app-body">
                    <main className="main">
                        <div style={{ marginTop: 20 }} className="animated fadeIn">
                            <Container >
                                <Row className="justify-content-center">
                                    <Col md="6">
                                        <CardGroup style={{ width: 851 }}>
                                            <Card style={{ marginLeft: -511, marginTop: -20 }} className="p-4">
                                                <CardBody>
                                                    <Row>
                                                        <Col xs="12" md="6">
                                                            <FormGroup row className="marginBottomZero">
                                                                <Col xs="12" md="3">
                                                                    <h5 >Sessions :</h5>
                                                                </Col>
                                                                <Col xs="12" md="9">
                                                                    <Select
                                                                        placeholder="--Select--"
                                                                        value={sessionValue}
                                                                        options={sessionOptions}
                                                                        onChange={this.onSessionSelect} />
                                                                </Col>
                                                            </FormGroup>
                                                        </Col>
                                                        <Col md="6">
                                                            <FormGroup row className="marginBottomZero">
                                                                <Col xs="12" md="3">
                                                                    <h5 >Category :</h5>
                                                                </Col>
                                                                <Col xs="12" md="9">
                                                                    <Select
                                                                        placeholder="--Select--"
                                                                        value={categoryValue}
                                                                        options={categoryOptions}
                                                                        clearable={true}
                                                                        onChange={this.onCategorySelect} />
                                                                </Col>
                                                            </FormGroup>
                                                        </Col>
                                                    </Row>
                                                </CardBody>
                                            </Card>
                                        </CardGroup>
                                        {/* <CardGroup style={{  marginLeft: -508, alignSelf: 'center' }}> */}
                                            {/* width: 251 + '%', <BootstrapTable ref='table' data={this.state.questionData} style={{ marginLeft: -511, marginTop: -20, width: 800 }} >
                                                <TableHeaderColumn dataField='askedBy' headerAlign='left' width='400' >Asked By</TableHeaderColumn>
                                                <TableHeaderColumn dataField='Question' headerAlign='left' isKey width='800'>Question</TableHeaderColumn>
                                                <TableHeaderColumn dataField='voteCount' headerAlign='left' width='300'>Likes</TableHeaderColumn>
                                            </BootstrapTable> */}
                                            {this.renderQuestions}


                                        {/* </CardGroup> */}
                                    </Col>
                                </Row>
                            </Container>
                        </div>
                    </main>
                </div>
                <FooterQueScreen />
            </div>
        );
    }
}
export default SessionQuestions;