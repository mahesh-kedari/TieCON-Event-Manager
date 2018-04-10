import React, {Component} from 'react';
import {
    Input, InputGroup, InputGroupText, InputGroupAddon, Row, Col,
    Card, CardBody, Button, Label, FormGroup
  } from 'reactstrap';
import {Link, Switch, Route, Redirect} from 'react-router-dom';

import Select from 'react-select';
import * as firebase from 'firebase';
import 'firebase/firestore';
import { DBUtil } from '../../services';
import { ToastContainer, toast } from 'react-toastify';
 

class SponsorForm extends Component{

    constructor(props){
        super(props);

        this.state = {
            sponsor: {
                id:'',
                name:'',
                description: '',
                websiteURL:'',
                imageURL: '',
                category: '',
                isDelete: false
            },
            submitted: false
        }

        this.changeFunction = this.changeFunction.bind(this);
        this.onChangeCategoryField = this.onChangeCategoryField.bind(this);
        this.setInputToAlphabets = this.setInputToAlphabets.bind(this);
        this.submitFunction = this.submitFunction.bind(this);
        this.updateFunction = this.updateFunction.bind(this);
        this.resetFields = this.resetFields.bind(this);
    }

    // Method for get default data of sponor
    componentWillMount(){
        let thisRef = this;
        if (this.props.match.params.id != undefined)
        {
           var docRef =  DBUtil.getDocRef("Sponsor").doc(this.props.match.params.id);
           docRef.get().then(function(doc) {
             if (doc.exists)
             {
                 let sponsorData = doc.data();
                 thisRef.setState({
                   sponsor: {
                     id: doc.id,
                     name: sponsorData.name,
                     description: sponsorData.description,
                     websiteURL:sponsorData.websiteURL,
                     imageURL: sponsorData.imageURL,
                     category: sponsorData.category,
                   }
                 });
             } 
             else {
                 toast.error("Invalid data.", {
                   position: toast.POSITION.BOTTOM_RIGHT,
                 });
             }
           }).catch(function(error) {
               toast.error("Invalid data.", {
                 position: toast.POSITION.BOTTOM_RIGHT,
               });
           });
        }   
    }

    // Method for set all text box values
    changeFunction(event) {
        const { name, value } = event.target;
        const { sponsor } = this.state;
        this.setState({
            sponsor: {
                ...sponsor,
                [name]: value
            }
        });
    }

    // Method for set only alphabets
    setInputToAlphabets(e) {
        const re = /[a-zA-Z ]+/g;
        if (!re.test(e.key)) {
        e.preventDefault();
        }
    }

    // Method for select category value
    onChangeCategoryField(e) {
        const sponsor = this.state.sponsor;
        this.setState({
             sponsor: {
                 ...sponsor,
                 category: e.target.value
             }   
        });
    }

    // Method for reset all fields 
    resetFields(resetFlag){
        this.setState({
            sponsor: {
                name:'',
                description: '',
                websiteURL:'',
                imageURL: '',
                category: '',
                isDelete: false
            },
            submitted: false
        });
        if (resetFlag != true) {
            toast.success("Sponsor from reset successfully.", {
            position: toast.POSITION.BOTTOM_RIGHT,
            });
        }
    }

    // Method for insert sponsor data
    submitFunction(event){
        event.preventDefault();        
        this.setState({ submitted: true });     
        const { sponsor } = this.state;   
       
        let componentRef = this;
        if (sponsor.name && sponsor.description) {
            let tableName = "Sponsor";
            let doc = {
                name: sponsor.name,
                description: sponsor.description,
                websiteURL: sponsor.websiteURL,
                imageURL: sponsor.imageURL,
                category: sponsor.category,
                isDelete: false,
                timestamp: new Date()
            }
    
            DBUtil.addObj(tableName, doc, function (id, error) { 
                if(id != ""){   
                    toast.success("Sponsor saved successfully.", {
                        position: toast.POSITION.BOTTOM_RIGHT,
                    });
                    componentRef.resetFields(true);
                    setTimeout(() => {
                        componentRef.props.history.push('/Sponsor');     
                    }, 3000);
                }
            },
            function (err) {
                toast.error("Error: Sponsor not saved.", {
                    position: toast.POSITION.BOTTOM_RIGHT,
                });
            });
        }
    }

