import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Legend,
  Tooltip,
} from "chart.js";

// Register required Chart.js components
ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Legend,
  Tooltip
);

export function WorkoutMetricsChart({ metrics }) {
  if (!metrics) return null;

  const chartColors = {
    "Heart Rate": "red",
    Speed: "blue",
    Output: "green",
    Cadence: "gray",
    Resistance: "orange",
  };

  const chartDatasets = metrics.metrics.map((val) => ({
    label: val.display_name,
    data: val.values,
    borderColor: chartColors[val.display_name],
    borderWidth: 2,
    fill: false,
  }));

  const chartData = {
    labels: metrics.seconds_since_pedaling_start,
    datasets: chartDatasets,
  };

  const options = {
    plugins: {
      legend: {
        display: true,
      },
      tooltip: {
        enabled: true,
        //mode: "index",
        intersect: false,
        interaction: {
          mode: "nearest",
        },
        backgroundColor: "#9cbba1",
        callbacks: {
          // Customizing the tooltip content
          label: function (tooltipItem) {
            const datasetLabel = tooltipItem.dataset.label || "";
            const value = tooltipItem.raw;
            return `${datasetLabel}: ${value}`;
          },
          title: function (tooltipItem) {
            //const label = (tooltipItem[0].label / 60).toFixed(1);
            //return `${label || ""} minutes`;
            const labelMinutes = (tooltipItem[0].label / 60).toFixed(0);
            const labelSeconds = (tooltipItem[0].label % 60).toFixed(0);
            //console.log(tooltipItem);
            return `${labelMinutes || ""} minutes ${
              labelSeconds || ""
            } seconds`;
          },
        },
      },
    },
  };

  return <Line data={chartData} options={options} />;
}
