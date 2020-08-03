const express = require("express");
const router = new express.Router();
const db = require("../db");
const ExpressError = require("../helpers/expressError");
const Company = require("../models/company.js");
const Job = require("../models/job.js")
const jsonschema = require("jsonschema");
// const newJob = require("../schemas/newJob.json");
// const updateJob = require("../schemas/updateJob.json");

// returns list of jobs, filtered if arguments added
router.get("/", async function (req, res, next) {
  try {
    const response = await Job.getJobs(req.query);
    return res.json({jobs: response});
  }
  catch (err) {
    return next(err);
  }
});

// returns single job
router.get("/:id", async function (req, res, next) {
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

// // creates and returns new company
// router.post("/", async function (req, res, next) {
//   try {
//     const result = jsonschema.validate(req.body, newCompany);

//     if (!result.valid) {
//       let listOfErrors = result.errors.map(error => error.stack);
//       let error = new ExpressError(listOfErrors, 400);
//       return next(error);
//     }  
//     const company = await Company.create(req.body);
//     return res.status(201).json({company});
//   } catch(err) {
//     return next(err);
//   }
// })

// // updates company and returns updated company
// router.patch("/:handle", async function (req, res, next) {
//   try {
//     if (req.body.handle) {
//       throw new ExpressError("Updating handle not allowed", 401);
//     }
//     const result = jsonschema.validate(req.body, updateCompany);

//     if (!result.valid) {
//       let listOfErrors = result.errors.map(error => error.stack);
//       let error = new ExpressError(listOfErrors, 400);
//       return next(error);
//     }
//     const comp = await Company.getCompany(req.params.handle);
//     const company = await comp.update(req.body);
//     return res.json({company});
//   } catch(err) {
//     return next(err);
//   }
// })

// router.delete("/:handle", async function (req, res, next) {
//   try {
//     const company = await Company.getCompany(req.params.handle);
//     const message = await company.delete();
//     return res.json({message});
//   } catch(err) {
//     return next(err);
//   }
// })

module.exports = router;