const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

const ENV = process.env.NODE_ENV || "development";
const config = {};

require("dotenv").config({
  path: `${__dirname}/../.env.${ENV}`,
});

if (ENV === "production") {
  config.connectionString = process.env.DATABASE_URL;
  config.max = 2;

  config.ssl = {
    rejectUnauthorized: true,
    ca: fs.readFileSync(path.join(__dirname, "../certs/ca.crt")).toString(),
  };
}

if (!process.env.PGDATABASE && !process.env.DATABASE_URL) {
  throw new Error("PGDATABASE or DATABASE_URL not set");
}

module.exports = new Pool(config);
