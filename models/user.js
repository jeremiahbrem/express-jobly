/** User class for jobly */

const db = require("../db");
const ExpressError = require("../helpers/expressError.js");
const sqlForPartialUpdate = require("../helpers/partialUpdate.js")

// username TEXT PRIMARY KEY,
//   password TEXT NOT NULL,
//   first_name TEXT NOT NULL,
//   last_name TEXT NOT NULL,
//   email TEXT NOT NULL UNIQUE,
//   photo_url TEXT,
//   is_admin BOOLEAN NOT NULL DEFAULT false
class User {

  constructor(username, first_name, last_name, email, photo_url, is_admin) {
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
      `SELECT username, first_name, last_name, email, photo_url
        FROM users WHERE username='${usernameInput}'`
    );
    if (!result.rows[0]) {
      throw new ExpressError(`Username ${usernameInput} not found`, 404);
    }
    const { username, first_name, last_name, email, photo_url } = result.rows[0];
    return new User(username, first_name, last_name, email, photo_url);
  }

//   /* Creates new company with given properties and returns Company object
//    * index - incremental value placeholder in query statements
//    * query - db.query statement string
//    * columns - array for storing columns to be changed in SET statement
//    * indexes - array for storing value placeholders for query statement
//    * values - array of given updated property values
//   */ 
//   static async create(parameters) {
//     let index = 0;
//     let query = `INSERT INTO jobs `;
//     let columns = [];
//     let indexes = [];
//     let values = Object.values(parameters);

//     for (let key in parameters) {
//       index++;
//       columns.push(`${key}`);
//       indexes.push(`$${index}`);
//     }     
//     query = query + `(${columns.join(",")})` + 
//       ` VALUES (${indexes.join(",")}) RETURNING *`;

//     const result = await db.query(query, values);
//     const { id, title, salary, equity, company_handle, date_posted } = result.rows[0];
//     return new Job(id, title, salary, equity, company_handle, date_posted);
//   }

//   // Updates job instance with given properties and returns updated job
//   async update(parameters) {
//     // check for duplicate name
    
//     const { query, values } = sqlForPartialUpdate('jobs', parameters, 'id', this.id);
//     const result = await db.query(query, values);  
//     return result.rows[0];
//   }

//   // Deletes company from database
//   async delete() {
//     const response = await db.query(
//       `DELETE FROM jobs WHERE id=$1
//        RETURNING title`,
//        [this.id]
//     );
//     const message = `Job ${response.rows[0].title} deleted.`
//     return message;
//   }
}

module.exports = User;