const express = require("express");
const router = new express.Router();
const db = require("../db");
const ExpressError = require("../helpers/expressError");
const jsonschema = require("jsonschema");
const User = require("../models/user.js")
const newUser = require("../schemas/newUser.json");
const updateUser = require("../schemas/updateUser.json");
const { SECRET_KEY } = require("../config.js");
const jwt = require("jsonwebtoken");
const { ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth.js")

// returns list of users
router.get("/", ensureLoggedIn, async function (req, res, next) {
  try {
    const response = await User.getUsers(req.query);
    return res.json({users: response});
  }
  catch (err) {
    return next(err);
  }
});

// returns single user
router.get("/:username", ensureLoggedIn, async function (req, res, next) {
  try {
    const username = req.params.username;
    const user = await User.getUser(username);
    const jobs = await user.getJobs();
    return res.json({
      user: {
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        photo_url: user.photo_url,
        is_admin: user.is_admin,
        jobs
      }
    });
  } catch(err) {
    return next(err);
  }
})

// // creates and returns token with body {username, is_admin}
router.post("/", async function (req, res, next) {
  try {
    const result = jsonschema.validate(req.body, newUser);

    if (!result.valid) {
      let listOfErrors = result.errors.map(error => error.stack);
      let error = new ExpressError(listOfErrors, 400);
      return next(error);
    }  
    const user = await User.create(req.body);
    let token = jwt.sign(
      { 
        username: user.username, 
        is_admin: user.is_admin
      }, 
      SECRET_KEY
    );
    return res.status(201).json({ token });
  } catch(err) {
    return next(err);
  }
})

// // updates user and returns updated user
router.patch("/:username", ensureCorrectUser, async function (req, res, next) {
  try {
    if (req.body.is_admin) {
      throw new ExpressError("Updating is_admin not allowed", 401);
    }
    if (req.body.username) {
      throw new ExpressError("Updating username not allowed", 401);
    }
    const result = jsonschema.validate(req.body, updateUser);

    if (!result.valid) {
      let listOfErrors = result.errors.map(error => error.stack);
      let error = new ExpressError(listOfErrors, 400);
      return next(error);
    }
    const getUser = await User.getUser(req.params.username);
    delete req.body._token;
    const user = await getUser.update(req.body);
    return res.json({
      user: {
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        photo_url: user.photo_url,
        is_admin: user.is_admin
      }
    });
  } catch(err) {
    return next(err);
  }
})

router.delete("/:username", ensureCorrectUser, async function (req, res, next) {
  try {
    const user = await User.getUser(req.params.username);
    const message = await user.delete();
    return res.json({message});
  } catch(err) {
    return next(err);
  }
})

module.exports = router;