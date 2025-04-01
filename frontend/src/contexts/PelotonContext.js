import React, { createContext, useState, useContext, useCallback } from "react";
import { useAuth } from "../hooks/useAuth";
import { useWorkouts } from "../hooks/useWorkouts";

const PelotonContext = createContext();

export const usePeloton = () => useContext(PelotonContext);

export function PelotonDashboardProvider({ children }) {
  const { userData, isLoggedIn, handleLogin, loginError, checkAuthStatus } =
    useAuth();
  const {
    workouts,
    selectedWorkout,
    metrics,
    fetchWorkouts: originalFetchWorkouts,
    fetchMetrics,
    setSelectedWorkout,
    loading: workoutsLoading,
    error: workoutsError,
  } = useWorkouts();

  // Error state for the entire context
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Wrap fetchWorkouts to handle authentication issues
  const fetchWorkouts = useCallback(async () => {
    // Only proceed if the user is properly authenticated
    if (!isLoggedIn || !userData) {
      setError("Authentication required. Please log in.");
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      // Run a quick auth check before fetching workouts
      await checkAuthStatus();

      const result = await originalFetchWorkouts();
      setLoading(false);
      return result;
    } catch (err) {
      console.error("Error fetching workouts:", err);
      setError("Failed to load workouts. Please try again.");
      setLoading(false);
      return [];
    }
  }, [isLoggedIn, userData, originalFetchWorkouts, checkAuthStatus]);

  const value = {
    userData,
    isLoggedIn,
    handleLogin,
    loginError,
    workouts,
    selectedWorkout,
    metrics,
    fetchWorkouts,
    fetchMetrics,
    setSelectedWorkout,
    loading: loading || workoutsLoading,
    error: error || workoutsError,
  };

  return (
    <PelotonContext.Provider value={value}>{children}</PelotonContext.Provider>
  );
}
