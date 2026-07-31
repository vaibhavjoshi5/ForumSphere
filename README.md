# SocialHub

SocialHub is a full-stack community platform built with React, Node.js, Express, and MongoDB.

## Local development

1. Copy `.env.example` to `backend/.env` and update the values.
2. Start MongoDB locally (or provide a MongoDB Atlas connection string).
3. Install and run the API:

   ```bash
   cd backend
   npm install
   npm run dev
   ```

4. In another terminal, install and run the React app:

   ```bash
   cd frontend
   npm install
   npm start
   ```

The frontend runs on port 3000 and proxies API requests to the backend on port 3001.

## Verification

```bash
cd backend && npm test
cd frontend && npm run build
```

The API also exposes `GET /api/health` for health checks.
