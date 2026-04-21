import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import './DocumentForm.css'

function DocumentForm({ onCreateDocument, isAdmin, currentUser }) {
  const [formData, setFormData] = useState({
    title: '',
    department: 'General',
    doc_type: 'Memo',
    description: '',
    sender: '',
    receiver: '',
    status: 'Pending',
    priority: 'Medium',
    due_date: '',
    remarks: '',
    access_key: '',
    owner: '',
    attachment: null,
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (!isAdmin) {
      setFormData((prev) => ({
        ...prev,
        owner: currentUser || '',
      }))
    }
  }, [isAdmin, currentUser])

  const handleChange = (e) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'file' ? e.target.files[0] : value,
    }))

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }
    if (!formData.sender.trim()) {
      newErrors.sender = 'Sender is required'
    }
    if (!formData.receiver.trim()) {
      newErrors.receiver = 'Receiver is required'
    }
    if (!formData.access_key.trim()) {
      newErrors.access_key = 'Access key is required'
    }
    if (isAdmin && !formData.owner.trim()) {
      newErrors.owner = 'Owner is required for admin-created documents'
    }
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const newErrors = validateForm()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const payload = new FormData()
      payload.append('title', formData.title.trim())
      payload.append('department', formData.department)
      payload.append('doc_type', formData.doc_type)
      payload.append('description', formData.description.trim())
      payload.append('sender', formData.sender.trim())
      payload.append('receiver', formData.receiver.trim())
      payload.append('status', formData.status)
      payload.append('priority', formData.priority)
      payload.append('access_key', formData.access_key.trim())
      if (formData.due_date) {
        payload.append('due_date', formData.due_date)
      }
      payload.append('remarks', formData.remarks.trim())
      if (isAdmin) {
        payload.append('owner', formData.owner.trim())
      }
      if (formData.attachment) {
        payload.append('attachment', formData.attachment)
      }
      const result = await onCreateDocument(payload)

      if (result.success) {
        setFormData({
          title: '',
          department: 'General',
          doc_type: 'Memo',
          description: '',
          sender: '',
          receiver: '',
          status: 'Pending',
          priority: 'Medium',
          due_date: '',
          remarks: '',
          access_key: '',
          owner: isAdmin ? '' : currentUser || '',
          attachment: null,
        })
        setErrors({})
      } else {
        setErrors({ submit: result.error })
        toast.error(result.error)
      }
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to create document'
      setErrors({ submit: errorMsg })
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="form-container">
      <div className="form-card card">
        <h2>Create New Document</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Document Title *</label>
            <input
              id="title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter document title"
              maxLength="255"
              disabled={loading}
            />
            {errors.title && <span className="error">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="department">Department *</label>
            <select
              id="department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="General">General</option>
              <option value="Registrar">Registrar</option>
              <option value="Dean Office">Dean Office</option>
              <option value="Guidance Office">Guidance Office</option>
              <option value="Accounting">Accounting</option>
              <option value="Library">Library</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="doc_type">Document Type *</label>
            <select
              id="doc_type"
              name="doc_type"
              value={formData.doc_type}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="Memo">Memo</option>
              <option value="Letter">Letter</option>
              <option value="Report">Report</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter document description"
              rows="3"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="sender">Sender *</label>
            <input
              id="sender"
              type="text"
              name="sender"
              value={formData.sender}
              onChange={handleChange}
              placeholder="Enter sender name"
              maxLength="255"
              disabled={loading}
            />
            {errors.sender && <span className="error">{errors.sender}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="receiver">Receiver *</label>
            <input
              id="receiver"
              type="text"
              name="receiver"
              value={formData.receiver}
              onChange={handleChange}
              placeholder="Enter receiver name"
              maxLength="255"
              disabled={loading}
            />
            {errors.receiver && <span className="error">{errors.receiver}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="access_key">Document Access Key *</label>
            <input
              id="access_key"
              type="password"
              name="access_key"
              value={formData.access_key}
              onChange={handleChange}
              placeholder="Set document access key"
              disabled={loading}
            />
            {errors.access_key && <span className="error">{errors.access_key}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="status">Status *</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="Pending">Pending</option>
              <option value="In Process">In Process</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="priority">Priority *</label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="due_date">Due Date</label>
            <input
              id="due_date"
              type="date"
              name="due_date"
              value={formData.due_date}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="remarks">Remarks</label>
            <textarea
              id="remarks"
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              placeholder="Add optional remarks"
              rows="2"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="attachment">Attachment</label>
            <input
              id="attachment"
              type="file"
              name="attachment"
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          {isAdmin ? (
            <div className="form-group">
              <label htmlFor="owner">Owner Name *</label>
              <input
                id="owner"
                type="text"
                name="owner"
                value={formData.owner}
                onChange={handleChange}
                placeholder="Enter document owner"
                maxLength="255"
                disabled={loading}
              />
              {errors.owner && <span className="error">{errors.owner}</span>}
            </div>
          ) : (
            <div className="form-group">
              <label>Owner</label>
              <div className="readonly-owner">{currentUser || 'Logged in user'}</div>
            </div>
          )}

          {errors.submit && (
            <div className="form-error-message">{errors.submit}</div>
          )}

          <button
            type="submit"
            className="btn-primary btn-submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                creating...
              </>
            ) : (
              '✨ Create Document with Encryption'
            )}
          </button>
        </form>

        <p className="form-info">
          ℹ️ Your document ID will be encrypted using IDEA algorithm and included in the QR code.
        </p>
      </div>
    </div>
  )
}

export default DocumentForm
