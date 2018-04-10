import React, {Component} from 'react';
import {
    Input, InputGroup, InputGroupText, InputGroupAddon, Row, Col,
    Card, CardBody, Button, Label, FormGroup
} from 'reactstrap';

import * as firebase from 'firebase';
import 'firebase/firestore';
import { DBUtil } from '../../services';
import { ToastContainer, toast } from 'react-toastify';

class AboutUs extends Component{
    constructor(props) {
        super(props);
        this.state = {
            info: '',
        };
        this.changeFunction = this.changeFunction.bind(this);
        this.submitFunction = this.submitFunction.bind(this);
        this.resetField = this.resetField.bind(this);
    }

    // Method to set text area value
    changeFunction(event) {
        const { name, value } = event.target;
        const { info } = this.state;
        this.setState({
            info: value,
        });
    }

    // Method for submit & pass data to database
    submitFunction(event){
        event.preventDefault();        
        const { info } = this.state;   
        let componentRef = this;
        if (info != "") {
            let tableName = "AboutUs";
            let doc = {
                info: info,
                timestamp: new Date()
            }
             
        DBUtil.addObj(tableName, doc, function (id, error) {    
            if(id != ""){
                toast.success("About us added successfully.", {
                    position: toast.POSITION.BOTTOM_RIGHT,
                });
                componentRef.resetField(true);
            }
          },
            function (err) {
              toast.error("Error: About us not saved.", {
                position: toast.POSITION.BOTTOM_RIGHT,
              });
            });
        }
    }

    // Method for reset all fields
    resetField(resetFlag) {
        this.setState({
            info: ''
        });
        if (resetFlag != true) {
            toast.success("About us form reset successfully.", {
                position: toast.POSITION.BOTTOM_RIGHT,
            });
        }
    }

    render(){
        return (
            <div className="animated fadeIn">
                <Row className="justify-content-left">
                <Col md="12">
                    <Card className="mx-6">
                    <CardBody className="p-4">
                        <h1>About Us</h1>
                        <FormGroup row>
                        <Col xs="12" md="12">
                            <InputGroup className="mb-3">
                            <InputGroupAddon addonType="prepend">
                                <InputGroupText><i className="fa fa-info"></i></InputGroupText>
                            </InputGroupAddon>
                            <Input type="textarea" placeholder="Info" name="info" value={this.state.info} onChange={this.changeFunction} required />
                            </InputGroup>
                        </Col>
                        </FormGroup>
                        <FormGroup row>
                        <Col xs="12" md="12">
                            <Button type="submit" size="md" color="success" onClick={this.submitFunction} ><i className="icon-note"></i> Submit</Button> &nbsp;&nbsp;
                            <Button onClick={this.resetField} type="reset" size="md" color="danger" ><i className="fa fa-ban"></i> Reset</Button>
                            <ToastContainer autoClose={4000} />
                        </Col>
                        </FormGroup>
                    </CardBody>
                    </Card>
                </Col>
                </Row>
          </div>
        );
    }
}

export default AboutUs;
