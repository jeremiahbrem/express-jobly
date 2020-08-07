process.env.NODE_ENV === "test";

const request = require("supertest");
const app = require("../../app.js");
const Company = require("../../models/company.js");
const User = require("../../models/user.js")
const jwt = require("jsonwebtoken");

const { TEST_DATA, beforeEachCallback } = require("../jest.config.js");
const db = require("../../db");

// test user properties
let username;
let password;
let first_name;
let last_name;
let email;
let photo_url;
let is_admin;

// test user object
let testUser;

beforeEach(async function() {
  await beforeEachCallback();
  username = TEST_DATA.user.username;
  password = TEST_DATA.user.password;
  first_name = TEST_DATA.user.first_name;
  last_name = TEST_DATA.user.last_name;
  email = TEST_DATA.user.email;
  photo_url = TEST_DATA.user.photo_url;
  is_admin = TEST_DATA.user.is_admin;
})

describe("Testing user route functions", () => {
  test("GET /users", async function() {
    const response = await request(app)
      .get("/users")
      .send({_token: TEST_DATA.testToken});
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({
      users: [{
        username,
        first_name,
        last_name,
        email
      },
      {
        username: TEST_DATA.admin.username,
        first_name: TEST_DATA.admin.first_name,
        last_name: TEST_DATA.admin.last_name,
        email: TEST_DATA.admin.email
      }]
    });  
  })
  
  test("GET /users/:username ", async function() {
    const response = await request(app)
      .get(`/users/${username}`)
      .send({_token: TEST_DATA.testToken});
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({
      user: {
        username,
        first_name,
        last_name,
        email,
        photo_url,
        is_admin,
        jobs: [{
          title: TEST_DATA.job.title,
          company_handle: TEST_DATA.job.company_handle,
          state: TEST_DATA.app.state
        }]
      }
    })   
  })

  test("GET /users/:username not found", async function() {
    const response = await request(app)
      .get('/users/unknown')
      .send({_token: TEST_DATA.testToken});
    expect(response.statusCode).toEqual(404);  
  })
  
  test("POST /users", async function() {
    const response = await request(app)
      .post(`/users`)
      .send({
        username: 'user2',
        first_name: 'Tester2',
        last_name: 'Testerhausen',
        password: 'testpassword2',
        email: 'test2@example.com',
        photo_url: 'http://example.com/img2.jpg'
      });
    let data = jwt.decode(response.body.token);
    expect(response.statusCode).toEqual(201);
    expect(data).toEqual({
      iat: expect.any(Number),
      username: 'user2',
      is_admin: false
    });  
  })
  
  test("POST /users invalid username", async function() {
    const response = await request(app)
      .post(`/users`)
      .send({
        username: 1234,
        first_name: 'Tester2',
        last_name: 'Testerhausen',
        email: 'test2@example.com',
        photo_url: 'http://example.com/img2.jpg'
      });
    expect(response.statusCode).toEqual(400);
  })
  
  test("POST /users invalid first_name", async function() {
    const response = await request(app)
      .post(`/users`)
      .send({
        username: 'test2',
        first_name: 1234,
        last_name: 'Testerhausen',
        email: 'test2@example.com',
        photo_url: 'http://example.com/img2.jpg'
      });
    expect(response.statusCode).toEqual(400);
  })

  test("POST /users invalid email", async function() {
    const response = await request(app)
      .post(`/users`)
      .send({
        username: 'test2',
        first_name: 1234,
        last_name: 'Testerhausen',
        email: 'bademail',
        photo_url: 'http://example.com/img2.jpg'
      });
    expect(response.statusCode).toEqual(400);
  })

  test("POST /users invalid photo_url", async function() {
    const response = await request(app)
      .post(`/users`)
      .send({
        username: 'test2',
        first_name: 1234,
        last_name: 'Testerhausen',
        email: 'test2@example.com',
        photo_url: 'badurl'
      });
    expect(response.statusCode).toEqual(400);
  })
  
  test("POST /users empty input", async function() {
    const response = await request(app)
      .post(`/users`)
      .send({});
    expect(response.statusCode).toEqual(400);
  })

  test("PATCH /users/:username some properties", async function() {
    const response = await request(app)
      .patch(`/users/${username}`)
      .send({
        _token: TEST_DATA.testToken,
        password: 'updatedPassword',
        email: 'updated@example.com',
        photo_url: 'http://example.com/new.jpg'
      })
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({
      user: {
        username: username,
        first_name: first_name,
        last_name: last_name,
        email: 'updated@example.com',
        photo_url: 'http://example.com/new.jpg',
        is_admin: false
      }
    }) 
  })
  
  test("PATCH /users/:username invalid email", async function() {
    const response = await request(app)
      .patch(`/users/${username}`)
      .send({
        _token: TEST_DATA.testToken,
        password: 'updatedPassword',
        email: 'bademail',
        photo_url: 'http://example.com/new.jpg'
      });
    expect(response.statusCode).toEqual(400);
  })

  test("PATCH /users/:username invalid photo_url", async function() {
    const response = await request(app)
      .patch(`/users/${username}`)
      .send({
        _token: TEST_DATA.testToken,
        password: 'updatedPassword',
        email: 'updated@example.com',
        photo_url: 'badurl'
      })
    expect(response.statusCode).toEqual(400);
  })

  test("PATCH /users/:username is_admin attempt", async function() {
    const response = await request(app)
      .patch(`/users/${username}`)
      .send({
        _token: TEST_DATA.testToken,
        is_admin: true
      })
    expect(response.statusCode).toEqual(401);
  })
  
  test("PATCH /users/:username username attempt", async function() {
    const response = await request(app)
      .patch(`/users/${username}`)
      .send({
        _token: TEST_DATA.testToken,
        username: 'newusername'
      })
    expect(response.statusCode).toEqual(401);
  })
  
  test("PATCH /users/:username empty inputs", async function() {
    const response = await request(app)
      .patch(`/users/${username}`)
      .send({
        _token: TEST_DATA.testToken
      })
    expect(response.statusCode).toEqual(400);
  })

  test("PATCH /users/:username unauthorized", async function() {
    const response = await request(app)
      .patch(`/users/${username}`)
      .send({
        _token: TEST_DATA.testToken
      })
    expect(response.statusCode).toEqual(400);
  })
  
  test("DELETE /username/:username", async function() {
    const response = await request(app)
      .delete(`/users/${username}`)
      .send({
        _token: TEST_DATA.testToken
      });
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({
      message: `User ${username} deleted.`
    });
  })
})

afterAll(async function() {
  await db.end();
})