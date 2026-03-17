const { Pool } = require("pg");

const pool = new Pool({
  user: "adityashah",
  host: "localhost",
  database: "fitness_tracker",
  port: 5432,
});

module.exports = pool;
