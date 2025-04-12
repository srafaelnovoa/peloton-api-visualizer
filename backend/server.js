require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const session = require("express-session");
const jwt = require("jsonwebtoken"); // Add this package (npm install jsonwebtoken)

const app = express();

// JWT secret key - store this in your .env file in production
const JWT_SECRET = process.env.JWT_SECRET || "KHneI36FNQ9XDr4S";

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
  credentials: true,
  methods: "GET,POST",
  allowedHeaders: "Content-Type,Authorization",
};

app.use("*", cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enhanced CORS headers
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");
  next();
});

// Configure session middleware
app.use(
  session({
    secret:
      process.env.SESSION_SECRET || "37bc1d12-ccdb-4eeb-8086-1a4fd42bced5",
    resave: false,
    saveUninitialized: false,
    proxy: true,
    cookie: {
      secure: true,
      httpOnly: true,
      sameSite: "none", // lowercase for consistency
      maxAge: 60 * 60 * 1000,
    },
  })
);

const PELOTON_API_BASE =
  process.env.PELOTON_API_BASE || "https://api.onepeloton.com";

// Helper function to extract cookie
function extractCookie(setCookieHeaders) {
  if (!setCookieHeaders) return "";
  return setCookieHeaders.map((header) => header.split(";")[0]).join(";");
}

// Generate JWT token
function generateToken(userData, username, authConfig) {
  return jwt.sign(
    {
      userId: userData.user_id,
      username: username,
      // Don't include sensitive data in the token
    },
    JWT_SECRET,
    { expiresIn: "1h" } // Match Peloton token lifetime
  );
}

app.post("/api/auth", async (req, res) => {
  try {
    const { username_or_email, password } = req.body;
    const response = await axios.post(`${PELOTON_API_BASE}/auth/login`, {
      username_or_email,
      password,
    });

    const cookie = extractCookie(response.headers["set-cookie"]);

    // Store auth data in the session
    req.session.authenticatedConfig = { headers: { Cookie: cookie } };
    req.session.authData = response.data;
    req.session.authTimestamp = Date.now();

    // Store credentials for refresh (if you want to keep this functionality)
    req.session.refreshCredentials = { username_or_email, password };

    // Fetch user details
    const userResponse = await axios.get(
      `${PELOTON_API_BASE}/api/user/${response.data.user_id}`,
      req.session.authenticatedConfig
    );

    req.session.userData = userResponse.data;

    // Generate JWT token
    const token = generateToken(
      response.data,
      username_or_email,
      req.session.authenticatedConfig
    );

    // Explicitly Set-Cookie for Safari
    res.setHeader(
      "Set-Cookie",
      `session_id=${req.sessionID}; Path=/; HttpOnly; Secure; SameSite=None`
    );

    console.log("Logon success", username_or_email);

    // Return both user data and token
    res.json({
      ...userResponse.data,
      token: token,
    });
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Authentication failed";
    console.error("Authentication error:", errorMessage);
    res.status(error.response?.status || 400).json({ error: errorMessage });
  }
});

app.get("/api/session-keepalive", (req, res) => {
  console.log("session-keepalive");
  if (req.session) {
    res.json({ sessionExists: true });
  } else {
    res.status(401).json({ error: "No session found" });
  }
});

app.get("/api/check-auth", (req, res) => {
  console.log("check-auth");

  // Check for JWT token in Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];

    try {
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET);
      return res.json({
        isAuthenticated: true,
        userId: decoded.userId,
        username: decoded.username,
      });
    } catch (err) {
      console.log("Invalid token:", err.message);
      // Continue to check session if token invalid
    }
  }

  // Fallback to session check
  if (req.session && req.session.authData) {
    res.json({
      isAuthenticated: true,
      userId: req.session.authData.user_id,
    });
  } else {
    res.json({ isAuthenticated: false });
  }
});

