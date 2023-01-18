# hellonode

## A Fly Example

This is a simple application used in the [fly.io Getting Started](https://fly.io/docs/getting-started/node/)  documentation showing how to deploy a Node application using Flyctl's builtin Nodejs deployment option.

* Run flyctl init
* When prompted for a builder, select builtin Nodejs.
* Run flyctl deploy

## Fly.io with YBM

1. Create secrets for DB config like below

    ```bash
    fly secrets set \
      DB_PORT=5433 \
      DB_USER=admin \
      DB_PASSWORD="<password>" \
      DB_HOST="<db-endpoint>" \
      DB_CA_CERT="$(cat ybdb-ca.crt)"
    ```$$

2. Boot the application, and check the logs for the egress IP. (fly lauch or fly deploy)

```log
2023-01-18T04:05:44.485 app[b023793b] sin [info] 2023/01/18 04:05:44 listening on [fdaa:1:2746:a7b:80:b023:793b:2]:22 (DNS: [fdaa::3]:53)
2023-01-18T04:05:45.576 app[b023793b] sin [info] > hellonode@1.0.0 start
2023-01-18T04:05:45.576 app[b023793b] sin [info] > node server.js
2023-01-18T04:05:45.904 app[b023793b] sin [info] >>>> Connecting to YugabyteDB!
2023-01-18T04:05:45.911 app[b023793b] sin [info] HelloNode app listening on port 8080!
2023-01-18T04:05:46.859 app[b023793b] sin [info] Retrieved all data
2023-01-18T04:05:46.859 app[b023793b] sin [info] IFCONFIG.ME Response: 167.88.158.67
2023-01-18T04:05:50.908 app[b023793b] sin [info] Error: timeout expired
2023-01-18T04:05:50.908 app[b023793b] sin [info] at Timeout._onTimeout (/app/node_modules/pg/lib/client.js:106:28)
2023-01-18T04:05:50.908 app[b023793b] sin [info] at listOnTimeout (node:internal/timers:564:17)
2023-01-18T04:05:50.908 app[b023793b] sin [info] at process.processTimers (node:internal/timers:507:7)
```

App will show timeout error. Take the egress IP and add to Allow list on YBM
