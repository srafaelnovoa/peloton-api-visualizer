import React, { useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import LoginForm from "./components/LoginForm";
import { UserInfo } from "./components/UserInfo";
import { WorkoutList } from "./components/WorkoutList";
import { WorkoutMetricsChart } from "./components/WorkoutMetricsChart";
import Button from "react-bootstrap/Button";

export default function PelotonDashboard() {
  const [userData, setUserData] = useState(null);
  const [workouts, setWorkouts] = useState([]);
  const [metrics, setMetrics] = useState(null);

  const handleLogin = async (usernameOrEmail, password) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth",
        { username_or_email: usernameOrEmail, password },
        { withCredentials: true }
      );
      setUserData(response.data);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const fetchWorkouts = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/workouts", {
        withCredentials: true,
      });
      setWorkouts(response.data.data);
    } catch (error) {
      console.error("Failed to fetch workouts", error);
    }
  };

  const fetchMetrics = async (workoutId) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/workout/${workoutId}/metrics`,
        { withCredentials: true }
      );
      let metrics = response.data;
      metrics.heart_rate =
        metrics.metrics.find(
          ({ display_name }) => display_name === "Heart Rate"
        )?.values || [];
      metrics.speed =
        metrics.metrics.find(({ display_name }) => display_name === "Speed")
          ?.values || [];
      metrics.power =
        metrics.metrics.find(({ display_name }) => display_name === "Output")
          ?.values || [];
      setMetrics(metrics);
    } catch (error) {
      console.error("Failed to fetch metrics", error);
    }
  };

  return (
    <div className="p-4">
      <LoginForm onLogin={handleLogin} />
      <UserInfo userData={userData} />
      <Button
        onClick={fetchWorkouts}
        className="bg-green-500 text-white px-4 py-2 rounded"
      >
        Fetch Workouts
      </Button>
      <WorkoutList workouts={workouts} onSelectWorkout={fetchMetrics} />
      <WorkoutMetricsChart metrics={metrics} />
    </div>
  );
}
