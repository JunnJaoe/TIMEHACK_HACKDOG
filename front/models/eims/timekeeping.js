'user strict';

var qbos_eims_db = require('../../helper/mysql_qbos_eims_db.js');
var obj_res = require('../../helper/response.js');

exports.getFormList = function() {
    return new Promise((resolve, reject)=>{
        qbos_eims_db.execute('SELECT * FROM form_details WHERE is_deleted = 0')
        .then((data)=>{
            resolve(data);
        }).catch((error)=>{
            reject(error);
        });
    });
};

exports.getLeaveCredits = function(employee_id) {
    return new Promise((resolve, reject)=>{
        qbos_eims_db.execute('SELECT * FROM employee_credit WHERE employee_id = ? AND (valid_until >= NOW() OR valid_until IS NULL) AND is_forfeited = 0 AND is_deleted = 0', [employee_id])
        .then((data)=>{
            resolve(data);
        }).catch((error)=>{
            reject(error);
        });
    });
};

exports.getFormByID = function(form_name, id) {
    return new Promise((resolve, reject)=>{
        qbos_eims_db.execute('SELECT * FROM ?? WHERE id = ?', ['form_' + form_name, id])
        .then((data)=>{
            resolve(data);
        }).catch((error)=>{
            reject(error);
        });        
    });
};

exports.getFormComments = function(form_name, employee_id, start_date, end_date) {
    var forms = [
        'official_business',
        'overtime',
        'leave_of_absence'
    ];  // list of forms

    return new Promise((resolve, reject)=>{
        qbos_eims_db.execute(`
            SELECT fc.*, CONCAT(ei.first_name, ' ', ei.last_name) AS 'employee_name' FROM ?? f
            JOIN form_comment fc ON f.id = fc.form_id
            JOIN employee_information ei ON fc.employee_id = ei.id
            WHERE f.employee_id = ? AND (f.start_date <= ? AND f.end_date >= ?) AND fc.form_type = ? AND f.is_deleted = 0
        `, ['form_' + form_name, employee_id, end_date, start_date, forms.indexOf(form_name) + 1])
        .then((data)=>{
            resolve(data);
        }).catch((error)=>{
            reject(error);
        });        
    });
};

exports.getFormCommentsBySuperior = function(form_name, employee_id, start_date, end_date) {
    var forms = [
        'official_business',
        'overtime',
        'leave_of_absence'
    ];  // list of forms

    return new Promise((resolve, reject)=>{
        qbos_eims_db.execute(`
            SELECT fc.*, (SELECT CONCAT(first_name, ' ', last_name) FROM employee_information WHERE fc.employee_id = id) AS 'employee_name'
            FROM ?? f JOIN form_comment fc JOIN employee_information ei
            ON f.employee_id = ei.id AND f.id = fc.form_id
            WHERE ei.immediate_superior = ? AND (f.start_date <= ? AND f.end_date >= ?) AND fc.form_type = ? AND f.is_deleted = 0
        `, ['form_' + form_name, employee_id, end_date, start_date, forms.indexOf(form_name) + 1])
        .then((data)=>{
            resolve(data);
        }).catch((error)=>{
            reject(error);
        });        
    });
};

exports.getFiledOB = function(employee_id, start_date, end_date) {
    return new Promise((resolve, reject)=>{
        qbos_eims_db.execute(`
            SELECT fob.*, fd.name AS 'fob_name' FROM form_official_business fob JOIN form_details fd ON fob.fob_type = fd.id
            WHERE fob.employee_id = ? AND (fob.start_date <= ? AND fob.end_date >= ?) AND fob.is_deleted = 0
        `, [employee_id, end_date, start_date])
        .then((data)=>{
            resolve(data);
        }).catch((error)=>{
            reject(error);
        });
    });
};

exports.getFiledOBBySuperior = function(superior_id, start_date, end_date) {
    return new Promise((resolve, reject)=>{
        qbos_eims_db.execute(`
            SELECT fob.*, fd.name AS 'fob_name', CONCAT(ei.first_name, ' ', ei.last_name) AS 'employee_name'
            FROM form_official_business fob JOIN employee_information ei JOIN form_details fd
            ON fob.employee_id = ei.id AND fob.fob_type = fd.id
            WHERE ei.immediate_superior = ? AND (fob.start_date <= ? AND fob.end_date >= ?) AND fob.is_deleted = 0
            ORDER BY fob.status IS NULL, fob.status, ei.first_name, ei.last_name
        `, [superior_id, end_date, start_date])
        .then((data)=>{
            resolve(data);
        }).catch((error)=>{
            reject(error);
        });
    });
};

exports.getFiledOT = function(employee_id, start_date, end_date) {
    return new Promise((resolve, reject)=>{
        qbos_eims_db.execute(`
            SELECT fot.*, fd.name AS 'fot_name' FROM form_overtime fot JOIN form_details fd ON fot.fot_type = fd.id
            WHERE fot.employee_id = ? AND (fot.start_date <= ? AND fot.end_date >= ?) AND fot.is_deleted = 0
        `, [employee_id, end_date, start_date])
        .then((data)=>{
            resolve(data);
        }).catch((error)=>{
            reject(error);
        });
    });
};

