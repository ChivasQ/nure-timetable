const mysql = require('mysql2');
const fs = require('fs');
const CONFIG_PATH = "./config.json"
let config = null;

try {
  const fileContent = fs.readFileSync(CONFIG_PATH, 'utf8');
  config = JSON.parse(fileContent);
  
} catch (error) {
  console.error('Помилка при читані конфігу:', error);
  return;
}

const connection = mysql.createConnection({
    host: config["host"],
    user: config["user"],
    password: config["password"],
    database: config["database"]
});

connection.connect(function(err) {
    if (err) {
        console.error(":( Sad: " + err.stack);
        return;
    }
    console.log("Connected to db :)");
});

function executeQuery(sqlQuery, params = []) {
    return new Promise((resolve, reject) => {
        connection.query(sqlQuery, params, (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
}

module.exports = {
    executeQuery
};