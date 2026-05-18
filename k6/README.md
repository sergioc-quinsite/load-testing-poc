# Grafana k6

# Useful Commands

## Run the load test
```bash
docker compose run --rm k6 run workflows.js
```

## Run with more virtual users

```bash
docker compose run --rm k6 run --vus 50 --duration 5m workflows.js
```

## Run smoke test

```bash
docker compose run --rm k6 run --vus 1 --iterations 1 workflows.js
```

## Run stress test

```bash
docker compose run --rm k6 run --vus 100 --duration 10m workflows.js
```