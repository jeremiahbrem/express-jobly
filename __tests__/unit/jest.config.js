process.env.NODE_ENV === "test";

const app = require("../../app");
const db = require("../../db");
const Company = require("../../models/company.js");

// object for holding test data values to use in tests
const TEST_DATA = {}

// called before each test
async function beforeEachCallback() {
  await db.query('DELETE FROM companies');
  await createTestCompanyData();
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

module.exports = { TEST_DATA, beforeEachCallback };