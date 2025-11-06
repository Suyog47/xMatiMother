import { Dialog, Button, Icon } from '@blueprintjs/core'
import {
  Elements,
} from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import React, { FC, useState, useEffect, useMemo, useCallback, useRef } from 'react'
import CheckoutForm from './CheckoutForm'
import CancellationFailedDialog from './dialogs/CancellationFailedDialog'
import SubscriptionInvoiceLicenseDialog from './dialogs/LicenseInvoiceDialog'
import PaymentFailedDialog from './dialogs/PaymentFailedDialog'
import PaymentSuccessDialog from './dialogs/PaymentSuccessDialog'
import SubscriptionCancelConfirmDialog from './dialogs/SubscriptionCancelConfirmDialog'
import SubscriptionCancelledDialog from './dialogs/SubscriptionCancelledDialog'
import TransactionHistory from './TransactionHistory'

const CURRENT_VERSION = '100.0.0'
const API_URL = process.env.REACT_APP_API_URL || 'https://www.app.xmati.ai/apis'

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PROMISE || 'pk_live_51RPPI0EncrURrNgDF2LNkLrh5Wf53SIe3WjqPqjtzqbJWDGfDFeG4VvzUXuC4nCmrPTNOTeFENuAqRBw1mvbNJg600URDxPnuc')

