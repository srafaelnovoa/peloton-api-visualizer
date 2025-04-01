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

        // If we have a userId but no userData, fetch the user data
        if (response.data.userId && !userData) {
          try {
            const userResponse = await axios.get(
              `${API_BASE_URL}/api/user-data`, // You'll need to add this endpoint to your backend
              { withCredentials: true }
            );
            setUserData(userResponse.data);
          } catch (userError) {
            console.error("Failed to fetch user data:", userError);
            // If we can't get user data, we're not really authenticated
            setIsAuthenticated(false);
          }
        }
      } else {
        // Make sure we clear both states if not authenticated
        setIsAuthenticated(false);
        setUserData(null);
      }
    } catch (error) {
      console.error("Auth check failed", error);
      setIsAuthenticated(false);
      setUserData(null);
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

      // Only set both of these if we have valid user data
      if (response.data && response.data.username) {
        setUserData(response.data);
        setIsAuthenticated(true);
      } else {
        // If response doesn't have expected user data, consider it a failure
        throw new Error("Invalid user data received");
      }

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

      // Ensure authentication states are reset on failure
      setIsAuthenticated(false);
      setUserData(null);

      setLoading(false);
      return false;
    }
  };

  // Create a combined authentication check
  const isValidAuth = isAuthenticated && userData !== null;

  return {
    userData,
    isLoggedIn: isValidAuth, // Use the combined check
    handleLogin,
    loginError,
    loading,
    checkAuthStatus,
  };
}
