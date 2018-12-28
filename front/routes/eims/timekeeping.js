"use strict";

var express = require('express');
var router = express.Router();
var moment = require('moment');
var Excel = require('exceljs');
var tempy = require('tempy');
var timekeeping = require('../../services/eims/timekeeping');

router.get('/', function(request, response, next) {
    if(request.session.user) {
        var message = request.session.msg;
        request.session.msg = null;
        var employee_id = request.session.user['employee_id'];

        let index;
        if(request.session.user.access_type == 'employee') {
            var date1 = request.session['active-filter-start-date'] ? request.session['active-filter-start-date'] : moment().startOf('month');
            var date2 = request.session['active-filter-end-date'] ? request.session['active-filter-end-date'] : moment().endOf('month');

            index = timekeeping.index_data(employee_id, date1, date2);
        } else {
            var filter_data = null;
            var date1 = request.session['active-admin-filter-start-date'] ? request.session['active-admin-filter-start-date'] : moment().startOf('month');
            var date2 = request.session['active-admin-filter-end-date'] ? request.session['active-admin-filter-end-date'] : moment().endOf('month');
    
            if(request.session['active-admin-filter-data']) {
                filter_data = {
                    form_id: request.session['active-admin-filter-data']['form-id'],
                    department_id: request.session['active-admin-filter-data']['department-id'],
                    section_id: request.session['active-admin-filter-data']['section-id'],
                    employee_id: request.session['active-admin-filter-data']['employee-id'],
                    status: request.session['active-admin-filter-data']['status'],
                };
            }
            index = timekeeping.admin_index_data(employee_id, date1, date2, filter_data);
        }
        
        index.then((index_data)=>{
            var data = {
                page: {
                    title: "EIMS | Timekeeping Module",
                    name: "eims-timekeeping",
                    system: 'eims',
                    module: 'timekeeping'
                },
                index: index_data.data,
                user: request.session.user,
                moment: moment,
                msg: message
            };
            response.render('eims/timekeeping.html', data);    
        }).catch((error)=>{
            console.log(error);
            next(error);
        });
    } else {
        response.redirect('/');
    }
});

router.get('/approval', function(request, response, next) {
    if(request.session.user) {
        if(request.session.user['access_type'] == 'employee') {
            if(request.session.user['reporting_employee_count'] > 0) {
                var message = request.session.msg;
                request.session.msg = null;
                var employee_id = request.session.user['employee_id'];
                var date1 = request.session['approval-active-filter-start-date'] ? request.session['approval-active-filter-start-date'] : moment().startOf('month');
                var date2 = request.session['approval-active-filter-end-date'] ? request.session['approval-active-filter-end-date'] : moment().endOf('month');
                        
                let index = timekeeping.approval_list(employee_id, date1, date2);
                index.then((index_data)=>{
                    var data = {
                        page: {
                            title: "EIMS | Timekeeping Module",
                            name: "eims-timekeeping",
                            system: 'eims',
                            module: 'timekeeping-approval'
                        },
                        index: index_data.data,
                        user: request.session.user,
                        moment: moment,
                        msg: message
                    };
                    response.render('eims/timekeeping-approval.html', data);    
                }).catch((error)=>{
                    console.log(error);
                    next(error);
                });    
            } else {
                response.render('401.html', {
                    page: 'page_401',
                    user: request.session.user,
                    moment: require('moment')
                });
            }    
        } else {
            response.redirect('/');            
        }
    } else {
        response.redirect('/');
    }
});

router.post('/filter-list', function(request, response, next) {
    var employee_id = request.session.user['employee_id'];
    var date1 = request.body.date1;
    var date2 = request.body.date2;

    request.session['active-filter-start-date'] = date1;
    request.session['active-filter-end-date'] = date2;

    var data = {
        success: 1,
        msg: 'Successfully changed the filter list.'
    };
    response.json(data);
});

