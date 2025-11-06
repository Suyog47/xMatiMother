import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom';
import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';
import '@blueprintjs/datetime/lib/css/blueprint-datetime.css';
import './App.css';
import Subscription from './components/Subscription/Subscription';
import MainScreen from './components/Wizard';
import AdminControl from './components/AdminControl/AdminControl';

function App() {
  const [isSubscriptionOpen, setSubscriptionOpen] = useState(false);
  const [isAdminOpen, setAdminOpen] = useState(false);

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>xMati Mother Application</h1>
          <nav className="nav-menu">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/wizard" className="nav-link">Registration Wizard</Link>
            <button 
              className="nav-link nav-button" 
              onClick={() => setSubscriptionOpen(true)}
            >
              Subscription Management
            </button>
            <button 
              className="nav-link nav-button" 
              onClick={() => setAdminOpen(true)}
            >
              Admin Control Panel
            </button>
          </nav>
        </header>

        <main className="App-main">
          <Switch>
            <Route exact path="/">
              <div className="home-content">
                <h2>Welcome to xMati Mother</h2>
                <p>This application demonstrates three main features:</p>
                <div className="feature-cards">
                  <div className="feature-card">
                    <h3>📝 Registration Wizard</h3>
                    <p>Multi-step registration process with email verification, organization info, and payment setup</p>
                    <Link to="/wizard">
                      <button className="feature-button">Go to Wizard</button>
                    </Link>
                  </div>
                  <div className="feature-card">
                    <h3>💳 Subscription Management</h3>
                    <p>Manage subscription plans, process payments, view transaction history</p>
                    <button 
                      className="feature-button"
                      onClick={() => setSubscriptionOpen(true)}
                    >
                      Open Subscription
                    </button>
                  </div>
                  <div className="feature-card">
                    <h3>⚙️ Admin Control Panel</h3>
                    <p>Manage users, handle maintenance, backup/restore, and view enquiries</p>
                    <button 
                      className="feature-button"
                      onClick={() => setAdminOpen(true)}
                    >
                      Open Admin Panel
                    </button>
                  </div>
                </div>
              </div>
            </Route>
            <Route path="/wizard">
              <MainScreen />
            </Route>
          </Switch>
        </main>

        {/* Subscription Dialog */}
        <Subscription 
          isOpen={isSubscriptionOpen} 
          toggle={() => setSubscriptionOpen(!isSubscriptionOpen)} 
        />

        {/* Admin Control Dialog */}
        <AdminControl 
          isOpen={isAdminOpen} 
          toggle={() => setAdminOpen(!isAdminOpen)} 
        />
      </div>
    </Router>
  );
}

export default App;
