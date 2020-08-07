const express = require("express");
const router = new express.Router();
const db = require("../db");
const ExpressError = require("../helpers/expressError");
const Company = require("../models/company.js");
const Job = require("../models/job.js")
const jsonschema = require("jsonschema");
const newJob = require("../schemas/newJob.json");
const updateJob = require("../schemas/updateJob.json");
const updateApp = require("../schemas/updateApp.json")
const { ensureLoggedIn, ensureIsAdmin } = require("../middleware/auth.js");

// returns list of jobs, filtered if arguments added
router.get("/", ensureLoggedIn, async function (req, res, next) {
  try {
    const response = await Job.getJobs(req.query);
    return res.json({jobs: response});
  }
  catch (err) {
    return next(err);
  }
});

// returns single job
router.get("/:id", ensureLoggedIn, async function (req, res, next) {
  try {
    const id = req.params.id;
    const response = await Job.getJob(+id);
    const company = await Company.getCompany(response.company_handle);
    return res.json({job: {
      id: response.id,
      title: response.title,
      salary: response.salary,
      equity: response.equity,
      date_posted: response.date_posted,
      company
    }});
  } catch(err) {
    return next(err);
  }
})

// creates and returns new job
router.post("/", ensureIsAdmin, async function (req, res, next) {
  try {
    if (req.body.id) {
      throw new ExpressError("Do not enter ID, it is automatically set", 401);
    }
    const result = jsonschema.validate(req.body, newJob);

    if (!result.valid) {
      let listOfErrors = result.errors.map(error => error.stack);
      let error = new ExpressError(listOfErrors, 400);
      return next(error);
    }  
    delete req.body._token;
    const job = await Job.create(req.body);
    return res.status(201).json({job});
  } catch(err) {
    return next(err);
  }
})

// creates new job application
router.post("/:id/apply", ensureLoggedIn, async function (req, res, next) {
  try { 
    const job = await Job.getJob(req.params.id);
    const response = await job.apply(req.user.username);
    return res.status(201).json({
      message: response.state
    })
  } catch(err) {
    return next(err);
  }
})

// updates job application
router.patch("/applications/:id", ensureIsAdmin, async function (req, res, next) {
  try {
    const result = jsonschema.validate(req.body, updateApp);

    if (!result.valid) {
      let listOfErrors = result.errors.map(error => error.stack);
      let error = new ExpressError(listOfErrors, 400);
      return next(error);
    } 

    const response = await Job.updateApp(req.params.id, req.body.state);
    return res.json({
      message: response.state
    })
  } catch(err) {
    return next(err);
  }
})

// // updates company and returns updated company
router.patch("/:id", ensureIsAdmin, async function (req, res, next) {
  try {
    if (req.body.id) {
      throw new ExpressError("Updating id not allowed", 401);
    }
    const result = jsonschema.validate(req.body, updateJob);

    if (!result.valid) {
      let listOfErrors = result.errors.map(error => error.stack);
      let error = new ExpressError(listOfErrors, 400);
      return next(error);
    }
    const getJob = await Job.getJob(req.params.id);
    delete req.body._token;
    const job = await getJob.update(req.body);
    return res.json({job});
  } catch(err) {
    return next(err);
  }
})

router.delete("/:id", ensureIsAdmin, async function (req, res, next) {
  try {
    const job = await Job.getJob(req.params.id);
    const message = await job.delete();
    return res.json({message});
  } catch(err) {
    return next(err);
  }
})

module.exports = router;