import React, {Component} from 'react';
import {Table, Button} from 'reactstrap';
import {BrowserRouter as Router, Link, Switch, Route, Redirect} from 'react-router-dom';

import * as firebase from 'firebase';
import 'firebase/firestore';
import { DBUtil } from '../../services';
import { ToastContainer, toast } from 'react-toastify';

class SponsorList extends Component{
    constructor(props){
        super(props);
        this.state = {
            sponsor : []
        }

        this.getSponsorList = this.getSponsorList.bind(this);
        this.deleteSponsor = this.deleteSponsor.bind(this);
    }

    // Method for set default data for sponsors
    componentWillMount(){
        this.getSponsorList();
    }

    // Method for get all sponsors
    getSponsorList(){
        let componentRef = this;
        DBUtil.getDocRef("Sponsor").where("isDelete", "==", false)
        .get()
        .then(function(querySnapshot) {
              let sponsorItems = [], sponsors = [], sponsorIds = [];  
              querySnapshot.forEach(function(doc) {
                    sponsorItems.push({
                        sponsorIds: doc.id,
                        sponsors: doc.data()
                    })
              });
             componentRef.setState({sponsor: sponsorItems})
        })
        .catch(function(error) {
            toast.error("User data not loaded.", {
              position: toast.POSITION.BOTTOM_RIGHT,
            });
        });
    }

    // Method for delete role
    deleteSponsor(sponsorId){
        let componentRef = this;
        DBUtil.getDocRef("Sponsor").doc(sponsorId).update({
                 "isDelete": true,
        }).then(function ()
            {
                toast.success("Sponsor deleted successfully.", {
                    position: toast.POSITION.BOTTOM_RIGHT,
                });
                setTimeout(() => {
                    componentRef.getSponsorList();
                }, 2000);
            });
    }

    render(){
        let componentRef = this;
        this.sponsorList = this.state.sponsor.map(function(item){
             return (
                 <tr key={item.sponsorIds}>
                     <td>{item.sponsors.name}</td>
                     <td>{item.sponsors.description}</td>
                     <td>{item.sponsors.category}</td>
                     <td>{item.sponsors.websiteURL}</td>
                     <td><Link to={`${componentRef.props.match.url}/SponsorForm/${item.sponsorIds}`} > 
                     <Button type="button" color="primary"><i className="fa fa-pencil"></i> Edit</Button></Link></td>
                     <td><Button color="danger" onClick={(e) => componentRef.deleteSponsor(item.sponsorIds)}> <i className="fa fa-trash"></i> Delete</Button></td>
                 </tr>
             )
         });

        return (
            <div className="animated fadeIn">
                <div>     
                    <Link to={`${this.props.match.url}/SponsorForm`}> 
                    <Button type="button" color="primary"><i className="fa fa-plus"></i> Add Sponors </Button></Link>
                    <ToastContainer autoClose={2000} />
                </div>
                <br/>
                <Table bordered hover size="xs">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Category</th>
                            <th>Website URL</th>
                            <th></th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.sponsorList}
                    </tbody>
                </Table>
            </div>
        );
    }
}

export default SponsorList;
