import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export function useAuth() {
  const [userData, setUserData] = useState(null);
  const [loginError, setLoginError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/check-auth`, {
        withCredentials: true,
      });

      if (response.data.isAuthenticated) {
        setIsAuthenticated(true);
        // Optionally fetch user data if needed
      }
    } catch (error) {
      console.error("Auth check failed", error);
    }
  };

  // Check auth status when the component mounts
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const handleLogin = async (usernameOrEmail, password) => {
    try {
      setLoading(true);
      setLoginError(null);

      const response = await axios.post(
        `${API_BASE_URL}/api/auth`,
        { username_or_email: usernameOrEmail, password },
        { withCredentials: true }
      );

      setUserData(response.data);
      setIsAuthenticated(true);

      // 🔹 Trigger a session call to ensure Safari saves cookies
      await axios.get(`${API_BASE_URL}/api/session-keepalive`, {
        withCredentials: true,
      });

      await axios.get(`${API_BASE_URL}/api/check-auth`, {
        withCredentials: true,
      });

      setLoading(false);
      return true;
    } catch (error) {
      console.error("Login failed", error);
      setLoginError(
        error.response?.data?.message || "Login failed. Please try again."
      );
      setLoading(false);
      return false;
    }
  };

  return {
    userData,
    isLoggedIn: isAuthenticated,
    handleLogin,
    loginError,
    loading,
    checkAuthStatus,
  };
}
