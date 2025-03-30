import React, { createContext, useState, useContext } from "react";
import { useAuth } from "../hooks/useAuth";
import { useWorkouts } from "../hooks/useWorkouts";

const PelotonContext = createContext();

export const usePeloton = () => useContext(PelotonContext);

export function PelotonDashboardProvider({ children }) {
  const { userData, isLoggedIn, handleLogin, loginError } = useAuth();
  const {
    workouts,
    selectedWorkout,
    metrics,
    fetchWorkouts,
    fetchMetrics,
    setSelectedWorkout,
  } = useWorkouts();

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
  };

  return (
    <PelotonContext.Provider value={value}>{children}</PelotonContext.Provider>
  );
}
