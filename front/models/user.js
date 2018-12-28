"use strict";

var qbos_db = require('../helper/mysql_qbos_db');
var qbos_eims_db = require('../helper/mysql_qbos_eims_db');
var obj_res = require('../helper/response');

exports.checkUser = function(email_address) {
    return new Promise((resolve, reject)=>{
        qbos_db.execute('SELECT * FROM account WHERE email_address = ? AND is_deleted = 0', [email_address])
        .then((data)=>{
            resolve(data);
        }).catch((error)=>{
            reject(error);
        });
    });
};

exports.getEmployeeDetails = function(employee_id) {
    return new Promise((resolve, reject)=>{
        qbos_eims_db.execute(`
            SELECT *, (SELECT COUNT(*) FROM employee_information WHERE immediate_superior = ? AND is_deleted = 0) AS 'reporting_employee_count'
            FROM employee_information WHERE id = ? AND is_resigned = 0 AND is_deleted = 0
        `, [employee_id, employee_id])
        .then((data)=>{
            resolve(data);
        }).catch((error)=>{
            reject(error);
        });
    });
};

// place this model to maintenance module
exports.getEmployeeGroup = function() {
    return new Promise((resolve, reject)=>{
        qbos_eims_db.execute('SELECT * FROM employee_group WHERE is_deleted = 0')
        .then((data)=>{
            resolve(data);
        }).catch((error)=>{
            reject(error);
        });
    });
};

exports.checkAdminAccess = function(account_id) {
    return new Promise((resolve, reject)=>{
        qbos_db.execute('SELECT * FROM administration WHERE account_id = ? AND is_deleted = 0', [account_id])
        .then((data)=>{
            resolve(data);
        }).catch((error)=>{
            reject(error);
        });
    });
};