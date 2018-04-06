import * as firebase from 'firebase';
import 'firebase/firestore';

export const firebaseConfig = {
    apiKey: "AIzaSyAuFLKp-auhYOpzOyerwIF6jar6bITZf1Q",
    authDomain: "tiecon-pune.firebaseapp.com",
    databaseURL: "https://tiecon-pune.firebaseio.com",
    projectId: "tiecon-pune",
    storageBucket: "tiecon-pune.appspot.com",
    messagingSenderId: "1055109214488"
} // from Firebase Console

firebase.initializeApp(firebaseConfig)
export const firestoredb = firebase.firestore();
export const ref = firebase.database().ref()
export const firebaseAuth = firebase.auth