import React from 'react';
import { BrowserRouter as Router, Route, Switch, Link, useLocation } from 'react-router-dom';
import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';
import '@blueprintjs/datetime/lib/css/blueprint-datetime.css';
import './App.css';
import Subscription from './components/Subscription/Subscription';
import MainScreen from './components/Wizard';
import AdminControl from './components/AdminControl/AdminControl';
import Unauthorized from './components/Unauthorized/Unauthorized';
import { hasRequiredAuthParams } from './utils/auth';

// Protected Route Component for Admin
const ProtectedAdminRoute: React.FC = () => {
  const location = useLocation();
  const isAuthorized = hasRequiredAuthParams(location);
  
  return isAuthorized ? <AdminControl /> : <Unauthorized />;
};

// Protected Route Component for Subscription
const ProtectedSubscriptionRoute: React.FC = () => {
  const location = useLocation();
  const isAuthorized = hasRequiredAuthParams(location);
  
  return isAuthorized ? <Subscription /> : <Unauthorized />;
};

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
              <ProtectedAdminRoute />
            </Route>
            <Route path="/subscription">
              <ProtectedSubscriptionRoute />
            </Route>
          </Switch>
        </main>


      </div>
    </Router>
  );
}

export default App;
