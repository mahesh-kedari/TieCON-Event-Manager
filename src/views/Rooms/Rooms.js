import React, { Component } from 'react';
import {
    Input, InputGroup, InputGroupText, InputGroupAddon, Row, Col,   
    Card,  CardBody, Button, FormGroup
} from 'reactstrap';
import Select from 'react-select';
import 'react-select/dist/react-select.css';
import { ToastContainer, toast } from 'react-toastify';

import * as firebase from 'firebase';
import 'firebase/firestore';
import { DBUtil } from '../../services';

class Rooms extends Component {
    constructor(props) {
        super(props);

        this.state = {
            room: {
                roomName: '',
                capacity: '',
                bufferCapacity : '',
                availableServices: []
            },
            serviceDropDown: [],
            submitted: false
        };
        this.changeFunction = this.changeFunction.bind(this);
        this.submitFunction = this.submitFunction.bind(this);
        this.resetField = this.resetField.bind(this);
        this.handleSelectChange = this.handleSelectChange.bind(this);   
        this.setInputToNumeric = this.setInputToNumeric.bind(this);
    }

    // Method for get defaulf services
    componentWillMount() {
        let componentRef = this;
        DBUtil.addChangeListener("AvailableServices", function (objectList) {
            let services = [], arrayService = [], servicesArray = [];
            objectList.forEach(function (doc) {
                services.push(doc.data());
            });            
            servicesArray = services[0].services;
            servicesArray.forEach(function (item){
                arrayService.push({label : item , value : item });
            });
            componentRef.setState({serviceDropDown : arrayService})
        });
    }

    // Method for set text values
    changeFunction(event) {
        const { name, value } = event.target;
        const { room } = this.state;
        this.setState({
            room: {
                ...room,
                [name]: value
            }
        });
    }

    // Method for save rooms data
    submitFunction(event) {
        event.preventDefault();
        this.setState({ submitted: true });
        const { room } = this.state;
        if (room.roomName && room.capacity ) {
            if(this.state.room.availableServices.length > 0){
                let length = this.state.room.availableServices.length;
                let serviceString = this.state.room.availableServices[length - 1]
                if(serviceString == ""){
                    this.state.room.availableServices = [];
                }
                else{
                    let serviceArray = serviceString.split(',');
                    this.state.room.availableServices = serviceArray;
                }
            } 
            
            let componentRef = this;
            let tableName = "Rooms";
            let docName = room.roomName;
            let doc= {
                roomName: room.roomName,
                capacity: room.capacity,
                bufferCapacity: room.bufferCapacity,
                availableServices: room.availableServices
            }
            DBUtil.addDoc(tableName, docName, doc ,function(){          
                toast.success("Room saved successfully.", {
                    position: toast.POSITION.BOTTOM_RIGHT,
                });
                setTimeout(() => {
                    componentRef.resetField(true);
                }, 500);
            },
            function(err){
                toast.error("Room not saved.", {
                    position: toast.POSITION.BOTTOM_RIGHT,
                });
            });
        }
    }

    // Method for reset all fields
    resetField(resetFlag) {
        this.setState({
            room: {
                roomName: '',
                capacity: '',
                bufferCapacity : '',
                availableServices: [], 
            }
        });
        this.handleSelectChange(null);
        if (resetFlag != true) {
            toast.success("Room form reset successfully.", {
                position: toast.POSITION.BOTTOM_RIGHT,
            });
        }
    }
   
    // Method for set drop-down list
    handleSelectChange(value) {
        if (value != null) {
            this.state.room.availableServices.push(value);
        }
        this.setState({ value });
    }

    // Method for set only Numeric
    setInputToNumeric(e) {
        const re = /[0-9]+/g;
        if (!re.test(e.key)) {
        e.preventDefault();
        }
    }
    
    render() {
        const { room, submitted, value ,serviceDropDown} = this.state;   
        const options = this.state.serviceDropDown;

        return (
            <div className="animated fadeIn">
                    <Row className="justify-content-left">
                        <Col md="8">
                            <Card className="mx-6"> 
                                <CardBody className="p-4">
                                    <h1>Room</h1>
                                    <FormGroup row>
                                        <Col xs="12" md="6" className={(submitted && !room.roomName ? ' has-error' : '')}  >
                                            <InputGroup className="mb-3">
                                                <InputGroupAddon addonType="prepend">
                                                    <InputGroupText>
                                                        <i className="icon-home"></i>
                                                    </InputGroupText>
                                                </InputGroupAddon>
                                                <Input type="text" placeholder="Room Name" name="roomName" value={this.state.room.roomName} onChange={this.changeFunction} />
                                                {submitted && !room.roomName &&
                                                        <div style={{color: "red"}} className="help-block">*Required</div>
                                                    }
                                            </InputGroup>
                                        </Col>
                                        <Col md="6">
                                            <InputGroup className="mb-3">
                                                <InputGroupAddon addonType="prepend">
                                                    <InputGroupText><i className="icon-pie-chart"></i></InputGroupText>
                                                </InputGroupAddon>
                                                <Input type="text" placeholder="Capacity" name="capacity" maxLength={15} value={this.state.room.capacity} onKeyPress={(e) => this.setInputToNumeric(e)} onChange={this.changeFunction} />
                                                 {submitted && !room.capacity &&
                                                <div style={{color: "red"}} className="help-block">*Required</div>
                                            }
                                            </InputGroup>
                                        </Col>
                                    </FormGroup>
                                    <FormGroup row>
                                    <Col xs="12"  md="6"  >
                                            <InputGroup className="mb-3">
                                                <InputGroupAddon addonType="prepend">
                                                    <InputGroupText><i className="icon-pie-chart"></i></InputGroupText>
                                                </InputGroupAddon>
                                                <Input type="text" placeholder="Buffer Capacity" name="bufferCapacity" maxLength={15} value={this.state.room.bufferCapacity} onKeyPress={(e) => this.setInputToNumeric(e)} onChange={this.changeFunction} />
                                            </InputGroup>
                                        </Col>
                                        <Col  md="6" className={(submitted && !room.availableServices ? ' has-error' : '')}>
                                            <FormGroup>
                                                <Select
                                                    multi
                                                    onChange={this.handleSelectChange}
                                                    placeholder="Select Services"
                                                    simpleValue
                                                    value={value}
                                                    options={options}
                                                />
                                            </FormGroup>
                                        </Col>                                      
                                        </FormGroup>
                                    <FormGroup row className="noBottomMargin">
                                        <Col xs="6" md="12" >
                                            <Button type="button" size="md" color="success" onClick={this.submitFunction} >Create Room</Button>
                                             &nbsp;&nbsp;
                                            <Button onClick={this.resetField} type="reset" size="md" color="danger" ><i className="fa fa-ban"></i> Reset</Button>
                                            <ToastContainer autoClose={4000} />
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

export default Rooms;
    