    // Method for update sponsor data
    updateFunction(){
        let componentRef = this;
        this.setState({ submitted: true });
        const { sponsor } = this.state;
        DBUtil.getDocRef("Sponsor").doc(sponsor.id).update({
            name: sponsor.name,
            description: sponsor.description,
            websiteURL: sponsor.websiteURL,
            imageURL: sponsor.imageURL,
            category: sponsor.category          
        }).then(function ()
        {
            toast.success("Sponsor updated successfully.", {
                position: toast.POSITION.BOTTOM_RIGHT,
            });
            componentRef.resetFields(true);
            setTimeout(() => {
                componentRef.props.history.push('/Sponsor');  
            }, 2000);
        });
    }

    render(){
        const { sponsor, submitted, value } = this.state;   
        if(this.state.sponsor.id != ""){
            this.setButtons = ( 
                <Button type="submit" size="md" color="success" onClick={this.updateFunction} ><i className="icon-note"></i> Update</Button> 
            );
        }
        else{
            this.setButtons = ( 
                <Button type="submit" size="md" color="success" onClick={this.submitFunction} ><i className="icon-note"></i> Submit</Button> 
            );
        }
        return (
            <div className="animated fadeIn">
                <div>   
                    <Link to="/sponsor"> 
                        <Button type="button" color="primary">
                            <i className="fa fa-chevron-left"></i>
                            Back to List 
                        </Button>
                    </Link>
                 </div><br/>
             
                <Row className="justify-content-left">
                    <Col md="8">
                        <Card className="mx-6">
                        <CardBody className="p-4">
                            <h1>Sponsor</h1>
                            <FormGroup row>
                                <Col xs="12" md="6" className={(submitted && !sponsor.name ? ' has-error' : '')}  >
                                    <InputGroup className="mb-3">
                                    <InputGroupAddon addonType="prepend">
                                        <InputGroupText>
                                        <i className="fa fa-handshake-o"></i>
                                        </InputGroupText>
                                    </InputGroupAddon>
                                    <Input type="text" placeholder="Sponsor Name" name="name" onKeyPress={(e) => this.setInputToAlphabets(e)} value={this.state.sponsor.name} onChange={this.changeFunction} required />
                                    {submitted && !sponsor.name &&
                                        <div className="help-block" style={{ color: "red" }}>*Required</div>
                                    }
                                    </InputGroup>
                                </Col>
                                <Col md="6" className={(submitted && !sponsor.description ? ' has-error' : '')} >
                                    <InputGroup className="mb-3">
                                    <InputGroupAddon addonType="prepend">
                                        <InputGroupText>
                                        <i className="fa fa-info"></i>
                                        </InputGroupText>
                                    </InputGroupAddon>
                                    <Input type="text" placeholder="Description" name="description" value={this.state.sponsor.description} onChange={this.changeFunction} required />
                                    {submitted && !sponsor.description &&
                                        <div style={{ color: "red" }} className="help-block" >*Required</div>
                                    }
                                    </InputGroup>
                                </Col>
                            </FormGroup>
                            <FormGroup row>
                                <Col xs="12" md="6">
                                    <InputGroup className="mb-3">
                                    <Input type="select" style={{ width: 200 }} name="category" multiple= {false} value={this.state.sponsor.category} id='category' placeholder="Category" onChange={(e) => this.onChangeCategoryField(e)} >
                                        <option value='Select Category'>Select Category</option>
                                        <option value="Gold">Gold</option>
                                        <option value="Platinum">Platinum</option>
                                        <option value="Sliver">Sliver</option>
                                    </Input>
                                    </InputGroup>
                                </Col>
                                <Col xs="12" md="6"  >
                                    <InputGroup className="mb-3">
                                    <InputGroupAddon addonType="prepend">
                                        <InputGroupText><i className="fa fa-external-link" aria-hidden="true"></i></InputGroupText>
                                    </InputGroupAddon>
                                    <Input type="text" placeholder="Website URL" name="websiteURL" value={this.state.sponsor.websiteURL} onChange={this.changeFunction} required />
                                    </InputGroup>
                                </Col>
                            </FormGroup>
                            <FormGroup row>
                                <Col xs="12" md="6">
                                    <InputGroup className="mb-3">
                                    <InputGroupAddon addonType="prepend">
                                        <InputGroupText><i className="fa fa-image"></i></InputGroupText>
                                    </InputGroupAddon>
                                    <Input type="text" placeholder="Image URL" name="imageURL" value={this.state.sponsor.imageURL} onChange={this.changeFunction} />
                                    </InputGroup>
                                </Col>
                            </FormGroup>
                            <FormGroup row>
                                <Col xs="12" md="12">
                                    {this.setButtons} &nbsp;&nbsp;
                                    <Button type="reset" size="md" color="danger" onClick={this.resetFields} ><i className="fa fa-ban"></i> Reset</Button>
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

export default SponsorForm;
