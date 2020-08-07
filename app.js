/** Express app for jobly. */

const express = require("express");

const ExpressError = require("./helpers/expressError");

const morgan = require("morgan");

const app = express();
const cors = require("cors");
const companyRoutes = require("./api/companyRoutes.js");
const jobRoutes = require("./api/jobRoutes.js");
const userRoutes = require("./api/userRoutes.js");
const authRoutes = require("./api/authRoutes.js");
const { authenticateJWT } = require("./middleware/auth.js");

// allow both form-encoded and json body parsing
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// allow connections to all routes from any browser
app.use(cors());

// get auth token for all routes
app.use(authenticateJWT);

app.use(express.json());
app.use("/companies", companyRoutes);
app.use("/jobs", jobRoutes);
app.use("/users", userRoutes);
app.use("/", authRoutes);

// add logging system
app.use(morgan("tiny"));

/** 404 handler */

app.use(function(req, res, next) {
  const err = new ExpressError("Not Found", 404);

  // pass the error to the next piece of middleware
  return next(err);
});

/** general error handler */

app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  if (process.env.NODE_ENV != "test") console.error(err.stack);

  return res.json({
    status: err.status,
    message: err.message
  });
});

module.exports = app;
