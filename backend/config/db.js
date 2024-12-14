const mysql = require('mysql2');
const fs = require('fs');   
const path = require('path');
require('dotenv').config();

const cert = path.join(__dirname, process.env.DB_SSL_CERT);

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
        ca: fs.readFileSync('C:\Users\HP\Desktop\Coding\PLP Academy\Project\Telemedicine_Application\backend\config\DigiCertGlobalRootCA.crt.pem')
    }
});

module.exports = pool.promise();