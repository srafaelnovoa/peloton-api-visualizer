import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export function useWorkouts(checkAuthStatus) {
  const [workouts, setWorkouts] = useState([]);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [authError, setAuthError] = useState(false);

  const fetchWorkouts = async () => {
    try {
      setLoading(true);
      setError(null);
      setAuthError(false);

      if (checkAuthStatus) {
        await checkAuthStatus();
      }

      const response = await axios.get(`${API_BASE_URL}/api/workouts`, {
        withCredentials: true,
      });

      const workoutsData = response.data.data;
      const workoutsCycling = workoutsData.filter(
        ({ fitness_discipline }) => fitness_discipline === "cycling"
      );

      setWorkouts(workoutsCycling);
      setLoading(false);
      return workoutsCycling;
    } catch (error) {
      console.error("Failed to fetch workouts", error);

      if (error.response && error.response.status === 401) {
        setAuthError(true);
      }

      setError("Failed to fetch workouts. Please try again.");
      setLoading(false);
      return [];
    }
  };

  const fetchMetrics = async (workoutId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(
        `${API_BASE_URL}/api/workout/${workoutId}/metrics`,
        { withCredentials: true }
      );

      setMetrics(response.data);

      // Find the selected workout and format its date
      const workout = workouts.find(({ id }) => id === workoutId);
      if (workout) {
        const formattedWorkout = {
          ...workout,
          workoutDate: new Date(workout.created_at * 1000).toDateString(),
        };
        setSelectedWorkout(formattedWorkout);
      }

      setLoading(false);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch metrics", error);
      setError("Failed to fetch workout metrics. Please try again.");
      setLoading(false);
      return null;
    }
  };

  return {
    workouts,
    selectedWorkout,
    metrics,
    loading,
    error,
    authError,
    fetchWorkouts,
    fetchMetrics,
    setSelectedWorkout,
  };
}
