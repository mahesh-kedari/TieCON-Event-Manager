import SponsorList from './SponsorList';
import SponsorForm from './SponsorForm.js';
import React, {Component} from 'react';
import {BrowserRouter as Router,Link, Switch, Route, Redirect} from 'react-router-dom'

class Sponsor extends Component{
    render(){
        return <div>
                    <Route exact path={this.props.match.path} component={SponsorList} />
                    <Route path={`${this.props.match.path}/SponsorForm/:id?`} component={SponsorForm} />
               </div>    
    }
}

export default Sponsor;
