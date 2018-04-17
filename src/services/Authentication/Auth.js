import { ref, firebaseAuth } from '../config'

export class Auth {
  constructor() {
  }
static addNewUser (user){
  ref.child(`users/${user.uid}/info`)
    .set({
      email: user.email,
      uid: user.uid
    });
    // .then(()  => user )
}


  static auth(email, pwd, callbackFn, errorFn) {
    firebaseAuth().createUserWithEmailAndPassword(email, pwd)
      .then((response) => {
        this.addNewUser(response);
        callbackFn(response);
      })
      .catch((ex) => {
        errorFn(ex);
      });
  }
  static logOut (){
    firebaseAuth().signOut();
  }

  static login (email, pwd, callbackFn, errorFn){
    firebaseAuth().signInWithEmailAndPassword(email, pwd)
    .then((response) => {
      callbackFn(response);
    })
    .catch((ex) => {
      errorFn(ex);
    });
  }

  static resetPassword (email, callbackFn, errorFn){
    firebaseAuth().sendPasswordResetEmail(email)
    .then((response) => {
      callbackFn(response);
    })
    .catch((ex) => {
      errorFn(ex);
    });
  }
}
