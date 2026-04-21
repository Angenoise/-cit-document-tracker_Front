import React, { useState } from 'react'
import QRCode from 'qrcode.react'
import './DocumentList.css'

function DocumentList({ documents, onViewDocument, onDeleteDocument, qrBaseUrl }) {
  const [expandedId, setExpandedId] = useState(null)

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id)
  }

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
                <h3>{doc.title}</h3>
                <p className="owner">👤 {doc.owner}</p>
                <p className="owner">No: {doc.document_number || 'Pending number'}</p>
                <p className="owner">Type: {doc.doc_type}</p>
              </div>
              <button
                className="expand-btn"
                onClick={() => toggleExpand(doc.id)}
              >
                {expandedId === doc.id ? '▼' : '▶'}
              </button>
            </div>

            <div className="card-meta">
              <span className="meta-item">
                🆔 <strong>Enc ID:</strong>
                <code className="doc-id">{(doc.idea_encrypted_internal_id || '').substring(0, 12)}...</code>
              </span>
              <span className="meta-item">📅 {new Date(doc.created_at).toLocaleDateString()}</span>
              <span className="meta-item">Dept: {doc.department}</span>
              <span className="meta-item">Status: {doc.status}</span>
              <span className="meta-item">Priority: {doc.priority}</span>
            </div>

            {expandedId === doc.id && (
              <div className="card-expanded">
                <div className="encryption-info">
                  <h4>Encrypted ID (Copy/Paste)</h4>
                  <div className="encrypted-id-display">
                    <code>{doc.encrypted_id}</code>
                    <button
                      className="copy-btn btn-small"
                      onClick={() => copyToClipboard(doc.encrypted_id)}
                      title="Copy encrypted ID"
                    >
                      📋
                    </button>
                  </div>
                  <p className="encryption-note">Use this value in QR Lookup if scanning is difficult.</p>
                  <div className="encrypted-id-display" style={{ marginTop: '10px' }}>
                    <code>{qrLink}</code>
                    <button
                      className="copy-btn btn-small"
                      onClick={() => copyToClipboard(qrLink)}
                      title="Copy QR access link"
                    >
                      🔗
                    </button>
                  </div>
                  <p className="encryption-note">QR now contains this secure document link.</p>
                </div>

                <div className="qr-section">
                  <h4>🔗 QR Code</h4>
                  <div id={`qr-${doc.encrypted_id}`} className="qr-container">
                    <QRCode
                      value={qrLink}
                      size={200}
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                  <button
                    className="btn-secondary btn-small"
                    onClick={() => downloadQR(doc.encrypted_id, doc.title)}
                  >
                    ⬇️ Download QR
                  </button>
                </div>
              </div>
            )}

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
