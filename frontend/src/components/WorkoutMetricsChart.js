import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
} from "chart.js";

// Register required Chart.js components
ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

export function WorkoutMetricsChart({ metrics, selectedWorkout }) {
  if (!metrics) return null;
  const workoutDate = new Date(
    selectedWorkout.created_at * 1000
  ).toDateString();

  const chartData = {
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
  };

  return (
    <div className="mt-4">
      <h2>Workout Metrics - {workoutDate}</h2>
      <Line data={chartData} />
    </div>
  );
}
