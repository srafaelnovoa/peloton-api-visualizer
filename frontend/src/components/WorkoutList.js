import Button from "react-bootstrap/Button";

export function WorkoutList({ workouts, onSelectWorkout }) {
  console.log("Workout Data:", workouts);
  if (workouts.length === 0) return null;
  return (
    <div className="mt-4 container">
      <h5 className="text-truncate text-center fw-bold fs-7">Cycling</h5>
      <ul className="list-unstyled">
        {workouts.map((workout) => {
          const title =
            workout.name === "Lanebreak Ride"
              ? workout?.ride?.title
              : workout?.peloton?.ride?.title;
          return (
            <li key={workout.id}>
              <Button
                onClick={() => onSelectWorkout(workout.id)}
                className="mb-1 btn btn-sm btn-primary w-100"
                style={{ minWidth: "100px" }}
              >
                {title || "Workout"}
              </Button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
