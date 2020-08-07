/** Job class for jobly */

const db = require("../db");
const ExpressError = require("../helpers/expressError.js");
const sqlForPartialUpdate = require("../helpers/partialUpdate.js")

class Job {

  constructor(id, title, salary, equity, company_handle, date_posted) {
    this.id = id;
    this.title = title;
    this.salary = salary;
    this.equity = equity;
    this.company_handle = company_handle;
    this.date_posted = date_posted;
  }

  /* queries the database for all job objects that meet the given arguments criteria,
   * returns all jobs if no arguments given 
   * searchQuery - WHERE statement filters job title by search term
   * salaryQuery - WHERE statement filters jobs by minimum salary
   * equityStart - WHERE statement filters jobs by minimum equity
   * queryStart - begins query statement with WHERE or AND if multiple WHERE statements
   */
  static async getJobs(params) {
    let searchQuery = '';
    let salaryQuery = '';
    let equityQuery = '';
    let queryStart = 'WHERE';

    if (params.search) {
      searchQuery = `${queryStart} title LIKE '%${params.search}%'`;
      queryStart = 'AND';
    }
    if (params.min_salary) {
      salaryQuery = `${queryStart} salary > ${params.min_salary}`;
      queryStart = 'AND';
    }
    if (params.min_equity) {
      equityQuery = `${queryStart} equity > ${params.min_equity}`;
      queryStart = 'AND';
    }

    const result = await db.query(
      `SELECT title, company_handle FROM jobs ${searchQuery} ${salaryQuery} ${equityQuery}
      ORDER BY date_posted DESC`
    );
    return result.rows;
 
  }

  /* gets job by id and returns Job object */ 
  static async getJob(idInput) {
    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle, date_posted
        FROM jobs WHERE id='${idInput}'`
    );
    if (!result.rows[0]) {
      throw new ExpressError(`Job with id ${idInput} not found`, 404);
    }
    const { id, title, salary, equity, company_handle, date_posted } = result.rows[0];
    return new Job(id, title, salary, equity, company_handle, date_posted);
  }

//   /* Creates new company with given properties and returns Company object
//    * index - incremental value placeholder in query statements
//    * query - db.query statement string
//    * columns - array for storing columns to be changed in SET statement
//    * indexes - array for storing value placeholders for query statement
//    * values - array of given updated property values
//   */ 
  static async create(parameters) {
    let index = 0;
    let query = `INSERT INTO jobs `;
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
    const { id, title, salary, equity, company_handle, date_posted } = result.rows[0];
    return new Job(id, title, salary, equity, company_handle, date_posted);
  }

  // Updates job instance with given properties and returns updated job
  async update(parameters) {
    // check for duplicate name
    
    const { query, values } = sqlForPartialUpdate('jobs', parameters, 'id', this.id);
    const result = await db.query(query, values);  
    return result.rows[0];
  }

  // Deletes company from database
  async delete() {
    const response = await db.query(
      `DELETE FROM jobs WHERE id=$1
       RETURNING title`,
       [this.id]
    );
    const message = `Job ${response.rows[0].title} deleted.`
    return message;
  }

  async apply(username) {
    const response = await db.query(
      `INSERT INTO applications (username, job_id)
      VALUES ($1, $2)
      RETURNING *`,
      [username, this.id]
    );
    return response.rows[0];
  }

  static async updateApp(id, state) {
    const response = await db.query(
      `UPDATE applications SET state=$1
      WHERE id=$2
      RETURNING *`,
      [state, id]
    );
    return response.rows[0];
  }
}

module.exports = Job;