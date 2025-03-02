import Button from "react-bootstrap/Button";

export function WorkoutList({ workouts, onSelectWorkout }) {
  return (
    <div>
      <h3 className="mt-4 text-center">Cycling</h3>
      <ul>
        {workouts.map((workout) => (
          <li key={workout.id}>
            <Button
              onClick={() => onSelectWorkout(workout.id)}
              className="mb-1 text-blue-500 underline"
            >
              {workout.peloton.ride.title || "Workout"}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
