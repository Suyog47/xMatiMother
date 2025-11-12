import { Dialog, Button, Spinner } from '@blueprintjs/core'
import React, { useState, useEffect } from 'react'
import { PDFDocument, rgb } from 'pdf-lib'

interface InvoiceDetails {
  userName: string
  email: string
  subscriptionName: string
  amount: any
  paymentType: string
  duration: string
}

interface SubscriptionInvoiceLicenseDialogProps {
  isOpen: boolean
  invoiceDetails: InvoiceDetails
  onClose: () => void
  setIsSuccessDialogOpen: (val: boolean) => void
}

const SubscriptionInvoiceLicenseDialog: React.FC<SubscriptionInvoiceLicenseDialogProps> = ({
  isOpen,
  invoiceDetails,
  onClose,
  setIsSuccessDialogOpen
}) => {
  const [pdfLoading, setPdfLoading] = useState(true)
  const [pdfError, setPdfError] = useState(false)

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setPdfLoading(true)
      setPdfError(false)
    }
  }, [isOpen])

  const handlePdfLoad = () => {
    setPdfLoading(false)
  }

  const handlePdfError = () => {
    setPdfLoading(false)
    setPdfError(true)
  }

  const handleDownload = async () => {
    try {
      // Fetch the original license PDF
      const licensePdfUrl = `${process.env.PUBLIC_URL || ''}/Mist_license_agreement.pdf`
      const response = await fetch(licensePdfUrl)
      
      if (!response.ok) {
        throw new Error('Failed to fetch license PDF')
      }
      
      const licensePdfBytes = await response.arrayBuffer()
      
      // Load the original license PDF
      const licensePdf = await PDFDocument.load(licensePdfBytes)
      
      // Create a new PDF document for the complete invoice + license
      const mergedPdf = await PDFDocument.create()
      
      // Create invoice page
      const invoicePage = mergedPdf.addPage([595.28, 841.89]) // A4 size
      const { height } = invoicePage.getSize()
      
      // Set up fonts and colors
      const fontSize = 12
      const titleFontSize = 20
      const sectionFontSize = 16
      const headerColor = rgb(0.063, 0.420, 0.639) // #106ba3
      const textColor = rgb(0, 0, 0)
      
      // Add invoice content
      let yPosition = height - 50
      
      // Header
      invoicePage.drawText('Invoice & License Agreement', {
        x: 50,
        y: yPosition,
        size: titleFontSize,
        color: headerColor,
      })
      
      yPosition -= 30
      invoicePage.drawText(`xMati - Generated on: ${new Date().toLocaleDateString()}`, {
        x: 50,
        y: yPosition,
        size: fontSize,
        color: textColor,
      })
      
      yPosition -= 20
      invoicePage.drawText(`Customer: ${invoiceDetails.userName}`, {
        x: 50,
        y: yPosition,
        size: fontSize,
        color: textColor,
      })
      
      // Invoice Details Section
      yPosition -= 40
      invoicePage.drawText('Invoice Details', {
        x: 50,
        y: yPosition,
        size: sectionFontSize,
        color: headerColor,
      })
      
      yPosition -= 25
      invoicePage.drawText(`Subscription Name: ${invoiceDetails.subscriptionName}`, {
        x: 50,
        y: yPosition,
        size: fontSize,
        color: textColor,
      })
      
      yPosition -= 20
      invoicePage.drawText(`Amount: ${invoiceDetails.amount} (${invoiceDetails.paymentType})`, {
        x: 50,
        y: yPosition,
        size: fontSize,
        color: textColor,
      })
      
      yPosition -= 20
      invoicePage.drawText(`Duration: ${invoiceDetails.duration}`, {
        x: 50,
        y: yPosition,
        size: fontSize,
        color: textColor,
      })
      
      yPosition -= 20
      invoicePage.drawText(`Email: ${invoiceDetails.email}`, {
        x: 50,
        y: yPosition,
        size: fontSize,
        color: textColor,
      })
      
      // Add note about license agreement
      yPosition -= 40
      invoicePage.drawText('License Agreement', {
        x: 50,
        y: yPosition,
        size: sectionFontSize,
        color: headerColor,
      })
      
      yPosition -= 25
      invoicePage.drawText('The complete license agreement follows on the next pages.', {
        x: 50,
        y: yPosition,
        size: fontSize,
        color: textColor,
      })
      
      yPosition -= 20
      invoicePage.drawText('By using xMati software, you agree to be bound by all terms and conditions', {
        x: 50,
        y: yPosition,
        size: fontSize,
        color: textColor,
      })
      
      yPosition -= 15
      invoicePage.drawText('outlined in the license agreement.', {
        x: 50,
        y: yPosition,
        size: fontSize,
        color: textColor,
      })
      
      // Copy all pages from the license PDF to the merged PDF
      const licensePages = await mergedPdf.copyPages(licensePdf, licensePdf.getPageIndices())
      licensePages.forEach((page) => mergedPdf.addPage(page))
      
      // Generate the final PDF
      const mergedPdfBytes = await mergedPdf.save()
      
      // Create blob and download (create new Uint8Array to ensure proper typing)
      const pdfArray = new Uint8Array(mergedPdfBytes)
      const blob = new Blob([pdfArray], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      
      // Generate filename
      const fileName = `xMati_Invoice_License_${invoiceDetails.userName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
      
      // Create download link and trigger download
      const downloadLink = document.createElement('a')
      downloadLink.href = url
      downloadLink.download = fileName
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
      
      // Clean up
      URL.revokeObjectURL(url)
      
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Error generating PDF. Please try again. Make sure the license agreement PDF is available.')
    }
  }

  // const handleSendEmail = () => {
  //   // Create email content
  //   const subject = encodeURIComponent('Invoice and License Agreement of xMati')
  //   const body = encodeURIComponent(`
  // Dear User,

  // Please find below your invoice details and license agreement of xMati:

  // Invoice for ${invoiceDetails.userName}

  // INVOICE DETAILS:
  // Subscription Name: ${invoiceDetails.subscriptionName}
  // Amount: ${invoiceDetails.amount} (${invoiceDetails.paymentType})
  // Duration: ${invoiceDetails.duration}

  // LICENSE AGREEMENT:
  // ${licenseAgreement}

  // Best regards,
  // Support Team
  //     `)

  //   // Create mailto URL
  //   const mailtoUrl = `mailto:${invoiceDetails.email}?subject=${subject}&body=${body}`

  //   // Open default mail application
  //   window.location.href = mailtoUrl
  // }

  const handleNext = () => {
    setIsSuccessDialogOpen(true)
    onClose()
  }

  // const licenseAgreement = `
  //   This License Agreement ("Agreement") is entered into by and between the user ("You") and the service provider ("Company"). By accessing or using the service, You agree to be bound by the terms and conditions of this Agreement. If You do not agree, do not use the service.

  //   1. Grant of License
  //   The Company grants You a non-exclusive, non-transferable, revocable license to use the service for personal or business purposes, subject to the terms of this Agreement.

  //   2. Restrictions
  //   You shall not:
  //   - Modify, copy, or create derivative works of the service.
  //   - Reverse engineer, decompile, or disassemble the service.
  //   - Rent, lease, or sublicense the service to any third party.

  //   3. Ownership
  //   All intellectual property rights in the service remain the exclusive property of the Company. This Agreement does not grant You any ownership rights.

  //   4. Termination
  //   The Company may terminate this Agreement at any time if You breach any of its terms. Upon termination, You must cease all use of the service.

  //   5. Disclaimer of Warranties
  //   The service is provided "as is" without any warranties, express or implied, including but not limited to warranties of merchantability or fitness for a particular purpose.

  //   6. Limitation of Liability
  //   In no event shall the Company be liable for any indirect, incidental, or consequential damages arising out of the use or inability to use the service.

  //   7. Governing Law
  //   This Agreement shall be governed by and construed in accordance with the laws of the jurisdiction in which the Company is located.

  //   8. Entire Agreement
  //   This Agreement constitutes the entire agreement between You and the Company regarding the service and supersedes all prior agreements.

  //   By using the service, You acknowledge that You have read, understood, and agree to be bound by this Agreement.

  //   END OF AGREEMENT
  // `

  return (
    <Dialog
      isOpen={isOpen}
      onClose={() => {
        onClose()
        setIsSuccessDialogOpen(true)
      }}
      title=""
      canOutsideClickClose={false}
      style={{ 
        width: '90vw', 
        maxWidth: '1000px', 
        height: '95vh',
        borderRadius: '8px',
        overflow: 'hidden',
        padding: '0'
      }}
    >
      {/* Main Container */}
      <div style={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'white'
      }}>
        
        {/* Header Section with Invoice Details */}
        <div style={{
          padding: '20px',
          borderBottom: '2px solid #e0e0e0',
          backgroundColor: '#f8f9fa',
          flexShrink: 0
        }}>
          <h2 style={{ 
            margin: '0 0 15px 0', 
            fontSize: '20px', 
            fontWeight: '600',
            color: '#106ba3' 
          }}>
            Invoice & License Agreement
          </h2>
          <div style={{ 
            display: 'flex', 
            gap: '30px', 
            fontSize: '14px',
            color: '#495057'
          }}>
            <span><strong>Subscription:</strong> {invoiceDetails.subscriptionName}</span>
            <span><strong>Amount:</strong> {invoiceDetails.amount} ({invoiceDetails.paymentType})</span>
            <span><strong>Duration:</strong> {invoiceDetails.duration}</span>
          </div>
        </div>

        {/* PDF Display Container - Maximum Space */}
        <div style={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: '#fff'
        }}>
          
          {/* PDF Loading Spinner */}
          {pdfLoading && (
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 10,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px',
                background: 'rgba(255, 255, 255, 0.9)',
                padding: '20px',
                borderRadius: '8px'
              }}
            >
              <Spinner size={40} />
              <span style={{ fontSize: '14px', color: '#666' }}>Loading license agreement...</span>
            </div>
          )}

          {/* PDF Embed */}
          {!pdfError ? (
            <>
              {/* Try object tag first */}
              <object
                data={`${process.env.PUBLIC_URL || ''}/Mist_license_agreement.pdf#toolbar=0&navpanes=0&scrollbar=0&statusbar=0&messages=0`}
                type="application/pdf"
                width="100%"
                height="100%"
                style={{
                  display: pdfLoading ? 'none' : 'block'
                }}
                onLoad={handlePdfLoad}
                onError={handlePdfError}
              >
                {/* Fallback iframe for browsers that don't support object tag */}
                <iframe
                  src={`${process.env.PUBLIC_URL || ''}/Mist_license_agreement.pdf#toolbar=0&navpanes=0&scrollbar=0&statusbar=0&messages=0`}
                  width="100%"
                  height="100%"
                  style={{
                    border: 'none',
                    display: pdfLoading ? 'none' : 'block'
                  }}
                  onLoad={handlePdfLoad}
                  onError={handlePdfError}
                  title="License Agreement"
                >
                  {/* This content shows if both object and iframe fail */}
                  <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                    <p>Your browser does not support PDF viewing. Please download the PDF to view the license agreement.</p>
                    <a 
                      href={`${process.env.PUBLIC_URL || ''}/Mist_license_agreement.pdf`} 
                      download
                      style={{ color: '#007bff', textDecoration: 'underline' }}
                    >
                      Download License Agreement PDF
                    </a>
                  </div>
                </iframe>
              </object>
            </>
          ) : (
            /* Error state - show fallback text */
            <div
              style={{
                padding: '20px',
                height: '100%',
                overflowY: 'auto',
                fontSize: '14px',
                lineHeight: '1.6'
              }}
            >
              <div style={{ 
                marginBottom: '15px', 
                color: '#dc3545', 
                fontWeight: 'bold',
                textAlign: 'center',
                padding: '10px',
                backgroundColor: '#f8d7da',
                border: '1px solid #f5c6cb',
                borderRadius: '4px'
              }}>
                ⚠️ License PDF could not be loaded.
              </div>
              {/* <pre style={{
                fontFamily: 'inherit',
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
                margin: 0,
                color: '#333'
              }}>
                {licenseAgreement}
              </pre> */}
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div style={{
          padding: '15px 20px',
          borderTop: '2px solid #e0e0e0',
          backgroundColor: '#f8f9fa',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '15px',
          flexShrink: 0
        }}>
          <Button
            intent="primary"
            onClick={handleDownload}
            style={{
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: '600',
              borderRadius: '6px'
            }}
          >
            Download
          </Button>
          {/* <Button
            intent="success"
            onClick={handleSendEmail}
            style={{
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: '600',
              borderRadius: '6px'
            }}
          >
            Send Email
          </Button> */}
          <Button
            intent="warning"
            onClick={handleNext}
            style={{
              padding: '10px 24px',
              fontSize: '14px',
              fontWeight: '600',
              borderRadius: '6px'
            }}
          >
            Next
          </Button>
        </div>
      </div>
    </Dialog>
  )
}

export default SubscriptionInvoiceLicenseDialog
