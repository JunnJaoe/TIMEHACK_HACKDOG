"use strict";

const mysql = require('mysql');

/* for localhost mysql database */
const config = {
  host:       process.env.TIMEHACK_MYSQL_HOST || '<mysql-host>',
  user:       process.env.TIMEHACK_MYSQL_USER || '<mysql-user>',
  password:   process.env.TIMEHACK_MYSQL_PASS || '<mysql-pass>',
  name:       process.env.TIMEHACK_MYSQL_NAME || '<mysql-name>',
  port:       process.env.TIMEHACK_MYSQL_PORT || '<mysql-port>'
};

const state = {
  pool: null
};

exports.connect = function (done) {

  state.pool = mysql.createPool({
    connectionLimit: 100, //important
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.name,
    port: config.port
  });

  return new Promise((resolve, reject) => {
    let conn = execute("Select version()", []);
    conn.then((data) => {
      resolve(data);
    }).catch((error) => {
      reject(error);
    });
  });
};

exports.get = function (callback) {
  return state.pool;
};

function execute(sql, param) {
  return new Promise((resolve, reject) => {
    state.pool.getConnection(function (error, connection) {
      if (error) {
        reject(error);
      } else {
        connection.query(sql, param, function (err, rows) {
          connection.release();
          if (!err) {
            resolve(rows);
          }
          else {
            reject(err);
          }
        });

        connection.on('error', function (err) {
          connection.release();
          reject(err);
        });
      }
    });
  });
};

exports.execute = execute;