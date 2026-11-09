# ForumSphere

Community discussion platform built with React, Express, and MySQL.

## Local setup

Create a MySQL database and dedicated account. Copy .env.example to backend/.env,
set the database credentials and SECRET, then run npm ci and npm run dev from
backend. The API creates its tables on first connection. In frontend run
npm install and npm start. The frontend proxies local API requests to port 3001.

For Docker Compose, copy .env.example to .env at the repo root, set the database
passwords and SECRET, then run docker compose up --build and open http://localhost:8080.

For Aiven or another managed MySQL service, configure MYSQL_HOST, MYSQL_PORT,
MYSQL_DATABASE, MYSQL_USER, MYSQL_PASSWORD, MYSQL_SSL=true, and MYSQL_SSL_CA.
Set SECRET on the backend and REACT_APP_API_URL on the frontend when hosted separately.

## Import existing records

Pause legacy writes. Export users, subgreddiits, posts, and reports with
mongoexport --jsonArray into a private directory outside the repo. Name the files
users.json, subgreddiits.json, posts.json, and reports.json. Run
node scripts/import-legacy.js <export-directory> from backend against an empty
MySQL database. The import preserves IDs and password hashes and rolls back on
error. Verify the imported data before switching traffic.
