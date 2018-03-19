import React, {Component} from 'react';
import { Badge,  Row,  Col,  Card,  CardHeader,  CardBody,  Table,
Pagination,  PaginationItem,  PaginationLink , Button, Container} from 'reactstrap';
import {Link, Switch, Route, Redirect} from 'react-router-dom';


import {DBUtil} from '../../../services';
import *as firebase from 'firebase';
import 'firebase/firestore';

class UserList extends Component
{

    constructor(props)
    {
        super(props);
        this.state =
        {
          userObj: [],
          Qrurl : '' 
        }
       this.openWin = this.openWin.bind(this);
       this.fetchDetails= this.fetchDetails.bind(this);
       this.createQR = this.createQR.bind(this);
       this.deleteUser = this.deleteUser.bind(this);
       this.getUserList= this.getUserList.bind(this);
    }


     componentWillMount()
     {
     this.getUserList();
    }

       
       getUserList()
        {
          let thisRef = this;
         DBUtil.addChangeListener("Users", function(list)
       {
          let listItem = [];
         list.forEach(function(document) {
        listItem.push({userId :document.id , userInfo:document.data()})
         });
     
         thisRef.setState({userObj : listItem});
        
       })
  
        }


       deleteUser(user)
    {
   DBUtil.getDocRef("Users").doc(user.userId).delete().then(function(response) {
   alert("user deleted successfully")
    });
   }
   
       createQR(user) {
        //  
      
          let fname = user.userInfo.firstName;
          let lname = user.userInfo.lastName;
          let contactNo = user.userInfo.contactNo;
          let emailid = user.userInfo.emailId;
          let roleName = user.userInfo.roleName
       
	      let  cardDetails= {
				version: '3.0',
				lastName: lname,
				firstName: fname,
				organization: 'Eternus Solutions',
				cellPhone: contactNo,
				role: roleName,
				email: emailid
			};
			
			let generatedQR = qrCode.createVCardQr(cardDetails, { typeNumber: 12, cellSize: 2 });
		
			// var card = `<div style='height: 5.8in;width: 4.3in;'>
			// <div style='border-bottom: 2px solid black;'><img style="width:4.3in;height:1in" src='https://www.tiecon.org/wp-content/uploads/2015/08/tiecon.png'/></div>
			// <div id='print'>
			// <div><h1>Harshit Jyoti</h1></div>
			// <div>`+generatedQR+`</div>
			// </div>
			// <div style='position:fixed;bottom:0px;border-top: 2px solid black;'><img style="width:4.3in;height:1in" src='https://www.tiecon.org/wp-content/uploads/2015/08/tiecon.png'/></div>
      // </div>`;
     
      this.setState({ Qrurl : generatedQR})
			
   }


     fetchDetails(user)
     {

     
        this.createQR(user); 
     setTimeout(() => {
           this.openWin(user)
        }, 250);
     }



    openWin(user) {
    
          let fname = user.userInfo.firstName;
          let lname = user.userInfo.lastName;
          let name = fname +" "+lname;
          let contactNo = user.userInfo.contactNo;
          let emailid = user.userInfo.emailId;
          let roleName = user.userInfo.roleName;


    var newWindow = window.open('','','width=200,height=100');
    newWindow.document.writeln("<html>");
    newWindow.document.writeln("<body>");
   
    newWindow.document.writeln("<div> QR code : <br/> <br/></div>")
    newWindow.document.writeln("" + this.state.Qrurl + 
       "");
    newWindow.document.writeln("<div> Name : "   + "" + name +  "</div>" + "<br/>")
  
    newWindow.document.writeln("<div> Email Id: "   + "" + emailid +  "</div>" + "<br/>")
   
     newWindow.document.writeln("<div> Contact No : "   + "" + contactNo +  "</div>" + "<br/>")

     newWindow.document.writeln("<div> Profile : "   + "" + roleName +  "</div>" + "<br/>")

    newWindow.document.writeln("</body></html>");
    newWindow.document.close();

    setTimeout(function() {
    newWindow.print();
    newWindow.close();
}, 1000);
  }

  

   render() {
     let componentRef = this;
        this.users = this
            .state
            .userObj
            .map(function (user) {
                return <tr >
                   
                    <td>{user.userInfo.firstName} {user.userInfo.lastName}</td>
                    <td>{user.userInfo.contactNo}</td>
                    <td>{user.userInfo.emailId}</td>
                    <td>{user.userInfo.roleName}</td>
                    <td> <Button  onClick={() => componentRef.deleteUser(user)} color="danger">Delete</Button></td>  
                   <td> <Link to={`${componentRef.props.match.url}/userForm`}> <Button type="button" color="primary">Edit</Button></Link></td>
                </tr>
            });

        return (
            <div className="animated fadeIn">
            <div>     
           <Link to={`${this.props.match.url}/userForm`}> <Button type="button" color="secondary"> Add new User </Button></Link>
           </div>       
           <br/>
           <br/>
                   <Container>
                    <Row className="justify-content-center">
                        <Col xs="12">
                            <Card>
                                <CardHeader>
                                    <label className="regHeading">Users</label>                                   
                                </CardHeader>
                                <CardBody>
                                    <Table responsive>
                                        <thead>
                                           
                                            <th>First Name</th>
                                            <th>Contact No</th>
                                            <th>Email</th>
                                            <th>Profile</th>
                                            <th>        </th>
                                            <th>        </th>
                                            <th>        </th>
                                        </thead>
                                        {this.users}
                                    </Table>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
              </Container>
            </div>
        )
    }
}


export default UserList;



































