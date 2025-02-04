const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const PELOTON_API_BASE = "https://api.onepeloton.com";

// Endpoint to authenticate user and retrieve token
app.post("/api/auth", async (req, res) => {
  try {
    const { username_or_email, password } = req.body;
    const response = await axios.post(`${PELOTON_API_BASE}/auth/login`, {
      username_or_email,
      password,
    });

    res.json(response.data);
  } catch (error) {
    res
      .status(400)
      .json({ error: error.response?.data || "Authentication failed" });
  }
});

// Endpoint to fetch user workouts
app.get("/api/workouts", async (req, res) => {
  try {
    const { token } = req.headers;
    const response = await axios.get(
      `${PELOTON_API_BASE}/api/user/${req.query.userId}/workouts`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    res.json(response.data);
  } catch (error) {
    res
      .status(400)
      .json({ error: error.response?.data || "Failed to fetch workouts" });
  }
});

// Endpoint to fetch workout metrics
app.get("/api/workout/:workoutId/metrics", async (req, res) => {
  try {
    const { token } = req.headers;
    const { workoutId } = req.params;
    const response = await axios.get(
      `${PELOTON_API_BASE}/api/workout/${workoutId}/performance_graph`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    res.json(response.data);
  } catch (error) {
    res
      .status(400)
      .json({ error: error.response?.data || "Failed to fetch metrics" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
