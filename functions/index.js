const functions = require('firebase-functions');
var admin = require("firebase-admin");
const nodemailer = require('nodemailer');
var serviceAccount = require('./tiecon-pune-production.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://TiECON-Pune.firebaseio.com'
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
    if (!req.isAttendee) {
        return response.status(400).send('Invalid isAttendee');
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
                fullName:req.fullName,
                roleName:req.roleName,
                isAttendee:req.isAttendee,
            };
            return sendWelcomeEmail(req.userEmail, req.displayName, response, req.password, attendeeDetails, userRecord.uid);
        })
        .catch((error) => {
            console.log("Error creating new user:", error);
            return response.status(500).send("Error creating new user:");
        });
});

function sendWelcomeEmail(email, displayName, response, password, attendeeDetails, uid) {
    const mailOptions = {
        from: `${APP_NAME} <noreply@firebase.com>`,
        to: email,
    };

    // The user subscribed to the newsletter.
    mailOptions.subject = `Welcome to ${APP_NAME}!`;
    mailOptions.text = `Hey ${displayName || ''}! Thank you for your registration at ${APP_NAME}. Your password for login is '${password}'.`;
    return mailTransport.sendMail(mailOptions).then(() => {
        console.log('New welcome email sent to:', email);
        return admin.firestore().collection("Attendee").doc(uid)
            .set(attendeeDetails)
            .then((docRef) => {
                console.log('Attendde added', attendeeDetails);
                return response.status(200).send("Successfully created new user.");
            })
            .catch((ex) => {
                console.log('Error Adding Attendee', ex);
                return response.status(500).send("Error updating attendance table for user:" + email);
            });
    }).catch((error) => {
        console.log("Error sending mail to user:", error);
        return response.status(500).send("Error sending mail to user:" + email);
    });
}
