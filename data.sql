DROP TABLE IF EXISTS companies;
DROP TABLE IF EXISTS jobs;

CREATE TABLE companies (
    handle TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    num_employees INTEGER,
    description TEXT,
    logo_url TEXT
);

CREATE TABLE jobs (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    salary REAL NOT NULL,
    equity REAL NOT NULL CHECK(equity <= 1.00),
    company_handle TEXT REFERENCES companies
      ON DELETE CASCADE,
    date_posted TIMESTAMP DEFAULT current_timestamp
)