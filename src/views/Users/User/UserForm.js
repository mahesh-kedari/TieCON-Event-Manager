

import React from 'react';
import {Label, CardHeader, Container, Row, Col, Card, CardBody, CardFooter, Button, Input, InputGroup, InputGroupAddon, InputGroupText, FormGroup} from 'reactstrap';
import {Link, Switch, Route, Redirect} from 'react-router-dom';
import {DBUtil} from '../../../services';
import *as firebase from 'firebase';
import 'firebase/firestore';
import {createBrowserHistory } from 'history';  
var history = createBrowserHistory()
import Select from 'react-select';
import 'react-select/dist/react-select.css';

class UserForm extends React.Component {
    constructor(props) {
        super(props);
        var history= {history}
        this.state = {
            user: {
                firstName: '',
                lastName: '',
                emailId: '',
                contactNo: '',
                roleName: ''
            },
           // submitted: false,
            isChecked: true,
            profilesValue: '',
            profileData :[],
             errors: {}
        };

        this.changeFunction = this.changeFunction.bind(this);
        this.submitFunction = this.submitFunction.bind(this);
        this.resetField = this.resetField.bind(this);
        this.toggleChange =this.toggleChange.bind(this);
        this.getProfileList = this.getProfileList.bind(this);
        this.changeprofile=this.changeprofile.bind(this);
        this.handleValidation = this.handleValidation.bind(this);
    }


    componentWillMount()
     {
         
      this.getProfileList();
    }
     
     changeprofile (profilesValue) {
        const roleName = 'roleName';
        const user = this.state.user;
        user[roleName] = profilesValue;
        this.setState({user: user});
    
        this.setState({profilesValue });
        console.log(this.state.user.roleName);
    }


     getProfileList()
        {
          let thisRef = this;
          let listRoles = [];
         let i;
    //    DBUtil.addChangeListener("Profiles", function(list)
    //    {
    //     list.forEach(function(document) {
    //     for(var i=0;i<document.data().roleName.length;i++)
    //      {
    //      listItem.push({label:document.data().roleName[i] , value:document.data().roleName[i]})
    //      }});
     
    //     thisRef.setState(
    //          {profileData : listItem});
    //     })

     DBUtil.addChangeListener("Roles", function(response)
    {
      response.forEach(function(Roledoc)
      {
        listRoles.push({label:Roledoc.id , value:Roledoc.id})
      })
        // console.log(listRooms, "listRooms");
    })
     thisRef.setState(
             {profileData : listRoles});

     

      }


    changeFunction(event) {
       
        const { name, value } = event.target;
      
        const { user } = this.state;
      
        this.setState({
            user: {
                ...user,
                [name]: value
            }
        });
        
    }

    handleValidation()
    {
        let formIsValid = true;
        let errors = {};
        const { user } = this.state;

        console.log("in handlevalidations", user);
        if(!user.firstName)
        {
           formIsValid = false;
           errors["firstName"] = "please fill out the first name"; 
        }
         
        if(user.firstName){
             if(!user.firstName.match(/^[a-zA-Z]+$/)){
                 formIsValid = false;
                 errors["firstName"] = "please enter valid name";
             }          
        }

        if(!user.lastName)
        {
           formIsValid = false;
           errors["lastName"] = "please fill out the last name"; 
        }
      
         if(user.lastName){
             if(!user.lastName.match(/^[a-zA-Z]+$/)){
                 formIsValid = false;
                 errors["lastName"] = "please enter valid name";
             }          
        }


          if(!user.emailId)
        {
           formIsValid = false;
           errors["emailId"] = "please fill out the email Id"; 
        }
   
          if(user.emailId){
            let lastAtPos = user.emailId.lastIndexOf('@');
            let lastDotPos = user.emailId.lastIndexOf('.');

            if (!(lastAtPos < lastDotPos && lastAtPos > 0 && user.emailId.indexOf('@@') == -1 && lastDotPos > 2 && (user.emailId.length - lastDotPos) > 2)) {
              formIsValid = false;
              errors["emailId"] = "Email is not valid";
            }
       }

         if(!user.roleName)
        {
           formIsValid = false;
           errors["roleName"] = "please select roleName"; 
        }

         if(user.contactNo)
        {
             
        }

         this.setState({errors: errors});
         return formIsValid;
    }
      



