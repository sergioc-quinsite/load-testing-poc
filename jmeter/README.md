# Jmeter

## Create load  test
```bash
jmeter
```

## Run the app

```bash
docker compose run --rm jmeter \
  -n \
  -t /tests/workflows.jmx \
  -l /results/results.jtl \
  -e \
  -o /results/report
```



