require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const session = require("express-session");

const app = express();

const allowedOrigins = [
  "https://srafaelnovoa.github.io",
  "https://srafaelnovoa.github.io/peloton-api-visualizer",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // Allow credentials
  methods: "GET,POST", // Allowed request methods
  allowedHeaders: "Content-Type,Authorization", // Ensure correct headers
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure session middleware
app.use(
  session({
    secret:
      process.env.SESSION_SECRET || "37bc1d12-ccdb-4eeb-8086-1a4fd42bced5", //Session Key
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 1000, // 1 hour, matching Peloton token lifetime
    },
  })
);

const PELOTON_API_BASE =
  process.env.PELOTON_API_BASE || "https://api.onepeloton.com"; // Use env variable

// Helper function to extract cookie (same as before)
function extractCookie(setCookieHeaders) {
  if (!setCookieHeaders) return "";
  return setCookieHeaders.map((header) => header.split(";")[0]).join(";");
}

app.post("/api/auth", async (req, res) => {
  try {
    const { username_or_email, password } = req.body;
    const response = await axios.post(`${PELOTON_API_BASE}/auth/login`, {
      username_or_email,
      password,
    });

    const cookie = extractCookie(response.headers["set-cookie"]);

    // Store auth data in the session instead of globals!
    req.session.authenticatedConfig = { headers: { Cookie: cookie } };
    req.session.authData = response.data;
    req.session.authTimestamp = Date.now(); // Add timestamp

    // Fetch user details
    const userResponse = await axios.get(
      `${PELOTON_API_BASE}/api/user/${response.data.user_id}`,
      req.session.authenticatedConfig
    );

    req.session.userData = userResponse.data; // Store user details in session

    console.log("Logon success", username_or_email);

    res.json(userResponse.data); // Return user data to client
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Authentication failed";
    console.error("Authentication error:", errorMessage);
    res.status(error.response?.status || 400).json({ error: errorMessage });
  }
});

// Middleware to check auth and handle expired tokens
const checkAuth = async (req, res, next) => {
  if (!req.session.authData || !req.session.authenticatedConfig) {
    return res.status(401).json({ error: "Unauthorized", requiresLogin: true });
  }

  // Check for token expiration
  const tokenExpiryBuffer = 5 * 60 * 1000; // 5 minutes
  const sessionStartTime = req.session.authTimestamp || 0;
  const timeElapsed = Date.now() - sessionStartTime;

  if (
    timeElapsed > 60 * 60 * 1000 - tokenExpiryBuffer &&
    req.session.refreshCredentials
  ) {
    try {
      // Refresh the token
      const { username_or_email, password } = req.session.refreshCredentials;

      const response = await axios.post(`${PELOTON_API_BASE}/auth/login`, {
        username_or_email,
        password,
      });

      const cookie = extractCookie(response.headers["set-cookie"]);

      // Update session with new token
      req.session.authenticatedConfig = { headers: { Cookie: cookie } };
      req.session.authData = response.data;
      req.session.authTimestamp = Date.now();

      console.log("Token refreshed for", username_or_email);
    } catch (error) {
      // If refresh fails, clear session
      req.session.destroy((err) => {
        if (err) console.error("Session destruction error:", err);
      });
      return res
        .status(401)
        .json({ error: "Session expired", requiresLogin: true });
    }
  } else if (timeElapsed > 60 * 60 * 1000 - tokenExpiryBuffer) {
    // Token expired, no refresh credentials
    req.session.destroy((err) => {
      if (err) console.error("Session destruction error:", err);
    });
    return res
      .status(401)
      .json({ error: "Session expired", requiresLogin: true });
  }

  next();
};

const protectedRouter = express.Router();

protectedRouter.use(checkAuth); // Apply auth check to all routes in this router

protectedRouter.get("/workouts", async (req, res) => {
  try {
    // Access auth data from the session
    const { authData, authenticatedConfig } = req.session;
    const url = `${PELOTON_API_BASE}/api/user/${authData.user_id}/workouts?joins=peloton.ride`;
    const response = await axios.get(url, authenticatedConfig);
    res.json(response.data);
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch workouts";
    console.error("Workouts fetch error:", errorMessage);
    res.status(error.response?.status || 400).json({ error: errorMessage });
  }
});

protectedRouter.get("/workout/:workoutId/metrics", async (req, res) => {
  try {
    const { workoutId } = req.params;
    const { authenticatedConfig } = req.session;

    const url = `${PELOTON_API_BASE}/api/workout/${workoutId}/performance_graph`;
    const response = await axios.get(url, authenticatedConfig);
    res.json(response.data);
    //console.log("metrics success", response.data);
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch metrics";
    console.error("Metrics fetch error:", errorMessage);
    res.status(error.response?.status || 400).json({ error: errorMessage });
  }
});

protectedRouter.get("/achievements", async (req, res) => {
  try {
    // Access auth data from the session
    const { authData, authenticatedConfig } = req.session;

    const url = `${PELOTON_API_BASE}/api/user/${authData.user_id}/achievements`;
    const response = await axios.get(url, authenticatedConfig);
    res.json(response.data);
    //console.log("workouts success", response.data);
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch achievements";
    console.error("achievements fetch error:", errorMessage);
    res.status(error.response?.status || 400).json({ error: errorMessage });
  }
});
app.use("/api", protectedRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
