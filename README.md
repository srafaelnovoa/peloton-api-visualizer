# Peloton Workout Visualizer

This project is a work in progress. It is a web application that integrates with the Peloton API to authenticate users, retrieve workout data, and visualize key metrics such as heart rate, speed, and power. The application allows users to view their latest workouts and select a specific workout for a more detailed analysis through interactive charts.

**Note**: This project is not currently accepting contributions. It is being developed and maintained by the author.

## Features

- User authentication with Peloton API
- Fetches a list of the user's latest workouts
- Displays workout metrics (heart rate, speed, power) for the selected workout
- Visualizes the metrics using Chart.js
- Responsive design for easy access across devices

## Technologies Used

- **Frontend**: HTML, CSS, JavaScript
- **Libraries**: Chart.js for data visualization
- **Backend**: Node.js (or Python for middleware, depending on implementation)
- **API**: Peloton API for workout data
- **Authentication**: OAuth for Peloton login and token retrieval

## Installation

To get started with this project locally, follow these steps:

1. Clone the repository:
   ```bash
   git clone https://github.com/srafaelnovoa/peloton-api-integration
2. Navigate to the project directory:
   ```bash
   cd peloton-workout-visualizer
3. Install dependencies:
   ```bash
   npm install  # or use yarn if preferred
4. Create an .env file to store your Peloton API credentials (client ID, client secret, etc.).
5. Run the application:
   ```bash
   npm start  # or use the appropriate start command
6. Open your browser and go to http://localhost:3000 (or the port you've configured).

## Usage
1. Log in with your Peloton credentials to authenticate the app.
2. View your list of recent workouts.
3. Select a workout to view detailed metrics (heart rate, speed, power).
4. The metrics will be displayed in an interactive chart.

## API Reference
The app integrates with the Peloton API to retrieve workout data. Here are the main endpoints it uses:

- Authentication:
  - Endpoint for logging in via OAuth.
- Get Workouts:
  - Retrieves the latest workout sessions for the authenticated user.
- Get Workout Details:
  - Fetches specific workout metrics (heart rate, speed, power) for the selected workout.

## Contributing
This project is not currently accepting contributions. It is a personal work in progress, and I am not actively reviewing pull requests at this time.

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements
Peloton API: For providing access to workout data
Chart.js: For the charting library used to visualize workout metrics
