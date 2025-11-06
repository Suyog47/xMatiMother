import React from 'react';
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom';
import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';
import '@blueprintjs/datetime/lib/css/blueprint-datetime.css';
import './App.css';
import Subscription from './components/Subscription/Subscription';
import MainScreen from './components/Wizard';
import AdminControl from './components/AdminControl/AdminControl';

function App() {

  return (
    <Router>
      <div className="App">
        {/* <header className="App-header">
          <h1>xMati Mother Application</h1>
          <nav className="nav-menu">
            <Link to="/wizard" className="nav-link" target="_blank" rel="noopener noreferrer">Registration Wizard</Link>
            <Link to="/admin" className="nav-link" target="_blank" rel="noopener noreferrer">Admin Control Panel</Link>
            <Link to="/subscription" className="nav-link" target="_blank" rel="noopener noreferrer">Subscription Management</Link>
          </nav>
        </header> */}

        <main className="App-main">
          <Switch>
            <Route exact path="/">
              <MainScreen />
            </Route>
            <Route path="/wizard">
              <MainScreen />
            </Route>
            <Route path="/admin">
              <AdminControl />
            </Route>
            <Route path="/subscription">
              <Subscription />
            </Route>
          </Switch>
        </main>


      </div>
    </Router>
  );
}

export default App;
