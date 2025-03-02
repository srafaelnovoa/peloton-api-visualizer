import Button from "react-bootstrap/Button";

export function WorkoutList({ workouts, onSelectWorkout }) {
  return (
    <div>
      <h2 className="mt-4">Workouts</h2>
      <ul>
        {workouts.map((workout) => (
          <li key={workout.id}>
            <Button
              onClick={() => onSelectWorkout(workout.id)}
              className="text-blue-500 underline"
            >
              {workout.peloton.ride.title || "Workout"}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