const Subscription: FC = () => {
  let savedFormData = JSON.parse(localStorage.getItem('formData') || '{}')
  const savedSubData = JSON.parse(localStorage.getItem('subData') || '{}')
  const token = JSON.parse(localStorage.getItem('token') || '{}')

  console.log(savedFormData, savedSubData)
  // Dummy toggle function for compatibility with existing dialogs
  const toggle = () => {}

  const [actualAmount, setActualAmount] = useState<any>(null)
  const [clientSecret, setClientSecret] = useState<string>('')
  const [transactions, setTransactions] = useState<any[]>([])
  const [selectedTab, setSelectedTab] = useState<string>('Starter')
  const [isLoadingSecret, setIsLoadingSecret] = useState(false)
  const [paymentError, setPaymentError] = useState<string>('')
  const [subscription, setSubscription] = useState<string>('')
  const [expiryTill, setExpiryTill] = useState<string>('')
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false)
  const [isConfirmCancelDialogOpen, setIsConfirmCancelDialogOpen] = useState(false)
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const [isCancelProcessing, setIsCancelProcessing] = useState(false)
  const [selectedDuration, setSelectedDuration] = useState<string>('monthly')
  const [isInvoiceLicenseDialogOpen, setIsInvoiceLicenseDialogOpen] = useState(false)

  interface CalculatedData {
    status: boolean
    refund: boolean
    action: 'upgrade' | 'downgrade'
    totalMonths?: number
    usedMonth?: number
    usedAmount: number
    daysUsed?: number
    daysRemaining?: number
    dailyAmount?: string
    amountUsedInDays?: number
    totalUsedAmount?: number
    totalLeftAmount: string
    timestamp: Date
    amount: number
    message?: string
    error?: string
  }

  const [calculatedData, setCalculatedData] = useState<any>(null)
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true)
  const [isPaymentFailedDialogOpen, setIsPaymentFailedDialogOpen] = useState(false)
  const [paymentFailedMessage, setPaymentFailedMessage] = useState('')
  const [isFailedCancelDialogOpen, setIsFailedCancelDialogOpen] = useState(false)
  const [failedCancelMessage, setFailedCancelMessage] = useState('')
  const [cardData, setCardData] = useState<any>(null)

  const [refundDetails, setRefundDetails] = useState<{
    status: boolean
    usedMonth?: number
    monthlyAmount?: number
    usedAmount?: number
    daysRemainingInCycle?: number
    remainingMonths?: number
    refundAmount?: string
    message?: string
  } | null>(null)

  const amount = useMemo(() => {
    let price: number

    price = selectedTab === 'Starter' ? 1900 : 4500

    if (selectedDuration === 'yearly') {
      price = selectedTab === 'Starter'
        ? Math.ceil(1600 * 12)
        : Math.ceil(3600 * 12)
    }

    setActualAmount(price / 100)

    if (subscription !== 'Trial' && !savedSubData.expired && !savedSubData.isCancelled && !savedFormData.nextSubs) {
      const durationOrder: { [key: string]: number } = {
        monthly: 1,
        yearly: 2,
      }

      const currentPlan = savedSubData.subscription
      const currentAmount = parseFloat(String(savedSubData.amount).replace(/^\$/, ''))
      const newPlan = selectedTab

      let data: any
      let action

      if (currentPlan === 'Starter' && newPlan === 'Professional') {
        action = 'upgrade'
      } else if (currentPlan === 'Professional' && newPlan === 'Starter') {
        action = 'downgrade'
      } else if (durationOrder[selectedDuration] > durationOrder[savedSubData.duration]) {
        action = 'upgrade'
      } else if (durationOrder[selectedDuration] < durationOrder[savedSubData.duration]) {
        action = 'downgrade'
      } else {
        action = 'upgrade'
      }

      if (action === 'upgrade') {
        data = calculateUpgradeAmount(
          savedSubData.createdAt,
          savedSubData.till,
          currentPlan,
          currentAmount,
          price / 100
        )
      } else {
        data = calculateDowngradeAmount(
          savedSubData.createdAt,
          savedSubData.till,
          currentPlan,
          currentAmount,
          price / 100
        )
      }

      if (data) {
        setCalculatedData(data)
        const parsedAmount = typeof data.amount === 'number'
          ? data.amount
          : parseFloat(String((data as any).amount || '0'))
        price = Math.round(parsedAmount * 100)
      }
    }

    return parseFloat(price.toFixed(2))
  }, [selectedTab, selectedDuration])

  const invoiceDetails = {
    userName: savedFormData.fullName || 'Valued Customer',
    email: savedFormData.email || '',
    subscriptionName: subscription || 'N/A',
    amount: `$${amount / 100}`,
    paymentType: calculatedData?.refund ? 'REFUNDED' : 'CHARGED',
    duration: selectedDuration,
  }

  const getClientSecret = useCallback(async () => {
    if (!isPaymentDialogOpen) {
      return
    }

    let amt = amount
    if (!amt || amt <= 0) {
      amt = 100
    }

    setIsLoadingSecret(true)
    setPaymentError('')
    try {
      savedFormData = JSON.parse(localStorage.getItem('formData') || '{}')
      const result = await fetch(`${API_URL}/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-App-Version': CURRENT_VERSION
        },
        body: JSON.stringify({
          amount: amt, currency: 'usd',
          customerId: { id: savedFormData.stripeCustomerId },
          paymentMethodId: savedFormData.stripePayementId,
          email: savedFormData.email,
          subscription: selectedTab,
          duration: selectedDuration
        }),
      })

      if (!result.ok) {
        throw new Error('Payment setup failed')
      }
      const data = await result.json()

      if (!data.client_secret) {
        throw new Error('Invalid server response')
      }
      setClientSecret(data.client_secret.client_secret)
      setCardData(data.card_data)
    } catch (err: any) {
      setPaymentError(err.message)
      setClientSecret('')
    } finally {
      setIsLoadingSecret(false)
    }
  }, [amount, selectedDuration, isPaymentDialogOpen])

  const fetchTransactions = useCallback(async () => {
    setIsLoadingTransactions(true)
    try {
      const savedFormDataLocal = JSON.parse(localStorage.getItem('formData') || '{}')
      const tokenLocal = JSON.parse(localStorage.getItem('token') || '{}')

      const res = await fetch(`${API_URL}/get-stripe-transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenLocal}`,
          'X-App-Version': CURRENT_VERSION
        },
        body: JSON.stringify({ email: savedFormDataLocal.email })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error)
      }

      if (!data || !Array.isArray(data.charges)) {
        throw new Error('Invalid data of transactions.')
      }

      const latestCharge = data?.charges?.[0]
      if (latestCharge?.id) {
        const existingSubData = JSON.parse(localStorage.getItem('subData') || '{}')
        localStorage.setItem('subData', JSON.stringify({ ...existingSubData, transactionId: latestCharge.id }))
      }

      if (data.charges) {
        setTransactions(data.charges)
      }
    } catch (error) {
      alert(error)
      console.error('Failed to fetch transactions:', error)
    } finally {
      setIsLoadingTransactions(false)
    }
  }, [])
  
  const fetchedOnceRef = useRef(false)
  useEffect(() => {
    void getClientSecret()

    if (!fetchedOnceRef.current) {
      void fetchTransactions()
      fetchedOnceRef.current = true
    }

    setSubscription(savedSubData.subscription || '')

    const formattedExpiryTill = savedSubData.till
      ? new Date(savedSubData.till).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
      : ''
    setExpiryTill(formattedExpiryTill)
  }, [getClientSecret, savedSubData.subscription, savedSubData.till, fetchTransactions])

  const downloadCSV = async () => {
    const email = savedFormData.email

    const res = await fetch(`${API_URL}/download-csv`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-App-Version': CURRENT_VERSION
      },
      body: JSON.stringify({ data: transactions, email }),
    })

    const blob = await res.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${email}-data.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
  }

  const cancelSubscription = async () => {
    const { fullName, email, } = savedFormData
    const { subscription, amount, createdAt, till } = savedSubData
    setIsCancelProcessing(true)

    try {
      let res
      if (subscription !== 'Trial') {
        res = await fetch(`${API_URL}/cancel-subscription`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'X-App-Version': CURRENT_VERSION
          },
          body: JSON.stringify({ chargeId: savedSubData.transactionId, reason: '', email, fullName, subscription, amount, refundDetails }),
        })
      } else {
        res = await fetch(`${API_URL}/trial-cancellation`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'X-App-Version': CURRENT_VERSION
          },
          body: JSON.stringify({ email }),
        })
      }

      const data = await res.json()

      if (data.success) {
        setIsConfirmCancelDialogOpen(false)
        setIsCancelDialogOpen(true)
        toggle()
      } else {
        setFailedCancelMessage(data.message || 'Cancellation failed. Please try again later.')
        setIsFailedCancelDialogOpen(true)
      }
    } catch (err: any) {
      setFailedCancelMessage(err.message || 'An error occurred while processing your cancellation.')
      setIsFailedCancelDialogOpen(true)
    } finally {
      setIsCancelProcessing(false)
    }
  }

  function calculateUpgradeAmount(startDate: any, expiryDate: any, subs: any, currentAmount: any, newAmount: any) {
    try {
      const currentDate = new Date()
      const start = new Date(formatToISODate(startDate))
      const expiry = new Date(formatToISODate(expiryDate))

      if (isNaN(start.getTime()) || isNaN(expiry.getTime())) {
        throw new Error('Invalid date format')
      }

      let currentCycleStart = new Date(start)
      let cycleNumber = 0

      while (currentCycleStart <= currentDate) {
        const nextCycleStart = new Date(currentCycleStart)
        nextCycleStart.setMonth(nextCycleStart.getMonth() + 1)

        if (currentDate < nextCycleStart) {
          break
        }
        currentCycleStart = nextCycleStart
        cycleNumber++
      }

      const tentativeCycleEnd = new Date(currentCycleStart)
      tentativeCycleEnd.setMonth(tentativeCycleEnd.getMonth() + 1)
      const currentCycleEnd = tentativeCycleEnd > expiry ? expiry : tentativeCycleEnd

      const msInDay = 1000 * 60 * 60 * 24
      const totalCycleDays = Math.ceil((currentCycleEnd.getTime() - currentCycleStart.getTime()) / msInDay)

      const usedMonth = cycleNumber

      const monthlyAmount = (subs === 'Professional') ? 45 : 19
      const usedAmount = usedMonth * monthlyAmount

      const daysUsed = Math.ceil((currentDate.getTime() - currentCycleStart.getTime()) / msInDay)
      const dailyAmount = (monthlyAmount / totalCycleDays).toFixed(2)

      const amountUsedInDays = (parseFloat(dailyAmount) * daysUsed)

      const remainingAmount = (usedAmount + amountUsedInDays).toFixed(2)
      const numericRemainingAmount = parseFloat(remainingAmount)
      const totalUsedAmount = Math.max(0, (numericRemainingAmount === Infinity) ? newAmount : numericRemainingAmount)

      const totalLeftAmount = Math.max(0, currentAmount - totalUsedAmount).toFixed(2)

      const numericTotalLeftAmount = typeof totalLeftAmount === 'string' ? parseFloat(totalLeftAmount) : totalLeftAmount
      const amountToChargeRefund = (Number(newAmount) - numericTotalLeftAmount).toFixed(2)

      return {
        status: true,
        action: 'upgrade' as 'upgrade',
        refund: (parseFloat(amountToChargeRefund) <= 0) ? true : false,
        usedMonth,
        usedAmount,
        daysUsed,
        dailyAmount,
        amountUsedInDays,
        totalUsedAmount,
        totalLeftAmount,
        amount: Math.abs(parseFloat(amountToChargeRefund)).toFixed(2),
      }
    } catch (error: any) {
      console.error('Error calculating refund details:', error.message)
      return { status: false, message: 'Failed to calculate refund details', error: error.message }
    }
  }

  function calculateDowngradeAmount(startDate: any, expiryDate: any, subs: any, currentAmount: any, newAmount: any) {
    try {
      const currentDate = new Date()
      const start = new Date(formatToISODate(startDate))
      const expiry = new Date(formatToISODate(expiryDate))

      if (isNaN(start.getTime()) || isNaN(expiry.getTime())) {
        throw new Error('Invalid date format')
      }

      let currentCycleStart = new Date(start)
      let cycleNumber = 0

      while (currentCycleStart <= currentDate) {
        const nextCycleStart = new Date(currentCycleStart)
        nextCycleStart.setMonth(nextCycleStart.getMonth() + 1)

        if (currentDate < nextCycleStart) {
          break
        }
        currentCycleStart = nextCycleStart
        cycleNumber++
      }

      const tentativeCycleEnd = new Date(currentCycleStart)
      tentativeCycleEnd.setMonth(tentativeCycleEnd.getMonth() + 1)
      const currentCycleEnd = tentativeCycleEnd > expiry ? expiry : tentativeCycleEnd

      const usedMonth = cycleNumber + 1

      const monthlyAmount = (subs === 'Professional') ? 45 : 19
      const usedAmount = usedMonth * monthlyAmount

      const msInDay = 1000 * 60 * 60 * 24
      const daysRemaining = Math.ceil((currentCycleEnd.getTime() - currentDate.getTime()) / msInDay)

      const remainingAmount = currentAmount - usedAmount
      const totalLeftAmount = Math.max(0, remainingAmount)

      return {
        status: true,
        action: 'downgrade' as 'downgrade',
        refund: true,
        usedMonth,
        usedAmount,
        daysRemaining,
        totalLeftAmount,
        amount: totalLeftAmount.toFixed(2),
      }
    } catch (error: any) {
      console.error('Error calculating refund details:', error.message)
      return { status: false, message: 'Failed to calculate refund details', error: error.message }
    }
  }

  const togglePaymentDialog = async (val: boolean) => {
    setIsPaymentDialogOpen(val)
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  const logout = async () => {
    localStorage.clear()
    window.location.href = '/'
  }

  function formatToISODate(date: any) {
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
  }

  function getMonthDifference(startDate: any, endDate: any) {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const years = end.getFullYear() - start.getFullYear()
    const months = end.getMonth() - start.getMonth()
    const totalMonths = years * 12 + months

    return totalMonths
  }

  function calculateRefundDetails(startDate: any, expiryDate: any, totalAmount: any, subs: any) {
    try {
      const currentDate = new Date()
      const start = new Date(formatToISODate(startDate))
      const expiry = new Date(formatToISODate(expiryDate))

      if (isNaN(start.getTime()) || isNaN(expiry.getTime())) {
        throw new Error('Invalid date format')
      }

      const totalMonths = getMonthDifference(start, expiry)

      let currentCycleStart = new Date(start)
      let cycleNumber = 0

      while (currentCycleStart <= currentDate) {
        const nextCycleStart = new Date(currentCycleStart)
        nextCycleStart.setMonth(nextCycleStart.getMonth() + 1)

        if (currentDate < nextCycleStart) {
          break
        }
        currentCycleStart = nextCycleStart
        cycleNumber++
      }

      const tentativeCycleEnd = new Date(currentCycleStart)
      tentativeCycleEnd.setMonth(tentativeCycleEnd.getMonth() + 1)
      const currentCycleEnd = tentativeCycleEnd > expiry ? expiry : tentativeCycleEnd

      const msInDay = 1000 * 60 * 60 * 24
      const daysRemaining = Math.ceil((currentCycleEnd.getTime() - currentDate.getTime()) / msInDay)

      const usedMonth = cycleNumber + 1
      const remainingMonths = totalMonths - usedMonth

      const monthlyAmount = (subs === 'Professional') ? 45 : 19
      const usedAmount = usedMonth * monthlyAmount

      const remainingAmount = totalAmount - usedAmount
      const refundAmount = Math.max(0, remainingAmount)

      return {
        status: true,
        usedMonth,
        monthlyAmount,
        usedAmount,
        daysRemainingInCycle: daysRemaining,
        remainingMonths,
        refundAmount: refundAmount.toFixed(2),
      }
    } catch (error: any) {
      console.error('Error calculating refund details:', error.message)
      return { status: false, message: 'Failed to calculate refund details', error: error.message }
    }
  }

  const handleCalculateRefundDetails = useCallback(() => {
    const { createdAt: startDate, till: expiryDate, amount: totalAmount, subscription: subs } = savedSubData

    const numericAmount = parseFloat(totalAmount.replace(/^\$/, ''))
    if (startDate && expiryDate && numericAmount) {
      const refundData = calculateRefundDetails(startDate, expiryDate, numericAmount, subs)
      setRefundDetails(refundData)
    } else {
      setRefundDetails({ status: false, message: 'Invalid subscription data' })
    }
  }, [savedSubData])

  useEffect(() => {
    if (subscription !== 'Trial') {
      if (isConfirmCancelDialogOpen) {
        handleCalculateRefundDetails()
      }
    }
  }, [isConfirmCancelDialogOpen])

  const isValidClientSecret = (secret: string) => {
    return /^pi_[a-zA-Z0-9]+_secret_[a-zA-Z0-9]+$/.test(secret)
  }

  return (
    <>
      {/* Main Screen */}
      <div style={{ 
        minHeight: '100vh',
        backgroundColor: '#f5f8fa',
        padding: '20px'
      }}>
        <div style={{
          maxWidth: '1400px',
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
            backgroundColor: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <Icon icon="dollar" size={28} color="#2d3748" />
            <h1 style={{ 
              margin: 0, 
              fontSize: '28px', 
              fontWeight: 600, 
              color: '#2d3748' 
            }}>
              Subscribe & Pay
            </h1>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              minHeight: 'calc(100vh - 140px)',
              padding: 32,
              paddingTop: 20,
              paddingLeft: 32,
              paddingRight: 32,
              paddingBottom: 32,
              gap: 20,
            }}
          >
          {/* Left: Subscription Plan Section */}
          <div style={{ flex: 1.8, overflowY: 'auto' }}>
            <div
              style={{
                marginBottom: '10px',
                textAlign: 'center',
                fontSize: '0.95em',
                color: '#666',
                lineHeight: '1.4',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'normal',
                maxHeight: '4.5em',
              }}
            >
              {subscription && expiryTill && (
                <p style={{ margin: '0' }}>
                  Your current subscription plan is <strong><u>{subscription}</u></strong>, valid till <strong><u>{expiryTill}</u></strong>.
                  {subscription === 'Trial' && !savedSubData.expired && (
                    savedFormData.nextSubs ? (
                      <> You opted for <strong><u>{savedFormData.nextSubs.plan}</u></strong> plan on a <strong><u>{savedFormData.nextSubs.duration}</u></strong> basis after Trial, which you can change anytime.</>
                    ) : (
                      <> You have cancelled your subscription.</>
                    )
                  )}
                  {subscription !== 'Trial' && !savedSubData.expired && (
                    savedFormData.nextSubs ? (
                      <> You have downgraded your plan to <strong><u>{savedFormData.nextSubs.plan}</u></strong> for the <strong><u>{savedFormData.nextSubs.duration}</u></strong> duration, which will be activated on the day of expiry.</>
                    ) : (
                      <></>
                    )
                  )}
                </p>
              )}
            </div>

            <h1 style={{ marginBottom: '5px', fontSize: '1.2em' }}>
              {(subscription === 'Trial' && !savedSubData.expired)
                ? 'Choose Your Subscription Plan'
                : 'Change Your Subscription Plan'}
            </h1>
            <div style={{
              display: 'flex',
              gap: '20px',
              marginBottom: '10px',
              justifyContent: 'space-between'
            }}>
              {['Starter', 'Professional'].map((plan) => (
                <div
                  key={plan}
                  onClick={() => setSelectedTab(plan)}
                  style={{
                    flex: 1,
                    border: `2px solid ${selectedTab === plan ? '#2196f3' : '#e0e0e0'}`,
                    borderRadius: '6px',
                    padding: '15px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    backgroundColor: selectedTab === plan ? '#f8fbff' : 'white'
                  }}
                >
                  <h3 style={{
                    margin: '0',
                    padding: '0',
                    textAlign: 'center',
                    fontSize: '1.1em',
                    marginBottom: '10px'
                  }}>
                    {plan}
                  </h3>
                  <h3 style={{
                    marginTop: 0,
                    marginBottom: '12px',
                    fontSize: '1.2em'
                  }}>
                    {plan === 'Starter' ? '$19/month' : '$45/month'} &nbsp;&nbsp; <span style={{ fontSize: '0.75em', color: '#666' }}>(Introductory price)</span>
                  </h3>
                  <div style={{
                    marginBottom: '12px',
                    padding: '10px',
                    background: '#f8f9fa',
                    borderRadius: '3px'
                  }}>
                    <strong style={{ fontSize: '0.95em' }}>
                      {plan === 'Starter' ? '3 bots included' : '5 bots included'}
                    </strong>
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <div style={{
                      color: '#666',
                      marginBottom: '10px',
                      paddingBottom: '10px',
                      borderBottom: '1px solid #eee',
                      fontSize: '0.95em'
                    }}>
                      Includes:
                    </div>
                    {['LLM Support', 'HITL (Human in the Loop) Enabled', 'Bot Analytics'].map((feature) => (
                      <div
                        key={feature}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          marginBottom: '6px',
                          fontSize: '0.9em'
                        }}
                      >
                        <span style={{ color: '#4caf50', marginRight: '6px' }}>✓</span>
                        {feature}
                      </div>
                    ))}
                    <div style={{
                      color: '#666',
                      marginBottom: '10px',
                      paddingBottom: '10px',
                      borderBottom: '1px solid #eee',
                      fontSize: '0.95em'
                    }}>
                      Supported Channels:
                    </div>
                    {['Whatsapp', 'Web Channel', 'Telegram', 'Slack', 'Facebook Messenger'].map((feature) => (
                      (plan === 'Starter' && feature === 'Whatsapp') ? null : (
                        <div
                          key={feature}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: '6px',
                            fontSize: '0.9em'
                          }}
                        >
                          <span style={{ color: '#4caf50', marginRight: '6px' }}>✓</span>
                          {feature}
                        </div>
                      )
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                display: 'flex',
                gap: '12px',
                marginTop: '15px',
                width: '100%',
              }}
            >
              <Button
                type="submit"
                intent="primary"
                fill
                style={{
                  height: 50,
                  fontSize: '1.1em',
                  fontWeight: 600,
                  borderRadius: 6,
                  flex: 1,
                }}
                onClick={() => togglePaymentDialog(true)}
              >
                Update your Subscription
              </Button>

              {savedSubData.canCancel === true &&
                savedSubData.isCancelled === false &&
                savedSubData.expired === false && (
                  <Button
                    intent="danger"
                    fill
                    style={{
                      height: 50,
                      fontSize: '1.1em',
                      fontWeight: 600,
                      borderRadius: 6,
                      flex: 1,
                    }}
                    onClick={() => {
                      setIsConfirmCancelDialogOpen(true)
                    }}
                    disabled={isLoadingTransactions}
                  >
                    Cancel Your Subscription
                  </Button>
                )}
            </div>

          </div>

          {/* Vertical Divider */}
          <div
            style={{
              width: '2px',
              minWidth: '2px',
              background: '#e0e0e0',
              margin: '0 16px',
              height: '100%',
              flexShrink: 0,
            }}
          />

          {/* Right: Transaction History Section */}
          <TransactionHistory
            transactions={transactions}
            isLoadingTransactions={isLoadingTransactions}
            fetchTransactions={fetchTransactions}
            downloadCSV={downloadCSV}
          />
        </div>

        </div>
      </div>

      {/* Payment dialog  */}
      <Dialog
        isOpen={isPaymentDialogOpen}
        onClose={() => togglePaymentDialog(false)}
        title={` ${selectedTab} Payment`}
        icon="dollar"
        canOutsideClickClose={false}
        style={{
          width: (savedSubData.subscription !== 'Trial' &&
            !savedSubData.expired &&
            !savedSubData.isCancelled &&
            !savedFormData.nextSubs &&
            (savedSubData.subscription !== selectedTab || savedSubData.duration !== selectedDuration)) ? '60vw' : '40vw',
          maxWidth: '90vw'
        }}
      >

        {/* Payment Section */}
        <div style={{ borderTop: '1px solid #e0e0e0', paddingLeft: '15px', paddingRight: '14px', paddingTop: '6px' }}>
          {isLoadingSecret && (
            <div style={{ padding: '25px', textAlign: 'center', fontWeight: 'bold' }}>
              Loading payment details...
            </div>
          )}

          {paymentError && (
            <div style={{ color: 'red', margin: '15px 0', textAlign: 'center' }}>
              {paymentError || 'An error occurred while processing your payment. Please try again.'}
            </div>
          )}

          {(!isLoadingSecret && clientSecret && isValidClientSecret(clientSecret)) ? (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm
                clientSecret={clientSecret}
                amount={amount}
                actualAmount={actualAmount}
                calculatedData={calculatedData}
                togglePaymentDialog={togglePaymentDialog}
                toggle={toggle}
                selectedPlan={selectedTab}
                selectedDuration={selectedDuration}
                setSelectedDuration={setSelectedDuration}
                setPaymentFailedMessage={setPaymentFailedMessage}
                setIsPaymentFailedDialogOpen={setIsPaymentFailedDialogOpen}
                setIsLicenseDialogOpen={setIsInvoiceLicenseDialogOpen}
                cardData={cardData}
              />
            </Elements>
          ) : (
            !isLoadingSecret && (
              <div style={{ color: 'red', margin: '15px 0', textAlign: 'center' }}>
                {paymentError || 'Got Invalid Client secret. Please try again later.'}
              </div>
            )
          )}
        </div>
      </Dialog>

      {/* Subscription Invoice and License Dialog */}
      <SubscriptionInvoiceLicenseDialog
        isOpen={isInvoiceLicenseDialogOpen}
        invoiceDetails={invoiceDetails}
        setIsSuccessDialogOpen={setIsSuccessDialogOpen}
        onClose={() => setIsInvoiceLicenseDialogOpen(false)}
      />

      {/* Payment success dialog */}
      <PaymentSuccessDialog
        isOpen={isSuccessDialogOpen}
        onClose={() => setIsSuccessDialogOpen(false)}
        onLogout={logout}
      />

      {/* Subscription cancel confirm dialog */}
      <SubscriptionCancelConfirmDialog
        isOpen={isConfirmCancelDialogOpen}
        subscription={subscription}
        refundDetails={refundDetails}
        isCancelProcessing={isCancelProcessing}
        onConfirmCancel={cancelSubscription}
        onClose={() => setIsConfirmCancelDialogOpen(false)}
      />

      {/* Subscription cancelled dialog */}
      <SubscriptionCancelledDialog
        isOpen={isCancelDialogOpen}
        onClose={() => setIsCancelDialogOpen(false)}
        onLogout={logout}
      />

      {/* Payment Failed dialog */}
      <PaymentFailedDialog
        isOpen={isPaymentFailedDialogOpen}
        message={paymentFailedMessage}
        onClose={() => {
          setIsPaymentDialogOpen(false)
          setIsPaymentFailedDialogOpen(false)
        }}
      />

      {/* Cancellation Failed dialog */}
      <CancellationFailedDialog
        isOpen={isFailedCancelDialogOpen}
        message={failedCancelMessage}
        onClose={() => {
          setIsConfirmCancelDialogOpen(false)
          setIsFailedCancelDialogOpen(false)
        }}
      />
    </>
  )
}

export default Subscription