router.post('/filter-approval-list', function(request, response, next) {
    var employee_id = request.session.user['employee_id'];
    var date1 = request.body.date1;
    var date2 = request.body.date2;
    
    request.session['approval-active-filter-start-date'] = date1;
    request.session['approval-active-filter-end-date'] = date2;

    var data = {
        success: 1,
        msg: 'Successfully changed the filter approval list.'
    };
    response.json(data);
});

router.post('/admin-filter-list', function(request, response, next) {
    var employee_id = request.session.user['employee_id'];
    var date1 = request.body.date1;
    var date2 = request.body.date2;
    var form_id = request.body.form_id;
    var department_id = request.body.department_id;
    var section_id = request.body.section_id;
    var employee_id = request.body.employee_id;
    var status = request.body.status;

    request.session['active-admin-filter-start-date'] = date1;
    request.session['active-admin-filter-end-date'] = date2;
    request.session['active-admin-filter-data'] = {
        'form-id': form_id,
        'department-id': department_id,
        'section-id': section_id,
        'employee-id': employee_id,
        'status': status
    };
    var data = {
        success: 1,
        msg: 'Successfully changed the admin filter list.'
    };
    response.json(data);
});

router.post('/submit/:type', function(request, response, next) {
    var form_type = request.params.type;
    var form_details = request.body;
    var employee_id = request.session.user['employee_id'];

    switch(form_type) {
        case 'ob': {
            let ob = timekeeping.add_ob(employee_id, form_details);
            ob.then((data)=>{
                if(data.status == 1) {
                    request.session.msg = {
                        type: 'success',
                        msg: data.msg
                    };
                    let notify = timekeeping.notify_user(
                        employee_id,
                        'filing',
                        'QBOS Notification - Official Business Form has been filed',
                        `INSERT_NAME has filed an official business form.<br/><br/>
                        Please visit your account at QBOS to review this.`);
                    notify.then((data)=>{
                        console.log("Successfully sent email.");
                    }).catch((error)=>{
                        console.log("Error sending email. Details: " + error);
                    });
                } else {
                    request.session.msg = {
                        type: 'error',
                        msg: data.msg
                    };                    
                }
                response.redirect('/eims/timekeeping/')
            }).catch((error)=>{
                console.log(error);
                next(error);
            });
            break;
        }
        case 'ot': {
            let ot = timekeeping.add_ot(employee_id, form_details);
            ot.then((data)=>{
                if(data.status == 1) {
                    request.session.msg = {
                        type: 'success',
                        msg: data.msg
                    };
                    let notify = timekeeping.notify_user(
                        employee_id,
                        'filing',
                        'QBOS Notification - Overtime Form has been filed',
                        `INSERT_NAME has filed an overtime form.<br/><br/>
                        Please visit your account at QBOS to review this.`);
                    notify.then((data)=>{
                        console.log("Successfully sent email.");
                    }).catch((error)=>{
                        console.log("Error sending email. Details: " + error);
                    });
                } else {
                    request.session.msg = {
                        type: 'error',
                        msg: data.msg
                    };                    
                }
                response.redirect('/eims/timekeeping/')
            }).catch((error)=>{
                console.log(error);
                next(error);
            });
            break;
        }
        case 'loa': {
            let loa = timekeeping.add_loa(employee_id, form_details);
            loa.then((data)=>{
                if(data.status == 1) {
                    request.session.msg = {
                        type: 'success',
                        msg: data.msg
                    };
                    let notify = timekeeping.notify_user(
                        employee_id,
                        'filing',
                        'QBOS Notification - Leave of Absence Form has been filed',
                        `INSERT_NAME has filed an leave of absence form.<br/><br/>
                        Please visit your account at QBOS to review this.`);
                    notify.then((data)=>{
                        console.log("Successfully sent email.");
                    }).catch((error)=>{
                        console.log("Error sending email. Details: " + error);
                    });
                } else {
                    request.session.msg = {
                        type: 'error',
                        msg: data.msg
                    };                    
                }
                response.redirect('/eims/timekeeping/')
            }).catch((error)=>{
                console.log(error);
                next(error);
            });
            break;
        }
        default: {
            console.log("File: routes/eims/timekeeping.js Line 123. Gone to the default of switch case.");
            next();
        }
    }
});

