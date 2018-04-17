import React, { Component } from 'react';
import { Link, Switch, Route, Redirect } from 'react-router-dom';
import { Container } from 'reactstrap';
import Header from '../../components/Header/';
import Sidebar from '../../components/Sidebar/';
import Breadcrumb from '../../components/Breadcrumb/';
import Aside from '../../components/Aside/';
import Footer from '../../components/Footer/';
/** components import* */
import Dashboard from '../../views/Dashboard/';
import User from '../../views/Users/User/';
import Role from '../../views/Users/Role/';
import Reports from '../../views/Reports/Reports';
import Attendance from '../../views/Attendance/Attendance';
import Session from '../../views/Sessions/Session';
import Registration from '../../views/Registration/Registration';
import Rooms from '../../views/Rooms/Rooms';
import RegistrationList from '../../views/RegistrationList/registrationList';
import Attendee from '../../views/Attendee/Attendee';
import AttendeeReport from '../../views/Reports/Attendee Report/AttendeeReport';
import SessionReport from '../../views/Reports/Sessions Report/SessionReport';
import AboutUs from '../../views/AboutUs/AboutUs';
import Sponsor from '../../views/Sponsor/Sponsor';
import Logout from '../../views/Pages/logOut/';
import * as firebase from 'firebase';
import 'firebase/firestore';
import InitialQuestions from '../../views/InitialQuestions/InitialQuestions';

class Full extends Component {
  constructor(props) {
    super(props);
    this.state = {
      authUser: false,
      initialLoad: true
    }
  }
  componentWillMount() {
    let thisRef = this;
    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        thisRef.setState({
          authUser: true,
          initialLoad: false
        })
      }
      else {
        thisRef.setState({
          authUser: false,
          initialLoad: false
        })
      }
    }, function (err) {
      console.log("err", err);
    });
  }
  render() {
    if (!this.state.initialLoad) {
      if (this.state.authUser == true) {
        return (
          <div className="app">
            <Header />
            <div className="app-body">
              <Sidebar {...this.props} />
              <main className="main">
                <Breadcrumb />
                <Container fluid>
                  <Switch>
                    <Route path="/dashboard" name="Dashboard" component={Dashboard} />
                    <Route path="/user" name="User" component={User} />
                    <Route path="/role" name="Role" component={Role} />
                    <Route path='/registration' name='Registration' component={Registration} />
                    <Route path='/attendance' name='Attendance' component={Attendance} />
                    <Route path='/session' name='Session' component={Session} />
                    <Route path='/rooms' name='Rooms' component={Rooms} />
                    <Route path='/registrationList' name='Registration List' component={RegistrationList} />
                    <Route path='/attendee' name='Attendee' component={Attendee} />
                    <Route path='/attendeeReport' name='Attendee Report' component={AttendeeReport} />
                    <Route path='/sessionReport' name='Session Report' component={SessionReport} />
                    <Route path='/aboutUs' name='AboutUs' component={AboutUs} />
                    <Route path='/sponsor' name='Sponsor' component={Sponsor} />
                    <Route path='/logOut' name='logOut' component={Logout} />
                    <Route path='/initialQuestions' name='Initial Questions' component={InitialQuestions} />
                    <Redirect from="/" to="/dashboard" />
                  </Switch>
                </Container>
              </main>
              <Aside />
            </div>
            <Footer />
          </div>
        );
      }
      else {
        return (
          <Redirect from="/" to="/login" />
        );
      }
    } else {
      return (<span></span>);
    }
  }
}

export default Full;
