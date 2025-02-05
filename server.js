const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());
let session_id = "";
let user_id = "";
let pubsub_session = "";
let authenticated_options = null;

const PELOTON_API_BASE = "https://api.onepeloton.com";

// Endpoint to authenticate user and retrieve token
app.post("/api/auth", async (req, res) => {
  try {
    const { username_or_email, password } = req.body;
    const response = await axios.post(`${PELOTON_API_BASE}/auth/login`, {
      username_or_email,
      password,
    });
    var cookie = response.headers["set-cookie"];
    //console.log(cookie);
    for (var i = 0; i < cookie.length; i++) {
      cookie[i] = cookie[i].split(";")[0];
    }
    authenticated_options = { headers: { Cookie: cookie.join(";") } };
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
    const response = await axios.get(
      `${PELOTON_API_BASE}/api/user/${req.query.userId}/workouts`,
      authenticated_options
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
    const { workoutId } = req.params;
    const response = await axios.get(
      `${PELOTON_API_BASE}/api/workout/${workoutId}/performance_graph`,
      authenticated_options
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
