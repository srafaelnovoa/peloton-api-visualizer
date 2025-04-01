import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Helper to get token from localStorage
const getToken = () => localStorage.getItem("auth_token");

// Helper to set token in localStorage
const setToken = (token) => {
  if (token) {
    localStorage.setItem("auth_token", token);
  } else {
    localStorage.removeItem("auth_token");
  }
};

// Helper to add token to requests
const addAuthHeader = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export function useAuth() {
  const [userData, setUserData] = useState(null);
  const [loginError, setLoginError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkAuthStatus = async () => {
    try {
      const token = getToken();

      const response = await axios.get(`${API_BASE_URL}/api/check-auth`, {
        withCredentials: true,
        headers: {
          ...addAuthHeader(),
        },
      });

      if (response.data.isAuthenticated) {
        setIsAuthenticated(true);

        // If we have a userId but no userData, fetch the user data
        if (response.data.userId && !userData) {
          try {
            const userResponse = await axios.get(
              `${API_BASE_URL}/api/user-data`,
              {
                withCredentials: true,
                headers: {
                  ...addAuthHeader(),
                },
              }
            );
            setUserData(userResponse.data);
          } catch (userError) {
            console.error("Failed to fetch user data:", userError);
            setIsAuthenticated(false);
          }
        }
      } else {
        // If server reports not authenticated, clear everything
        setIsAuthenticated(false);
        setUserData(null);
        setToken(null); // Clear the token
      }
    } catch (error) {
      console.error("Auth check failed", error);
      setIsAuthenticated(false);
      setUserData(null);
    }
  };

  // Check auth status when the component mounts
  useEffect(() => {
    const token = getToken();
    if (token) {
      checkAuthStatus();
    }
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

      // Check if we received a token and user data
      if (response.data && response.data.username && response.data.token) {
        // Save the token
        setToken(response.data.token);

        // Save user data
        const userDataWithoutToken = { ...response.data };
        delete userDataWithoutToken.token; // Don't store token in state

        setUserData(userDataWithoutToken);
        setIsAuthenticated(true);

        // Trigger a session call to ensure Safari saves cookies
        await axios.get(`${API_BASE_URL}/api/session-keepalive`, {
          withCredentials: true,
          headers: {
            ...addAuthHeader(),
          },
        });

        // Verify authentication status
        await axios.get(`${API_BASE_URL}/api/check-auth`, {
          withCredentials: true,
          headers: {
            ...addAuthHeader(),
          },
        });

        setLoading(false);
        return true;
      } else {
        throw new Error("Invalid user data or missing token");
      }
    } catch (error) {
      console.error("Login failed", error);
      setLoginError(
        error.response?.data?.error || "Login failed. Please try again."
      );

      // Reset auth state
      setIsAuthenticated(false);
      setUserData(null);
      setToken(null); // Clear token on failed login

      setLoading(false);
      return false;
    }
  };

  const handleLogout = () => {
    // Clear all auth data
    setIsAuthenticated(false);
    setUserData(null);
    setToken(null);
  };

  // Create a combined authentication check
  const isValidAuth = isAuthenticated && userData !== null;

  return {
    userData,
    isLoggedIn: isValidAuth,
    handleLogin,
    handleLogout, // Added logout function
    loginError,
    loading,
    checkAuthStatus,
    getAuthHeaders: addAuthHeader, // Expose for other hooks to use
  };
}
