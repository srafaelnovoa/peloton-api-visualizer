import React, { useEffect, useState } from "react";
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
  const [isInitialLoading, setIsInitialLoading] = useState(false);

  useEffect(() => {
    const loadWorkouts = async () => {
      if (isLoggedIn && userData) {
        // Set local loading state
        setIsInitialLoading(true);

        // Add a delay to ensure cookies are properly set
        await new Promise((resolve) => setTimeout(resolve, 1000));

        try {
          await fetchWorkouts();
        } catch (err) {
          console.error("Error loading workouts after delay:", err);
        } finally {
          setIsInitialLoading(false);
        }
      }
    };

    loadWorkouts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, userData]);

  if (loading || isInitialLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorAlert message={error} />;
  }

  if (!isLoggedIn || !userData) {
    return (
      <div className="container flex-grow-1 d-flex flex-column align-items-center justify-content-center">
        <LoginForm />
      </div>
    );
  }

  return (
    <div className="container flex-grow-1 d-flex flex-column align-items-center justify-content-center">
      <div className="w-100 text-center">
        <div className="row">
          <div className="col-md-2 p-0">
            <div className="container p-0">
              <h5 className="text-truncate text-center fw-bold fs-7">
                {userData.username}
              </h5>
              <UserInfo />
            </div>
          </div>
          <div className="col-md-2 px-2">
            <div className="container p-0">
              <h5 className="text-truncate text-center fw-bold fs-7">
                Cycling
              </h5>
              <WorkoutList />
            </div>
          </div>
          <div className="col-md-8 p-0">
            <div className="container p-0">
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
    </div>
  );
}
