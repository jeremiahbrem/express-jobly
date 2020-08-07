process.env.NODE_ENV === "test";

const request = require("supertest");
const app = require("../../app.js");
const Company = require("../../models/company.js");

const { TEST_DATA, beforeEachCallback } = require("../jest.config.js");
const db = require("../../db");

let name;
let handle;
let num_employees;
let description;
let logo_url;

beforeEach(async function() {
  await beforeEachCallback();
  name = TEST_DATA.company.name;
  handle = TEST_DATA.company.handle;
  num_employees = TEST_DATA.company.num_employees;
  description = TEST_DATA.company.description;
  logo_url = TEST_DATA.company.logo_url;
})

describe("Testing company route functions", () => {
  test("GET /companies return ALL", async function() {
    const response = await request(app)
      .get("/companies")
      .send({_token: TEST_DATA.testToken});
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({
      companies: [
        {handle: handle, name: name}
      ]
    });  
  })
  
  test("GET /companies with search", async function() {
    const response = await request(app)
      .get(`/companies?search=${name}`)
      .send({_token: TEST_DATA.testToken});
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({
      companies: [
        {handle: handle, name: name}
      ]
    });  
  })
  
  test("GET /companies with search not found", async function() {
    const response = await request(app)
      .get("/companies?search=unknown")
      .send({_token: TEST_DATA.testToken});
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({
      companies: []
    });  
  })
  
  test("GET /companies with min num_employees", async function() {
    const min = num_employees - 1;
    const response = await request(app)
      .get(`/companies?min_employees=${min}`)
      .send({_token: TEST_DATA.testToken});
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({
      companies: [
        {handle: handle, name: name}
      ]
    });  
  })
  
  test("GET /companies with min num_employees not found", async function() {
    const min = num_employees + 1;
    const response = await request(app)
      .get(`/companies?min_employees=${min}`)
      .send({_token: TEST_DATA.testToken});
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({
      companies: []
    });  
  })

  test("GET /companies with max num_employees", async function() {
    const max = num_employees + 1;
    const response = await request(app)
      .get(`/companies?max_employees=${max}`)
      .send({_token: TEST_DATA.testToken});
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({
      companies: [
        {handle: handle, name: name}
      ]
    });  
  })
  
  test("GET /companies with max num_employees not found", async function() {
    const max = num_employees - 1;
    const response = await request(app)
      .get(`/companies?max_employees=${max}`)
      .send({_token: TEST_DATA.testToken});
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({
      companies: []
    });  
  })
  
  test("GET /companies between max and min num_employees", async function() {
    const max = num_employees + 1;
    const min = num_employees - 1;
    const response = await request(app)
      .get(`/companies?min_employees=${min}&max_employees=${max}`)
      .send({_token: TEST_DATA.testToken});
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({
      companies: [
        {handle: handle, name: name}
      ]
    });  
  })
  
  test("GET /companies between max and min num_employees not found", async function() {
    const max = num_employees + 3;
    const min = num_employees + 1;
    const response = await request(app)
      .get(`/companies?min_employees=${min}&max_employees=${max}`)
      .send({_token: TEST_DATA.testToken});
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({
      companies: []
    });  
  })
  
  test("GET /companies searched name and between max and min num_employees", async function() {
    const max = num_employees + 2;
    const min = num_employees;
    const response = await request(app)
      .get(`/companies?search=${name}&min_employees=${min}&max_employees=${max}`)
      .send({_token: TEST_DATA.testToken});
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({
      companies: [
        {handle: handle, name: name}
      ]
    });  
  })

  test("GET /companies unauthorized", async function() {
    const response = await request(app)
      .get('/companies');
    expect(response.statusCode).toBe(401);  
  })
  
  test("GET /companies/:handle ", async function() {
    const response = await request(app)
      .get(`/companies/${handle}`)
      .send({_token: TEST_DATA.testToken});
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({
      company: {
        handle: handle, 
        name: name,
        description: description,
        num_employees: num_employees,
        logo_url: logo_url,
        jobs: [{
          title: TEST_DATA.job.title
        }]
      }
    });  
  })

  test("GET /companies/:handle not found", async function() {
    const response = await request(app)
      .get('/companies/unknown')
      .send({_token: TEST_DATA.testToken});
    expect(response.statusCode).toBe(404);  
  })
  
  test("GET /companies/:handle unauthorized", async function() {
    const response = await request(app)
      .get('/companies/unknown');
    expect(response.statusCode).toBe(401);  
  })
  
  test("POST /companies all columns", async function() {
    const response = await request(app)
      .post(`/companies`)
      .send({
        _token: TEST_DATA.adminToken,
        handle: 'test',
        name: 'Test',
        description: 'Test company',
        num_employees: 100,
        logo_url: 'http://example.com/logo.jpg'
      });
    expect(response.statusCode).toEqual(201);
    expect(response.body).toEqual({
      company: {
        handle: 'test', 
        name: 'Test',
        description: 'Test company',
        num_employees: 100,
        logo_url: 'http://example.com/logo.jpg'
      }
    });  
  })
  
  test("POST /companies only required columns", async function() {
    const response = await request(app)
      .post(`/companies`)
      .send({
        _token: TEST_DATA.adminToken,
        handle: 'test',
        name: 'Test',
      });
    expect(response.statusCode).toEqual(201);
    expect(response.body).toEqual({
      company: {
        handle: 'test', 
        name: 'Test',
        description: null,
        num_employees: null,
        logo_url: null
      }
    });  
  })
  
  test("POST /companies invalid inputs", async function() {
    const response = await request(app)
      .post(`/companies`)
      .send({
        _token: TEST_DATA.adminToken,
        handle: 1234,
        name: 'Test',
        logo_url: 'badurl'
      });
    expect(response.statusCode).toEqual(400);
  })
  
  test("POST /companies empty inputs", async function() {
    const response = await request(app)
      .post(`/companies`)
      .send({
        _token: TEST_DATA.adminToken
      });
    expect(response.statusCode).toEqual(400);
  })
  
  test("POST /companies unauthorized", async function() {
    const response = await request(app)
      .post(`/companies`)
      .send({
        _token: TEST_DATA.testToken
      });
    expect(response.statusCode).toEqual(401);
  })

  test("PATCH /companies/:handle some properties", async function() {
    const response = await request(app)
      .patch(`/companies/${handle}`)
      .send({
        _token: TEST_DATA.adminToken,
        name: 'UpdatedName',
        description: 'updatedDescrip'
      })
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({
      company: {
        handle: handle,
        name: 'UpdatedName',
        description: 'updatedDescrip',
        num_employees: num_employees,
        logo_url: logo_url
      }
    }) 
  })
  
  test("PATCH /companies/:handle invalid inputs", async function() {
    const response = await request(app)
      .patch(`/companies/${handle}`)
      .send({
        _token: TEST_DATA.adminToken,
        name: 1234,
        logo_url: 'badurl'
      })
    expect(response.statusCode).toEqual(400);
  })
  
  test("PATCH /companies/:handle empty inputs", async function() {
    const response = await request(app)
      .patch(`/companies/${handle}`)
      .send({
        _token: TEST_DATA.adminToken
      });
    expect(response.statusCode).toEqual(400);
  })

  test("PATCH /companies/:handle duplicate name", async function() {
    const newCompany = await Company.create({
      name: 'NewCompany',
      handle: 'newcomp'
    })
    const response = await request(app)
      .patch(`/companies/${handle}`)
      .send({
        _token: TEST_DATA.adminToken,
        name: newCompany.name
      });
    expect(response.statusCode).toEqual(400);
  })

  test("PATCH /companies unauthorized", async function() {
    const response = await request(app)
      .patch(`/companies/${handle}`)
      .send({
        _token: TEST_DATA.testToken
      });
    expect(response.statusCode).toEqual(401);
  })
  
  test("DELETE /companies/:handle", async function() {
    const response = await request(app)
      .delete(`/companies/${handle}`)
      .send({
        _token: TEST_DATA.adminToken
      });
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({
      message: `Company ${name} deleted.`
    });
  })

  test("DELETE /companies unauthorized", async function() {
    const response = await request(app)
      .delete(`/companies/${handle}`)
      .send({
        _token: TEST_DATA.testToken
      });
    expect(response.statusCode).toEqual(401);
  })
})

afterAll(async function() {
  await db.end();
})