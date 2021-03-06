const express = require("express");
const router = new express.Router();
const db = require("../db");
const ExpressError = require("../helpers/expressError");
const Company = require("../models/company.js");
const jsonschema = require("jsonschema");
const newCompany = require("../schemas/newCompany.json");
const updateCompany = require("../schemas/updateCompany.json");
const { ensureLoggedIn, ensureIsAdmin } = require("../middleware/auth.js");

// returns list of companies, filtered if arguments added
router.get("/", ensureLoggedIn, async function (req, res, next) {
  try {
    const response = await Company.getCompanies(req.query);
    return res.json({companies: response});
  }
  catch (err) {
    return next(err);
  }
});

// returns single company
router.get("/:handle", ensureLoggedIn, async function (req, res, next) {
  try {
    const getComp = await Company.getCompany(req.params.handle);
    const jobs = await getComp.getJobs();
    return res.json({
      company: { 
        handle: getComp.handle,
        name: getComp.name,
        description: getComp.description,
        num_employees: getComp.num_employees,
        logo_url: getComp.logo_url,
        jobs: jobs
      }  
    });
  } catch(err) {
    return next(err);
  }
})

// creates and returns new company
router.post("/", ensureIsAdmin, async function (req, res, next) {
  try {
    const result = jsonschema.validate(req.body, newCompany);

    if (!result.valid) {
      let listOfErrors = result.errors.map(error => error.stack);
      let error = new ExpressError(listOfErrors, 400);
      return next(error);
    }  
    delete req.body._token;
    const company = await Company.create(req.body);
    
    return res.status(201).json({company});
  } catch(err) {
    return next(err);
  }
})

// updates company and returns updated company
router.patch("/:handle", ensureIsAdmin, async function (req, res, next) {
  try {
    if (req.body.handle) {
      throw new ExpressError("Updating handle not allowed", 401);
    }
    const result = jsonschema.validate(req.body, updateCompany);

    if (!result.valid) {
      let listOfErrors = result.errors.map(error => error.stack);
      let error = new ExpressError(listOfErrors, 400);
      return next(error);
    }
    const comp = await Company.getCompany(req.params.handle);
    const company = await comp.update(req.body);
    return res.json({company});
  } catch(err) {
    return next(err);
  }
})

router.delete("/:handle", ensureIsAdmin, async function (req, res, next) {
  try {
    const company = await Company.getCompany(req.params.handle);
    const message = await company.delete();
    return res.json({message});
  } catch(err) {
    return next(err);
  }
})

module.exports = router;