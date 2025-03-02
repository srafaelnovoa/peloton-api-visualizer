import { Line } from "react-chartjs-2";

export function WorkoutMetricsChart({ metrics }) {
  if (!metrics) return null;

  return (
    <div className="mt-4">
      <h2>Workout Metrics</h2>
      <Line
        data={{
          labels: metrics.seconds_since_pedaling_start,
          datasets: [
            {
              label: "Heart Rate",
              data: metrics.heart_rate,
              borderColor: "red",
              borderWidth: 2,
              fill: false,
            },
            {
              label: "Speed",
              data: metrics.speed,
              borderColor: "blue",
              borderWidth: 2,
              fill: false,
            },
            {
              label: "Power",
              data: metrics.power,
              borderColor: "green",
              borderWidth: 2,
              fill: false,
            },
          ],
        }}
      />
    </div>
  );
}
