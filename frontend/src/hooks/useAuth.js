import { useState } from "react";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export function useAuth() {
  const [userData, setUserData] = useState(null);
  const [loginError, setLoginError] = useState(null);
  const [loading, setLoading] = useState(false);

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
    isLoggedIn: !!userData,
    handleLogin,
    loginError,
    loading,
  };
}
