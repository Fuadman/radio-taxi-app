Local taxi-server

Quick start to run Postgres and the tiny Express server locally.

1. Copy env example

```bash
cp ../.env.example .env
```

2. Start Postgres via Docker Compose (runs on host port 5433)

```bash
docker compose up -d
```

3. Install server deps and run migrations

```bash
cd taxi-server
npm install
npm run migrate        # runs migrations
npm run seed           # runs migrations + seed
npm run dev            # start server with nodemon
```

4. Health check

Open http://localhost:4000/health

Notes
- The DB is mapped to host port 5433 to avoid conflicts with local Postgres instances.
- You can change env vars in the root `.env.example` or create a `.env` file.
