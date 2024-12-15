const mysql = require('mysql2');
const fs = require('fs');   
const path = require('path');
require('dotenv').config();

const pool = mysql.createPool(
    {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {ca: fs.readFileSync(process.env.DB_SSL_CERT, "utf8")}
});

module.exports = pool.promise();