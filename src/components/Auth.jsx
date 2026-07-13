import React, { useState } from 'react';
import { BookOpen, Lock, User, Sparkles, BookMarked } from 'lucide-react';
import { loginUser, registerUser } from '../storage';

export default function Auth({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }

    if (password.length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }

    if (!isLogin) {
      if (password !== confirmPassword) {
        setError('Passwords do not match!');
        return;
      }

      const res = registerUser(username, password);
      if (res.success) {
        setSuccessMsg('Account created successfully! You can now log in.');
        setIsLogin(true);
        setUsername(username);
        setPassword('');
        setConfirmPassword('');
      } else {
        setError(res.message);
      }
    } else {
      const res = loginUser(username, password);
      if (res.success) {
        onLoginSuccess(res.username);
      } else {
        setError(res.message);
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* App Logo/Header */}
        <div className="auth-header">
          <div className="auth-logo-bg">
            <BookMarked className="auth-logo-icon" size={36} />
          </div>
          <h1>BookMatch</h1>
          <p className="auth-tagline">
            Find your next literary obsession. Swipe, match, and read.
          </p>
        </div>

        {/* Auth Toggle Tabs */}
        <div className="auth-tabs">
          <button 
            type="button"
            className={`auth-tab-btn ${isLogin ? 'active' : ''}`}
            onClick={() => { setIsLogin(true); setError(''); setSuccessMsg(''); }}
          >
            Login
          </button>
          <button 
            type="button"
            className={`auth-tab-btn ${!isLogin ? 'active' : ''}`}
            onClick={() => { setIsLogin(false); setError(''); setSuccessMsg(''); }}
          >
            Sign Up
          </button>
        </div>

        {/* Feedback Messages */}
        {error && <div className="auth-message error">{error}</div>}
        {successMsg && <div className="auth-message success">{successMsg}</div>}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <div className="input-wrapper">
              <User className="input-icon" size={18} />
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                maxLength={15}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
            </div>
          </div>

          {!isLogin && (
            <div className="form-group animate-slide-in">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={18} />
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  required
                />
              </div>
            </div>
          )}

          <button type="submit" className="auth-submit-btn">
            {isLogin ? 'Sign In' : 'Create Account'}
            <Sparkles className="btn-icon-right" size={18} />
          </button>
        </form>

        <div className="auth-footer">
          {isLogin ? (
            <p>
              New here?{' '}
              <button 
                type="button" 
                className="auth-link-btn" 
                onClick={() => { setIsLogin(false); setError(''); setSuccessMsg(''); }}
              >
                Create a new account
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button 
                type="button" 
                className="auth-link-btn" 
                onClick={() => { setIsLogin(true); setError(''); setSuccessMsg(''); }}
              >
                Sign in instead
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
