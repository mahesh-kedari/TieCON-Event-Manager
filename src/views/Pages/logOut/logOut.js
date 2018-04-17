import React, {Component} from 'react';
import {Link, Switch, Route, Redirect} from 'react-router-dom';
import {Container, Row, Col, Button, Input, InputGroupAddon, InputGroup, InputGroupText} from 'reactstrap';
import { Auth } from '../../../services/Authentication/Auth';
class Logout extends Component {
 componentDidMount (){
    Auth.logOut(); 
 }
 render () {
    return (
      <Redirect from="/" to="/login"/>
    )
 }
}
export default Logout;
