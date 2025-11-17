import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Switch, useLocation, useHistory } from 'react-router-dom';
import { Dialog, Button } from '@blueprintjs/core';
import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';
import '@blueprintjs/datetime/lib/css/blueprint-datetime.css';
import './App.css';
import Subscription from './components/Subscription/Subscription';
import MainScreen from './components/Wizard';
import AdminControl from './components/AdminControl/AdminControl';
import Unauthorized from './components/Unauthorized/Unauthorized';
import { hasRequiredAuthParams } from './utils/auth';

// Routes to exclude from localStorage validation
const excludedRoutes = /^\/(?:wizard|unauthorized)/
// const excludedRoutes = ['/', '/wizard', '/unauthorized'];

// LocalStorage Invalid Dialog Component
const LocalStorageInvalidDialog: React.FC<{ isOpen: boolean }> = ({ isOpen }) => {
  return (
    <Dialog
      isOpen={isOpen}
      canEscapeKeyClose={false}
      canOutsideClickClose={false}
      style={{ width: '500px' }}
    >
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{
          fontSize: '72px',
          marginBottom: '20px'
        }}>
          ⚠️
        </div>

        <h2 style={{
          fontSize: '28px',
          fontWeight: 600,
          color: '#2d3748',
          marginBottom: '16px'
        }}>
          Session Expired
        </h2>

        <p style={{
          fontSize: '16px',
          color: '#718096',
          marginBottom: '32px',
          lineHeight: '1.6'
        }}>
          Your session data is missing or has been cleared. Please re-open this screen from your xMati application to continue.
        </p>

        <Button
          icon="refresh"
          intent="primary"
          large
          onClick={() => window.close()}
          style={{
            height: '48px',
            fontSize: '16px',
            fontWeight: 600,
            borderRadius: '8px',
            padding: '0 32px',
            marginRight: '12px'
          }}
        >
          Close Window
        </Button>
      </div>
    </Dialog>
  );
};

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
  const [showInvalidStorageDialog, setShowInvalidStorageDialog] = useState(false);

  // Check localStorage fields continuously using listeners
  useEffect(() => {
    const safeParse = (raw: string | null) => {
      try {
        return JSON.parse(raw || '{}')
      } catch {
        return {}
      }
    }

    const showError = () => {
      setShowInvalidStorageDialog(true);
    }

    const validate = () => {
      const formDataRaw = localStorage.getItem('formData')
      const subDataRaw = localStorage.getItem('subData')
      const tokenDataRaw = localStorage.getItem('token')

      const formData = safeParse(formDataRaw)
      const subData = safeParse(subDataRaw)
      const tokenData = safeParse(tokenDataRaw)

      const invalid =
        !formDataRaw ||
        !subDataRaw ||
        !tokenDataRaw ||
        Object.keys(formData).length === 0 ||
        Object.keys(subData).length === 0 ||
        Object.keys(tokenData).length === 0 ||
        !formData.email

      if (invalid) {
        showError()
      }
    }

    const handleStorageChange = (event: StorageEvent) => {
      // If ALL of localStorage was cleared
      if (event.key === null) {
        showError()
        return
      }

      // If one of the critical keys changed
      if (event.key === 'formData' || event.key === 'subData' || event.key === 'token') {
        showError()
      }
    }

    // Initial validation on load
    if (window.location.pathname === '/subscription' || window.location.pathname === '/unauthorized') {
      validate()
    }

    // Listen for storage events
    window.addEventListener('storage', handleStorageChange)

    // cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  return (
    <Router>
      <div className="App">
        {/* Show dialog if localStorage is invalid */}
        <LocalStorageInvalidDialog isOpen={showInvalidStorageDialog} />
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
