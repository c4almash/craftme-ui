import React, { Component } from 'react';
import UserList from '../containers/user-list.jsx';
import UserDetail from '../containers/user-detail.jsx';
import { Switch, Route, Link } from 'react-router-dom';
import Login from './Login.jsx';
import Signup from './Signup.jsx';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <header>
        <ul>
          <li>
            <Link to="/login">Login</Link>
          </li>
          <li>
            <Link to="/signup">Signup</Link>
          </li>
        </ul>
        <div>
          <Switch>
            <Route path="/login" component={Login} />
            <Route path="/signup" component={Signup} />
          </Switch>
        </div>
      </header>
    );
  }
}

export default App;
