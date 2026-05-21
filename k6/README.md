# k6 Load Testing

Dockerized environment to run k6 load tests with real-time web dashboard and report export.

## Requirements

- Docker and Docker Compose installed
- Test scripts located in `./tests/`
- `./reports/` directory with write permissions

```bash
mkdir -p reports && chown 1000:1000 reports
```

---

## Commands

### Run the default script (`workflows.js`)

```bash
docker compose up
```

### Run a specific script

```bash
SCRIPT=login.js docker compose up
```

```bash
SCRIPT=checkout.js docker compose up
```

### Run in the background

```bash
SCRIPT=login.js docker compose up -d
```

### Follow logs (when running in background)

```bash
docker compose logs -f
```

### Stop the container

```bash
docker compose down
```

### Force recreate the container (after compose changes)

```bash
docker compose up --force-recreate
```

---

## Real-time Dashboard

While the test is running, the web dashboard is available at:

```
http://localhost:5665
```

Shows live:
- Active VUs
- Request rate and latencies (p90, p95, p99)
- Check statuses
- HTTP errors

> The dashboard updates automatically — no need to refresh.

---

## Generated Reports

At the end of each test, two files are saved to `./reports/`:

| File | Description |
|---|---|
| `report.html` | Interactive visual report from the dashboard |
| `summary.json` | Full metrics summary in JSON format |

### Viewing the HTML report

`report.html` is a standalone file — no server needed. Open it directly in your browser:

**macOS**
```bash
open reports/report.html
```

**Linux**
```bash
xdg-open reports/report.html
```

**Windows**
```bash
start reports/report.html
```

Or drag and drop the file into your browser from the file explorer.

### Querying the JSON summary

```bash
cat reports/summary.json | jq .
```

View only request duration metrics:

```bash
cat reports/summary.json | jq '.metrics.http_req_duration'
```

---

## Project Structure

```
.
├── docker-compose.yml
├── tests/
│   └── workflows.js
└── reports/
    ├── report.html
    └── summary.json
```

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `SCRIPT` | `workflows.js` | Script to run (must be inside `./tests/`) |
| `K6_WEB_DASHBOARD` | `true` | Enables the web dashboard |
| `K6_WEB_DASHBOARD_PORT` | `5665` | Dashboard port |
| `K6_WEB_DASHBOARD_EXPORT` | `/reports/report.html` | HTML report export path |