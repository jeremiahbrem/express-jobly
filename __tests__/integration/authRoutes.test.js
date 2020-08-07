process.env.NODE_ENV === "test";

const request = require("supertest");
const app = require("../../app.js");
const Company = require("../../models/company.js");
const jwt = require("jsonwebtoken");
const { TEST_DATA, beforeEachCallback } = require("../jest.config.js");
const db = require("../../db");

// test user properties
let username;
let password;
let is_admin;

// test user object
let testUser;

beforeEach(async function() {
  await beforeEachCallback();
  username = TEST_DATA.user.username;
  password = TEST_DATA.user.password;
  is_admin = TEST_DATA.user.is_admin;
})

describe("Testing login", () => {
  test("POST /login", async function() {
    const response = await request(app)
      .post("/login")
      .send({
        username,
        password
      });
    let data = jwt.decode(response.body.token);
    expect(response.statusCode).toEqual(200);
    expect(data).toEqual({
      iat: expect.any(Number),  
      username,
      is_admin
    });  
  })
})

afterAll(async function() {
  await db.end();
})