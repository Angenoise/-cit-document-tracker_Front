import React, { useState } from 'react'
import './DocumentForm.css'

function LoginForm({ onLogin, onRegister, loading, authError }) {
  const [mode, setMode] = useState('login')
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    confirmPassword: '',
  })
  const [fieldErrors, setFieldErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }))

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  const switchMode = (nextMode) => {
    setMode(nextMode)
    setCredentials({ username: '', password: '', confirmPassword: '' })
    setFieldErrors({})
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const errors = {}
    if (!credentials.username.trim()) {
      errors.username = 'Username is required.'
    }
    if (!credentials.password) {
      errors.password = 'Password is required.'
    }
    if (mode === 'register' && credentials.password !== credentials.confirmPassword) {
      errors.confirmPassword = 'Passwords must match.'
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    if (mode === 'register') {
      await onRegister({
        username: credentials.username.trim(),
        password: credentials.password,
      })
    } else {
      await onLogin({
        username: credentials.username.trim(),
        password: credentials.password,
      })
    }
  }

  return (
    <div className="form-container">
      <div className="form-card card">
        <div className="auth-toggle">
          <button
            type="button"
            className={mode === 'login' ? 'auth-toggle-active' : 'toggle-button'}
            onClick={() => switchMode('login')}
          >
            Sign In
          </button>
          <button
            type="button"
            className={mode === 'register' ? 'auth-toggle-active' : 'toggle-button'}
            onClick={() => switchMode('register')}
          >
            Create Account
          </button>
        </div>

        <h2>{mode === 'register' ? 'Create a New Account' : 'Login to Your Account'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              placeholder="Enter username"
              disabled={loading}
            />
            {fieldErrors.username && <span className="error">{fieldErrors.username}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              placeholder="Enter password"
              disabled={loading}
            />
            {fieldErrors.password && <span className="error">{fieldErrors.password}</span>}
          </div>

          {mode === 'register' && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                value={credentials.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm password"
                disabled={loading}
              />
              {fieldErrors.confirmPassword && <span className="error">{fieldErrors.confirmPassword}</span>}
            </div>
          )}

          {authError && <div className="form-error-message">{authError}</div>}

          <button type="submit" className="btn-primary btn-submit" disabled={loading}>
            {loading ? (mode === 'register' ? 'Creating account...' : 'Signing in...') : (mode === 'register' ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        <p className="form-info">
          {mode === 'register'
            ? 'Create an account and start tracking documents securely.'
            : 'Admin users can manage all documents. Regular users see only their own documents.'}
        </p>
      </div>
    </div>
  )
}

export default LoginForm
