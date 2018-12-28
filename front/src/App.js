import React, { Component } from 'react';
import { BrowserRouter, Route, Switch } from "react-router-dom";
import './App.scss';
import Home from './pages/home';
import Dashboard from './containers/DefaultLayout';
import Login from './pages/login';
import Error from './pages/error';
import Navigation from './component/navigation';

class App extends Component {
  render() {
    
    return (
      <BrowserRouter>
        <div>
          
          <Switch>
            <Route path="/" component={Home} exact />
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/login" component={Login} exact />
            <Route component={Error} />
          </Switch>
        </div>
      </BrowserRouter>
    );
  }
}

export default App;