exports.getFiledOTBySuperior = function(superior_id, start_date, end_date) {
    return new Promise((resolve, reject)=>{
        qbos_eims_db.execute(`
            SELECT fot.*, fd.name AS 'fot_name', CONCAT(ei.first_name, ' ', ei.last_name) AS 'employee_name'
            FROM form_overtime fot JOIN employee_information ei JOIN form_details fd
            ON fot.employee_id = ei.id AND fot.fot_type = fd.id
            WHERE ei.immediate_superior = ? AND (fot.start_date <= ? AND fot.end_date >= ?) AND fot.is_deleted = 0
            ORDER BY fot.status IS NULL, fot.status, ei.first_name, ei.last_name
        `, [superior_id, end_date, start_date])
        .then((data)=>{
            resolve(data);
        }).catch((error)=>{
            reject(error);
        });
    });
};

exports.getFiledLOA = function(employee_id, start_date, end_date) {
    return new Promise((resolve, reject)=>{
        qbos_eims_db.execute(`
            SELECT floa.*, fd.name AS 'floa_name' FROM form_leave_of_absence floa JOIN form_details fd ON floa.floa_type = fd.id
            WHERE floa.employee_id = ? AND (floa.start_date <= ? AND floa.end_date >= ?) AND floa.is_deleted = 0
        `, [employee_id, end_date, start_date])
        .then((data)=>{
            resolve(data);
        }).catch((error)=>{
            reject(error);
        });
    });
};

exports.getFiledLOABySuperior = function(superior_id, start_date, end_date) {
    return new Promise((resolve, reject)=>{
        qbos_eims_db.execute(`
            SELECT floa.*, fd.name AS 'floa_name', CONCAT(ei.first_name, ' ', ei.last_name) AS 'employee_name'
            FROM form_leave_of_absence floa JOIN employee_information ei JOIN form_details fd
            ON floa.employee_id = ei.id AND floa.floa_type = fd.id
            WHERE ei.immediate_superior = ? AND (floa.start_date <= ? AND floa.end_date >= ?) AND floa.is_deleted = 0
            ORDER BY floa.status IS NULL, floa.status, ei.first_name, ei.last_name
        `, [superior_id, end_date, start_date])
        .then((data)=>{
            resolve(data);
        }).catch((error)=>{
            reject(error);
        });
    });
};

exports.addOfficialBusiness = function(data) {
    return new Promise((resolve, reject)=>{
        qbos_eims_db.execute('INSERT INTO form_official_business SET ?', [data])
        .then((data)=>{
            if(data.data.affectedRows) {
                resolve(data);                
            } else {
                reject(obj_res.Error(null, 'Cannot insert in the row.', 500));
            }
        }).catch((error)=>{
            reject(error);
        });
    });
};

exports.editOfficialBusiness = function(id, data) {
    return new Promise((resolve, reject)=>{
        qbos_eims_db.execute('UPDATE form_official_business SET ? WHERE id = ?', [data, id])
        .then((data)=>{
            if(data.data.affectedRows) {
                resolve(data);
            } else {
                reject(obj_res.Error(null, 'Cannot update row.', 500));
            }
        }).catch((error)=>{
            reject(error);
        });
    });
};

exports.addOvertime = function(data) {
    return new Promise((resolve, reject)=>{
        qbos_eims_db.execute('INSERT INTO form_overtime SET ?', [data])
        .then((data)=>{
            if(data.data.affectedRows) {
                resolve(data);                
            } else {
                reject(obj_res.Error(null, 'Cannot insert in the row.', 500));
            }
        }).catch((error)=>{
            reject(error);
        });
    });
};

exports.editOvertime = function(id, data) {
    return new Promise((resolve, reject)=>{
        qbos_eims_db.execute('UPDATE form_overtime SET ? WHERE id = ?', [data, id])
        .then((data)=>{
            if(data.data.affectedRows) {
                resolve(data);
            } else {
                reject(obj_res.Error(null, 'Cannot update row.', 500));
            }
        }).catch((error)=>{
            reject(error);
        });
    });
};

exports.addLeaveOfAbsence = function(data) {
    return new Promise((resolve, reject)=>{
        qbos_eims_db.execute('INSERT INTO form_leave_of_absence SET ?', [data])
        .then((data)=>{
            if(data.data.affectedRows) {
                resolve(data);                
            } else {
                reject(obj_res.Error(null, 'Cannot insert in the row.', 500));
            }
        }).catch((error)=>{
            reject(error);
        });
    });
};

exports.editLeaveOfAbsence = function(id, data) {
    return new Promise((resolve, reject)=>{
        qbos_eims_db.execute('UPDATE form_leave_of_absence SET ? WHERE id = ?', [data, id])
        .then((data)=>{
            if(data.data.affectedRows) {
                resolve(data);
            } else {
                reject(obj_res.Error(null, 'Cannot update row.', 500));
            }
        }).catch((error)=>{
            reject(error);
        });
    });    
};

