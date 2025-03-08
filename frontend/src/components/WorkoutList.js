import Button from "react-bootstrap/Button";

export function WorkoutList({ workouts, onSelectWorkout }) {
  console.log("Workout Data:", workouts);
  if (workouts.length === 0) return null;
  return (
    <div>
      <h3 className="mt-4 text-center">Cycling</h3>
      <ul>
        {workouts.map((workout) => {
          const title =
            workout.name === "Lanebreak Ride"
              ? workout?.ride?.title
              : workout?.peloton?.ride?.title;
          return (
            <li key={workout.id}>
              <Button
                onClick={() => onSelectWorkout(workout.id)}
                className="mb-1 text-blue-500 underline"
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
