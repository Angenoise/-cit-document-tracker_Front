import React from 'react'
import './DocumentStats.css'

function DocumentStats({ stats, isUserView = false }) {
  if (!stats) return null

  if (isUserView) {
    return (
      <div className="stats-grid user-stats-grid">
        <div className="stat-card stat-card-blue">
          <div className="stat-icon">📄</div>
          <div className="stat-content">
            <h3>{stats.total_documents}</h3>
            <p>Active Documents</p>
          </div>
        </div>

        <div className="stat-card stat-card-green">
          <div className="stat-icon">👤</div>
          <div className="stat-content">
            <h3>{stats.unique_owners}</h3>
            <p>Owned Documents</p>
          </div>
        </div>

        <div className="stat-card stat-card-red">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3>
              {stats.status_counts?.pending || 0}
            </h3>
            <p>Status: Pending</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="stats-container">
      <div className="stat-card stat-card-blue">
        <div className="stat-icon">📊</div>
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

      {stats.status_counts && (
        <>
          <div className="stat-card">
            <div className="stat-icon">🕒</div>
            <div className="stat-content">
              <h3>{stats.status_counts.pending}</h3>
              <p>Pending</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⚙️</div>
            <div className="stat-content">
              <h3>{stats.status_counts.in_process}</h3>
              <p>In Process</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3>{stats.status_counts.completed}</h3>
              <p>Completed</p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default DocumentStats
