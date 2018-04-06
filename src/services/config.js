import * as firebase from 'firebase';
import 'firebase/firestore';

export const firebaseConfig = {
    apiKey: "AIzaSyAuFLKp-auhYOpzOyerwIF6jar6bITZf1Q",
    authDomain: "TiECON-Pune.firebaseapp.com",
    databaseURL: "https://TiECON-Pune.firebaseio.com",
    projectId: "TiECON-Pune",
    storageBucket: "TiECON-Pune.appspot.com",
    messagingSenderId: "1055109214488"
} // from Firebase Console

firebase.initializeApp(firebaseConfig)
export const firestoredb = firebase.firestore();
export const ref = firebase.database().ref()
export const firebaseAuth = firebase.auth