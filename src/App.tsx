import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch, Link, useLocation, useHistory } from 'react-router-dom';
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
  const history = useHistory();
  
  // Check authorization whenever location changes
  useEffect(() => {
    const isAuthorized = hasRequiredAuthParams(location);
    if (!isAuthorized) {
      history.replace('/unauthorized');
      return;
    }
    
    // Additional admin email check
    const formData = JSON.parse(localStorage.getItem('formData') || '{}');
    const isAdmin = formData.email === 'xmatiservice@gmail.com';
    if (!isAdmin) {
      history.replace('/unauthorized');
    }
  }, [location, history]);
  
  const isAuthorized = hasRequiredAuthParams(location);
  
  if (!isAuthorized) {
    return null; // Don't render anything while redirecting
  }
  
  // Additional admin email check for render
  const formData = JSON.parse(localStorage.getItem('formData') || '{}');
  const isAdmin = formData.email === 'xmatiservice@gmail.com';
  
  if (!isAdmin) {
    return null; // Don't render anything while redirecting
  }
  
  return <AdminControl />;
};

// Protected Route Component for Subscription
const ProtectedSubscriptionRoute: React.FC = () => {
  const location = useLocation();
  const history = useHistory();
  
  // Check authorization whenever location changes
  useEffect(() => {
    const isAuthorized = hasRequiredAuthParams(location);
    if (!isAuthorized) {
      history.replace('/unauthorized');
    }
  }, [location, history]);
  
  const isAuthorized = hasRequiredAuthParams(location);
  
  if (!isAuthorized) {
    return null; // Don't render anything while redirecting
  }
  
  return <Subscription />;
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
            <Route path="/unauthorized">
              <Unauthorized />
            </Route>
          </Switch>
        </main>


      </div>
    </Router>
  );
}

export default App;
