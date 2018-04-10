import React, {Component} from 'react';
import {Bar, Doughnut, Line, Pie, Polar, Radar} from 'react-chartjs-2';
import {CardColumns, Card, CardHeader, CardBody, Row, Col, FormGroup} from 'reactstrap';

import * as firebase from 'firebase';
import 'firebase/firestore';
import { DBUtil } from '../../../services';


class AttendeeReport extends Component{
    constructor(props){
        super(props);

        this.state = {
            attendeeData: []
        };
    }

    componentWillMount() {
        let componentRef = this;
        let profileList = [];
        // Call method for get user profiles list
        DBUtil.getDocRef("UserProfiles")
        .get().then((snapshot) => {
            let profileIDs = [], profiles = [];
            snapshot.forEach(function (doc) {
                profileList.push({
                    profileIDs: doc.id,
                    profiles: doc.data()
                });
            });
        });

        // Call method for get attendees data
        DBUtil.getDocRef("Attendee")
        .get().then((snapshot) => {
           let attendees  = [], attendeeCountList = [];
           snapshot.forEach(function (doc) {
            attendees.push(doc.data());
            });
            // Declaration of required counts
            var menteeCount = 0, mentorCount = 0, investorCount = 0, lookingForInvestmentCount = 0,
            adminCount = 0, delegatesCount = 0, sponsorCount = 0, attendeeCount = 0, ecoSystemCount = 0,
            organizingCommitteeCount = 0, guestCount = 0, volunteerCount = 0, speakerCount = 0, 
            mediaCount = 0, charterMemberCount= 0;
           
            // This loop for get attendees intent & profile count
            for (var i = 0; i < attendees.length; i++) {
                if(attendees[i].intent == 'Mentee'){
                    menteeCount = menteeCount + 1;
                }
                else if(attendees[i].intent == 'Mentor'){
                    mentorCount = mentorCount + 1;
                }
                else if(attendees[i].intent == 'Investor'){
                    investorCount = investorCount + 1;
                }
                else if(attendees[i].intent == 'Looking For Investment'){
                    lookingForInvestmentCount = lookingForInvestmentCount + 1;
                }
                
                if(attendees[i].profileServices != undefined){
                    // This loop for get attendees multiple profiles count
                    for(var j = 0; j < attendees[i].profileServices.length; j++){
                        // This loop for check actual profiles
                        for (var k = 0; k < profileList.length; k++) {
                            // This condition for check/match actual profiles with attendee profiles
                            if(profileList[k].profiles.profileName == attendees[i].profileServices[j]){

                                if(attendees[i].profileServices[j] == 'Admin'){
                                    adminCount = adminCount + 1;
                                    break;
                                }
                                else if(attendees[i].profileServices[j] == 'Attendee'){
                                    attendeeCount = attendeeCount + 1;
                                    break;
                                }
                                else if(attendees[i].profileServices[j] == 'Charter Member'){
                                    charterMemberCount = charterMemberCount + 1;
                                    break;
                                }
                                else if(attendees[i].profileServices[j] == 'Delegates'){
                                    delegatesCount = delegatesCount + 1;
                                    break;
                                }
                                else if(attendees[i].profileServices[j] == 'Eco System Partner'){
                                    ecoSystemCount = ecoSystemCount + 1;
                                    break;
                                }
                                else if(attendees[i].profileServices[j] == 'Guest'){
                                    guestCount = guestCount + 1;
                                    break;
                                }
                                else if(attendees[i].profileServices[j] == 'Media'){
                                    mediaCount = mediaCount + 1;
                                    break;
                                }
                                else if(attendees[i].profileServices[j] == 'Organizing Committee'){
                                    organizingCommitteeCount = organizingCommitteeCount + 1;
                                    break;
                                }
                                else if(attendees[i].profileServices[j] == 'Sponsor'){
                                    sponsorCount = sponsorCount + 1;
                                    break;
                                }
                                else if(attendees[i].profileServices[j] == 'Speaker'){
                                    speakerCount = speakerCount + 1;
                                    break;
                                }
                                else if(attendees[i].profileServices[j] == 'Volunteer'){
                                    volunteerCount = volunteerCount + 1;
                                    break;
                                }
                            }
                        }
                    }
                }
            }
            attendeeCountList.push({
                 mentee : menteeCount,
                 mentor : mentorCount,
                 investor: investorCount,
                 lookingForInvestment : lookingForInvestmentCount,
                 admin : adminCount,
                 attendee : attendeeCount,
                 charterMember : charterMemberCount,
                 ecoSystem : ecoSystemCount,
                 delegates : delegatesCount,
                 guest : guestCount,
                 media : mediaCount,
                 organizingCommittee : organizingCommitteeCount,
                 sponsor : sponsorCount,
                 speaker : speakerCount,
                 volunteer : volunteerCount
            });
            componentRef.setState({attendeeData : attendeeCountList}) 
        });
    }