router.post('/update/:type', function(request, response, next) {
    var form_type = request.params.type;
    var form_details = request.body;

    switch(form_type) {
        case 'ob': {
            let ob = timekeeping.edit_ob(form_details);
            ob.then((data)=>{
                if(data.status == 1) {
                    request.session.msg = {
                        type: 'success',
                        msg: data.msg
                    };
                } else {
                    request.session.msg = {
                        type: 'error',
                        msg: data.msg
                    };                    
                }
                response.redirect('/eims/timekeeping/')
            }).catch((error)=>{
                console.log(error);
                next(error);
            });
            break;
        }
        case 'ot': {
            let ot = timekeeping.edit_ot(form_details);
            ot.then((data)=>{
                if(data.status == 1) {
                    request.session.msg = {
                        type: 'success',
                        msg: data.msg
                    };
                } else {
                    request.session.msg = {
                        type: 'error',
                        msg: data.msg
                    };                    
                }
                response.redirect('/eims/timekeeping/')
            }).catch((error)=>{
                console.log(error);
                next(error);
            });
            break;
        }
        case 'loa': {
            let loa = timekeeping.edit_loa(form_details);
            loa.then((data)=>{
                if(data.status == 1) {
                    request.session.msg = {
                        type: 'success',
                        msg: data.msg
                    };
                } else {
                    request.session.msg = {
                        type: 'error',
                        msg: data.msg
                    };                    
                }
                response.redirect('/eims/timekeeping/')
            }).catch((error)=>{
                console.log(error);
                next(error);
            });
            break;
        }
        default: {
            console.log("File: routes/eims/timekeeping.js Line 123. Gone to the default of switch case.");
            next();
        }
    }
});

router.post('/approve-form', function(request, response, next) {
    var form = request.body;
    
    let approve_form = timekeeping.approve_form(form);
    approve_form.then((data)=>{
        if(data.status == 1) {
            request.session.msg = {
                type: 'success',
                msg: data.msg
            };
            let notify = timekeeping.notify_user(
                form,
                'approving',
                'QBOS Notification - Form has been approved',
                `Hi INSERT_EMPLOYEE_NAME!<br/><br/>
                This is to inform you that INSERT_SUPERIOR_NAME has approved your INSERT_TYPE_OF_FORM form.<br/><br/>
                You can visit your account at QBOS to see this.`);
            notify.then((data)=>{
                console.log("Successfully sent email.");
            }).catch((error)=>{
                console.log("Error sending email. Details: " + error);
            });
        } else {
            request.session.msg = {
                type: 'error',
                msg: data.msg
            };                    
        }
        response.redirect('/eims/timekeeping/approval')
    }).catch((error)=>{
        console.log(error);
        next(error);
    });
});

router.post('/disapprove-form', function(request, response, next) {
    var form = request.body;
    
    let disapprove_form = timekeeping.disapprove_form(form);
    disapprove_form.then((data)=>{
        if(data.status == 1) {
            request.session.msg = {
                type: 'success',
                msg: data.msg
            };
            let notify = timekeeping.notify_user(
                form,
                'approving',
                'QBOS Notification - Form has been disapproved',
                `Hi INSERT_EMPLOYEE_NAME!<br/><br/>
                This is to inform you that INSERT_SUPERIOR_NAME has disapproved your INSERT_TYPE_OF_FORM form.<br/><br/>
                You can visit your account at QBOS to see this.`);
            notify.then((data)=>{
                console.log("Successfully sent email.");
            }).catch((error)=>{
                console.log("Error sending email. Details: " + error);
            });
        } else {
            request.session.msg = {
                type: 'error',
                msg: data.msg
            };                    
        }
        response.redirect('/eims/timekeeping/approval')
    }).catch((error)=>{
        console.log(error);
        next(error);
    });
});

