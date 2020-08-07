const express = require("express");
const router = new express.Router();
const ExpressError = require("../helpers/expressError");
const db = require("../db");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config.js");
const User = require("../models/user.js");

// POST /login - login: {username, password} => {token}
router.post("/login", async function(req, res, next) {
  try {
    const { username, password } = req.body; 
    const user = await User.authenticate(username, password);

    if (user) {
      const is_admin = user.is_admin
      let token = jwt.sign({ username, is_admin }, SECRET_KEY);
      return res.json({ token });
    }
    throw new ExpressError("Invalid user/password", 400); 
  } catch (err) {
    return next(err);
  }
})

module.exports = router