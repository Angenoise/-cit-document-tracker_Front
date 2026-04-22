import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { Toaster, toast } from 'react-hot-toast'
import DocumentForm from './components/DocumentForm'
import DocumentList from './components/DocumentList'
import DocumentStats from './components/DocumentStats'
import DocumentDetailModal from './components/DocumentDetailModal'
import QrLookupPanel from './components/QrLookupPanel'
import LoginForm from './components/LoginForm'
import AdminPanel from './components/AdminPanel'
import UserManagement from './components/UserManagement'
import schoolLogo from './assets/school-logo.png'
import collegeLogo from './assets/college-logo.png'
import './App.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

const getApiErrorMessage = (err, fallbackMessage) => {
  const data = err?.response?.data

  if (err?.response?.status === 401) {
    if (data?.detail === 'Invalid token.') {
      // Clear token since it's no longer valid
      localStorage.removeItem('cit_auth_token')
      localStorage.removeItem('cit_auth_user')
      setTimeout(() => {
        window.location.reload()
      }, 1000)
      return 'Session expired. Please log in again.'
    }
  }

  if (typeof data === 'string' && data.trim()) {
    return data
  }

  if (data?.detail) {
    return data.detail
  }

  if (data?.error) {
    return data.error
  }

  if (data && typeof data === 'object') {
    const firstValue = Object.values(data)[0]

    if (Array.isArray(firstValue) && firstValue.length > 0) {
      return String(firstValue[0])
    }

    if (typeof firstValue === 'string' && firstValue.trim()) {
      return firstValue
    }
  }

  return fallbackMessage || err.message || 'Request failed'
}