router.post('/cancel-form', function(request, response, next) {
    var form = request.body;
    
    let cancel_form = timekeeping.cancel_form(form);
    cancel_form.then((data)=>{
        if(data.status == 1) {
            request.session.msg = {
                type: 'success',
                msg: data.msg
            };
            let notify = timekeeping.notify_user(
                form,
                'cancelling',
                'QBOS Notification - Form has been cancelled',
                `Hi INSERT_SUPERIOR_NAME!<br/><br/>
                This is to inform you that INSERT_EMPLOYEE_NAME has cancelled his/her INSERT_TYPE_OF_FORM form.<br/><br/>
                You can visit your account at QBOS to see this.`);
            notify.then((data)=>{
                console.log("Successfully sent email.");
            }).catch((error)=>{
                console.log("Error sending email. Details: " + error);
            });
        } else {
            request.session.msg = {
                type: 'error',
                msg: data.msg
            };                    
        }
        response.redirect('/eims/timekeeping/')
    }).catch((error)=>{
        console.log(error);
        next(error);
    });
});

router.post('/delete-form', function(request, response, next) {
    var form = request.body;
    
    let delete_form = timekeeping.delete_form(form);
    delete_form.then((data)=>{
        if(data.status == 1) {
            request.session.msg = {
                type: 'success',
                msg: data.msg
            };
        } else {
            request.session.msg = {
                type: 'error',
                msg: data.msg
            };                    
        }
        response.redirect('/eims/timekeeping/')
    }).catch((error)=>{
        console.log(error);
        next(error);
    });
});

router.post('/add-comment', function(request, response, next) {
    var comment_details = request.body;

    let add_comment = timekeeping.add_comment(comment_details);
    add_comment.then((data)=>{
        var comment_data = {
            success: 1,
            insertId: data.data.data.insertId,
            msg: data.msg
        };
        response.json(comment_data);    
        let notify = timekeeping.notify_user(
            comment_details,
            'commenting',
            'QBOS Notification - Form has received a comment',
            `New comment on the form you are subscribed:<br/><br/>
            <i>${ moment(new Date(comment_details['comment_date_time'])).format('dddd, MMMM D, YYYY H:mm A') }</i><br/>
            <b>INSERT_COMMENTER_NAME:</b> ${ comment_details['comment'] }<br/><br/>
            You can visit your account at QBOS to see the full trail.`);
        notify.then((data)=>{
            console.log("Successfully sent email.");
        }).catch((error)=>{
            console.log("Error sending email. Details: " + error);
        });
    }).catch((error)=>{
        var error = {
            success: 0,
            msg: error
        };
        response.json(error);
    });
});

router.post('/ajax-get-comments', function(request, response, next) {
    let get_comments = timekeeping.get_comments_by_form_id(request.body.form_id, request.body.form_type_id);
    get_comments.then((data)=>{
        var comment_data = {
            success: 1,
            comments: data.data.data,
            msg: data.msg
        };
        response.json(comment_data);    
    }).catch((error)=>{
        var error = {
            success: 0,
            msg: error
        };
        response.json(error);        
    });
});

