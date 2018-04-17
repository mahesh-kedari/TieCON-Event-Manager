const functions = require('firebase-functions');
var admin = require("firebase-admin");
const nodemailer = require('nodemailer');
var serviceAccount = require('./tiecon-pune-production.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://tiecon-pune.firebaseio.com'
});

const mailTransport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: '',
        pass: '',
    },
});

const APP_NAME = 'TiECON Pune';

exports.registerUser = functions.https.onRequest((request, response) => {
    if (request.method !== 'POST') {
        return response.status(403).send('Forbidden!');
    }
    let req  = JSON.parse(request.body);
    
    if (!req.userEmail) {
        return response.status(400).send('Invalid user email');
    }
    if (!req.password) {
        return response.status(400).send('Invalid password');
    }
    if (!req.displayName) {
        return response.status(400).send('Invalid display name');
    }
    if (!req.contactNo) {
        return response.status(400).send('Invalid contactNo');
    }
    if (!req.firstName) {
        return response.status(400).send('Invalid firstName');
    }
    if (!req.lastName) {
        return response.status(400).send('Invalid lastName');
    }
    if (!req.fullName) {
        return response.status(400).send('Invalid fullName');
    }
    
    if (!req.roleName) {
        return response.status(400).send('Invalid roleName');
    }
    if (!req.address) {
        return response.status(400).send('Invalid address');
    }
    return admin.auth().createUser({
        email: req.userEmail,
        emailVerified: false,
        password: req.password,
        displayName: req.displayName,
        disabled: false
    })
        .then((userRecord) => {
            console.log("Successfully created new user:", userRecord.uid);
            let attendeeDetails = { 
                address: req.address, 
                contactNo: req.contactNo, 
                email:req.userEmail,
                firstName:req.firstName,
                lastName:req.lastName,
                password:req.password,
                fullName:req.fullName,
                roleName:req.roleName,
                profileServices: req.profileServices,
                timestamp :req.timestamp,
                registrationType: req.registrationType,
                briefInfo: req.briefInfo,
                info : req.info,
                attendeeCount: req.attendeeCount,
                attendeeLabel: req.attendeeLabel,
                attendanceId: req.attendanceId,
                sessionId:  req.sessionId,
                linkedInURL: req.linkedInURL,
                profileImageURL: req.profileImageURL
            };
        
        return sendWelcomeEmail(req.userEmail, req.displayName, response, req.password, attendeeDetails, userRecord.uid);
        })
        .catch((error) => {
            console.log("Error creating new user:", error);
            return response.status(500).send(error);
        });
});

function sendWelcomeEmail(email, displayName, response, password, attendeeDetails, uid) {
    const mailOptions = {
        from: `${APP_NAME} <noreply@firebase.com>`,
        to: email,
    };

    // The user subscribed to the newsletter.
    mailOptions.subject = `Welcome to ${APP_NAME}!`;
    mailOptions.text = `Hello ${displayName || ''},
                        \nWelcome to Tie Pune Chapter. We are glad to have you on board!
                        \n\tYou can now download our TiePune application, to streamline your complete TieCon Experience!
                        \n\t\t > Playstore Link: https://play.google.com/store/apps/details?id=com.eternus.tieconpuneevents
                        \n\t\t > Appstore Link: https://itunes.apple.com/us/app/tie-pune-events/id1367365998?ls=1&mt=8
                        \n\n Your One Time Password (OTP) for login is: '${password}'
                        \n\nOur TiePune Application now lets you
                        \n\t > Refer to TieCon Events Schedule and Agenda
                        \n\t > Study speaker details for each event
                        \n\t > Pose the speaker of your choice questions, any time through the event
                        \n\n\t > Network with co-attendees for insights
                        \nWe, with TiePune, will also engage you with Exciting TieCon Updates !!!
                        \nLooking forward to seeing you at the Event !!
                        \nCheers,
                        \nTeam Tie`;

     return admin.firestore().collection("Attendee").doc(uid)
            .set(attendeeDetails)
            .then((docRef) => {
                console.log('Attendde added', attendeeDetails);
                let resData = JSON.stringify({
                    status : "success",
                    uid : uid,
                    abc : 'Snehal Kale'
                });
               return response.status(200).send(resData);
           
            })
            .catch((ex) => {
                console.log('Error Adding Attendee', ex);
                return response.status(500).send("Error updating attendance table for user:" + ex);
            });
       }
