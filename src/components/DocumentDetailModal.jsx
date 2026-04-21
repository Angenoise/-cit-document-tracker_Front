import React, { useState } from 'react'
import './DocumentForm.css'

function DocumentDetailModal({ document, onClose, onSave }) {
  if (!document) {
    return null
  }

  const [editMode, setEditMode] = useState(false)
  const [formState, setFormState] = useState({
    status: document.status || 'Pending',
    priority: document.priority || 'Medium',
    due_date: document.due_date || '',
    remarks: document.remarks || '',
  })

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormState((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    if (!onSave) {
      return
    }

    const result = await onSave(document.id, formState)
    if (result.success) {
      setEditMode(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>{document.title}</h2>
            <p>{document.document_number || 'Pending number'} - {document.reference_code || 'No reference code yet'}</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {!editMode ? (
              <button className="btn-secondary" onClick={() => setEditMode(true)}>Edit</button>
            ) : (
              <button className="btn-secondary" onClick={handleSave}>Save</button>
            )}
            <button className="btn-secondary" onClick={onClose}>Close</button>
          </div>
        </div>

        <div className="detail-grid">
          <div><strong>Department:</strong> {document.department}</div>
          <div><strong>Type:</strong> {document.doc_type}</div>
          <div>
            <strong>Status:</strong>{' '}
            {editMode ? (
              <select name="status" value={formState.status} onChange={handleChange}>
                <option value="Pending">Pending</option>
                <option value="In Process">In Process</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Completed">Completed</option>
              </select>
            ) : (
              document.status
            )}
          </div>
          <div>
            <strong>Priority:</strong>{' '}
            {editMode ? (
              <select name="priority" value={formState.priority} onChange={handleChange}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            ) : (
              document.priority
            )}
          </div>
          <div><strong>Owner:</strong> {document.owner}</div>
          <div><strong>Sender:</strong> {document.sender}</div>
          <div><strong>Receiver:</strong> {document.receiver}</div>
          <div>
            <strong>Due date:</strong>{' '}
            {editMode ? (
              <input type="date" name="due_date" value={formState.due_date || ''} onChange={handleChange} />
            ) : (
              document.due_date || 'N/A'
            )}
          </div>
          <div><strong>Encrypted ID:</strong> {document.encrypted_id}</div>
        </div>

        <div className="form-group" style={{ marginTop: '1rem' }}>
          <label>Description</label>
          <div className="readonly-owner">{document.description || 'N/A'}</div>
        </div>

        <div className="form-group">
          <label>Remarks</label>
          {editMode ? (
            <textarea
              name="remarks"
              value={formState.remarks}
              onChange={handleChange}
              rows="3"
            />
          ) : (
            <div className="readonly-owner">{document.remarks || 'N/A'}</div>
          )}
        </div>

        <div className="form-group">
          <label>Attachment</label>
          <div className="readonly-owner">
            {document.attachment ? (
              <a href={document.attachment} target="_blank" rel="noreferrer">Open attachment</a>
            ) : 'No attachment uploaded'}
          </div>
        </div>

        {document.access_key && (
          <div className="form-group">
            <label>Access Key (Admin Only)</label>
            <div className="readonly-owner" style={{ backgroundColor: '#fff3cd', padding: '10px', borderRadius: '4px' }}>
              <strong>{document.access_key}</strong>
            </div>
          </div>
        )}

        <div className="form-group">
          <label>Document Activity</label>
          <div className="timeline">
            {(document.activities || []).length > 0 ? (
              document.activities.map((activity) => (
                <div key={activity.id} className="timeline-item">
                  <strong>{activity.action}</strong>
                  <div>{activity.message}</div>
                  <small>
                    {activity.changed_by || 'System'} - {new Date(activity.created_at).toLocaleString()}
                  </small>
                </div>
              ))
            ) : (
              <div className="readonly-owner">No activity yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DocumentDetailModal
