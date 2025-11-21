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
import logo from './assets/images/xmati.png';
const packageJson = { version: '100.0.0' }
const CURRENT_VERSION = packageJson.version

const API_URL = process.env.REACT_APP_API_URL || 'https://www.app.xmati.ai/apis'

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

// Account Blocked Full Screen Component
const AccountBlockedScreen: React.FC = () => {
  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #f8f0ff 0%, #e0b3ff 100%)',
        textAlign: 'center',
        padding: 24,
        boxSizing: 'border-box',
      }}
    >
      <img
        src={logo}
        alt='xMati Logo'
        style={{ width: 120, height: 'auto', marginBottom: 32, userSelect: 'none' }}
        draggable={false}
      />
      <div
        style={{
          fontSize: 28,
          fontWeight: 700,
          color: '#7c3aed',
          marginBottom: 16,
        }}
      >
        🚫 Account Blocked
      </div>
      <div
        style={{
          fontSize: 20,
          fontWeight: 500,
          color: '#2d3748',
          width: '80%',
          maxWidth: 600,
          lineHeight: 1.6,
          marginBottom: 24,
        }}
      >
        Your account has been temporarily blocked due to security or policy violations.
      </div>
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
          borderRadius: 8,
          padding: 20,
          marginBottom: 24,
          fontSize: 16,
          color: '#4a5568',
          maxWidth: 500,
        }}
      >
        <div style={{ marginBottom: 12 }}>
          Please contact support for assistance or wait for the block to be lifted.
        </div>
        <div style={{ fontSize: 14, color: '#6b7280' }}>
          If you believe this is an error, please reach out to our support team.
        </div>
      </div>
    </div>
  );
};

