import React, { useState, useEffect } from 'react'
import { Dialog, Button, Checkbox, Spinner } from '@blueprintjs/core'

interface LicenseAgreementDialogProps {
  isOpen: boolean
  onClose: () => void
  onAccept: () => void
}

const LicenseAgreementDialog: React.FC<LicenseAgreementDialogProps> = ({
  isOpen,
  onClose,
  onAccept
}) => {
  const [isAgreed, setIsAgreed] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(true)
  const [pdfError, setPdfError] = useState(false)

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setIsAgreed(false)
      setPdfLoading(true)
      setPdfError(false)
    }
  }, [isOpen])

  const handleClose = () => {
    setIsAgreed(false)
    onClose()
  }

  const handleAccept = () => {
    if (isAgreed) {
      onAccept()
    }
  }

  const handlePdfLoad = () => {
    setPdfLoading(false)
  }

  const handlePdfError = () => {
    setPdfLoading(false)
    setPdfError(true)
  }

  // This content should be replaced with the actual PDF content
//   const licenseContent = `
// MIST LICENSE AGREEMENT

// IMPORTANT - READ CAREFULLY: This license agreement ("Agreement") is a legal agreement between you ("User" or "Licensee") and xMati for the use of the xMati software platform ("Software").

// BY CLICKING "I ACCEPT" OR BY INSTALLING, COPYING, OR OTHERWISE USING THE SOFTWARE, YOU AGREE TO BE BOUND BY THE TERMS OF THIS AGREEMENT.

// 1. GRANT OF LICENSE
// Subject to the terms and conditions of this Agreement, xMati grants you a limited, non-exclusive, non-transferable license to use the Software in accordance with the documentation provided.

// 2. RESTRICTIONS
// You may not:
// - Modify, adapt, alter, translate, or create derivative works of the Software
// - Reverse engineer, disassemble, decompile, or otherwise attempt to derive the source code
// - Remove or alter any proprietary notices or labels on the Software
// - Use the Software for any unlawful purpose

// 3. INTELLECTUAL PROPERTY
// The Software and all intellectual property rights therein are and shall remain the exclusive property of xMati. This Agreement does not grant you any rights to trademarks, service marks, or trade names of xMati.

// 4. PRIVACY AND DATA
// Your use of the Software is subject to xMati's Privacy Policy. By using the Software, you consent to the collection, use, and processing of your data as described in the Privacy Policy.

// 5. SUPPORT AND UPDATES
// xMati may, but is not obligated to, provide technical support and software updates. Any updates provided will be subject to this Agreement unless accompanied by a separate license.

// 6. DISCLAIMER OF WARRANTIES
// THE SOFTWARE IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND. XMATI DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.

// 7. LIMITATION OF LIABILITY
// IN NO EVENT SHALL XMATI BE LIABLE FOR ANY DAMAGES, INCLUDING BUT NOT LIMITED TO DIRECT, INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF THE USE OR INABILITY TO USE THE SOFTWARE.

// 8. TERMINATION
// This Agreement is effective until terminated. Your rights under this Agreement will terminate automatically without notice if you fail to comply with any term of this Agreement.

// 9. GOVERNING LAW
// This Agreement shall be governed by and construed in accordance with the laws of the jurisdiction where xMati is located, without regard to conflict of law principles.

// 10. ENTIRE AGREEMENT
// This Agreement constitutes the entire agreement between you and xMati regarding the Software and supersedes all prior agreements and understandings.

// By clicking "I Accept" below, you acknowledge that you have read this Agreement, understand it, and agree to be bound by its terms and conditions.
//   `.trim()

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title="" // No title
      canOutsideClickClose={false}
      canEscapeKeyClose={false}
      hasBackdrop={true}
      style={{
        width: '90vw',
        maxWidth: '800px',
        height: '95vh',
        maxHeight: '93vh',
        borderRadius: '8px',
        overflow: 'hidden',
        padding: '0'
      }}
    >
      {/* Main Container - Full Height */}
      <div style={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'white'
      }}>
        
        {/* PDF Display Container - 85-90% of height */}
        <div style={{
          height: '85%', // Fixed 85% of dialog height
          margin: '0',
          border: 'none',
          backgroundColor: '#fff',
          position: 'relative',
          overflow: 'hidden'
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
                data={`${process.env.PUBLIC_URL || ''}/Mist_license_agreement.pdf#toolbar=0&navpanes=0&scrollbar=0&statusbar=0&messages=0&scrollbar=0`}
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
                  src={`${process.env.PUBLIC_URL || ''}/Mist_license_agreement.pdf#toolbar=0&navpanes=0&scrollbar=0&statusbar=0&messages=0&scrollbar=0`}
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
                  <p style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                    Your browser does not support PDF viewing. Please download the PDF to view the license agreement.
                    <br />
                    <a 
                      href={`${process.env.PUBLIC_URL || ''}/Mist_license_agreement.pdf`} 
                      download
                      style={{ color: '#007bff', textDecoration: 'underline' }}
                    >
                      Download License Agreement PDF
                    </a>
                  </p>
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
                {licenseContent}
              </pre> */}
            </div>
          )}
        </div>

        {/* Fixed Bottom Section - Single Row Layout */}
        <div style={{
          height: '15%', // Fixed 15% of dialog height
          minHeight: '80px',
          maxHeight: '100px',
          borderTop: '2px solid #e0e0e0',
          backgroundColor: '#f8f9fa',
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
          zIndex: 10
        }}>
          
          {/* Agreement Checkbox - Left Side */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            flex: 1
          }}>
            <Checkbox
              checked={isAgreed}
              onChange={(e) => setIsAgreed(e.currentTarget.checked)}
              style={{ marginRight: '12px' }}
            />
            <label style={{
              fontSize: '14px',
              fontWeight: '500',
              color: '#495057',
              cursor: 'pointer',
              margin: 0,
              lineHeight: '1.4'
            }}
            onClick={() => setIsAgreed(!isAgreed)}
            >
              I have read and agree to the terms and conditions of this License Agreement
            </label>
          </div>

          {/* Vertical Divider */}
          <div style={{
            width: '2px',
            height: '40px',
            backgroundColor: '#dee2e6',
            margin: '0 20px'
          }}></div>

          {/* Action Buttons - Right Side */}
          <div style={{
            display: 'flex',
            gap: '12px'
          }}>
            <Button
              onClick={handleClose}
              style={{
                padding: '10px 20px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                border: '2px solid #6c757d',
                color: '#6c757d',
                backgroundColor: 'white'
              }}
            >
              Cancel
            </Button>
            
            <Button
              onClick={handleAccept}
              disabled={!isAgreed}
              style={{
                background: isAgreed 
                  ? 'linear-gradient(135deg, #28a745 0%, #20c997 100%)' 
                  : '#e9ecef',
                color: isAgreed ? 'white' : '#6c757d',
                fontWeight: '600',
                border: 'none',
                padding: '10px 24px',
                borderRadius: '6px',
                fontSize: '14px',
                minWidth: '140px',
                boxShadow: isAgreed ? '0 3px 12px rgba(40, 167, 69, 0.3)' : 'none',
                cursor: isAgreed ? 'pointer' : 'not-allowed',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                if (isAgreed) {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 5px 18px rgba(40, 167, 69, 0.4)'
                }
              }}
              onMouseLeave={(e) => {
                if (isAgreed) {
                  e.currentTarget.style.transform = 'translateY(0px)'
                  e.currentTarget.style.boxShadow = '0 3px 12px rgba(40, 167, 69, 0.3)'
                }
              }}
            >
              Accept & Submit
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  )
}

export default LicenseAgreementDialog