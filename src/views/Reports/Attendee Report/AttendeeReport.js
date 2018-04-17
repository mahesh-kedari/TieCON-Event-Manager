import React, {Component} from 'react';
import {Bar, Doughnut, Line, Pie, Polar, Radar} from 'react-chartjs-2';
import {CardColumns, Card, CardHeader, CardBody, Row, Col, FormGroup} from 'reactstrap';

import * as firebase from 'firebase';
import 'firebase/firestore';
import { DBUtil } from '../../../services';
import Highcharts from 'highcharts';


class PieHighcharts extends Component {
    componentDidMount() {
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
            var menteeCount = 0, mentorCount = 0, investorCount = 0, lookingForInvestmentCount = 0; //,
            // adminCount = 0, delegatesCount = 0, sponsorCount = 0, attendeeCount = 0, ecoSystemCount = 0,
            // organizingCommitteeCount = 0, guestCount = 0, volunteerCount = 0, speakerCount = 0,
            // mediaCount = 0, charterMemberCount= 0;            
            let profileArray =[], profileData = [];

            // Loop for pre-define profile report default data
            for(var m = 0; m < profileList.length; m++)
            {
                if(m == 0){
                    profileArray.push([{name:profileList[m].profiles.profileName, y:0, sliced: true, selected: true}])
                }
                else{
                    profileArray.push([{name:profileList[m].profiles.profileName, y:0}])
                }
            }
            for(var i =0;i< profileArray.length;i++){
                profileData[i] =profileArray[i][0];
            }


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
                        // This loop for default profiles
                        for(var l=0; l < profileData.length; l++ )
                        {                            
                            if(profileData[l].name == attendees[i].profileServices[j])
                            {
                                profileData[l].y =  profileData[l].y + 1;
                            }
                        }

                        // // This loop for check actual profiles
                        // for (var k = 0; k < profileList.length; k++) {
                        //     // This condition for check/match actual profiles with attendee profiles
                        //     if(profileList[k].profiles.profileName == attendees[i].profileServices[j]){

                        //         if(attendees[i].profileServices[j] == 'Admin'){
                        //             adminCount = adminCount + 1;
                        //             break;
                        //         }
                        //         else if(attendees[i].profileServices[j] == 'Attendee'){
                        //             attendeeCount = attendeeCount + 1;
                        //             break;
                        //         }
                        //         else if(attendees[i].profileServices[j] == 'Charter Member'){
                        //             charterMemberCount = charterMemberCount + 1;
                        //             break;
                        //         }
                        //         else if(attendees[i].profileServices[j] == 'Delegates'){
                        //             delegatesCount = delegatesCount + 1;
                        //             break;
                        //         }
                        //         else if(attendees[i].profileServices[j] == 'Eco System Partner'){
                        //             ecoSystemCount = ecoSystemCount + 1;
                        //             break;
                        //         }
                        //         else if(attendees[i].profileServices[j] == 'Guest'){
                        //             guestCount = guestCount + 1;
                        //             break;
                        //         }
                        //         else if(attendees[i].profileServices[j] == 'Media'){
                        //             mediaCount = mediaCount + 1;
                        //             break;
                        //         }
                        //         else if(attendees[i].profileServices[j] == 'Organizing Committee'){
                        //             organizingCommitteeCount = organizingCommitteeCount + 1;
                        //             break;
                        //         }
                        //         else if(attendees[i].profileServices[j] == 'Sponsor'){
                        //             sponsorCount = sponsorCount + 1;
                        //             break;
                        //         }
                        //         else if(attendees[i].profileServices[j] == 'Speaker'){
                        //             speakerCount = speakerCount + 1;
                        //             break;
                        //         }
                        //         else if(attendees[i].profileServices[j] == 'Volunteer'){
                        //             volunteerCount = volunteerCount + 1;
                        //             break;
                        //         }
                        //     }
                        // }
                    }
                }
            }
            attendeeCountList.push({
                mentee : menteeCount,
                mentor : mentorCount,
                investor: investorCount,
                lookingForInvestment : lookingForInvestmentCount //,
                // admin : adminCount,
                // attendee : attendeeCount,
                // charterMember : charterMemberCount,
                // ecoSystem : ecoSystemCount,
                // delegates : delegatesCount,
                // guest : guestCount,
                // media : mediaCount,
                // organizingCommittee : organizingCommitteeCount,
                // sponsor : sponsorCount,
                // speaker : speakerCount,
                // volunteer : volunteerCount
            });

            // Created Pie chart for Intent report
            Highcharts.chart('intentReport', {
                chart: {
                    plotBackgroundColor: null,
                    plotBorderWidth: null,
                    plotShadow: false,
                    type: 'pie'
                },
                title: {
                    text: 'Intent Report'
                },
                tooltip: {
                    pointFormat: '{series.name}: <b>{point.percentage:.0f}</b>'
                },
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                            enabled: true,
                            format: '<b>{point.name}</b>: {point.percentage:.0f} ',
                            style: {
                                color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                            }
                        }
                    }
                },
                series: [{
                    name: 'Intent Report',
                    colorByPoint: true,
                    data: [{
                        name: 'Mentor',
                        y: attendeeCountList[0].mentor,
                        sliced: true,
                        selected: true
                    }, {
                        name: 'Mentee',
                        y: attendeeCountList[0].mentee
                    }, {
                        name: 'Investor',
                        y: attendeeCountList[0].investor
                    }, {
                        name: 'Looking For Investment',
                        y: attendeeCountList[0].lookingForInvestment
                    }]
                }]
            });

            // Created Pie chart for Profile Report
            Highcharts.chart('profileReport', {
                chart: {
                    plotBackgroundColor: null,
                    plotBorderWidth: null,
                    plotShadow: false,
                    type: 'pie'
                },
                title: {
                    text: 'Profile Report'
                },
                tooltip: {
                    pointFormat: '{series.name}: <b>{point.percentage:.0f}</b>'
                },
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                            enabled: true,
                            format: '<b>{point.name}</b>: {point.percentage:.0f} ',
                            style: {
                                color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                            }
                        }
                    }
                },
                series: [{
                    name: 'Profile Report',
                    colorByPoint: true,
                    data: profileData
                    // [{
                    //     name: 'Admin',
                    //     y: attendeeCountList[0].admin,
                    //     sliced: true,
                    //     selected: true
                    // }, {
                    //     name: 'Attendee',
                    //     y: attendeeCountList[0].attendee
                    // }, {
                    //     name: 'Charter Member',
                    //     y: attendeeCountList[0].charterMember
                    // }, {
                    //     name: 'Eco System Partner',
                    //     y: attendeeCountList[0].ecoSystem
                    // }, {
                    //     name: 'Delegates',
                    //     y: attendeeCountList[0].delegates
                    // }, {
                    //     name: 'Guest',
                    //     y: attendeeCountList[0].guest
                    // }, {
                    //     name: 'Media',
                    //     y: attendeeCountList[0].media
                    // }, {
                    //     name: 'Organizing Committee',
                    //     y: attendeeCountList[0].organizingCommittee
                    // }, {
                    //     name: 'Sponsor',
                    //     y: attendeeCountList[0].sponsor
                    // }, {
                    //     name: 'Speaker',
                    //     y: attendeeCountList[0].speaker
                    // }, {
                    //     name: 'Volunteer',
                    //     y: attendeeCountList[0].volunteer
                    // }]

                }]
            });
        });
    }
    render() {
        return (
            <div className="animated fadeIn">
                <Row className="justify-content-left">
                    <Col>
                        <FormGroup>
                            <Col xs="12" md="6" style={{ float: "left" }}>
                                <Card>
                                    <CardHeader>
                                        Intent Report
                                    </CardHeader>
                                    <CardBody>
                                        <div className="chart-wrapper">
                                            <div id="intentReport" style={{minwidth: "310px", height: "400px", maxwidth: "600px", margin: "0 auto"}} ></div>
                                        </div>
                                    </CardBody>
                                </Card>
                            </Col>
                            <Col xs="12" md="6" style={{ float: "left" }}>
                                <Card>
                                    <CardHeader>
                                        Profile Report
                                    </CardHeader>
                                    <CardBody>
                                            <div id="profileReport" style={{minwidth: "310px", height: "400px", maxwidth: "600px", margin: "0 auto"}} ></div>
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

class AttendeeReport extends Component{
    render() {
        return (
            <div>
                <PieHighcharts />
            </div>
        );
    }
}

export default AttendeeReport;
