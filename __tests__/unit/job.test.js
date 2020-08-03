process.env.NODE_ENV === "test";

const app = require("../../app");
const Job = require("../../models/job.js");

const { TEST_DATA, beforeEachCallback } = require("../jest.config");
const db = require("../../db");

// test job properties
let id;
let title;
let salary;
let equity;
let company_handle;
let date_posted;

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
  testJob = new Job(id, title, salary, equity, date_posted);
})

describe("Testing Job class functions", () => {
  test("Testing getJobs all", async function() {
    const result = await Job.getJobs({});
    expect(result).toEqual([{title, company_handle}]);
  })
  
  test("Testing getJobs search", async function() {
    const result = await Job.getJobs({search: title});
    expect(result).toEqual([{title, company_handle}]);
  })  

  test("Testing getJobs search not found", async function() {
    const result = await Job.getJobs({search: "unknown"});
    expect(result).toEqual([]);
  })

  test("Testing getJobs min_salary", async function() {
    const num = salary - 1;
    const result = await Job.getJobs({min_salary: num});
    expect(result).toEqual([{title, company_handle}]);
  })   

  test("Testing getJobs min_salary not found", async function() { 
    const num = salary + 1;
    const result = await Job.getJobs({min_salary: num});
    expect(result).toEqual([]);    
  })
  
  test("Testing getJobs min_equity", async function() {
    const num = equity - 0.1;
    const result = await Job.getJobs({min_salary: num});
    expect(result).toEqual([{title, company_handle}]);
  })
  
  test("Testing getJobs min_equity not found", async function() {
    const num = equity + 0.1;
    const result = await Job.getJobs({min_equity: num});
    expect(result).toEqual([]);
  })
  
  test("Testing getJobs with search, min_salary, & min_equity", async function() {
    const minSalary = salary - 1;
    const minEquity = equity - 0.1;
    const result = await Job.getJobs({
        search: title,
        min_salary: minSalary,
        min_equity: minEquity
    });
    expect(result).toEqual([{title, company_handle}]);
  })

  test("Testing getJob", async function() {
    const result = await Job.getJob(id);
    expect(result).toBeInstanceOf(Job);
    expect(result.id).toEqual(id);
    expect(result.title).toEqual(title);
    expect(result.salary).toEqual(salary);
    expect(result.equity).toEqual(equity);
    expect(result.company_handle).toEqual(company_handle);
    expect(result.date_posted).toEqual(date_posted);
  })
  
  test("Testing getJob not found", async function() {
    try {
      const result = await Job.getJob(1000000);
    } catch(err) {
      expect(err.message).toEqual(`Job with id 1000000 not found`);
    }
  })

//   test("Testing create required columns only", async function() {
//     const response = await Company.create({
//       handle: 'test',
//       name: 'Test'
//     })
//     expect(response).toBeInstanceOf(Company);
//     expect(response.handle).toEqual('test');
//     expect(response.name).toEqual('Test');
//   })
  
//   test("Testing create all columns", async function() {
//     const response = await Company.create({
//       handle: 'test',
//       name: 'Test',
//       description: 'Test company',
//       num_employees: 100,
//       logo_url: 'http://example.com/logo.jpg'
//     })
//     expect(response).toBeInstanceOf(Company);
//     expect(response.handle).toEqual('test');
//     expect(response.description).toEqual('Test company');
//     expect(response.num_employees).toEqual(100);
//     expect(response.logo_url).toEqual('http://example.com/logo.jpg');
//   })

//   test("Testing create duplicate handle", async function() {
//     try {
//       const response = await Company.create({
//         handle: handle,
//         name: 'Test'
//       })
//     } catch(err) {
//       expect(err.message).toEqual(`Handle ${handle} already exists.`)
//     }  
//   })
  
//   test("Testing create duplicate name", async function() {
//     try {
//       const response = await Company.create({
//         handle: 'test',
//         name: name
//       })
//     } catch(err) {
//       expect(err.message).toEqual(`Name ${name} already exists.`)
//     }  
//   })
  
//   test("Testing update some properties", async function() {
//     const name = 'updatedName';
//     const description = 'updatedDescription';
//     const result = await testCompany.update({name, description});
//     expect(result).toEqual({
//       handle: 'springboard',
//       name: 'updatedName',
//       description: description,
//       num_employees: num_employees,
//       logo_url: logo_url
//     })
//   })

//   test("Testing update duplicate name", async function() {
//     const newCompany = await Company.create({
//       name: 'NewCompany',
//       handle: 'newcomp'
//     })
//     try {
//       const response = await testCompany.update({
//         name: newCompany.name
//       })
//     } catch(err) {
//       expect(err.message).toEqual(`Name ${newCompany.name} already exists.`)
//     }  
//   })

//   test("Testing delete company", async function() {
//     const testName = testCompany.name;
//     const response = await testCompany.delete();
//     expect(response).toEqual(`Company ${testName} deleted.`)
//   })
})

afterAll(async function() {
  await db.end();
})