import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Axios default configuration
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
axios.defaults.withCredentials = true;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }

      try {
        // Try buyer auth first, if fails try seller auth
        let res;
        try {
          res = await axios.get('/auth/me');
          if (res.data && res.data._id) {
            setUser(res.data);
          }
        } catch (buyerErr) {
          // If buyer auth fails, try seller profile
          res = await axios.get('/seller-auth/profile');
          if (res.data && res.data.success) {
            setUser({ ...res.data.data, role: 'seller' });
          }
        }
      } catch (err) {
        console.log('Not authenticated');
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await axios.post('/auth/login', { email, password });
      const { user, token } = res.data;
      setUser(user);
      if (token) {
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
      return { success: true, role: user.role };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Login failed' };
    }
  };

  const sellerLogin = async (email, password) => {
    try {
      const res = await axios.post('/seller-auth/login', { email, password });
      const { seller, token } = res.data.data;
      
      // Use 'seller' as the role for independent businesses
      const sellerWithRole = { ...seller, role: 'seller' };
      setUser(sellerWithRole);
      
      // Store token
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return { success: true, role: 'seller' };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Seller login failed' };
    }
  };

  const register = async (userData) => {
    try {
      const res = await axios.post('/auth/register', userData);
      const { user, token } = res.data;
      setUser(user);
      if (token) {
        localStorage.setItem('token', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
      return { success: true, role: user.role };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Registration failed' };
    }
  };

  const sellerRegister = async (userData) => {
    try {
      // Inject dummy data for required model fields not collected in the simplified UI
      const fullUserData = {
        ownerName: userData.name,
        businessName: userData.studioName,
        email: userData.email,
        password: userData.password,
        phone: '0000000000', // Mock phone
        panNumber: 'ABCDE1234F', // Mock PAN
        businessAddress: {
          street: 'Mock Street',
          city: 'Mock City',
          state: 'Mock State',
          pincode: '000000'
        },
        bankDetails: {
          accountNumber: '0000000000',
          ifscCode: 'MOCK0000123',
          bankName: 'Mock Bank',
          accountHolderName: userData.name
        }
      };

      const res = await axios.post('/seller-auth/register', fullUserData);
      const { seller, token } = res.data.data;
      
      const sellerWithRole = { ...seller, role: 'seller' };
      setUser(sellerWithRole);
      
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return { success: true, role: 'seller' };
    } catch (err) {
      console.error('Registration error:', err.response?.data);
      return { success: false, error: err.response?.data?.message || 'Seller registration failed' };
    }
  };

  const googleLogin = async (token, role) => {
    try {
      const res = await axios.post('/auth/google', { token, role });
      const { user, token: jwtToken } = res.data;
      setUser(user);
      if (jwtToken) {
        localStorage.setItem('token', jwtToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;
      }
      return { success: true, role: user.role };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Google Auth failed' };
    }
  };

  const logout = async () => {
    try {
      await axios.get('/auth/logout');
      setUser(null);
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, sellerLogin, register, sellerRegister, googleLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
