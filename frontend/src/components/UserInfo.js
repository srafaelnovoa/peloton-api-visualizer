export function UserInfo({ userData }) {
  if (!userData) return null;

  const workout_counts = userData.workout_counts
    .filter((val) => val.count > 0)
    .sort((a, b) => b.count - a.count);

  return (
    <>
      <img src={userData.image_url} className="img-fluid" alt="User" />
      <div
        className="mt-3 overflow-auto border p-3"
        style={{ maxHeight: "300px" }}
      >
        {workout_counts.map((workout) => (
          <div key={workout.name} className="row align-items-center">
            <div className="col-5">
              <img
                src={workout.icon_url}
                className="w-100"
                alt="icon"
                id={`${workout.name}_icon`}
                //style={{ maxWidth: "100%", height: "auto" }}
              />
            </div>
            <div className="col-7">
              <div className="row pt-2">{workout.name}</div>
              <div className="row pb-2">{workout.count}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
