const { Pool } = require('pg');
require('dotenv').config();

const PORT = process.env.PORT || 3000;
const pool = new Pool({
  host: process.env.HOST,
  port: PORT,
  database: process.env.DATABASE,
  user: process.env.USER,
  password: process.env.PASSWORD,
  ssl: {
    rejectUnauthorized: false,
  },
});

module.exports = pool;