app.get("/api/user-data", (req, res) => {
  console.log("user-data");

  // Check for JWT token in Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];

    try {
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET);

      // If we have session data for this user, return it
      if (
        req.session &&
        req.session.userData &&
        req.session.userData.id === decoded.userId
      ) {
        console.log("req.session.userData.id", req?.session?.userData?.id);
        return res.json(req.session.userData);
      }

      // Otherwise return basic user info from token
      console.log("return basic user info", decoded?.userId, decoded?.username);
      return res.json({
        userId: decoded.userId,
        username: decoded.username,
      });
    } catch (err) {
      console.log("Invalid token for user-data:", err.message);
      // Continue to check session if token invalid
    }
  }

  // Fallback to session check
  if (req.session && req.session.userData) {
    res.json(req.session.userData);
  } else if (req.session && req.session.authData) {
    res.json({
      userId: req.session.authData.user_id,
      username: req.session.authData.username || "User",
    });
  } else {
    res.status(401).json({ error: "Not authenticated" });
  }
});

// Middleware to check auth and handle expired tokens
const checkAuth = async (req, res, next) => {
  console.log("checkAuth");

  // Check for JWT token in Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];

    try {
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log("decoded", decoded);
      console.log("req.session.authData", req.session.authData);
      console.log(
        "req.session.authenticatedConfig",
        req.session.authenticatedConfig
      );
      // If token is valid but we don't have session data, attempt to use token data
      if (!req.session.authData || !req.session.authenticatedConfig) {
        // This is a bare minimum to allow the request to proceed
        // Actual Peloton API calls might still fail without the session cookies
        req.session.authData = {
          user_id: decoded.userId,
          username: decoded.username,
        };
        console.log("req.session.authData", req.session.authData);

        // Without the actual Peloton cookie this might not work,
        // but we'll let the specific API handler deal with that
        console.log("Using token authentication without session data");
      }

      next();
      return;
    } catch (err) {
      console.log("Invalid token in checkAuth:", err.message);
      // Continue to check session if token invalid
    }
  }

  // Fallback to session check
  if (!req.session.authData || !req.session.authenticatedConfig) {
    console.log(
      "checkAuth Unauthorized",
      req.session.authData,
      req.session.authenticatedConfig
    );
    return res.status(401).json({ error: "Unauthorized", requiresLogin: true });
  }

  // Token refresh logic (same as before)
  const tokenExpiryBuffer = 5 * 60 * 1000;
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
      console.log("checkAuth error", error);
      req.session.destroy((err) => {
        if (err) console.error("Session destruction error:", err);
      });
      return res
        .status(401)
        .json({ error: "Session expired", requiresLogin: true });
    }
  } else if (timeElapsed > 60 * 60 * 1000 - tokenExpiryBuffer) {
    req.session.destroy((err) => {
      if (err) console.error("Session destruction error:", err);
    });
    console.log("checkAuth Session expired");
    return res
      .status(401)
      .json({ error: "Session expired", requiresLogin: true });
  }

  console.log("checkAuth next");
  next();
};

const protectedRouter = express.Router();

protectedRouter.use(checkAuth);

protectedRouter.get("/workouts", async (req, res) => {
  console.log("Workouts request received");
  try {
    // Access auth data from the session
    const { authData, authenticatedConfig } = req.session;
    console.log("authData", authData);
    console.log("authenticatedConfig", authenticatedConfig);
    const url = `${PELOTON_API_BASE}/api/user/${authData.user_id}/workouts?joins=peloton.ride`;
    console.log("url", url);
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

// Other protectedRouter routes remain the same
protectedRouter.get("/workout/:workoutId/metrics", async (req, res) => {
  try {
    const { workoutId } = req.params;
    const { authenticatedConfig } = req.session;

    const url = `${PELOTON_API_BASE}/api/workout/${workoutId}/performance_graph`;
    const response = await axios.get(url, authenticatedConfig);
    res.json(response.data);
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
    const { authData, authenticatedConfig } = req.session;

    const url = `${PELOTON_API_BASE}/api/user/${authData.user_id}/achievements`;
    const response = await axios.get(url, authenticatedConfig);
    res.json(response.data);
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
