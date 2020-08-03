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
  
//   test("POST /companies all columns", async function() {
//     const response = await request(app)
//       .post(`/companies`)
//       .send({
//         handle: 'test',
//         name: 'Test',
//         description: 'Test company',
//         num_employees: 100,
//         logo_url: 'http://example.com/logo.jpg'
//       });
//     expect(response.statusCode).toEqual(201);
//     expect(response.body).toEqual({
//       company: {
//         handle: 'test', 
//         name: 'Test',
//         description: 'Test company',
//         num_employees: 100,
//         logo_url: 'http://example.com/logo.jpg'
//       }
//     });  
//   })
  
//   test("POST /companies only required columns", async function() {
//     const response = await request(app)
//       .post(`/companies`)
//       .send({
//         handle: 'test',
//         name: 'Test',
//       });
//     expect(response.statusCode).toEqual(201);
//     expect(response.body).toEqual({
//       company: {
//         handle: 'test', 
//         name: 'Test',
//         description: null,
//         num_employees: null,
//         logo_url: null
//       }
//     });  
//   })
  
//   test("POST /companies invalid inputs", async function() {
//     const response = await request(app)
//       .post(`/companies`)
//       .send({
//         handle: 1234,
//         name: 'Test',
//         logo_url: 'badurl'
//       });
//     expect(response.statusCode).toEqual(400);
//   })
  
//   test("POST /companies empty inputs", async function() {
//     const response = await request(app)
//       .post(`/companies`)
//       .send({});
//     expect(response.statusCode).toEqual(400);
//   })

//   test("PATCH /companies/:handle some properties", async function() {
//     const response = await request(app)
//       .patch(`/companies/${handle}`)
//       .send({
//         name: 'UpdatedName',
//         description: 'updatedDescrip'
//       })
//     expect(response.statusCode).toEqual(200);
//     expect(response.body).toEqual({
//       company: {
//         handle: handle,
//         name: 'UpdatedName',
//         description: 'updatedDescrip',
//         num_employees: num_employees,
//         logo_url: logo_url
//       }
//     }) 
//   })
  
//   test("PATCH /companies/:handle invalid inputs", async function() {
//     const response = await request(app)
//       .patch(`/companies/${handle}`)
//       .send({
//         name: 1234,
//         logo_url: 'badurl'
//       })
//     expect(response.statusCode).toEqual(400);
//   })
  
//   test("PATCH /companies/:handle empty inputs", async function() {
//     const response = await request(app)
//       .patch(`/companies/${handle}`)
//       .send({});
//     expect(response.statusCode).toEqual(400);
//   })

//   test("PATCH /companies/:handle duplicate name", async function() {
//     const newCompany = await Company.create({
//       name: 'NewCompany',
//       handle: 'newcomp'
//     })
//     const response = await request(app)
//       .patch(`/companies/${handle}`)
//       .send({name: newCompany.name});
//     expect(response.statusCode).toEqual(400);
//   })
  
//   test("DELETE /companies/:handle", async function() {
//     const response = await request(app)
//       .delete(`/companies/${handle}`);
//     expect(response.statusCode).toEqual(200);
//     expect(response.body).toEqual({
//       message: `Company ${name} deleted.`
//     });
//   })
})

afterAll(async function() {
  await db.end();
})