// Maintenance Mode Full Screen Component
const MaintenanceModeScreen: React.FC = () => {
  return (
    <div
      style={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #f0f4f8 0%, #d9e2ec 100%)',
        textAlign: 'center',
        padding: 24,
        boxSizing: 'border-box',
      }}
    >
      <img
        src={logo}
        alt='xMati Logo'
        style={{ width: 120, height: 'auto', marginBottom: 24, userSelect: 'none' }}
        draggable={false}
      />
      <div
        style={{
          fontSize: 23,
          fontWeight: 600,
          color: '#102a43',
          width: '80%',
          maxWidth: 500,
          lineHeight: 1.6,
          wordSpacing: '2px',
        }}
      >
        The xMati platform is currently in Maintenance mode.
        <br />
        Please check back later.
      </div>
    </div>
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
  const [showAccountBlockedScreen, setShowAccountBlockedScreen] = useState(() => {
    // Check localStorage on initial load for blocked status
    const savedBlockedState = localStorage.getItem('accountBlocked')
    //return false;
    return savedBlockedState ? JSON.parse(savedBlockedState).isBlocked : false
  });
  const [showMaintenanceModeScreen, setShowMaintenanceModeScreen] = useState(() => {
    // Check localStorage on initial load for maintenance status
    const savedMaintenanceState = localStorage.getItem('maintenanceMode')
    // return false;
    return savedMaintenanceState ? JSON.parse(savedMaintenanceState).isActive : false
  });

  // Handle block status from WebSocket
  const handleBlockStatus = (status: string) => {
    setShowAccountBlockedScreen(status === 'Blocked' ? true : false);
    localStorage.setItem('accountBlocked', JSON.stringify({
      isBlocked: status === 'Blocked' ? true : false,
    }))
  };

  // Handle maintenance status from WebSocket
  const handleMaintenanceStatus = (status: boolean) => {
    setShowMaintenanceModeScreen(status);
    localStorage.setItem('maintenanceMode', JSON.stringify({ isActive: status }))
  };

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
      const tokenDataRaw = sessionStorage.getItem('token')
      const aesKeyDataRaw = sessionStorage.getItem('aes-key')

      const formData = safeParse(formDataRaw)
      const subData = safeParse(subDataRaw)

      const invalid =
        !formDataRaw ||
        !subDataRaw ||
        !tokenDataRaw ||
        !aesKeyDataRaw ||
        Object.keys(formData).length === 0 ||
        Object.keys(subData).length === 0 ||
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
      if (event.key === 'formData' || event.key === 'subData') {
        validate()
      }
    }

    let intervalId: any;
    
    // Initial validation on load
    if (window.location.pathname === '/subscription' || window.location.pathname === '/unauthorized') {
      // Run validation on mount and periodically (every 5 seconds)
      validate()
      intervalId = setInterval(validate, 5000)
    }

    // Listen for storage events
    window.addEventListener('storage', handleStorageChange)

    // cleanup
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  // WebSocket connection for real-time communication - keep alive regardless of which screen is shown
  useEffect(() => {
    const formData = JSON.parse(localStorage.getItem('formData') || '{}')

    let socket: WebSocket | null = null
    let reconnectTimeout: NodeJS.Timeout | null = null
    let isMounted = true

    const connectWebSocket = () => {
      if (!isMounted) {
        return
      }

      socket = new WebSocket('ws://localhost:8000')

      socket.onopen = () => {
        const userId = `${formData.email}_util`
        socket?.send(JSON.stringify({
          type: 'REGISTER_CHILD',
          userId,
          clientVersion: CURRENT_VERSION,
        }))

        // Immediately call /check-account-status after successful WebSocket connection
        // if (!didCheckAccountRef.current) {
        //   didCheckAccountRef.current = true

        // }

        // Immediately call /check-account-status after successful WebSocket connection
        void (async () => {
          try {
            if (!formData.email) {
              return
            }
            const res = await fetch(`${API_URL}/check-account-status`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-App-Version': CURRENT_VERSION,
              },
              body: JSON.stringify({
                email: `${formData.email}_util`,
                isMother: true,
              }),
            })

          } catch (err) {
            // Silently ignore errors; WebSocket remains available
          }
        })()

        // get the aes key
        // void (async () => {
        //   try {
        //     if (!formData.email) {
        //       return
        //     }
        //     const res = await fetch(`${API_URL}/get-aes-key`, {
        //       method: 'POST',
        //       headers: {
        //         'Content-Type': 'application/json',
        //         'X-App-Version': CURRENT_VERSION,
        //       },
        //       body: JSON.stringify({
        //         email: formData.email,
        //       }),
        //     })

        //     if (res.ok) {
        //       const data = await res.json()
        //       if (data && (data.token || Object.keys(data).length > 0)) {
        //         sessionStorage.setItem('aes-key', data.aesKey)
        //       } else {
        //         sessionStorage.setItem('aes-key', '')
        //       }
        //     } else {
        //       // remove any previous token on error
        //       sessionStorage.removeItem('aes-key')
        //     }

        //   } catch (err) {
        //     // Silently ignore errors; WebSocket remains available
        //   }
        // })()
      }

      socket.onmessage = (event) => {
        if (!isMounted) {
          return
        }
        const data = JSON.parse(event.data)

        switch (data.type) {

          case 'BLOCK_STATUS':
            handleBlockStatus(data.message)
            // console.log('user blocked')
            break
          case 'MAINTENANCE_STATUS':
            handleMaintenanceStatus(data.message)
            // console.log('maintenance mode')
            break
          default:
            break
        }
      }

      socket.onclose = () => {
        if (!isMounted) {
          return
        }
        reconnectTimeout = setTimeout(connectWebSocket, 1000)
      }
    }

    connectWebSocket()

    return () => {
      isMounted = false
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout)
      }
      socket?.close()
    }
  }, [])

  return (
    <Router>
      <div className="App">
        {/* Show full screen if in maintenance mode */}
        {showMaintenanceModeScreen ? (
          <MaintenanceModeScreen />
        ) : /* Show full screen if account is blocked */
          showAccountBlockedScreen ? (
            <AccountBlockedScreen />
          ) : (
            <>
              {/* Show dialog if localStorage is invalid */}
              <LocalStorageInvalidDialog isOpen={showInvalidStorageDialog} />

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
            </>
          )}
      </div>
    </Router>
  );
}

export default App;
