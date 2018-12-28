'user strict';

var qbos_db = require('../helper/mysql_qbos_db.js');

exports.getModuleList = function() {
    return new Promise((resolve, reject)=>{
        qbos_db.execute('SELECT * FROM module WHERE is_deleted = 0')
        .then((data)=>{
            resolve(data);
        }).catch((error)=>{
            reject(error);
        });
    });
};