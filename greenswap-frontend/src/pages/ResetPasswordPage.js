import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import axios from 'axios';


const ResetPasswordPage = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const Navigate = useNavigate();
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const res = await axios.post('http://localhost:8000/api/auth/reset-password/', { email });
      setMessage('Token has been sent to your email.');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to send reset email.');
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      const res = await axios.patch('http://localhost:8000/api/auth/reset-password/', {
        token,
        password,
        confirm_password: confirmPassword,
        email,
      });
      setMessage('Password has been reset successfully.');
      alert('Password reset successful! You can now log in with your new password.');
      Navigate('/auth'); // Redirect to login page
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to reset password.');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: 'auto', padding: '2rem' }}>
      <h2>Reset Password</h2>

      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {step === 1 ? (
        <form onSubmit={handleEmailSubmit}>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem', margin: '0.5rem 0' }}
          />
          <button type="submit" style={{ padding: '0.5rem', width: '100%' }}>
            Send Reset Token
          </button>
        </form>
      ) : (
        <form onSubmit={handlePasswordReset}>
            <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem', margin: '0.5rem 0' }}
          />
          <label>Token:</label>
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem' }}
          />

          <label>New Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem' }}
          />

          <label>Confirm Password:</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem' }}
          />

          <button type="submit" style={{ padding: '0.5rem', width: '100%' }}>
            Reset Password
          </button>
        </form>
      )}
    </div>
  );
};

export default ResetPasswordPage;