function App() {
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('cit_auth_token') || '')
  const [authUser, setAuthUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('cit_auth_user') || 'null')
    } catch (parseError) {
      return null
    }
  })
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState('')
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterOwner, setFilterOwner] = useState('')
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [selectedDocumentKey, setSelectedDocumentKey] = useState('')
  const [qrLookupResult, setQrLookupResult] = useState(null)
  const [initialQrEncryptedId, setInitialQrEncryptedId] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showQrLookupPanel, setShowQrLookupPanel] = useState(false)
  const [showDocumentList, setShowDocumentList] = useState(false)

  const documentListRef = useRef(null)
  const adminDocumentListRef = useRef(null)

  const isAdmin = Boolean(authUser?.is_staff)
  const isAuthenticated = Boolean(authToken && authUser)

  const authHeaders = (extraHeaders = {}) => ({
    Authorization: `Token ${authToken}`,
    ...extraHeaders,
  })

  const clearAuthState = () => {
    setAuthToken('')
    setAuthUser(null)
    setAuthError('')
    localStorage.removeItem('cit_auth_token')
    localStorage.removeItem('cit_auth_user')
    setDocuments([])
    setStats(null)
    setSelectedDocument(null)
    setSelectedDocumentKey('')
    setQrLookupResult(null)
  }

  const persistAuthState = (token, user) => {
    setAuthToken(token)
    setAuthUser(user)
    setAuthError('')
    localStorage.setItem('cit_auth_token', token)
    localStorage.setItem('cit_auth_user', JSON.stringify(user))
  }

  useEffect(() => {
    const url = new URL(window.location.href)
    const qrValue = (url.searchParams.get('qr') || '').trim()
    if (qrValue) {
      setInitialQrEncryptedId(qrValue)
    }
  }, [])

  useEffect(() => {
    if (initialQrEncryptedId) {
      toast('QR link detected. Enter document key to continue.')
    }
  }, [initialQrEncryptedId])

  useEffect(() => {
    if (isAuthenticated && initialQrEncryptedId) {
      setShowQrLookupPanel(true)
    }
  }, [isAuthenticated, initialQrEncryptedId])

  useEffect(() => {
    if (showDocumentList) {
      const ref = isAdmin ? adminDocumentListRef : documentListRef
      if (ref.current) {
        setTimeout(() => {
          ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 100)
      }
    }
  }, [showDocumentList, isAdmin])

  const handleLogin = async (credentials) => {
    setAuthLoading(true)
    setAuthError('')

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login/`, credentials, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      persistAuthState(response.data.token, response.data.user)
      toast.success(`Welcome back, ${response.data.user.username}`)
      return { success: true }
    } catch (err) {
      const message = getApiErrorMessage(err, 'Login failed')
      setAuthError(message)
      return { success: false, error: message }
    } finally {
      setAuthLoading(false)
    }
  }

  const handleRegister = async (credentials) => {
    setAuthLoading(true)
    setAuthError('')

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register/`, credentials, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      persistAuthState(response.data.token, response.data.user)
      toast.success(`Account created for ${response.data.user.username}`)
      return { success: true }
    } catch (err) {
      const message = getApiErrorMessage(err, 'Registration failed')
      setAuthError(message)
      return { success: false, error: message }
    } finally {
      setAuthLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      if (authToken) {
        await axios.post(`${API_BASE_URL}/auth/logout/`, {}, { headers: authHeaders() })
      }
    } catch (err) {
      // Clear local session even if logout endpoint fails.
    } finally {
      clearAuthState()
      toast.success('Logged out successfully')
    }
  }

  const fetchDocuments = async () => {
    if (!isAuthenticated) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await axios.get(`${API_BASE_URL}/documents/`, {
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        params: {
          ...(searchQuery ? { search: searchQuery } : {}),
          ...(isAdmin && filterOwner ? { owner: filterOwner } : {}),
        },
      })

      setDocuments(response.data.results || response.data)
    } catch (err) {
      setError(`Failed to fetch documents: ${getApiErrorMessage(err, 'Unable to load documents')}`)
      console.error('Error fetching documents:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    if (!isAuthenticated) {
      return
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/documents/stats/`, {
        headers: authHeaders(),
      })
      setStats(response.data)
    } catch (err) {
      setError(`Failed to fetch stats: ${getApiErrorMessage(err, 'Unable to load stats')}`)
      console.error('Error fetching stats:', err)
    }
  }

  const resolveQrCode = async (encryptedId, accessKey) => {
    if (!isAuthenticated) {
      const message = 'Please log in first to resolve QR links.'
      toast.error(message)
      throw new Error(message)
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/documents/resolve_qr/`, {
        headers: authHeaders({
          'X-Document-Key': accessKey,
        }),
        params: { encrypted_id: encryptedId },
      })

      setQrLookupResult(response.data)
      setSelectedDocument(response.data.document)
      setSelectedDocumentKey(accessKey)

      const url = new URL(window.location.href)
      if (url.searchParams.get('qr')) {
        url.searchParams.delete('qr')
        window.history.replaceState({}, '', url.toString())
      }

      toast.success('QR code resolved successfully')
      return response.data
    } catch (err) {
      const message = getApiErrorMessage(err, 'Unable to resolve QR code')
      toast.error(message)
      throw new Error(message)
    }
  }

  useEffect(() => {
    if (!isAuthenticated) {
      return
    }

    fetchDocuments()
    fetchStats()
  }, [searchQuery, filterOwner, isAuthenticated])

  const handleCreateDocument = async (formData) => {
    if (!isAuthenticated) {
      return { success: false, error: 'Please log in first.' }
    }

    setError(null)

    try {
      const isFormData = typeof FormData !== 'undefined' && formData instanceof FormData
      const response = await axios.post(`${API_BASE_URL}/documents/`, formData, {
        headers: authHeaders({
          ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        }),
      })

      setDocuments([response.data, ...documents])
      fetchStats()
      toast.success(`Document "${response.data.title}" created successfully!`)
      return { success: true, data: response.data }
    } catch (err) {
      const errorMsg = getApiErrorMessage(err, 'Failed to create document')
      setError(errorMsg)
      return { success: false, error: errorMsg }
    }
  }

  const handleDeleteDocument = async (documentId) => {
    if (!isAuthenticated) {
      toast.error('Please log in first.')
      return
    }

    if (!window.confirm('Are you sure you want to delete this document?')) {
      return
    }

    let accessKey = ''
    
    if (!isAdmin) {
      accessKey = window.prompt('Enter document access key to delete:') || ''
      if (!accessKey.trim()) {
        toast.error('Document access key is required.')
        return
      }
    }

    try {
      const headers = authHeaders({})
      if (accessKey) {
        headers['X-Document-Key'] = accessKey.trim()
      }
      
      await axios.delete(`${API_BASE_URL}/documents/${documentId}/`, {
        headers,
      })
      setDocuments(documents.filter((doc) => doc.id !== documentId))
      fetchStats()
    } catch (err) {
      setError(`Failed to delete document: ${getApiErrorMessage(err, 'Unable to delete document')}`)
    }
  }

  const handleViewDocument = async (document) => {
    if (!isAuthenticated) {
      toast.error('Please log in first.')
      return
    }

    let accessKey = ''
    
    if (!isAdmin) {
      accessKey = window.prompt('Enter document access key to view:') || ''
      if (!accessKey.trim()) {
        toast.error('Document access key is required.')
        return
      }
    }

    try {
      const headers = authHeaders({})
      if (accessKey) {
        headers['X-Document-Key'] = accessKey.trim()
      }
      
      const response = await axios.get(`${API_BASE_URL}/documents/${document.id}/`, {
        headers,
      })
      setSelectedDocument(response.data)
      setSelectedDocumentKey(accessKey.trim())
    } catch (err) {
      const message = getApiErrorMessage(err, 'Unable to open document')
      toast.error(message)
    }
  }

  const handleUpdateDocument = async (documentId, payload) => {
    if (!isAuthenticated) {
      const message = 'Please log in first.'
      toast.error(message)
      return { success: false, error: message }
    }

    if (!isAdmin && !selectedDocumentKey) {
      const message = 'Open the document using a valid access key before editing.'
      toast.error(message)
      return { success: false, error: message }
    }

    try {
      const headersConfig = authHeaders({
        'Content-Type': 'application/json',
      })
      if (selectedDocumentKey) {
        headersConfig['X-Document-Key'] = selectedDocumentKey
      }
      const response = await axios.patch(`${API_BASE_URL}/documents/${documentId}/`, payload, {
        headers: headersConfig,
      })

      setSelectedDocument(response.data)
      setDocuments((prev) => prev.map((doc) => (doc.id === response.data.id ? { ...doc, ...response.data } : doc)))
      fetchStats()
      toast.success('Document updated successfully')
      return { success: true, data: response.data }
    } catch (err) {
      const message = getApiErrorMessage(err, 'Unable to update document')
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const owners = [...new Set(documents.map((doc) => doc.owner))].filter(Boolean)
  const qrBaseUrl = `${window.location.origin}${window.location.pathname}`

  const handleCreateDocumentPanel = async (formData) => {
    const result = await handleCreateDocument(formData)
    if (result.success && isAdmin) {
      setShowCreateModal(false)
    }
    return result
  }

  const handleQrLookup = async (encryptedId, accessKey) => {
    const result = await resolveQrCode(encryptedId, accessKey)
    if (isAdmin) {
      setShowQrLookupPanel(false)
    }
    return result
  }

  if (!isAuthenticated) {
    return (
      <div className="app">
        <Toaster position="top-right" />
        <div className="app-header">
          <div className="header-row">
            <div className="logo-item">
              <img src={collegeLogo} alt="CIT Logo" style={{ height: '80px', width: 'auto' }} />
            </div>
            <div className="header-content">
              <h1>CIT Document Tracker</h1>
              <p>Login as admin or user to track and access encrypted documents.</p>
            </div>
            <div className="logo-item">
              <img src={schoolLogo} alt="University Logo" style={{ height: '80px', width: 'auto' }} />
            </div>
          </div>
        </div>

        <div className="container">
          <LoginForm
            onLogin={handleLogin}
            onRegister={handleRegister}
            loading={authLoading}
            authError={authError}
          />
          {initialQrEncryptedId && (
            <div className="qr-lookup-result card">
              <h3>QR Link Detected</h3>
              <p>Encrypted ID from link: {initialQrEncryptedId}</p>
              <p>Sign in first, then enter the document access key to open this document.</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <Toaster position="top-right" />
      <div className="app-header">
        <div className="header-row">
          <div className="logo-item">
            <img src={collegeLogo} alt="CIT Logo" style={{ height: '80px', width: 'auto' }} />
          </div>
          <div className="header-content">
            <h1>CIT Document Tracker</h1>
            <p>Secure document tracking with role-based access and QR links.</p>
          </div>
          <div className="logo-item">
            <img src={schoolLogo} alt="University Logo" style={{ height: '80px', width: 'auto' }} />
          </div>
        </div>
        <div className="user-info">
          <span>
            Logged in as {authUser.username} ({isAdmin ? 'Admin' : 'User'})
          </span>
          <button className="btn-secondary" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div className="container">
        {error && <div className="error-banner">{error}</div>}

        {isAdmin && (
          <div className="dashboard-focus-shell">
            <AdminPanel stats={stats} />
          </div>
        )}

        {isAdmin && <UserManagement authHeaders={authHeaders} />}

        {isAdmin && (
          <div className="dashboard-actions card">
            <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
              + Create Document
            </button>
            <button className="btn-secondary" onClick={() => setShowQrLookupPanel((prev) => !prev)}>
              {showQrLookupPanel ? 'Hide QR Lookup' : 'Open QR Lookup'}
            </button>
            <button className="btn-secondary" onClick={() => setShowDocumentList((prev) => !prev)}>
              {showDocumentList ? 'Hide Document List' : 'Open Document List'}
            </button>
          </div>
        )}

        {!isAdmin && (
          <div className="user-focus-shell card">
            <DocumentStats stats={stats} isUserView={true} />
            
            <div className="user-actions-top">
              <button className="btn-secondary" onClick={() => setShowQrLookupPanel((prev) => !prev)}>
                {showQrLookupPanel ? 'Hide QR Lookup' : 'QR Lookup'}
              </button>
              <div className="search-box user-search-box">
                <input
                  type="text"
                  placeholder="Search by title, owner, sender, or status..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {showQrLookupPanel && (
              <div className="dropdown-panel">
                <QrLookupPanel onLookup={handleQrLookup} initialEncryptedId={initialQrEncryptedId} />
              </div>
            )}

            <div className="create-document-focus">
              <DocumentForm
                onCreateDocument={handleCreateDocumentPanel}
                isAdmin={isAdmin}
                currentUser={authUser.username}
              />
            </div>

            <button
              className="btn-secondary document-dropdown-trigger"
              onClick={() => setShowDocumentList((prev) => !prev)}
            >
              {showDocumentList ? 'Hide Document List' : 'Show Document List'}
            </button>

            {showDocumentList && (
              <div className="dropdown-panel" ref={documentListRef}>
                {loading ? (
                  <div className="loading">
                    <div className="spinner"></div>
                    Loading documents...
                  </div>
                ) : (
                  <DocumentList
                    documents={documents}
                    onViewDocument={handleViewDocument}
                    onDeleteDocument={handleDeleteDocument}
                    qrBaseUrl={qrBaseUrl}
                  />
                )}
              </div>
            )}
          </div>
        )}

        {isAdmin && showDocumentList && (
          <div className="dropdown-panel card" ref={adminDocumentListRef}>
            <div className="search-filter-section">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Search by title, owner, sender, or status..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {owners.length > 0 && (
                <div className="filter-box">
                  <select
                    value={filterOwner}
                    onChange={(e) => setFilterOwner(e.target.value)}
                  >
                    <option value="">All Owners</option>
                    {owners.map((owner) => (
                      <option key={owner} value={owner}>
                        {owner}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {loading ? (
              <div className="loading">
                <div className="spinner"></div>
                Loading documents...
              </div>
            ) : (
              <DocumentList
                documents={documents}
                onViewDocument={handleViewDocument}
                onDeleteDocument={handleDeleteDocument}
                qrBaseUrl={qrBaseUrl}
              />
            )}
          </div>
        )}

        {isAdmin && showCreateModal && (
          <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
            <div className="modal-card" onClick={(event) => event.stopPropagation()}>
              <div className="modal-header">
                <h2>Create New Document</h2>
                <button className="btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Close
                </button>
              </div>
              <DocumentForm
                onCreateDocument={handleCreateDocumentPanel}
                isAdmin={isAdmin}
                currentUser={authUser.username}
              />
            </div>
          </div>
        )}

        {isAdmin && showQrLookupPanel && (
          <div className="modal-overlay" onClick={() => setShowQrLookupPanel(false)}>
            <div className="modal-card" onClick={(event) => event.stopPropagation()}>
              <div className="modal-header">
                <h2>QR Lookup</h2>
                <button className="btn-secondary" onClick={() => setShowQrLookupPanel(false)}>
                  Close
                </button>
              </div>
              <QrLookupPanel onLookup={handleQrLookup} initialEncryptedId={initialQrEncryptedId} />
            </div>
          </div>
        )}

        {selectedDocument && (
          <DocumentDetailModal
            document={selectedDocument}
            onSave={handleUpdateDocument}
            onClose={() => setSelectedDocument(null)}
          />
        )}

        {qrLookupResult && (
          <div className="qr-lookup-result card">
            <h3>QR Lookup Result</h3>
            <p>Resolved document ID: {qrLookupResult.resolved_document_id}</p>
            <p>Document number: {qrLookupResult.resolved_document_number}</p>
            <p>Reference code: {qrLookupResult.resolved_reference_code}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
