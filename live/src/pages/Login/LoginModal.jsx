// LoginModal.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Divider, Input, Button, Spin, Tabs, message } from 'antd';
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import { FaGoogle } from 'react-icons/fa';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { googleLogin } from '../../helper/api_helper';
import { saveTokenToLocalStorage } from '../../redux/middleware';

const { TabPane } = Tabs;

const LoginModal = ({ onClose, onLoginSuccess, onSignupSuccess, verificationCode, productName }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const { isLogingIn } = useSelector((state) => state.authSlice);
  
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });
  
  const [signupForm, setSignupForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({});

  // Email validation
  const emailValidation = (value) => {
    const pattern = /^[a-z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return pattern.test(value);
  };

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!emailValidation(loginForm.email)) {
      setErrors({ ...errors, loginEmail: 'Invalid Email Id' });
      return;
    }
    
    setLoading(true);
    try {
      await dispatch({ type: "LOGIN", data: loginForm });
      message.success('Login successful!');
      onLoginSuccess();
    } catch (error) {
      message.error('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Handle signup
  const handleSignup = async (e) => {
    e.preventDefault();
    const newErrors = {};
    
    // Validation
    if (!signupForm.name) newErrors.name = 'Name is required';
    if (!signupForm.email) {
      newErrors.email = 'Email is required';
    } else if (!emailValidation(signupForm.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!signupForm.password) {
      newErrors.password = 'Password is required';
    } else if (signupForm.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (signupForm.password !== signupForm.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setLoading(true);
    try {
      await dispatch({ 
        type: "SIGNUP", 
        data: {
          name: signupForm.name,
          email: signupForm.email,
          phone: signupForm.phone,
          password: signupForm.password
        }
      });
      message.success('Account created successfully!');
      onSignupSuccess();
    } catch (error) {
      message.error('Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Google login success
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      const response = await googleLogin({ token: credentialResponse.credential });
      
      if (response.success) {
        saveTokenToLocalStorage(response.token);
        dispatch({ type: "LOGIN_SUCCESS", payload: response.user });
        message.success('Google login successful!');
        onLoginSuccess();
      }
    } catch (error) {
      message.error('Google login failed');
    }
  };

  const handleGoogleError = () => {
    message.error('Google login failed');
  };

  return (
    <div className="login-modal-wrapper">
      <Spin spinning={loading || isLogingIn}>
        <div className="p-6">
          {/* Product info banner */}
          {productName && (
            <div 
              className="mb-6 p-4 rounded-lg"
              style={{ 
                backgroundColor: '#fdf6e3',
                border: '1px solid #f2c41a'
              }}
            >
              <div className="flex items-center gap-3">
                <div className="text-amber-600">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    Activating warranty for: <span className="font-bold">{productName}</span>
                  </p>
                  {verificationCode && (
                    <p className="text-xs text-gray-600 mt-1">
                      Code: <code className="font-mono bg-gray-100 px-2 py-1 rounded">{verificationCode}</code>
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab}
            centered
            className="mb-6"
          >
            <TabPane tab="Login" key="login">
              <form onSubmit={handleLogin}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 mb-2 text-sm font-medium">
                      Email Address
                    </label>
                    <Input
                      size="large"
                      placeholder="Enter your email"
                      prefix={<MailOutlined className="text-gray-400" />}
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      required
                      className="w-full"
                    />
                    {errors.loginEmail && (
                      <p className="text-red-500 text-xs mt-1">{errors.loginEmail}</p>
                    )}
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-gray-700 text-sm font-medium">
                        Password
                      </label>
                      <button
                        type="button"
                        className="text-xs text-blue-600 hover:text-blue-800"
                        onClick={() => {
                          onClose();
                          navigate('/forget-password');
                        }}
                      >
                        Forgot password?
                      </button>
                    </div>
                    <Input.Password
                      size="large"
                      placeholder="Enter your password"
                      prefix={<LockOutlined className="text-gray-400" />}
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      required
                      className="w-full"
                    />
                  </div>
                  
                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    size="large"
                    loading={isLogingIn}
                    style={{
                      backgroundColor: '#f2c41a',
                      borderColor: '#f2c41a',
                      borderRadius: '8px',
                      height: '44px',
                      fontWeight: 600
                    }}
                  >
                    Login
                  </Button>
                </div>
              </form>
            </TabPane>
            
            <TabPane tab="Sign Up" key="signup">
              <form onSubmit={handleSignup}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 mb-2 text-sm font-medium">
                      Full Name
                    </label>
                    <Input
                      size="large"
                      placeholder="Enter your full name"
                      prefix={<UserOutlined className="text-gray-400" />}
                      value={signupForm.name}
                      onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                      required
                      className="w-full"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-2 text-sm font-medium">
                      Email Address
                    </label>
                    <Input
                      size="large"
                      placeholder="Enter your email"
                      prefix={<MailOutlined className="text-gray-400" />}
                      value={signupForm.email}
                      onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                      required
                      className="w-full"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-2 text-sm font-medium">
                      Phone Number (Optional)
                    </label>
                    <Input
                      size="large"
                      placeholder="Enter your phone number"
                      prefix={<PhoneOutlined className="text-gray-400" />}
                      value={signupForm.phone}
                      onChange={(e) => setSignupForm({ ...signupForm, phone: e.target.value })}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-2 text-sm font-medium">
                      Password
                    </label>
                    <Input.Password
                      size="large"
                      placeholder="Create a password"
                      prefix={<LockOutlined className="text-gray-400" />}
                      value={signupForm.password}
                      onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                      required
                      className="w-full"
                    />
                    {errors.password && (
                      <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-2 text-sm font-medium">
                      Confirm Password
                    </label>
                    <Input.Password
                      size="large"
                      placeholder="Confirm your password"
                      prefix={<LockOutlined className="text-gray-400" />}
                      value={signupForm.confirmPassword}
                      onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                      required
                      className="w-full"
                    />
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                    )}
                  </div>
                  
                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    size="large"
                    loading={loading}
                    style={{
                      backgroundColor: '#f2c41a',
                      borderColor: '#f2c41a',
                      borderRadius: '8px',
                      height: '44px',
                      fontWeight: 600
                    }}
                  >
                    Create Account
                  </Button>
                </div>
              </form>
            </TabPane>
          </Tabs>
          
          <Divider>Or continue with</Divider>
          
          <div className="flex justify-center mb-4">
            <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap
                theme="filled_blue"
                size="large"
                text="signin_with"
                shape="rectangular"
                logo_alignment="left"
                width="100%"
              />
            </GoogleOAuthProvider>
          </div>
          
          <div className="text-center mt-6 pt-6 border-t border-gray-200">
            <p className="text-gray-600 text-sm">
              {activeTab === 'login' ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                className="text-blue-600 hover:text-blue-800 font-medium"
                onClick={() => setActiveTab(activeTab === 'login' ? 'signup' : 'login')}
              >
                {activeTab === 'login' ? 'Sign up here' : 'Login here'}
              </button>
            </p>
          </div>
          
          <div className="text-center mt-4">
            <button
              type="button"
              className="inline-flex items-center text-gray-500 hover:text-gray-700 text-sm"
              onClick={onClose}
            >
              <ArrowLeftOutlined className="mr-2" />
              Back to warranty activation
            </button>
          </div>
        </div>
      </Spin>
    </div>
  );
};

export default LoginModal;