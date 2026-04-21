import React, { useState, useEffect } from 'react'
import axios from 'axios'
import './DocumentForm.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

const getApiErrorMessage = (err, fallbackMessage) => {
  const data = err?.response?.data

  if (typeof data === 'string' && data.trim()) {
    return data
  }

  if (data?.detail) {
    return data.detail
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

function UserManagement({ authHeaders }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    is_staff: false,
  })
  const [editingUserId, setEditingUserId] = useState(null)

  const fetchUsers = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await axios.get(`${API_BASE_URL}/users/`, {
        headers: authHeaders(),
      })
      setUsers(response.data.results || response.data)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to load users'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.username.trim()) {
      setError('Username is required.')
      return
    }
    if (!editingUserId && !formData.password) {
      setError('Password is required for new users.')
      return
    }

    try {
      setError(null)
      if (editingUserId) {
        const payload = {
          username: formData.username.trim(),
          is_staff: formData.is_staff,
        }
        if (formData.password) {
          payload.password = formData.password
        }
        const response = await axios.patch(`${API_BASE_URL}/users/${editingUserId}/`, payload, {
          headers: authHeaders(),
        })
        setUsers(users.map((user) => (user.id === editingUserId ? response.data : user)))
        setEditingUserId(null)
      } else {
        const payload = {
          username: formData.username.trim(),
          password: formData.password,
          is_staff: formData.is_staff,
        }
        const response = await axios.post(`${API_BASE_URL}/users/`, payload, {
          headers: authHeaders(),
        })
        setUsers([response.data, ...users])
      }
      setFormData({ username: '', password: '', is_staff: false })
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to save user'))
    }
  }

  const handleEdit = (user) => {
    setEditingUserId(user.id)
    setFormData({ username: user.username, password: '', is_staff: user.is_staff })
    setError(null)
  }

  const handleDelete = async (userId) => {
    if (!window.confirm('Delete this user?')) {
      return
    }

    try {
      await axios.delete(`${API_BASE_URL}/users/${userId}/`, {
        headers: authHeaders(),
      })
      setUsers(users.filter((user) => user.id !== userId))
      if (editingUserId === userId) {
        setEditingUserId(null)
        setFormData({ username: '', password: '', is_staff: false })
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to delete user'))
    }
  }

  const cancelEdit = () => {
    setEditingUserId(null)
    setFormData({ username: '', password: '', is_staff: false })
    setError(null)
  }

  return (
    <div className="user-management-card card">
      <div className="user-management-header">
        <h2>👥 User Management</h2>
        <p>Create, edit, or remove staff and regular users from the admin dashboard.</p>
      </div>

      <div className="form-group">
        <label htmlFor="um-username">Username</label>
        <input
          id="um-username"
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="Username"
        />
      </div>

      <div className="form-group">
        <label htmlFor="um-password">Password</label>
        <input
          id="um-password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder={editingUserId ? 'Leave empty to keep current password' : 'Password'}
        />
      </div>

      <div className="form-group checkbox-group">
        <label>
          <input
            type="checkbox"
            name="is_staff"
            checked={formData.is_staff}
            onChange={handleChange}
          />
          Admin user
        </label>
      </div>

      {error && <div className="form-error-message">{error}</div>}

      <div className="user-actions">
        <button className="btn-primary btn-submit" onClick={handleSubmit}>
          {editingUserId ? 'Update User' : 'Create User'}
        </button>
        {editingUserId && (
          <button type="button" className="btn-secondary" onClick={cancelEdit}>
            Cancel
          </button>
        )}
      </div>

      <div className="user-table-wrapper">
        {loading ? (
          <div className="loading">Loading users...</div>
        ) : (
          <table className="user-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Admin</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.username}</td>
                  <td>{user.is_staff ? 'Yes' : 'No'}</td>
                  <td>
                    <button className="btn-secondary btn-small" onClick={() => handleEdit(user)}>
                      Edit
                    </button>
                    <button className="btn-danger btn-small" onClick={() => handleDelete(user.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default UserManagement