exports.approveForm = function(form_name, form_id) {
    return new Promise((resolve, reject)=>{
        qbos_eims_db.execute('UPDATE ?? SET status = 1 WHERE id = ?', ['form_' + form_name, form_id])
        .then((data)=>{
            if(data.data.affectedRows) {
                resolve(data);
            } else {
                reject(obj_res.Error(null, 'Cannot update row.', 500));
            }
        }).catch((error)=>{
            reject(error);
        });        
    });
};

exports.disapproveForm = function(form_name, form_id) {
    return new Promise((resolve, reject)=>{
        qbos_eims_db.execute('UPDATE ?? SET status = -1 WHERE id = ?', ['form_' + form_name, form_id])
        .then((data)=>{
            if(data.data.affectedRows) {
                resolve(data);
            } else {
                reject(obj_res.Error(null, 'Cannot update row.', 500));
            }
        }).catch((error)=>{
            reject(error);
        });        
    });
};

exports.cancelForm = function(form_name, form_id, reason) {
    return new Promise((resolve, reject)=>{
        qbos_eims_db.execute('UPDATE ?? SET status = NULL, is_cancelled = 1, reason_for_cancel = ? WHERE id = ?', ['form_' + form_name, reason, form_id])
        .then((data)=>{
            if(data.data.affectedRows) {
                resolve(data);
            } else {
                reject(obj_res.Error(null, 'Cannot update row.', 500));
            }
        }).catch((error)=>{
            reject(error);
        });
    });    
};

exports.deleteForm = function(form_name, form_id) {
    return new Promise((resolve, reject)=>{
        qbos_eims_db.execute('UPDATE ?? SET is_deleted = 1 WHERE id = ?', ['form_' + form_name, form_id])
        .then((data)=>{
            if(data.data.affectedRows) {
                resolve(data);
            } else {
                reject(obj_res.Error(null, 'Cannot update row.', 500));
            }
        }).catch((error)=>{
            reject(error);
        });
    });
};

exports.addComment = function(data) {
    return new Promise((resolve, reject)=>{
        qbos_eims_db.execute('INSERT INTO form_comment SET ?', [data])
        .then((data)=>{
            if(data.data.affectedRows) {
                resolve(data);                
            } else {
                reject(obj_res.Error(null, 'Cannot insert in the row.', 500));
            }
        }).catch((error)=>{
            reject(error);
        });        
    });
};

/* Admin Models */

exports.getFormsFiltered = function(form_name, form_code, filter, status, start_date, end_date) {
    var query = `
        SELECT f.*, fd.name AS 'f_name', CONCAT(ei.first_name, ' ', ei.last_name) AS 'employee_name'
        FROM _insert_table_name_ f JOIN employee_information ei JOIN form_details fd
        ON f.employee_id = ei.id AND f._insert_type_field_ = fd.id
        WHERE ${ filter != 'all' ? 'ei.' + filter + ' AND ' : '' }(f.start_date <= ? AND f.end_date >= ?) AND ${ status != 'all' ? 'f.status ' + status + ' AND ' : '' }f.is_deleted = 0
        ORDER BY f.start_date, f.start_time
    `;

    var data = {
        ob: null,
        ot: null,
        loa: null
    };

    return new Promise((resolve, reject)=>{
        if(form_name != 'all') {
            qbos_eims_db.execute(
                query
                    .replace('_insert_table_name_', 'form_' + form_name)
                    .replace('_insert_type_field_', 'f' + form_code + '_type'),
                [end_date, start_date]
            )
            .then((forms)=>{
                data[form_code] = forms.data;
                resolve(data);
            }).catch((error)=>{
                reject(error);
            });
        } else {
            let get_ob = qbos_eims_db.execute(
                query
                    .replace('_insert_table_name_', 'form_official_business')
                    .replace('_insert_type_field_', 'fob_type'),
                [end_date, start_date]
            );
            let get_ot = qbos_eims_db.execute(
                query
                    .replace('_insert_table_name_', 'form_overtime')
                    .replace('_insert_type_field_', 'fot_type'),
                [end_date, start_date]
            );
            let get_loa = qbos_eims_db.execute(
                query
                    .replace('_insert_table_name_', 'form_leave_of_absence')
                    .replace('_insert_type_field_', 'floa_type'),
                [end_date, start_date]
            );
            
            Promise.all([get_ob, get_ot, get_loa])
            .then((forms)=>{
                data['ob'] = forms[0].data;
                data['ot'] = forms[1].data,
                data['loa'] = forms[2].data;
                resolve(data);
            }).catch((error)=>{
                reject(error);
            });
        }
    });
};

exports.getFormCommentByFormID = function(form_id, type_id) {
    return new Promise((resolve, reject)=>{
        qbos_eims_db.execute(`
            SELECT fc.*, (SELECT CONCAT(first_name, ' ', last_name) FROM employee_information WHERE fc.employee_id = id) AS 'employee_name'
            FROM form_comment fc WHERE fc.form_id = ? AND fc.form_type = ? AND is_deleted = 0
        `, [form_id, type_id])
        .then((data)=>{
            resolve(data);
        }).catch((error)=>{
            reject(error);
        });
    });
};