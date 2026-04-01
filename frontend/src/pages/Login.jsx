import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { BookOpen, AlertCircle } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(username, password, role);
      if (role === 'admin') navigate('/admin');
      else navigate('/student');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <BookOpen className="logo-icon" size={48} />
          <h1>Academic Repository</h1>
          <p>Login to access your structured academic history</p>
        </div>
        
        {error && (
          <div className="error-message">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Username (ID)</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required 
              placeholder="Enter your Student ID / Admin Username"
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              placeholder="••••••••"
            />
          </div>

          <div className="form-group">
            <label>Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="student">Student</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          <button type="submit" className="btn-primary login-btn">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
