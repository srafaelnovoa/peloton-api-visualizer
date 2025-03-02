export function UserInfo({ userData }) {
  if (!userData) return null;

  const workout_counts = userData.workout_counts
    .filter((val) => val.count > 0)
    .sort((a, b) => b.count - a.count);

  return (
    <div className="mt-4">
      <h3>{userData.username}</h3>
      <img src={userData.image_url} className="img-fluid" alt="User" />
      {workout_counts.map((workout) => (
        <div
          key={workout.name}
          className="d-flex justify-content-center align-items-center"
        >
          <img
            src={workout.icon_url}
            className="img-thumbnails"
            style={{ width: 100 }}
            alt="icon"
            id={`${workout.name}_icon`}
          />
          {workout.name} - {workout.count}
        </div>
      ))}
    </div>
  );
}
