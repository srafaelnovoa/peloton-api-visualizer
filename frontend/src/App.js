import React, { useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

export default function PelotonDashboard() {
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [workouts, setWorkouts] = useState([]);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [metrics, setMetrics] = useState(null);

  const handleLogin = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth",
        { username_or_email: usernameOrEmail, password },
        { withCredentials: true } // Ensure credentials are included
      );
      console.log("Login successful", response.data);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const fetchWorkouts = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/workouts", {
        withCredentials: true, // Required for session persistence
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
        { withCredentials: true } // Required for authentication
      );
      setMetrics(response.data);
      setSelectedWorkout(workoutId);
    } catch (error) {
      console.error("Failed to fetch metrics", error);
    }
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <input
          type="text"
          placeholder="Username or Email"
          value={usernameOrEmail}
          onChange={(e) => setUsernameOrEmail(e.target.value)}
          className="border p-2 mr-2"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 mr-2"
        />
        <button
          onClick={handleLogin}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Login
        </button>
      </div>

      <button
        onClick={fetchWorkouts}
        className="bg-green-500 text-white px-4 py-2 rounded"
      >
        Fetch Workouts
      </button>

      <h2 className="mt-4">Workouts</h2>
      <ul>
        {workouts.map((workout) => (
          <li key={workout.id}>
            <button
              onClick={() => fetchMetrics(workout.id)}
              className="text-blue-500 underline"
            >
              {workout.name || "Workout"}
            </button>
          </li>
        ))}
      </ul>

      {metrics && (
        <div className="mt-4">
          <h2>Workout Metrics</h2>
          <Line
            data={{
              labels: metrics.seconds_since_start,
              datasets: [
                {
                  label: "Heart Rate",
                  //data: metrics.heart_rate,
                  data: metrics.metrics.find(
                    ({ display_name }) => display_name === "Heart Rate"
                  ).values,
                  borderColor: "red",
                  borderWidth: 2,
                  fill: false,
                },
                {
                  label: "Speed",
                  //data: metrics.speed,
                  data: metrics.metrics.find(
                    ({ display_name }) => display_name === "Speed"
                  ).values,
                  borderColor: "blue",
                  borderWidth: 2,
                  fill: false,
                },
                {
                  label: "Power",
                  //data: metrics.power,
                  data: metrics.metrics.find(
                    ({ display_name }) => display_name === "Output"
                  ).values,

                  borderColor: "green",
                  borderWidth: 2,
                  fill: false,
                },
              ],
            }}
          />
        </div>
      )}
    </div>
  );
}
