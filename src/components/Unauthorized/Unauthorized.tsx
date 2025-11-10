import React from 'react';
import { Button, Card, Elevation } from '@blueprintjs/core';

const Unauthorized: React.FC = () => {
  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f8fa',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <Card 
        elevation={Elevation.TWO}
        style={{
          padding: '40px',
          textAlign: 'center',
          maxWidth: '500px',
          width: '100%'
        }}
      >
        <div style={{
          fontSize: '72px',
          color: '#d9534f',
          marginBottom: '20px'
        }}>
          🚫
        </div>
        
        <h1 style={{
          fontSize: '32px',
          fontWeight: 600,
          color: '#2d3748',
          marginBottom: '16px'
        }}>
          Unauthorized Access
        </h1>
        
        <p style={{
          fontSize: '16px',
          color: '#718096',
          marginBottom: '32px',
          lineHeight: '1.5'
        }}>
          You don't have permission to access this xMati page. Please make sure you have the required authentication parameters.
        </p>
        
        <Button
          icon="arrow-left"
          intent="primary"
          large
          onClick={handleGoBack}
          style={{
            height: '48px',
            fontSize: '16px',
            fontWeight: 600,
            borderRadius: '8px',
            padding: '0 32px'
          }}
        >
          Go Back
        </Button>
      </Card>
    </div>
  );
};

export default Unauthorized;