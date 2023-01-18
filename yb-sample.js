var pg = require('pg');
const async = require('async');
const fs = require('fs');
const { callbackify } = require('util');
const { rows } = require('pg/lib/defaults');

const config = {
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT ||'5433',
    database: process.env.DB_NAME ||'yugabyte',
    user: process.env.DB_USER ||'yugabyte',
    password: process.env.DB_PASSWORD || 'yugabyte',
    // Uncomment and initialize the SSL settings for YugabyteDB Managed and other secured types of deployment
    ssl: {
        rejectUnauthorized: true,
        ca: process.env.DB_CA_CERT
    },
    connectionTimeoutMillis: process.env.DB_TIMEOUT || 5000
};

var client;

async function connect(callbackHadler) {
    console.log('>>>> Connecting to YugabyteDB!');

    try {
        client = new pg.Client(config);

        await client.connect();

        console.log('>>>> Connected to YugabyteDB!');

        callbackHadler();
    } catch (err) {
        callbackHadler(err);
    }
}

async function createDatabase(callbackHadler) {
    try {
        var stmt = 'DROP TABLE IF EXISTS DemoAccount';

        await client.query(stmt);

        stmt = `CREATE TABLE DemoAccount (
            id int PRIMARY KEY,
            name varchar,
            age int,
            country varchar,
            balance int)`;

        await client.query(stmt);

        stmt = `INSERT INTO DemoAccount VALUES
            (1, 'Jessica', 28, 'USA', 10000),
            (2, 'John', 28, 'Canada', 9000)`;

        await client.query(stmt);

        console.log('>>>> Successfully created table DemoAccount.');

        callbackHadler();
    } catch (err) {
        callbackHadler(err);
    }
}

async function selectAccounts(callbackHadler) {
    console.log('>>>> Selecting accounts:');

    try {
        const res = await client.query('SELECT name, age, country, balance FROM DemoAccount');
        var row;

        for (i = 0; i < res.rows.length; i++) {
            row = res.rows[i];

            console.log('name = %s, age = %d, country = %s, balance = %d',
                row.name, row.age, row.country, row.balance);
        }

        callbackHadler();
    } catch (err) {
        callbackHadler(err);
    }
}

async function transferMoneyBetweenAccounts(callbackHadler, amount) {
    try {
        await client.query('BEGIN TRANSACTION');

        await client.query('UPDATE DemoAccount SET balance = balance - ' + amount + ' WHERE name = \'Jessica\'');
        await client.query('UPDATE DemoAccount SET balance = balance + ' + amount + ' WHERE name = \'John\'');
        await client.query('COMMIT');

        console.log('>>>> Transferred %d between accounts.', amount);

        callbackHadler();
    } catch (err) {
        callbackHadler(err);
    }
}

async.series([
    function (callbackHadler) {
        connect(callbackHadler);
    },
    function (callbackHadler) {
        createDatabase(callbackHadler);
    },
    function (callbackHadler) {
        selectAccounts(callbackHadler);
    },
    function (callbackHadler) {
        transferMoneyBetweenAccounts(callbackHadler, 800);
    },
    function (callbackHadler) {
        selectAccounts(callbackHadler);
    }
],
    function (err) {
        if (err) {
            // Applies to logic of the transferMoneyBetweenAccounts method
            if (err.code == 40001) {
                console.error(
                    `The operation is aborted due to a concurrent transaction that is modifying the same set of rows.
                    Consider adding retry logic or using the pessimistic locking.`);
            }

            console.error(err);
        }
        client.end();
    }
);
