process.env.NODE_ENV === "test";

const app = require("../app");
const db = require("../db");
const Company = require("../models/company.js");

// object for holding test data values to use in tests
const TEST_DATA = {}

// called before each test
async function beforeEachCallback() {
  await db.query('DELETE FROM companies');
  await db.query('DELETE FROM jobs');
  await createTestCompanyData();
  await createTestJobData();
}

// creates test company and adds to TEST_DATA
async function createTestCompanyData() {
  const result = await db.query(
    `INSERT INTO companies VALUES (
        'springboard',
        'Springboard',
        200,
        'Software bootcamp',
        'https://media-exp1.licdn.com/dms/image/C4E0BAQHf0JHEUIMUXA/company-logo_200_200/0?e=1604534400&v=beta&t=mhAEJsQsM85pLISJJwRXg4tJuBAcJi5H-_W6bsDSDCg'
     )
     RETURNING handle, name, num_employees, description, logo_url`
  )
  TEST_DATA['company'] = result.rows[0];
}

async function createTestJobData() {
  const result = await db.query(
    `INSERT INTO jobs (title, salary, equity, company_handle)
    VALUES (
      'Software Developer',
      100000.00,
      0.00,
      'springboard'
    )
    RETURNING *`
  )
  TEST_DATA['job'] = result.rows[0];
}

async function createTestUserData() {
  `INSERT INTO user 
  VALUES ('testuser', 'Tester', 'Testerson', 'tester@example.com', 'http://example.com/image.jpg')
  RETURNING *`
}

module.exports = { TEST_DATA, beforeEachCallback };