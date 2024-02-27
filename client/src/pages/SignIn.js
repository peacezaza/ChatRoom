import React, { useState } from 'react';
import axios from "axios";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook } from '@fortawesome/free-brands-svg-icons';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
// Consider grouping the import statements to enhance readability
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import './SignIn.css';

function LoginPage() {
  // State variables initialization
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [forgotPasswordClicked, setForgotPasswordClicked] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State for showing password
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // Function to toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // sleep function
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Function to handle login action
  const handleLogin = async (e) => {
    e.preventDefault();
    // Implement your login logic here
    console.log('Logging in with:', { username, password, rememberMe });
    // password = password.toString()
    try {
      const response = await axios.post('http://127.0.0.1:5000/login', {username , password});
      if (response.status === 201) {
          console.log('login successfully');
          setIsPopupOpen(true);
          await sleep(3000)
          setIsPopupOpen(false)

      } else {
          console.error('Failed to login');
          await sleep(5000)
      }
  }
catch (error) {
    console.error('Error adding product:', error);
}
  };

  // Function to handle forgot password action
  const handleForgotPassword = () => {
    // Implement your forgot password logic here
    console.log('Forgot Password clicked');
    setForgotPasswordClicked(true);
  };

  return (
    <div className="container">
      {/* Login form */}
      <div className="head">
        <h2>Sign In</h2>
      </div>
      <form onSubmit={handleLogin}>
        {/* Username Input */}
        <label className="input-label">
          Username or Email
        </label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="input-field"
        />
        {/* Password Input */}
        <label className="input-label">
          Password
        </label>
        <div className="password-input">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
          />
            {/* Toggle password visibility */}
            <FontAwesomeIcon
              icon={showPassword ? faEyeSlash : faEye}
              className="password-icon"
              onClick={togglePasswordVisibility}
            />
        </div>
        {/* Remember me and Forgot Password */}
        <div className="form-row">
          <label className="remember-me">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            Remember me
          </label>
          {/* Forgot password link */}
          <a className="forgot-password" onClick={handleForgotPassword}>Forgot Password</a>
        </div>
        {/* Login Button */}
        <button type="submit">Sign in</button>
      </form>
      {/* Divider */}
      <div className="line">
        <hr className="divider" />
        <span className="or-text">OR</span>
        <hr className="divider" />
      </div>
      {/* Social media login options */}
      <div className="social-icons">
        <a href="#">
          <FontAwesomeIcon icon={faFacebook} className="facebook-icon" />
        </a>
        <a href="#">
          <FontAwesomeIcon icon={faGoogle} className="google-icon" />
        </a>
      </div>
      {/* Pop-up for successful login */}
      <Popup open={isPopupOpen} closeOnDocumentClick >
        <div className="popup-content">
          <p>Login successful!</p>
        </div>
      </Popup>

    </div>
  );
}

export default LoginPage;