    submitFunction(event) {
        event.preventDefault();

         if(this.handleValidation()){
            let compRef = this;
              const { user } = this.state;
         DBUtil.addObj("Users", user, function(response)
        {
          compRef.props.history.push('/user');
        })
           alert("user created successfully");
        }
       }

   
  resetField()
      {
         this.setState({
            user: {
                firstName: '',
                lastName: '',
                emailId: '',
                contactNo: '',
                roleName :''
            },
           isChecked : false,
           errors: {}
          
        });
        }
  
       toggleChange()
       {
           this.setState({isChecked : !this.state.isChecked})
          // console.log("chekbox",this.state.isChecked )
       }


    render() {
       
        const { user, profilesValue ,profileData} = this.state;
     
        // const{submitted} = this.state;
         let options =profileData;
     
        return (
            <div className="animated fadeIn">
             <div>
            <Link to="/user"> <Button type="button" color="secondary"> Back to List </Button></Link>
            </div>
            <br/>
            <br/>
              <Container>
            
                 <Row className="justify-content-center">
                 <Col md="12">
                 <Card className="mx-4">
                <CardHeader>
                 <i className="fa fa-align-justify"></i>
                  User Form
                </CardHeader>

           
                 <CardBody className="p-4">
                 
                  
                <form name="form" onSubmit={this.submitFunction}>

                    
                <FormGroup row>
                  <Col md="6" >        
                  <InputGroup>
                    <InputGroupAddon addonType="prepend">
                    <InputGroupText>
                    <i className="icon-user"></i>
                    </InputGroupText>
                    </InputGroupAddon>
                  <Input type="text" placeholder="Enter First Name" name="firstName" value={this.state.user.firstName} 
                   onChange={this.changeFunction}/>
                  <br/> <span style={{color: "red"}}>{this.state.errors["firstName"]}</span>
                 </InputGroup>
                 </Col>

                  <Col  md="6" >        
                  <InputGroup>
                   <InputGroupAddon addonType="prepend">
                    <InputGroupText>
                    <i className="icon-user"></i>
                    </InputGroupText>
                    </InputGroupAddon>
                  <Input type="text" placeholder="Enter Last Name" name="lastName" value={this.state.user.lastName} 
                   onChange={this.changeFunction}/>
                   <br/> <span style={{color: "red"}}>{this.state.errors["lastName"]}</span>
                 </InputGroup>
                 </Col>
                </FormGroup>
  
                <br/>
              


                  <FormGroup row>
                  <Col md="6" >        
                  <InputGroup>
                  <InputGroupAddon addonType="prepend">
                   
                   <InputGroupText>@</InputGroupText>
                   
                    </InputGroupAddon>
                  <Input type="text" placeholder="Enter valid Email Id" name="emailId" value={this.state.user.emailId} 
                   onChange={this.changeFunction}/>
                   <br/> <span style={{color: "red"}}>{this.state.errors["emailId"]}</span>
                 </InputGroup>
                 </Col>

                  <Col  md="6">        
                  <InputGroup>
                 <InputGroupAddon addonType="prepend">
                    <InputGroupText>
                    <i className="icon-phone"></i>
                    </InputGroupText>
                    </InputGroupAddon>
                  <Input type="number" placeholder="Enter Contact Number " name="contactNo" value={this.state.user.contactNo} 
                   onChange={this.changeFunction}/>
                 </InputGroup>
                 </Col>

                </FormGroup>

                <br/>

                  
                
               
               


           <Row>
           <Col md="6" >        
           <FormGroup>
           <Select
           onChange={this.changeprofile}
           placeholder="Select Profile"
            simpleValue
            value={profilesValue}
           options={options}
          />
           <br/> <span style={{color: "red"}}>{this.state.errors["roleName"]}</span>
          </FormGroup>
          </Col>
         </Row>
             <br/>
               <Row>
                  <Col xs="12">        
                  <FormGroup>
                 {/* <input type="checkbox"  value = {this.state.isChecked}  onChange={this.toggleChange} />
                  <Label> Reset Password on sign on  </Label> */}
                  </FormGroup>
                 </Col>
                </Row>

               <Row>
               <Col xs="12">  
               <h1>   </h1>
               <br/>
               </Col>
               </Row>    

               <Row>
               <Col sm={{ size: 'auto', offset: 2 }}>
               <Button type="submit" color="primary">Create User</Button>
               </Col>
              <Col sm={{ size: 'auto', offset: 3 }}>
              <Button onClick={this.resetField} color="success">Reset</Button>
              </Col>
              </Row>
  
                 </form>
                </CardBody>
                </Card>
                </Col>
                </Row>
                 
                </Container>
          
            </div>
      
        );
    }
}

export default UserForm;