import React from 'react'
import { QRCodeCanvas as QRCode } from 'qrcode.react'
import './DocumentList.css'

function DocumentList({ documents, onViewDocument, onDeleteDocument, qrBaseUrl }) {
  const buildQrLink = (encryptedId) => `${qrBaseUrl}?qr=${encodeURIComponent(encryptedId)}`

  const downloadQR = (encryptedId, title) => {
    const qrElement = document.getElementById(`qr-${encryptedId}`)
    if (qrElement) {
      const canvas = qrElement.querySelector('canvas')
      const link = document.createElement('a')
      link.href = canvas.toDataURL('image/png')
      link.download = `${title.replace(/\s+/g, '_')}_QR.png`
      link.click()
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
  }

  if (documents.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📭</div>
        <h3>No documents yet</h3>
        <p>Create your first document to get started!</p>
      </div>
    )
  }

  return (
    <div className="document-list">
      <h2>📋 Documents ({documents.length})</h2>
      
      <div className="documents-grid">
        {documents.map((doc) => {
          const qrLink = buildQrLink(doc.encrypted_id)
          return (
            <div key={doc.id} className="document-card card">
              <div className="card-header">
                <div className="card-title-section">
                  <div className="title-row">
                    <span className="title-icon">📄</span>
                    <h3>{doc.title}</h3>
                  </div>
                  <div className="owner-row">
                    <div className="owner-avatar">{(doc.owner || '?').charAt(0).toUpperCase()}</div>
                    <span className="owner-name">{doc.owner}</span>
                  </div>
                  <div className="mini-info-list">
                    <div className="mini-info-item">Document No: {doc.document_number || 'Pending number'}</div>
                    <div className="mini-info-item">Type: {doc.doc_type}</div>
                  </div>
                </div>
              </div>

              <div className="card-meta">
                <span className="meta-item">
                  🆔 <strong>Enc ID:</strong>
                  <code className="doc-id">{(doc.idea_encrypted_internal_id || '').substring(0, 12)}...</code>
                </span>
                <span className="meta-item">📅 {new Date(doc.created_at).toLocaleDateString()}</span>
              </div>

              <div className="card-body-grid">
                <div className="card-details compact-section">
                  <h4>Details</h4>
                  <div className="detail-row">
                    <span className="label">Dept:</span>
                    <span className="value">{doc.department}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Status:</span>
                    <span className="value status-pill">{doc.status}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Priority:</span>
                    <span className="value priority-pill">{doc.priority}</span>
                  </div>
                </div>

                <div className="qr-section compact-section">
                  <h4>QR Code</h4>
                  <div id={`qr-${doc.encrypted_id}`} className="qr-container compact-qr-container">
                    <QRCode
                      value={qrLink}
                      size={170}
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                  <div className="qr-link-row">
                    <button
                      className="copy-btn btn-small"
                      onClick={() => copyToClipboard(doc.encrypted_id)}
                      title="Copy encrypted ID"
                    >
                      📋
                    </button>
                    <button
                      className="btn-secondary btn-small download-qr-btn"
                      onClick={() => downloadQR(doc.encrypted_id, doc.title)}
                    >
                      Download QR
                    </button>
                  </div>
                </div>
              </div>

              <div className="card-actions">
                <button className="btn-secondary btn-small" onClick={() => onViewDocument(doc)}>
                  View
                </button>
                {onDeleteDocument && (
                  <button className="btn-danger btn-small" onClick={() => onDeleteDocument(doc.id)}>
                    Delete
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default DocumentList
