import React from 'react'
import './DocumentStats.css'

function AdminPanel({ stats }) {
  return (
    <div className="admin-panel card">
      <div className="stats-header">
        <h2>🛠️ Admin Dashboard</h2>
        <p>Manage all documents, review owners, and monitor usage across the platform.</p>
      </div>

      {stats ? (
        <div className="stats-grid admin-stats-grid">
          <div className="stat-card stat-card-blue">
            <div className="stat-icon">📄</div>
            <div className="stat-content">
              <h3>{stats.total_documents}</h3>
              <p>Total Documents</p>
            </div>
          </div>
          <div className="stat-card stat-card-green">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3>{stats.unique_owners}</h3>
              <p>Unique Owners</p>
            </div>
          </div>
          <div className="stat-card stat-card-red">
            <div className="stat-icon">📅</div>
            <div className="stat-content">
              <h3>{stats.documents_this_month}</h3>
              <p>This Month</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="loading">Loading admin metrics...</div>
      )}
    </div>
  )
}

export default AdminPanel
