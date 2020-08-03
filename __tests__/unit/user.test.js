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

  test("Testing create", async function() {
    const response = await Job.create({
      title: 'Test Job',
      salary: 200000.00,
      equity: 0.05,
      company_handle: 'springboard'
    })
    expect(response).toBeInstanceOf(Job);
    expect(response.id).toBeDefined();
    expect(response.title).toEqual('Test Job');
    expect(response.salary).toEqual(200000);
    expect(response.equity).toEqual(0.05);
    expect(response.company_handle).toEqual('springboard');
    expect(response.date_posted).toBeDefined();
  })
  
  test("Testing update some properties", async function() {
    const title = 'updatedTitle';
    const salary = 105000;
    const result = await testJob.update({title, salary});
    expect(result).toEqual({
      id: id,
      title: 'updatedTitle',
      salary: 105000,
      equity: equity,
      company_handle: company_handle,
      date_posted: date_posted
    })
  })

  test("Testing delete job", async function() {
    const testTitle = testJob.title;
    const response = await testJob.delete();
    expect(response).toEqual(`Job ${testJob.title} deleted.`)
  })
})

afterAll(async function() {
  await db.end();
})