    render(){
        let attendeeCounts =  this.state.attendeeData;
        if(attendeeCounts.length != 0){
            this.printIntentData = {
                labels: ['Mentor', 'Mentee', 'Investor', 'Looking For Investment'],
                datasets: [
                    {
                        label: 'Intent Report',
                        backgroundColor: 'rgba(255,99,132,0.2)',
                        borderColor: 'rgba(255,99,132,1)',
                        borderWidth: 1,
                        hoverBackgroundColor: 'rgba(255,99,132,0.4)',
                        hoverBorderColor: 'rgba(255,99,132,1)',
                        data: [attendeeCounts[0].mentor, attendeeCounts[0].mentee,
                        attendeeCounts[0].investor, attendeeCounts[0].lookingForInvestment]
                    }
                ]
            };
            
            this.loadIntentData = <div className="chart-wrapper">
                                    <Bar data={this.printIntentData} options={{ maintainAspectRatio: false}}/>
                                  </div>

            this.printProfileData = {
                labels: ['Admin', 'Attendee', 'Charter Member', 'Eco System Partner', 'Delegates', 'Guest', 'Media', 'Organizing Committee', 'Sponsor', 'Speaker', 'Volunteer'],
                datasets: [
                    {
                        label: 'Profile Report',
                        backgroundColor: 'rgba(255,99,132,0.2)',
                        borderColor: 'rgba(255,99,132,1)',
                        borderWidth: 1,
                        hoverBackgroundColor: 'rgba(255,99,132,0.4)',
                        hoverBorderColor: 'rgba(255,99,132,1)',
                        data: [attendeeCounts[0].admin, attendeeCounts[0].attendee, attendeeCounts[0].charterMember , attendeeCounts[0].ecoSystem ,
                        attendeeCounts[0].delegates , attendeeCounts[0].guest  ,  attendeeCounts[0].media    , attendeeCounts[0].organizingCommittee ,
                        attendeeCounts[0].sponsor , attendeeCounts[0].speaker , attendeeCounts[0].volunteer
                    ]
                    }
                ]
            };

            this.loadProfileData = <div className="chart-wrapper">
                                     <Bar data={this.printProfileData} options={{ maintainAspectRatio: false}}/>
                                   </div>
        }
        else{
            this.loadIntentData = "Loading...";
            this.loadProfileData = "Loading...";
        }

        return (
            <div className="animated fadeIn">
                <Row className="justify-content-left">
                    <Col md="12">
                    <FormGroup row>
                        <Col xs="12" md="12">
                            <Card>
                                <CardHeader>
                                    Intent Report
                                </CardHeader>
                                <CardBody>
                                    {this.loadIntentData}
                                </CardBody>
                            </Card>
                        </Col>
                     </FormGroup>
                     <FormGroup row>
                        <Col xs="12" md="12">
                            <Card>
                                <CardHeader>
                                    Profile Report
                                </CardHeader>
                                <CardBody>
                                    {this.loadProfileData}
                                </CardBody>
                            </Card>
                        </Col>
                     </FormGroup>
                    </Col>
               </Row>
            </div>
        );
    }
}

export default AttendeeReport;