router.get('/export-to-csv', function(request, response, next) {
    var date1 = request.session['active-admin-filter-start-date'] ? request.session['active-admin-filter-start-date'] : moment().startOf('month');
    var date2 = request.session['active-admin-filter-end-date'] ? request.session['active-admin-filter-end-date'] : moment().endOf('month');

    // convert status code to words
    function stringifyStatus(status) {
        var string = '';
        switch(status) {
            case 1: { string = 'Approved'; break; }
            case -1: { string = 'Disapproved'; break; }
            case 0: { string = 'Pending'; break; }
            case null: { string = 'Cancelled'; break; }
        }
        return string;
    };

    if(request.session['active-admin-filter-data']) {
        var filter_data = {
            form_id: request.session['active-admin-filter-data']['form-id'],
            department_id: request.session['active-admin-filter-data']['department-id'],
            section_id: request.session['active-admin-filter-data']['section-id'],
            employee_id: request.session['active-admin-filter-data']['employee-id'],
            status: request.session['active-admin-filter-data']['status'],
        };

        let export_data = timekeeping.export_form_data(date1, date2, filter_data);
        export_data.then((data)=>{
            var form = data.data;

            if((form.ob != null && form.ob.length > 0) || (form.ot != null && form.ot.length > 0) || (form.loa != null && form.loa.length > 0)) {
                var workbook = new Excel.Workbook();
                workbook.creator = "Questronix Back Office System";
                workbook.created = new Date();
                workbook.properties.date1904 = true;

                if(form.ob != null) {
                    if(form.ob.length > 0) {
                        var worksheet = workbook.addWorksheet('Official Business', {
                            pageSetup: {paperSize: 9, orientation: 'landscape'}
                        });

                        var ob_worksheet = workbook.getWorksheet('Official Business');
                        ob_worksheet.columns = [
                            { header: 'No.', key: 'no', width: 5 },
                            { header: 'Employee Name', key: 'employeename', width: 25 },
                            { header: 'Type', key: 'type', width: 20 },
                            { header: 'Start Date', key: 'startdate', width: 15 },
                            { header: 'Start Time', key: 'starttime', width: 10 },
                            { header: 'End Date', key: 'enddate', width: 15 },
                            { header: 'End Time', key: 'endtime', width: 10 },
                            { header: 'Total Days', key: 'totaldays', width: 10 },
                            { header: 'Location', key: 'location', width: 20 },
                            { header: 'Details', key: 'details', width: 30 },
                            { header: 'Objectives', key: 'objectives', width: 20 },
                            { header: 'Result', key: 'result', width: 20 },
                            { header: 'Status', key: 'status', width: 20 },
                            { header: 'Date and Time Filed', key: 'datetimefiled', width: 25 },
                        ];

                        var rows = [];
                        for(var i = 0; i < form.ob.length; i++) {
                            var data = {
                                no: i + 1,
                                employeename: form.ob[i].employee_name,
                                type: form.ob[i].f_name,
                                startdate: moment(form.ob[i].start_date).format('MM/DD/YYYY'),
                                starttime: moment(form.ob[i].start_time, 'HH:mm:ss').format('h:mm A'),
                                enddate: moment(form.ob[i].end_date).format('MM/DD/YYYY'),
                                endtime: moment(form.ob[i].end_time, 'HH:mm:ss').format('h:mm A'),
                                totaldays: form.ob[i].total_days,
                                location: form.ob[i].location,
                                details: form.ob[i].fob_details,
                                objectives: form.ob[i].objective,
                                result: form.ob[i].result,
                                status: stringifyStatus(form.ob[i].status),
                                datetimefiled: moment(form.ob[i].date_filed).format('MM/DD/YYYY h:mm A')
                            };
                            rows.push(data);
                        }
                        
                        ob_worksheet.addRows(rows);
                    }
                }

                if(form.ot != null) {
                    if(form.ot.length > 0) {
                        var worksheet = workbook.addWorksheet('Overtime', {
                            pageSetup: {paperSize: 9, orientation: 'landscape'}
                        });

                        var ot_worksheet = workbook.getWorksheet('Overtime');
                        ot_worksheet.columns = [
                            { header: 'No.', key: 'no', width: 5 },
                            { header: 'Employee Name', key: 'employeename', width: 25 },
                            { header: 'Type', key: 'type', width: 20 },
                            { header: 'Start Date', key: 'startdate', width: 15 },
                            { header: 'Start Time', key: 'starttime', width: 10 },
                            { header: 'End Date', key: 'enddate', width: 15 },
                            { header: 'End Time', key: 'endtime', width: 10 },
                            { header: 'Total Hours', key: 'totalhours', width: 10 },
                            { header: 'Details', key: 'details', width: 30 },
                            { header: 'Accomplishment', key: 'accomplishment', width: 20 },
                            { header: 'Status', key: 'status', width: 20 },
                            { header: 'Date and Time Filed', key: 'datetimefiled', width: 25 },
                        ];

                        var rows = [];
                        for(var i = 0; i < form.ot.length; i++) {
                            var data = {
                                no: i + 1,
                                employeename: form.ot[i].employee_name,
                                type: form.ot[i].f_name,
                                startdate: moment(form.ot[i].start_date).format('MM/DD/YYYY'),
                                starttime: moment(form.ot[i].start_time, 'HH:mm:ss').format('h:mm A'),
                                enddate: moment(form.ot[i].end_date).format('MM/DD/YYYY'),
                                endtime: moment(form.ot[i].end_time, 'HH:mm:ss').format('h:mm A'),
                                totalhours: form.ot[i].total_hours,
                                details: form.ot[i].fot_details,
                                accomplishment: form.ot[i].accomplishment,
                                status: stringifyStatus(form.ot[i].status),
                                datetimefiled: moment(form.ot[i].date_filed).format('MM/DD/YYYY h:mm A')
                            };
                            rows.push(data);
                        }
                        
                        ot_worksheet.addRows(rows);
                    }
                }

                if(form.loa != null) {
                    if(form.loa.length > 0) {
                        var worksheet = workbook.addWorksheet('Leave of Absence', {
                            pageSetup: {paperSize: 9, orientation: 'landscape'}
                        });

                        var loa_worksheet = workbook.getWorksheet('Leave of Absence');
                        loa_worksheet.columns = [
                            { header: 'No.', key: 'no', width: 5 },
                            { header: 'Employee Name', key: 'employeename', width: 25 },
                            { header: 'Type', key: 'type', width: 20 },
                            { header: 'Start Date', key: 'startdate', width: 15 },
                            { header: 'Start Time', key: 'starttime', width: 10 },
                            { header: 'End Date', key: 'enddate', width: 15 },
                            { header: 'End Time', key: 'endtime', width: 10 },
                            { header: 'Total Days', key: 'totaldays', width: 10 },
                            { header: 'Details', key: 'details', width: 30 },
                            { header: 'Status', key: 'status', width: 20 },
                            { header: 'Date and Time Filed', key: 'datetimefiled', width: 25 },
                        ];

                        var rows = [];
                        for(var i = 0; i < form.loa.length; i++) {
                            var data = {
                                no: i + 1,
                                employeename: form.loa[i].employee_name,
                                type: form.loa[i].f_name,
                                startdate: moment(form.loa[i].start_date).format('MM/DD/YYYY'),
                                starttime: moment(form.loa[i].start_time, 'HH:mm:ss').format('h:mm A'),
                                enddate: moment(form.loa[i].end_date).format('MM/DD/YYYY'),
                                endtime: moment(form.loa[i].end_time, 'HH:mm:ss').format('h:mm A'),
                                totaldays: form.loa[i].total_days,
                                details: form.loa[i].floa_details,
                                status: stringifyStatus(form.loa[i].status),
                                datetimefiled: moment(form.loa[i].date_filed).format('MM/DD/YYYY h:mm A')
                            };
                            rows.push(data);
                        }
                        
                        loa_worksheet.addRows(rows);
                    }
                }

                var tempFilePath = tempy.file({ name: 'HR Forms (' + moment(date1, 'MMMM D, YYYY').format('MM-DD-YYYY') + ' to ' + moment(date2, 'MMMM D, YYYY').format('MM-DD-YYYY') + ').xlsx' });
                workbook.xlsx.writeFile(tempFilePath)
                    .then(function() {
                        response.download(tempFilePath);
                    });
            } else {
                request.session.msg = {
                    type: 'error',
                    msg: 'Insufficient data to export.'
                };
                response.redirect('/eims/timekeeping/')                
            }
        }).catch((error)=>{
            console.log(error);
            next(error);
        });
    } else {
        console.log("Error: Filter data not found.");
        next();
    }
});

module.exports = router;