process.env.NODE_ENV === "test";

const app = require("../../app");
const User = require("../../models/user.js");

const { TEST_DATA, beforeEachCallback } = require("../jest.config");
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
  testUser = new User(username, password, first_name, last_name, email, photo_url, is_admin);
})

describe("Testing User class functions", () => {
  test("Testing getUsers", async function() {
    const result = await User.getUsers();
    expect(result).toEqual([{
        username,
        first_name,
        last_name,
        email
    }]);
  })

  test("Testing getUser", async function() {
    const result = await User.getUser(username);
    expect(result).toBeInstanceOf(User);
    expect(result.username).toEqual(username);
    expect(result.password).toBeDefined();
    expect(result.first_name).toEqual(first_name);
    expect(result.last_name).toEqual(last_name);
    expect(result.email).toEqual(email);
    expect(result.photo_url).toEqual(photo_url);
    expect(result.is_admin).toEqual(is_admin);
  })
  
  test("Testing getUser not found", async function() {
    try {
      const result = await User.getUser('unknown');
    } catch(err) {
      expect(err.message).toEqual(`Username unknown not found`);
    }
  })

  test("Testing create", async function() {
    const response = await User.create({
      username: 'user2',
      password: 'password2',
      first_name: 'Tester2',
      last_name: 'Testerhauser',
      email: 'test2@example.com',
      photo_url: 'http://example.com/test2.jpg'
    });    
    console.log(response)
    expect(response).toBeInstanceOf(User);
    expect(response.username).toEqual('user2');
    expect(response.password).toBeDefined();
    expect(response.first_name).toEqual('Tester2');
    expect(response.last_name).toEqual('Testerhauser');
    expect(response.email).toEqual('test2@example.com');
    expect(response.photo_url).toEqual('http://example.com/test2.jpg');
    expect(response.is_admin).toBeFalsy();
  })

  test("Testing create duplicate username", async function() {
    try {
      const response = await User.create({
        username: username,
        password: 'password2',
        first_name: 'Tester2',
        last_name: 'Testerhauser',
        email: 'test2@example.com',
        photo_url: 'http://example.com/test2.jpg'
      })
    } catch(err) {
      expect(err.message).toEqual(`Username ${username} already exists.`)
    }
  })
  
  test("Testing create duplicate email", async function() {
    try {
      const response = await User.create({
        username: 'user2',
        password: 'password2',
        first_name: 'Tester2',
        last_name: 'Testerhauser',
        email: email,
        photo_url: 'http://example.com/test2.jpg'
      })
    } catch(err) {
      expect(err.message).toEqual(`Email ${email} already exists.`)
    }
  })
  
  test("Testing update some properties", async function() {
    const password = 'updatedpassword';
    const email = 'updated@example.com';
    const photo_url = 'http://example.com/new.jpg';
    const result = await testUser.update({password, email, photo_url});
    expect(result).toEqual({
      username: testUser.username,
      password: expect.any(String),
      first_name: testUser.first_name,
      last_name: testUser.last_name,
      email: 'updated@example.com',
      photo_url: 'http://example.com/new.jpg',
      is_admin: false
    })
  })
  
  test("Testing delete user", async function() {
    const testUsername = testUser.username;
    const response = await testUser.delete();
    expect(response).toEqual(`User ${testUsername} deleted.`)
  })

  test("Testing authenticate user", async function () {
    let response = await User.authenticate(username, password);
    expect(response).toEqual({
      username: username,
      is_admin: false
    })

    let notUser = await User.authenticate(username, "wrongpassword");
    expect(notUser).toBeFalsy();
  });
})

afterAll(async function() {
  await db.end();
})