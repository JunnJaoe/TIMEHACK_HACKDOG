'user strict';

var qbos_eims_db = require('../../helper/mysql_qbos_eims_db.js');
var obj_res = require('../../helper/response.js');

exports.getAllEmployeeNames = function() {
    return new Promise((resolve, reject)=>{
        qbos_eims_db.execute(`SELECT id, CONCAT(first_name, ' ', last_name) AS 'employee_name', department, section FROM employee_information WHERE is_resigned = 0 AND is_deleted = 0`)
        .then((data)=>{
            resolve(data);
        }).catch((error)=>{
            reject(error);
        })
    });
};

exports.getEmployeeDetails = function(id) {
    return new Promise((resolve, reject)=>{
        qbos_eims_db.execute(`SELECT * FROM employee_information WHERE id = ?`, id)
        .then((data)=>{
            resolve(data);
        }).catch((error)=>{
            reject(error);
        });
    });
};