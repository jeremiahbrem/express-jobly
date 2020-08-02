const express = require("express");
const router = new express.Router();
const db = require("../db");
const ExpressError = require("../helpers/expressError");
const Company = require("../models/company.js");
const jsonschema = require("jsonschema");
const newCompany = require("../schemas/newCompany.json");
const updateCompany = require("../schemas/updateCompany.json");

// returns list of companies, filtered if arguments added
router.get("/", async function (req, res, next) {
  try {
    const response = await Company.getCompanies(req.query);
    return res.json({companies: response});
  }
  catch (err) {
    return next(err);
  }
});

// returns single company
router.get("/:handle", async function (req, res, next) {
  try {
    const handle = req.params.handle;
    const response = await Company.getCompany(handle);
    return res.json({company: response});
  } catch(err) {
    return next(err);
  }
})

// creates and returns new company
router.post("/", async function (req, res, next) {
  try {
    const result = jsonschema.validate(req.body, newCompany);

    if (!result.valid) {
      let listOfErrors = result.errors.map(error => error.stack);
      let error = new ExpressError(listOfErrors, 400);
      return next(error);
    }  
    const company = await Company.create(req.body);
    return res.status(201).json({company});
  } catch(err) {
    return next(err);
  }
})

// updates company and returns updated company
router.patch("/:handle", async function (req, res, next) {
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

router.delete("/:handle", async function (req, res, next) {
  try {
    const company = await Company.getCompany(req.params.handle);
    const message = await company.delete();
    return res.json({message});
  } catch(err) {
    return next(err);
  }
})

module.exports = router;