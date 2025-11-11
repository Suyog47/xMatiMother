import React from 'react'
import { Dialog, Button } from '@blueprintjs/core'

interface PaymentSuccessDialogProps {
  isOpen: boolean
  onClose: () => void
  onClearing: () => Promise<void>
}

const PaymentSuccessDialog: React.FC<PaymentSuccessDialogProps> = ({ isOpen, onClose, onClearing }) => {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={async () => {
        onClose()
        await onClearing()
      }}
      title="Payment Successful"
      icon="tick-circle"
      canOutsideClickClose={false}
    >
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2 style={{ color: '#4caf50', marginBottom: '10px' }}>Thank You!</h2>
        <p style={{ fontSize: '1.1em', color: '#666' }}>
          Your payment is successful...
        </p>
        <div style={{ marginTop: 10, color: '#106ba3', fontWeight: 500, fontSize: 15 }}>
          Go back to your xMati and <strong>logout your xMati app</strong> to reflect the changes.
        </div>
        {/* <div style={{ marginTop: 24, color: 'red', fontWeight: 600, fontSize: 17 }}>
          *DO NOT Refresh this page and logout is mandatory for full subscription activation*.
        </div> */}
        <Button
          intent="primary"
          onClick={async () => {
            onClose()
            await onClearing()
          }}
          style={{
            marginTop: '20px',
            padding: '14px 32px',
            fontSize: '1.05em',
            fontWeight: 'bold',
            minWidth: '250px',
            borderRadius: 6,
          }}
        >
          Continue
        </Button>
      </div>
    </Dialog>
  )
}

export default PaymentSuccessDialog
