import { Button, Spinner, Card, Elevation } from '@blueprintjs/core'
import { toast } from '../../utils/shared'
import ms from 'ms'
import React, { FC, useEffect, useState, useCallback } from 'react'
import api from '../../utils/api'
import EnquiryDialog from './EnquiryDialog'
import UserCard from './UserCard'

const packageJson = { version: '100.0.0' }

interface UserData {
  email: string
  [key: string]: any // Add more fields as needed
}

const CURRENT_VERSION = packageJson.version
const API_URL = process.env.REACT_APP_API_URL || 'https://www.app.xmati.ai/apis'

const AdminControl: FC = () => {
  const savedFormData = JSON.parse(localStorage.getItem('formData') || '{}')
  const token = JSON.parse(localStorage.getItem('token') || '{}')
  const maintenanceStatus = JSON.parse(localStorage.getItem('maintenance') || '{"status": false}')
  const [isLoading, setLoading] = useState(false)
  const [isMaintenanceActive, setMaintenanceActive] = useState(maintenanceStatus.status)
  const [userList, setUserList] = useState<UserData[]>([])
  const [isEnquiryDialogOpen, setEnquiryDialogOpen] = useState(false)
  const toggleMaintenance = () => setMaintenanceActive((prev: boolean) => !prev)
  const toggleEnquiryDialog = () => setEnquiryDialogOpen((prev: boolean) => !prev)

  const getAllUsers = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/get-all-users-subscriptions`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'X-App-Version': CURRENT_VERSION },
      })
      const result = await response.json()

      if (result.success) {
        setUserList(result.data)
      } else {
        toast.failure(`Failed to fetch user list: ${result.message}`)
      }
    } catch (error) {
      toast.failure('Failed to fetch user list.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void getAllUsers()
  }, [getAllUsers])


  // const handleBackup = async () => {
  //   setLoading(true)
  //   try {
  //     const ids = savedFormData.botIdList
  //     await api.getSecured({ timeout: ms('8m') }).post('/admin/workspace/bots/saveAllBots', { ids })
  //     alert('Backup to S3 completed successfully!')
  //   } catch (error) {
  //     console.error('Error during backup:', error)
  //     alert('Failed to backup to S3.')
  //   } finally {
  //     setLoading(false)
  //   }
  // }

  // const handleRetrieval = async () => {
  //   setLoading(true)
  //   try {
  //     await api.getSecured({ timeout: ms('8m') }).post('/admin/workspace/bots/getAllBots')
  //     alert('Retrieval from S3 completed successfully!')
  //     setTimeout(() => {
  //       window.location.reload()
  //     }, 500)
  //   } catch (error) {
  //     console.error('Error during retrieval:', error)
  //     alert('Failed to retrieve from S3.')
  //   } finally {
  //     setLoading(false)
  //   }
  // }

  const handleMaintenance = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/set-maintenance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'X-App-Version': CURRENT_VERSION },
        body: JSON.stringify({ status: !isMaintenanceActive }),
      })

      const result = await response.json()
      if (result.status) {
        toggleMaintenance()
        alert(`${result.msg}, ${!isMaintenanceActive ? 'active' : 'inactive'}`)
        localStorage.setItem('maintenance', JSON.stringify({ status: !isMaintenanceActive }))
      } else {
        alert(`Failed to toggle maintenance mode: ${result.msg}`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f8fa',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '1400px',
        maxHeight: '95vh',
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px 32px',
          borderBottom: '1px solid #e1e8ed',
          backgroundColor: '#ffffff'
        }}>
          <h1 style={{
            margin: 0,
            fontSize: '28px',
            fontWeight: 600,
            color: '#2d3748'
          }}>
            Admin Control Panel
          </h1>
        </div>

        {isLoading && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}
          >
            <Spinner size={50} />
          </div>
        )}

        <div style={{
          display: 'flex',
          maxHeight: '80vh',
          minHeight: 'calc(100vh - 140px)',
          overflow: 'hidden'
        }}>
          {/* Left Panel - Admin Actions */}
          <div
            style={{
              width: '30%',
              padding: '20px',
              paddingTop: 0,
              borderRight: '1px solid #eee',
              background: '#f9f9f9',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: '14px',
              overflowY: 'auto',
              maxHeight: '100%',
            }}
          >
            <h2 style={{ fontSize: '20px', marginBottom: '6px', fontWeight: 600, marginTop: '10px' }}>Actions</h2>

            {/* Backup */}
            {/* <Card elevation={Elevation.TWO}
            style={{
              padding: '16px',
              paddingTop: '8px',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
            <h4 style={{ marginBottom: '10px', fontSize: '14px' }}>Backup Bots to S3</h4>
            <Button
              fill
              icon="cloud-upload"
              intent="primary"
              onClick={handleBackup}
              disabled={isLoading}
              style={{
                height: '40px',
                fontSize: '14px',
                fontWeight: 600,
                borderRadius: '6px',
              }}
            >
              Backup All Bots
            </Button>
          </Card> */}

            {/* Retrieve */}
            {/* <Card elevation={Elevation.TWO}
            style={{
              padding: '16px',
              paddingTop: '8px',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
            <h4 style={{ marginBottom: '10px', fontSize: '14px' }}>Restore Bots from S3</h4>
            <Button
              fill
              icon="cloud-download"
              intent="success"
              onClick={handleRetrieval}
              disabled={isLoading}
              style={{
                height: '40px',
                fontSize: '14px',
                fontWeight: 600,
                borderRadius: '6px',
              }}
            >
              Retrieve Bots
            </Button>
          </Card>  */}

            {/* Maintenance */}
            <Card elevation={Elevation.TWO}
              style={{
                padding: '16px',
                paddingTop: '8px',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}>
              <h4 style={{ marginBottom: '10px', fontSize: '14px' }}>Toggle Maintenance Mode</h4>
              <Button
                fill
                icon="wrench"
                intent="warning"
                onClick={handleMaintenance}
                disabled={isLoading}
                style={{
                  height: '40px',
                  fontSize: '14px',
                  fontWeight: 600,
                  borderRadius: '6px',
                }}
              >
                {isMaintenanceActive ? 'Disable Maintenance' : 'Enable Maintenance'}
              </Button>

              <div
                style={{
                  marginTop: '8px',
                  textAlign: 'center',
                  fontWeight: 500,
                  fontSize: '12px',
                  color: isMaintenanceActive ? 'green' : 'red',
                }}
              >
                Status: {isMaintenanceActive ? 'Active' : 'Inactive'}
              </div>
            </Card>

            <br />
            {/* Check Queries */}
            <Card elevation={Elevation.TWO}
              style={{
                padding: '16px',
                paddingTop: '8px',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}>
              <h4 style={{ marginBottom: '10px', fontSize: '14px' }}>View User Enquiries</h4>
              <Button
                fill
                icon="chat"
                intent="primary"
                onClick={toggleEnquiryDialog}
                disabled={isLoading}
                style={{
                  height: '40px',
                  fontSize: '14px',
                  fontWeight: 600,
                  borderRadius: '6px',
                }}
              >
                Check Enquiries
              </Button>
            </Card>
          </div>


          {/* Right Panel - User List */}
          <div
            style={{
              flex: 1,
              padding: '32px',
              paddingTop: 10,
              backgroundColor: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 600, marginTop: 0 }}>
                User Management
              </h2>
              <Button
                icon="refresh"
                large
                intent="primary"
                style={{
                  height: '40px',
                  fontSize: '15px',
                  fontWeight: 600,
                  borderRadius: '8px',
                  padding: '0 24px'
                }}
                onClick={() => getAllUsers()}
              />
            </div>

            {/* Scrollable User List */}
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {userList.map((u, idx) => (
                <UserCard
                  key={idx}
                  email={u.email}
                  userData={u.userData}
                  subscriptionData={u.subscriptionData}
                  botsData={u.botsData}
                />
              ))}
            </div>
          </div>

        </div>

        {/* Enquiries Dialog */}
        <EnquiryDialog
          isOpen={isEnquiryDialogOpen}
          onClose={toggleEnquiryDialog}
        />
      </div>
    </div>
  )
}

export default AdminControl


