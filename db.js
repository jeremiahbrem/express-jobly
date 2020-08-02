/** Database setup for jobly. */

const pg = require("pg");
const { DB_URI } = require("./config");

const db = new pg.Client({
  user: 'postgres',
  password: 'postgres',
  host: 'localhost',
  database: DB_URI,
  port: 5432
});

db.connect();

module.exports = db;
