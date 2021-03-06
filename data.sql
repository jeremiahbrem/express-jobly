DROP TABLE IF EXISTS applications;
DROP TABLE IF EXISTS jobs;
DROP TABLE IF EXISTS companies;
DROP TABLE IF EXISTS users;

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
    company_handle TEXT NOT NULL REFERENCES companies
      ON DELETE CASCADE,
    date_posted TIMESTAMP DEFAULT current_timestamp
);

CREATE TABLE users (
  username TEXT PRIMARY KEY,
  password TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  photo_url TEXT,
  is_admin BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE applications (
  id SERIAL PRIMARY KEY,
  username TEXT,
  job_id INTEGER,
  state TEXT DEFAULT 'applied',
  created_at TIMESTAMP DEFAULT current_timestamp,
  FOREIGN KEY(username) REFERENCES users ON DELETE CASCADE,
  FOREIGN KEY(job_id) REFERENCES jobs ON DELETE CASCADE
)