import Button from "react-bootstrap/Button";

export function WorkoutList({ workouts, onSelectWorkout }) {
  console.log("Workout Data:", workouts);
  if (workouts.length === 0) return null;
  return (
    <>
      <ul className="list-unstyled">
        {workouts.map((workout) => {
          const title =
            workout?.ride?.title /* LaneBreak rides */ ??
            workout?.peloton?.ride?.title /* Normal rides */ ??
            "Workout"; /* All other cases */
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
    </>
  );
}
