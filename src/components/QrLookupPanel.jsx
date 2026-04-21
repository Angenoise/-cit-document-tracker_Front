import React, { useEffect, useState } from 'react'
import './DocumentForm.css'

function QrLookupPanel({ onLookup, initialEncryptedId = '' }) {
  const [encryptedId, setEncryptedId] = useState('')
  const [accessKey, setAccessKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (initialEncryptedId) {
      setEncryptedId(initialEncryptedId)
    }
  }, [initialEncryptedId])

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!encryptedId.trim()) {
      setError('Enter an encrypted ID from a QR code.')
      return
    }

    if (!accessKey.trim()) {
      setError('Enter the document access key.')
      return
    }

    setLoading(true)
    setError('')

    try {
      await onLookup(encryptedId.trim(), accessKey.trim())
      setEncryptedId('')
      setAccessKey('')
    } catch (lookupError) {
      setError(lookupError.message || 'Unable to resolve QR code.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="form-card card">
      <h2>QR Lookup</h2>
      <p className="form-info">Paste the encrypted ID and enter the document access key.</p>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="encryptedId">Encrypted ID</label>
          <input
            id="encryptedId"
            type="text"
            value={encryptedId}
            onChange={(event) => setEncryptedId(event.target.value)}
            placeholder="Enter encrypted ID from QR code"
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="accessKey">Access Key</label>
          <input
            id="accessKey"
            type="password"
            value={accessKey}
            onChange={(event) => setAccessKey(event.target.value)}
            placeholder="Enter document key"
            disabled={loading}
          />
        </div>
        {error && <div className="form-error-message">{error}</div>}
        <button type="submit" className="btn-primary btn-submit" disabled={loading}>
          {loading ? 'Looking up...' : 'Resolve QR Code'}
        </button>
      </form>
    </div>
  )
}

export default QrLookupPanel
