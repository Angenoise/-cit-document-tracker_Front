import React from 'react'
import './DocumentStats.css'

function AdminPanel({ stats }) {
  return (
    <div className="stats-card card admin-panel">
      <div className="stats-header">
        <h2>🛠️ Admin Dashboard</h2>
        <p>Manage all documents, review owners, and monitor usage across the platform.</p>
      </div>

      {stats ? (
        <div className="stats-grid">
          <div className="stats-item">
            <span className="stats-value">{stats.total_documents}</span>
            <span className="stats-label">Total documents</span>
          </div>
          <div className="stats-item">
            <span className="stats-value">{stats.unique_owners}</span>
            <span className="stats-label">Unique owners</span>
          </div>
          <div className="stats-item">
            <span className="stats-value">{stats.documents_this_month}</span>
            <span className="stats-label">This month</span>
          </div>
        </div>
      ) : (
        <div className="loading">Loading admin metrics...</div>
      )}
    </div>
  )
}

export default AdminPanel
