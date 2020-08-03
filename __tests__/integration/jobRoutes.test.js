process.env.NODE_ENV === "test";

const request = require("supertest");
const app = require("../../app.js");
const Company = require("../../models/company.js");
const Job = require("../../models/job.js")

const { TEST_DATA, beforeEachCallback } = require("../jest.config.js");
const db = require("../../db");

// test job properties
let id;
let title;
let salary;
let equity;
let company_handle;
let date_posted;
let company;

// test job object
let testJob;

beforeEach(async function() {
  await beforeEachCallback();
  id = TEST_DATA.job.id;
  title = TEST_DATA.job.title;
  salary = TEST_DATA.job.salary;
  equity = TEST_DATA.job.equity;
  company_handle = TEST_DATA.job.company_handle;
  date_posted = TEST_DATA.job.date_posted;
  company = await Company.getCompany(company_handle);
})

describe("Testing job route functions", () => {
  test("GET /jobs return ALL", async function() {
    const response = await request(app)
      .get("/jobs");
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({
      jobs: [
        {title: title, company_handle: company_handle}
      ]
    });  
  })
  
  test("GET /jobs with search", async function() {
    const response = await request(app)
      .get(`/jobs?search=${title}`);
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({
      jobs: [
        {title: title, company_handle: company_handle}
      ]
    });  
  })
  
  test("GET /jobs with search not found", async function() {
    const response = await request(app)
      .get("/jobs?search=unknown");
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({
      jobs: []
    });  
  })
  
  test("GET /jobs with min_salary", async function() {
    const min = salary - 1;
    const response = await request(app)
      .get(`/jobs?min_salary=${min}`);
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({
      jobs: [
        {title: title, company_handle: company_handle}
      ]
    });  
  })
  
  test("GET /jobs with min_salary not found", async function() {
    const min = salary + 1;
    const response = await request(app)
      .get(`/jobs?min_salary=${min}`);
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({
      jobs: []
    });  
  })

  test("GET /jobs with min_equity", async function() {
    const min = equity - 1;
    const response = await request(app)
      .get(`/jobs?min_equity=${min}`);
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({
      jobs: [
        {title: title, company_handle: company_handle}
      ]
    });  
  })
  
  test("GET /jobs with min_equity not found", async function() {
    const min = equity + 1;
    const response = await request(app)
      .get(`/jobs?min_equity=${min}`);
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({
      jobs: []
    });  
  })
  
  test("GET /jobs with search, min_salary, min_equity", async function() {
    const minSalary = salary - 1;
    const minEquity = equity - 1;
    const response = await request(app)
      .get(`/jobs?search=${title}&min_salary=${minSalary}&min_equity=${minEquity}`);
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({
      jobs: [
        {title: title, company_handle: company_handle}
      ]
    });  
  })
  
  test("GET /jobs/:id ", async function() {
    const response = await request(app)
      .get(`/jobs/${id}`);
    const jobResp = response.body.job;  
    expect(response.statusCode).toEqual(200);
    expect(jobResp.id).toEqual(id);
    expect(jobResp.title).toEqual(title);
    expect(jobResp.company).toEqual(company);    
  })

  test("GET /jobs/:id not found", async function() {
    const response = await request(app)
      .get('/jobs/100000000');
    expect(response.statusCode).toEqual(404);  
  })
  
  test("POST /jobs", async function() {
    const response = await request(app)
      .post(`/jobs`)
      .send({
        title: 'Test job',
        salary: 200000,
        equity: 0.05,
        company_handle: 'springboard'
      });
    expect(response.statusCode).toEqual(201);
    expect(response.body).toEqual({
      job: {
        id: expect.any(Number), 
        title: 'Test job',
        salary: 200000,
        equity: 0.05,
        company_handle: 'springboard',
        date_posted: expect.any(String)
      }
    });  
  })
  
  test("POST /jobs invalid title", async function() {
    const response = await request(app)
      .post(`/jobs`)
      .send({
        title: 1234,
        salary: 200000,
        equity: 0.05,
        company_handle: 'springboard'
      });
    expect(response.statusCode).toEqual(400);
  })
  
  test("POST /jobs invalid salary", async function() {
    const response = await request(app)
      .post(`/jobs`)
      .send({
        title: 'Test job',
        salary: 'chedduh',
        equity: 0.05,
        company_handle: 'springboard'
      });
    expect(response.statusCode).toEqual(400);
  })
  
  test("POST /jobs invalid equity", async function() {
    const response = await request(app)
      .post(`/jobs`)
      .send({
        title: 1234,
        salary: 200000,
        equity: 1.1,
        company_handle: 'springboard'
      });
    expect(response.statusCode).toEqual(400);
  })
  
  test("POST /jobs missing inputs", async function() {
    const response = await request(app)
      .post(`/jobs`)
      .send({
        title: 1234,
        salary: 200000,
        equity: 1.1
      });
    expect(response.statusCode).toEqual(400);
  })

  test("PATCH /jobs/:id some properties", async function() {
    const response = await request(app)
      .patch(`/jobs/${id}`)
      .send({
        title: 'UpdatedTitle',
        salary: 105000
      })
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({
      job: {
        id, id,
        title: 'UpdatedTitle',
        salary: 105000,
        equity: equity,
        company_handle: company_handle,
        date_posted: expect.any(String)
      }
    }) 
  })
  
  test("PATCH /jobs/:id invalid title", async function() {
    const response = await request(app)
      .patch(`/jobs/${id}`)
      .send({
        title: 1234
      })
    expect(response.statusCode).toEqual(400);
  })
  
  test("PATCH /jobs/:id invalid salary", async function() {
    const response = await request(app)
      .patch(`/jobs/${id}`)
      .send({
        salary: 'chedduh'
      })
    expect(response.statusCode).toEqual(400);
  })

  test("PATCH /jobs/:id invalid equity", async function() {
    const response = await request(app)
      .patch(`/jobs/${id}`)
      .send({
        equity: 1.1
      })
    expect(response.statusCode).toEqual(400);
  })

  test("PATCH /jobs/:id not allowed", async function() {
    const response = await request(app)
      .patch(`/jobs/${id}`)
      .send({
        id: 50
      })
    expect(response.statusCode).toEqual(401);
  })
  
  test("PATCH /jobs/:id empty inputs", async function() {
    const response = await request(app)
      .patch(`/jobs/${id}`)
      .send({})
    expect(response.statusCode).toEqual(400);
  })
  
  test("DELETE /jobs/:id", async function() {
    const response = await request(app)
      .delete(`/jobs/${id}`);
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({
      message: `Job ${title} deleted.`
    });
  })
  
  test("DELETE /jobs/:id not found", async function() {
    const response = await request(app)
      .delete(`/jobs/100000000`);
    expect(response.statusCode).toEqual(404);
  })
})

afterAll(async function() {
  await db.end();
})