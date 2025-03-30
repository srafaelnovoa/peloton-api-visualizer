import React, { useEffect } from "react";
import LoginForm from "./LoginForm";
import { UserInfo } from "./UserInfo";
import { WorkoutList } from "./WorkoutList";
import { WorkoutMetricsChart } from "./WorkoutMetricsChart";
import { usePeloton } from "../contexts/PelotonContext";
import LoadingSpinner from "./LoadingSpinner";
import ErrorAlert from "./ErrorAlert";

export default function Dashboard() {
  const {
    isLoggedIn,
    userData,
    selectedWorkout,
    fetchWorkouts,
    loading,
    error,
  } = usePeloton();

  useEffect(() => {
    if (isLoggedIn) {
      fetchWorkouts();
    }
  }, [isLoggedIn]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorAlert message={error} />;
  }

  return (
    <div className="container flex-grow-1 d-flex flex-column align-items-center justify-content-center">
      {!isLoggedIn ? (
        <LoginForm />
      ) : (
        <div className="w-100 text-center">
          <div className="row">
            <div className="col-md-2">
              <div className="container">
                <h5 className="text-truncate text-center fw-bold fs-7">
                  {userData.username}
                </h5>
                <UserInfo />
              </div>
            </div>
            <div className="col-md-2">
              <div className="container">
                <h5 className="text-truncate text-center fw-bold fs-7">
                  Cycling
                </h5>
                <WorkoutList />
              </div>
            </div>
            <div className="col-md-8">
              <div className="container">
                {selectedWorkout ? (
                  <>
                    <h5 className="text-truncate text-center fw-bold fs-7">
                      Workout Metrics - {selectedWorkout.workoutDate}
                    </h5>
                    <WorkoutMetricsChart />
                  </>
                ) : (
                  <div className="alert alert-info">
                    Select a workout to view metrics
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
