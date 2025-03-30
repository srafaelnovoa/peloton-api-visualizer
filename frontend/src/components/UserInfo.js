import React from "react";
import { usePeloton } from "../contexts/PelotonContext";

export function UserInfo() {
  const { userData } = usePeloton();

  if (!userData) return null;

  const workout_counts = userData.workout_counts
    .filter((val) => val.count > 0)
    .sort((a, b) => b.count - a.count);

  return (
    <>
      <img
        src={userData.image_url}
        className="rounded img-fluid"
        alt="User"
        style={{ maxHeight: "200px" }}
      />
      <div className="overflow-auto border p-3" style={{ maxHeight: "300px" }}>
        <div className="d-flex justify-content-center flex-wrap">
          {workout_counts.map((workout) => (
            <div key={workout.name} className="align-items-center">
              <div className="px-1">
                <img
                  src={workout.icon_url}
                  className="w-100"
                  alt="icon"
                  id={`${workout.name}_icon`}
                  style={{ maxWidth: "2em" }}
                  title={workout.name}
                />
              </div>

              <div className="p-0  text-primary">{workout.count}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
