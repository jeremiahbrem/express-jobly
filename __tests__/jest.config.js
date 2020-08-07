process.env.NODE_ENV === "test";

const app = require("../app");
const db = require("../db");
const Company = require("../models/company.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { BCRYPT_WORK_FACTOR, SECRET_KEY } = require("../config.js")

// object for holding test data values to use in tests
const TEST_DATA = {}

// called before each test
async function beforeEachCallback() {
  await db.query('DELETE FROM jobs');
  await db.query('DELETE FROM companies');
  await db.query('DELETE FROM users');
  await createTestCompanyData();
  await createTestJobData();
  await createTestUserData();
  await createAdminData();
  await createAppData();
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
  );
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
  );
  TEST_DATA['job'] = result.rows[0];
}

async function createTestUserData() {
  const hashedPassword = await bcrypt.hash(
    'testpassword', BCRYPT_WORK_FACTOR);
  const result = await db.query(  
    `INSERT INTO users 
    VALUES ('testuser', '${hashedPassword}', 'Tester', 'Testerson', 'tester@example.com', 'http://example.com/image.jpg')
    RETURNING *`
  );
  TEST_DATA['user'] = result.rows[0];
  TEST_DATA.user.password = 'testpassword';
  TEST_DATA['testToken'] = jwt.sign({
    username: TEST_DATA.user.username,
    is_admin: TEST_DATA.user.is_admin
  }, SECRET_KEY);
}

async function createAdminData() {
  const hashedPassword = await bcrypt.hash(
    'adminpassword', BCRYPT_WORK_FACTOR);
  const result = await db.query(  
    `INSERT INTO users 
    VALUES ('adminuser', '${hashedPassword}', 'AdminUser', 'Adminson', 'admin@example.com', 'http://example.com/admin.jpg', 'true')
    RETURNING *`
  );
  TEST_DATA['admin'] = result.rows[0];
  TEST_DATA.admin.password = 'adminpassword';
  TEST_DATA['adminToken'] = jwt.sign({
    username: TEST_DATA.admin.username,
    is_admin: TEST_DATA.admin.is_admin
  }, SECRET_KEY);
}

async function createAppData() {
  const result = await db.query(
    `INSERT INTO applications (username, job_id, state)
    VALUES ('testuser', ${TEST_DATA.job.id}, 'applied')
    RETURNING *`
  );
  TEST_DATA['app'] = result.rows[0];
}

module.exports = { TEST_DATA, beforeEachCallback };