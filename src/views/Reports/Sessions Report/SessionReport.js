import React, { Component } from 'react';
import * as firebase from 'firebase';
import 'firebase/firestore';
import { DBUtil } from '../../../services';

import drilldown from 'highcharts-drilldown';
import Highcharts from 'highcharts';
drilldown(Highcharts);

class HighchartsDrilldown extends Component {

    componentDidMount() {
        // Veriable declartation
        let attendeeList = [], sessionList = [], profileData=[],
        sessionsData = [], profileList = [], attendeeData = [], sessionsAttendeeData = [];
        var sessionWiseAttendeeCount = 0;

        // Method for get all sessions data
        DBUtil.getDocRef("Sessions")
        .get().then((snapshot) => {
            let sessionIDs = [], sessions = [];
            snapshot.forEach(function (doc) {
                sessionList.push({
                    sessionIDs: doc.id,
                    sessions: doc.data()
                });
            });
        });
      
        // Method for get all user profiles data
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
        
        // Method for get all Attendee data
        DBUtil.getDocRef("Attendee")
        .get().then((snapshot) => {
            let attendeeIDs = [], attendees = [];
            snapshot.forEach(function (doc) {
                attendeeList.push({
                    attendeeIDs: doc.id,
                    attendees: doc.data()
                });
            });
        });
    
        // Method for get all Attendance data
        DBUtil.getDocRef("Attendance")
        .get().then((snapshot) => {
            let attendanceIDs = [], attendances = [], attendanceList =[] ;
            snapshot.forEach(function (doc) {
                attendanceList.push({
                    attendanceIDs: doc.id,
                    attendances: doc.data()
                });                
            });
           
            // Loop for get session-wise attendee count
            for(var k = 0; k < sessionList.length; k++){
                sessionWiseAttendeeCount = 0;
                for(var j = 0; j < attendanceList.length;  j++ ){
                    if(attendanceList[j].attendances.sessionId == sessionList[k].sessionIDs)   
                    {
                        sessionWiseAttendeeCount  = sessionWiseAttendeeCount + 1;
                    }                
                }
                sessionsData.push([sessionList[k].sessions.eventName,sessionWiseAttendeeCount,sessionList[k].sessionIDs]);
            }

            let arrayOfSessions = [{}];
            // Map function for set sessions data to session data set
            let sessionDataSet = sessionsData.map(function(row){
                arrayOfSessions = 
                {
                    name:  row[0], 
                    y: row[1],
                    drilldown: row[0] 
                }
                return arrayOfSessions;
            }); 
            let allSessionData =  [{
                "name": "Sessions",
                "colorByPoint": true,  
                "data": sessionDataSet
            }]
            
            // Loop for pre-define sessions attendee data for drilldown 
            for(var t = 0 ; t < sessionsData.length; t++)
            {
                let profileArray =[];
                for(var m = 0; m < profileList.length; m++)
                {
                    profileArray.push([profileList[m].profiles.profileName,0])
                }

                sessionsAttendeeData.push([{
                    "name": sessionsData[t][0],
                    "id": sessionsData[t][0],  
                    "data": profileArray
                }])
            }
          
           //Loop for set default attendee data to porfile data 
            for(var i =0;i< sessionsAttendeeData.length;i++){
                profileData[i] =sessionsAttendeeData[i][0]; 
            }

            // Below loops for get count of all attendees for spacific sessions
            for(var t = 0 ; t < sessionsData.length; t++)
            {

                for(var m = 0; m < profileList.length; m++)
                {

                    for(var j = 0; j < attendanceList.length;  j++ )
                    {

                         if(attendanceList[j].attendances.sessionId == sessionsData[t][2])   
                        {
                        
                            for(var i = 0; i < attendeeList.length; i++)
                            {
                                if(attendeeList[i].attendees.profileServices != undefined)
                                {
                                    for(var p = 0; p < attendeeList[i].attendees.profileServices.length; p++)
                                    {
                                        
                                        if(attendanceList[j].attendances.userId  == attendeeList[i].attendeeIDs  &&                                         
                                        profileList[m].profiles.profileName == attendeeList[i].attendees.profileServices[p])
                                        {

                                            for(var l=0; l < profileData.length; l++ )   
                                            {
                                                if(sessionsData[t][0] == profileData[l].name)
                                                {
                                                    for(var u=0; u < profileData[l].data.length; u++ )
                                                    {
                                                        if(profileData[l].data[u][0] == profileList[m].profiles.profileName)
                                                        {
                                                            profileData[l].data[u][1] =  profileData[l].data[u][1] + 1;
                                                        } 
                                                    }
                                                }
                                            }
                                        
                                        }
                                    }
                                }    
                            }  
                        }
                    }
                }
            }

            // Highchart implementation
            Highcharts.chart('container', {
                chart: {
                    type: 'column'
                },
                title: {
                    text: 'Sessionwise Attendee Report'
                },
                xAxis: {
                    type: 'category'
                },
                yAxis: {
                    title: {
                        text: 'Total percent'
                    }
                },
                legend: {
                    enabled: false
                },
                plotOptions: {
                    series: {
                        borderWidth: 0,
                        dataLabels: {
                            enabled: true,
                            format: '{point.y:.1f}%'
                        }
                    }
                },
                tooltip: {
                    headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
                    pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:.2f}%</b> of total<br/>'
                },
                "series": allSessionData,
                "drilldown":{
                        "series": profileData
                }
            });
        });
        // Condition for set default value
        if(sessionsData.length == 0){
            document.getElementById('container').innerText = 'Loading..';
        }
    }
    render() {
        return (
        <div id="container">
        </div>
        );
    }
}

class SessionReport extends Component {
  render() {
    return (
      <div>
        <HighchartsDrilldown />
      </div>
    );
  }
}

export default SessionReport;

