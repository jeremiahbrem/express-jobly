/** User class for jobly */

const db = require("../db");
const ExpressError = require("../helpers/expressError.js");
const sqlForPartialUpdate = require("../helpers/partialUpdate.js")
const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR } = require("../config.js")

class User {

  constructor(username, password, first_name, last_name, email, photo_url, is_admin) {
    this.username = username;
    this.password = password;
    this.first_name = first_name;
    this.last_name = last_name;
    this.email = email;
    this.photo_url = photo_url;
    this.is_admin = is_admin;
  }

  // queries the database for all user objects
  static async getUsers() {
    const result = await db.query(
      `SELECT username, first_name, last_name, email FROM users`
    );
    return result.rows;
  }

  /* gets user by username and returns User object */ 
  static async getUser(usernameInput) {
    const result = await db.query(
      `SELECT username, first_name, last_name, password, email, photo_url, is_admin
        FROM users WHERE username='${usernameInput}'`
    );
    if (!result.rows[0]) {
      throw new ExpressError(`Username ${usernameInput} not found`, 404);
    }
    const { username, first_name, last_name, password, email, photo_url, is_admin } = result.rows[0];
    return new User(username, password, first_name, last_name, email, photo_url, is_admin);
  }

  /* Creates new company with given properties and returns Company object
   * index - incremental value placeholder in query statements
   * query - db.query statement string
   * columns - array for storing columns to be changed in SET statement
   * indexes - array for storing value placeholders for query statement
   * values - array of given updated property values
  */ 
  static async create(parameters) {
    // check for duplicate username
    const usernameCheck = await db.query(
      `SELECT username FROM users WHERE username='${parameters.username}'`
    );
    if (usernameCheck.rows[0]) {
      throw new ExpressError(`Username ${parameters.username} already exists.`, 400);
    }
    // check for duplicate email
    const emailCheck = await db.query(
      `SELECT email FROM users WHERE email='${parameters.email}'`
    );
    if (emailCheck.rows[0]) {
      throw new ExpressError(`Email ${parameters.email} already exists.`, 400);
    }
    parameters.password = await bcrypt.hash(
      parameters.password, BCRYPT_WORK_FACTOR);

    let index = 0;
    let query = `INSERT INTO users `;
    let columns = [];
    let indexes = [];
    let values = Object.values(parameters);

    for (let key in parameters) {
      index++;
      columns.push(`${key}`);
      indexes.push(`$${index}`);
    }     
    query = query + `(${columns.join(",")})` + 
      ` VALUES (${indexes.join(",")}) RETURNING *`;

    const result = await db.query(query, values);
    const { username, password, first_name, last_name, email, photo_url, is_admin } = result.rows[0];
    return new User(username, password, first_name, last_name, email, photo_url, is_admin);
  }

  static async authenticate(username, password) {
    const results = await db.query(
      `SELECT username, password, is_admin
       FROM users
       WHERE username = $1`,
      [username]);
    const userData = results.rows[0];
    if (userData) {
      if (await bcrypt.compare(password, userData.password)) {
        return {
          username: userData.username,
          is_admin: userData.is_admin
        }  
      }
    }
    return false;
  }

  // Updates user instance with given properties and returns updated user
  async update(parameters) {
    // check for duplicate name
    if (parameters.password) {
      parameters.password = await bcrypt.hash(
        parameters.password, BCRYPT_WORK_FACTOR); 
    }
    const { query, values } = sqlForPartialUpdate('users', parameters, 'username', this.username);
    const result = await db.query(query, values);  
    return result.rows[0];
  }

  // Deletes user from database
  async delete() {
    const response = await db.query(
      `DELETE FROM users WHERE username=$1
       RETURNING username`,
       [this.username]
    );
    const message = `User ${response.rows[0].username} deleted.`
    return message;
  }

  async getJobs() {
    const response = await db.query(
      `SELECT j.title, j.company_handle, a.state FROM applications AS a
      JOIN jobs AS j ON a.job_id = j.id
      WHERE username='${this.username}'`
    );
    return response.rows;
  }
}

module.exports = User;