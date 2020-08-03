process.env.NODE_ENV === "test";

const app = require("../../app");
const Company = require("../../models/company.js");

const { TEST_DATA, beforeEachCallback } = require("../jest.config");
const db = require("../../db");

// test company properties
let name;
let handle;
let num_employees;
let description;
let logo_url;

// test company object
let testCompany;

beforeEach(async function() {
  await beforeEachCallback();
  name = TEST_DATA.company.name;
  handle = TEST_DATA.company.handle;
  num_employees = TEST_DATA.company.num_employees;
  description = TEST_DATA.company.description;
  logo_url = TEST_DATA.company.logo_url;
  testCompany = new Company(handle, name, description, num_employees, logo_url);
})

describe("Testing Company class functions", () => {
  test("Testing getCompanies all", async function() {
    const result = await Company.getCompanies({});
    expect(result).toEqual([{handle, name}]);
  })
  
  test("Testing getCompanies search", async function() {
    const result = await Company.getCompanies({search: name});
    expect(result).toEqual([{handle, name}]);
  })  

  test("Testing getCompanies search not found", async function() {
    const result = await Company.getCompanies({search: "unknown"});
    expect(result).toEqual([]);
  })

  test("Testing getCompanies max_employees", async function() {
    const num = num_employees + 1;
    const result = await Company.getCompanies({max_employees: num});
    expect(result).toEqual([{handle, name}]);
  })   

  test("Testing getCompanies max_employees not found", async function() { 
    const num = num_employees - 1;
    const result = await Company.getCompanies({max_employees: num});
    expect(result).toEqual([]);    
  })
  
  test("Testing getCompanies min_employees", async function() {
    const num = num_employees - 1;
    const result = await Company.getCompanies({min_employees: num});
    expect(result).toEqual([{handle, name}]);
  })
  
  test("Testing getCompanies min_employees not found", async function() {
    const num = num_employees + 1;
    const result = await Company.getCompanies({min_employees: num});
    expect(result).toEqual([]);
  })
  
  test("Testing getCompanies between min/max num_employees", async function() {
    const min = num_employees - 1;
    const max = num_employees + 1;
    const result = await Company.getCompanies({min_employees: min, max_employees: max});
    expect(result).toEqual([{handle, name}]);
  })

  test("Testing getCompany", async function() {
    const result = await Company.getCompany(handle);
    expect(result).toBeInstanceOf(Company);
    expect(result.handle).toEqual(handle);
    expect(result.name).toEqual(name);
    expect(result.description).toEqual(description);
    expect(result.num_employees).toEqual(num_employees);
    expect(result.logo_url).toEqual(logo_url);
    expect(result.handle).toEqual(handle);
  })
  
  test("Testing getCompany not found", async function() {
    try {
      const result = await Company.getCompany('unknown');
    } catch(err) {
      expect(err.message).toEqual(`Company with handle unknown not found`);
    }
  })

  test("Testing create required columns only", async function() {
    const response = await Company.create({
      handle: 'test',
      name: 'Test'
    })
    expect(response).toBeInstanceOf(Company);
    expect(response.handle).toEqual('test');
    expect(response.name).toEqual('Test');
  })
  
  test("Testing create all columns", async function() {
    const response = await Company.create({
      handle: 'test',
      name: 'Test',
      description: 'Test company',
      num_employees: 100,
      logo_url: 'http://example.com/logo.jpg'
    })
    expect(response).toBeInstanceOf(Company);
    expect(response.handle).toEqual('test');
    expect(response.description).toEqual('Test company');
    expect(response.num_employees).toEqual(100);
    expect(response.logo_url).toEqual('http://example.com/logo.jpg');
  })

  test("Testing create duplicate handle", async function() {
    try {
      const response = await Company.create({
        handle: handle,
        name: 'Test'
      })
    } catch(err) {
      expect(err.message).toEqual(`Handle ${handle} already exists.`)
    }  
  })
  
  test("Testing create duplicate name", async function() {
    try {
      const response = await Company.create({
        handle: 'test',
        name: name
      })
    } catch(err) {
      expect(err.message).toEqual(`Name ${name} already exists.`)
    }  
  })
  
  test("Testing update some properties", async function() {
    const name = 'updatedName';
    const description = 'updatedDescription';
    const result = await testCompany.update({name, description});
    expect(result).toEqual({
      handle: 'springboard',
      name: 'updatedName',
      description: description,
      num_employees: num_employees,
      logo_url: logo_url
    })
  })

  test("Testing update duplicate name", async function() {
    const newCompany = await Company.create({
      name: 'NewCompany',
      handle: 'newcomp'
    })
    try {
      const response = await testCompany.update({
        name: newCompany.name
      })
    } catch(err) {
      expect(err.message).toEqual(`Name ${newCompany.name} already exists.`)
    }  
  })

  test("Testing delete company", async function() {
    const testName = testCompany.name;
    const response = await testCompany.delete();
    expect(response).toEqual(`Company ${testName} deleted.`)
  })
})

afterAll(async function() {
  await db.end();
})