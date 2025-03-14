// App.js (Updated with Header, Footer, and Centered Layout)
import React, { useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import LoginForm from "./components/LoginForm";
import { UserInfo } from "./components/UserInfo";
import { WorkoutList } from "./components/WorkoutList";
import { WorkoutMetricsChart } from "./components/WorkoutMetricsChart";

function Header() {
  return (
    <header className="bg-dark text-white text-center py-3">
      <h1>Peloton Dashboard</h1>
    </header>
  );
}

function Footer() {
  return (
    <footer className="bg-dark text-white text-center py-3 mt-4">
      <p>&copy; 2025 Peloton Dashboard. All rights reserved.</p>
    </footer>
  );
}

export default function PelotonDashboard() {
  const [userData, setUserData] = useState(null);
  const [workouts, setWorkouts] = useState([]);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [metrics, setMetrics] = useState(null);

  const handleLogin = async (usernameOrEmail, password) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth",
        { username_or_email: usernameOrEmail, password },
        { withCredentials: true }
      );
      setUserData(response.data);
      fetchWorkouts();
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const fetchWorkouts = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/workouts", {
        withCredentials: true,
      });
      let workoutsData = response.data.data;
      let workoutsCycling = workoutsData.filter(
        ({ fitness_discipline }) => fitness_discipline === "cycling"
      );
      setWorkouts(workoutsCycling);
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
      setMetrics(response.data);
      let workout = workouts.find(({ id }) => id === workoutId);
      workout["workoutDate"] = new Date(
        selectedWorkout.created_at * 1000
      ).toDateString();
      setSelectedWorkout(workout);
    } catch (error) {
      console.error("Failed to fetch metrics", error);
    }
  };

  return (
    <div className="bg-light min-vh-100 d-flex flex-column">
      <Header />
      <div className="container flex-grow-1 d-flex flex-column align-items-center justify-content-center">
        {!userData ? (
          <LoginForm onLogin={handleLogin} />
        ) : (
          <div className="w-100 text-center">
            <div className="row">
              <div className="col-2">
                <div className="mt-4 container">
                  <h5 className="text-truncate text-center fw-bold fs-7">
                    {userData.username}
                  </h5>
                  <UserInfo userData={userData} />
                </div>
              </div>
              <div className="col-2">
                <div className="mt-4 container">
                  <h5 className="text-truncate text-center fw-bold fs-7">
                    Cycling
                  </h5>
                  <WorkoutList
                    workouts={workouts}
                    onSelectWorkout={fetchMetrics}
                  />
                </div>
              </div>
              <div className="col-8">
                <div className="mt-4 container">
                  <h5 className="text-truncate text-center fw-bold fs-7">
                    Workout Metrics - {selectedWorkout.workoutDate}
                  </h5>
                  <WorkoutMetricsChart metrics={metrics} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
