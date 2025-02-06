const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());
let g_authData, g_authenticated_config;

const PELOTON_API_BASE = "https://api.onepeloton.com";

// Endpoint to authenticate user and retrieve token
app.post("/api/auth", async (req, res) => {
  try {
    const { username_or_email, password } = req.body;
    const response = await axios.post(`${PELOTON_API_BASE}/auth/login`, {
      username_or_email,
      password,
    });
    let cookie = response.headers["set-cookie"];
    //console.log(cookie);
    for (let i = 0; i < cookie.length; i++) {
      cookie[i] = cookie[i].split(";")[0];
    }
    g_authenticated_config = { headers: { Cookie: cookie.join(";") } };
    g_authData = response.data;
    res.json(g_authData);
  } catch (error) {
    res
      .status(400)
      .json({ error: error.response?.data || "Authentication failed" });
  }
});

// Endpoint to fetch user workouts
app.get("/api/workouts", async (req, res) => {
  try {
    //const apiWorkouts = `${PELOTON_API_BASE}/api/user/${req.query.userId}/workouts`;
    const url = `${PELOTON_API_BASE}/api/user/${g_authData.user_id}/workouts`;
    const response = await axios.get(url, g_authenticated_config);
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
    const { workoutId } = req.params;
    const url = `${PELOTON_API_BASE}/api/workout/${workoutId}/performance_graph`;
    const response = await axios.get(url, g_authenticated_config);
    res.json(response.data);
  } catch (error) {
    res
      .status(400)
      .json({ error: error.response?.data || "Failed to fetch metrics" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
