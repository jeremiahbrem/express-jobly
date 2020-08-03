/** Company class for jobly */

const db = require("../db");
const ExpressError = require("../helpers/expressError.js");
const sqlForPartialUpdate = require("../helpers/partialUpdate.js")

class Company {

  constructor(handle, name, description, num_employees, logo_url) {
    this.handle = handle;
    this.name = name;
    this.description = description;
    this.num_employees = num_employees;
    this.logo_url = logo_url;
  }

  /* queries the database for all company objects that meet the given arguments criteria,
   * returns all companies if no arguments given 
   * searchQuery - WHERE statement filters company name by search term
   * empQuery - WHERE statement filters companies by number of employees
   * queryStart - begins query statement with WHERE or AND if multiple WHERE statements
   */
  static async getCompanies(params) {
    if (params.min_employees && params.max_employees && params.min_employees > params.max_employees) {
      throw new ExpressError("Minimum employees cannot be greater than maximum employees", 404);
    }

    let searchQuery = '';
    let empQuery = '';
    let queryStart = 'WHERE';

    if (params.search) {
      searchQuery = `${queryStart} name LIKE '%${params.search}'`;
      queryStart = 'AND';
    }

    if (params.min_employees && params.max_employees) {
      empQuery = `${queryStart} num_employees BETWEEN ${params.min_employees} AND ${params.max_employees}`;
      queryStart = 'AND';
    }
    else if (params.min_employees) {
      empQuery = `${queryStart} num_employees > ${params.min_employees}`;
      queryStart = 'AND';
    }
    else if (params.max_employees) {
      empQuery = `${queryStart} num_employees < ${params.max_employees}`;
      queryStart = 'AND'
    }

    const result = await db.query(
      `SELECT handle, name FROM companies ${searchQuery} ${empQuery}`
    );
    return result.rows;
 
  }

  /* gets company by handle and returns Company object */ 
  static async getCompany(handleInput) {
    const result = await db.query(
      `SELECT handle, name, description, num_employees, logo_url
        FROM companies WHERE handle='${handleInput}'`
    );
    if (!result.rows[0]) {
      throw new ExpressError(`Company with handle ${handleInput} not found`, 404);
    }
    const { handle, name, description, num_employees, logo_url } = result.rows[0];
    return new Company(handle, name, description, num_employees, logo_url);
  }

  /* Creates new company with given properties and returns Company object
   * index - incremental value placeholder in query statements
   * query - db.query statement string
   * columns - array for storing columns to be changed in SET statement
   * indexes - array for storing value placeholders for query statement
   * values - array of given updated property values
  */ 
  static async create(parameters) {
    // check for duplicate handle
    const handleCheck = await db.query(
      `SELECT handle FROM companies WHERE handle='${parameters.handle}'`
    );
    if (handleCheck.rows[0]) {
      throw new ExpressError(`Handle ${parameters.handle} already exists.`, 400);
    }
    // check for duplicate name
    const nameCheck = await db.query(
      `SELECT name FROM companies WHERE name='${parameters.name}'`
    );
    if (nameCheck.rows[0]) {
      throw new ExpressError(`Name ${parameters.name} already exists.`, 400);
    }

    let index = 0;
    let query = `INSERT INTO companies `;
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
    const { handle, name, description, num_employees, logo_url } = result.rows[0];
    return new Company(handle, name, description, num_employees, logo_url);
  }

  // Updates company instance with given properties and returns updated company
  async update(parameters) {
    // check for duplicate name
    const nameCheck = await db.query(
      `SELECT name FROM companies WHERE name='${parameters.name}'
       AND handle != '${this.handle}'`
    );
    if (nameCheck.rows[0]) {
      throw new ExpressError(`Name ${parameters.name} already exists.`, 400);
    }
    const { query, values } = sqlForPartialUpdate('companies', parameters, 'handle', this.handle);
    const result = await db.query(query, values);  
    return result.rows[0];
  }

  // Deletes company from database
  async delete() {
    const response = await db.query(
      `DELETE FROM companies WHERE handle='${this.handle}'
       RETURNING name`
    );
    const message = `Company ${response.rows[0].name} deleted.`
    return message;
  }
}

module.exports = Company