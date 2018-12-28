$(document).ready(function() {
    // $(".select2").select2();

    // $("#select-form").change(function() {
    // });
    $("#select-department").change(function() {
        var department_id = $('option:selected', this).val();

        if(department_id != 0) {
            $("#select-section").prop("disabled", false);
            $("#select-section").children('option').hide();
            $("#select-section").children('option[value=0]').show();
            $("#select-section").children('option[class=' + department_id + ']').show();
            $("#select-section").children('option[value=0]').prop('selected', true);

            $("#select-employee").prop("disabled", true);
            $("#select-employee").children('option').hide();
            $("#select-employee").children('option[value=0]').show();
            $("#select-employee").children('option[department=' + department_id + ']').show();
            $("#select-employee").children('option[value=0]').prop('selected', true);
        } else {
            $("#select-section").prop("disabled", true);
            $("#select-section").children('option[value=0]').prop('selected', true);
            $("#select-employee").prop("disabled", true);
            $("#select-employee").children('option[value=0]').prop('selected', true);
        }
    });

    $("#select-section").change(function() {
        var section_id = $('option:selected', this).val();

        if(section_id != 0) {
            $("#select-employee").prop("disabled", false);
            $("#select-employee").children('option').hide();
            $("#select-employee").children('option[value=0]').show();
            $("#select-employee").children('option[section=' + section_id + ']').show();
            $("#select-employee").children('option[value=0]').prop('selected', true);
        } else {
            $("#select-employee").prop("disabled", true);
            $("#select-employee").children('option[value=0]').prop('selected', true);
        }
    });

    $("#filter-form-list").on("click", function() {
        var form_type = $("#select-form").val();
        var department_id = $("#select-department").val();
        var section_id = $("#select-section").val();
        var employee_id = $("#select-employee").val();
        var status = $("#select-status").val();

        if(department_id != 0) {
            admin_filter_list(sessionStorage.getItem('admin-active-filter-start-date'), sessionStorage.getItem('admin-active-filter-end-date'), form_type, department_id, section_id, employee_id, status);
        } else {
            $("#show-all-confirmation-modal").modal();
        }
    });

    $("#show-all-forms").on("click", function() {
        var form_type = $("#select-form").val();
        var department_id = $("#select-department").val();
        var section_id = $("#select-section").val();
        var employee_id = $("#select-employee").val();
        var status = $("#select-status").val();

        admin_filter_list(sessionStorage.getItem('admin-active-filter-start-date'), sessionStorage.getItem('admin-active-filter-end-date'), form_type, department_id, section_id, employee_id, status);
    });

    var date = new Date();
    var d = date.getDate(),
        m = date.getMonth(),
        y = date.getFullYear();
    $('#calendar').fullCalendar({
        defaultDate: sessionStorage.getItem('admin-active-filter-start-date'),
        header: {
            left: 'prev,next today',
            center: 'title',
            // right: 'month,agendaWeek,agendaDay'
            right: 'month'
        },
        buttonText: {
            today: 'today',
            month: 'month',
            week: 'week',
            day: 'day'
        },
        events: forms,
        editable: false,
        displayEventEnd: true,
        eventMouseover: function(calEvent, jsEvent, view) {
            $(this).css('cursor', 'pointer');
            $(this).attr('data-toggle', 'tooltip');
            $(this).attr('data-placement', 'top');
            $(this).attr('data-html', 'true');
            $(this).attr('title',
                '<b>Filed on: </b>' + calEvent.view.filed_on + '<br/>' +
                '<b>Date: </b>' + moment(calEvent.start).format('MMM D, YYYY') + (moment(calEvent.start).format('MMM D, YYYY') != moment(calEvent.end).format('MMM D, YYYY') ? ' - ' + moment(calEvent.end).format('MMM D, YYYY') : '') + '<br/>' +
                '<b>Time: </b>' + moment(calEvent.start).format('h:mm A') + ' - ' + moment(calEvent.end).format('h:mm A') + '<br/>' +
                '<b>Employee Name: </b>' + calEvent.title + '<br/>' +
                '<b>Form: </b>' + calEvent.view.form_name + '<br/>' +
                '<b>Type: </b>' + calEvent.view.type + '<br/>' +
                '<b>Details: </b>' + calEvent.view.details
            );
        },
        eventClick: function(calEvent, jsEvent, view) {
            var form = {
                form_main_id: calEvent.view.form_main_id,
                id: calEvent.view.form_id,
                form_id: calEvent.view.form_type_id,
                name: calEvent.view.form_name,
                employee_name: calEvent.title,
                date: moment(calEvent.start).format('MM/DD/YYYY') + ' ' + moment(calEvent.start).format('h:mm A') + " - " + moment(calEvent.end).format('MM/DD/YYYY') + ' ' + moment(calEvent.end).format('h:mm A'),
                details: calEvent.view.details,
                type: calEvent.view.type
            };
            fetch_comments(form);
            // alert('Event: ' + calEvent.title);
            // alert('Coordinates: ' + jsEvent.pageX + ',' + jsEvent.pageY);
            // alert('View: ' + view.name);
        },
        eventRender: function(event, element) {
            element.find('span.fc-title').html(element.find('span.fc-title').text());
        },
    });

    // custom event triggers
    $(".fc-next-button, .fc-prev-button").on("click", function() {
        var date = $("#calendar").fullCalendar('getDate');
        var date1 = moment(date).startOf('month');
        var date2 = moment(date).endOf('month');

        if($(".fc-month-button").hasClass('fc-state-active')) {
            if(sessionStorage.getItem('admin-active-filter-data-form-type') && sessionStorage.getItem('admin-active-filter-data-department-id') && sessionStorage.getItem('admin-active-filter-data-section-id') && sessionStorage.getItem('admin-active-filter-data-employee-id')) {
                sessionStorage.setItem('admin-active-filter-start-date', date1);
                sessionStorage.setItem('admin-active-filter-end-date', date2);

                admin_filter_list(date1, date2, sessionStorage.getItem('admin-active-filter-data-form-type'), sessionStorage.getItem('admin-active-filter-data-department-id'), sessionStorage.getItem('admin-active-filter-data-section-id'), sessionStorage.getItem('admin-active-filter-data-employee-id'), sessionStorage.getItem('admin-active-filter-data-status'));
            }
        } else {
            if(moment(date1).format('YYYY-MM-DD') != moment(sessionStorage.getItem('admin-active-filter-start-date')).format('YYYY-MM-DD') &&
                moment(date2).format('YYYY-MM-DD') != moment(sessionStorage.getItem('admin-active-filter-end-date')).format('YYYY-MM-DD')) {
                if(sessionStorage.getItem('admin-active-filter-data-form-type') && sessionStorage.getItem('admin-active-filter-data-department-id') && sessionStorage.getItem('admin-active-filter-data-section-id') && sessionStorage.getItem('admin-active-filter-data-employee-id')) {
                    sessionStorage.setItem('admin-active-filter-start-date', date1);
                    sessionStorage.setItem('admin-active-filter-end-date', date2);

                    admin_filter_list(date1, date2, sessionStorage.getItem('admin-active-filter-data-form-type'), sessionStorage.getItem('admin-active-filter-data-department-id'), sessionStorage.getItem('admin-active-filter-data-section-id'), sessionStorage.getItem('admin-active-filter-data-employee-id'), sessionStorage.getItem('admin-active-filter-data-status'));                
                }
            }
        }
    });

    var active_form_type = sessionStorage.getItem('admin-active-filter-data-form-type');
    var active_department_id = sessionStorage.getItem('admin-active-filter-data-department-id');
    var active_section_id = sessionStorage.getItem('admin-active-filter-data-section-id');
    var active_employee_id = sessionStorage.getItem('admin-active-filter-data-employee-id');
    var active_status = sessionStorage.getItem('admin-active-filter-data-status');

    if(active_form_type && active_department_id && active_section_id && active_employee_id) {
        $("#initial-alert-info").hide();
        $("#export-to-csv").prop("disabled", false);
        $("#select-form").val(active_form_type);
        $("#select-department").val(active_department_id);
        $("#select-department").trigger("change");
        $("#select-section").val(active_section_id);
        $("#select-section").trigger("change");
        $("#select-employee").val(active_employee_id);
        $("#select-status").val(active_status);
    } else {
        $("#initial-alert-info").show();
        $("#export-to-csv").prop("disabled", true);
    }
    
    if($("#select-department").val() == 0) {
        $("#select-section").prop("disabled", true);
    } else {
        $("#select-section").prop("disabled", false);        
    }
    if($("#select-section").val() == 0) {
        $("#select-employee").prop("disabled", true);
    } else {
        $("#select-employee").prop("disabled", false);        
    }

    $("#add-comment").on("click", add_comment);
    $("#message").on("keyup", function(e) {
        var code = e.keyCode || e.which;
        if(code == 13) {
            add_comment();
        }
    });

    $("#export-to-csv").on("click", function() {
        var path = window.location.pathname;
        path = path.replace(/\/$/, '');

        window.location.href = path + '/export-to-csv';
    });
});

function admin_filter_list(date1, date2, form_type, department_id, section_id, employee_id, status) {
    var start_date = date1 ? moment(date1) : null;
    var end_date = date2 ? moment(date2) : null;

    sessionStorage.setItem('admin-active-filter-data-form-type', form_type);
    sessionStorage.setItem('admin-active-filter-data-department-id', department_id);
    sessionStorage.setItem('admin-active-filter-data-section-id', section_id);
    sessionStorage.setItem('admin-active-filter-data-employee-id', employee_id);
    sessionStorage.setItem('admin-active-filter-data-status', status)

    var path = window.location.pathname;
    path = path.replace(/\/$/, '');

    // $("#calendar-loading").show();
    $.ajax({
        url: path + '/admin-filter-list',
        type: 'POST',
        data: {
            date1: start_date ? start_date.format('MMMM D, YYYY') : start_date,
            date2: end_date ? end_date.format('MMMM D, YYYY') : end_date,
            form_id: form_type,
            department_id: department_id,
            section_id: section_id,
            employee_id: employee_id,
            status: status
        },
        dataType: 'json',
        success: function(cb) {
            // $("#calendar-loading").hide();
            window.location.href = path;
        },
        error: function(xhr, status, error) {
            console.log("Error: " + xhr.responseText);
        }
    });
}

function fetch_comments(form) {
    var path = window.location.pathname;
    path = path.replace(/\/$/, '');

    $.ajax({
        url: path + '/ajax-get-comments',
        type: 'POST',
        data: {
            form_id: form.id,
            form_type_id: form.form_main_id
        },
        dataType: 'json',
        success: function(cb) {
            $("#form-main-id").val(form.form_main_id);
            $("#form-id").val(form.id);
            $("#form-type-id").val(form.form_id);
            $("#form-employee-name").val(form.employee_name);
            $("#form-date-time").val(form.date);
            $("#form-name").val(form.name);
            $("#form-type").val(form.type);
            $("#form-details").val(form.details);
            $('.modal-comments').html('');
            $.each(cb.comments, function(i, v) {
                comment(v.employee_id, v.employee_name, v.comment_date, v.comment);
            });
            $("#comments-modal").modal();
            // console.log(cb);
        },
        error: function(xhr, status, error) {
            console.log("Error: " + xhr.responseText);
        }
    });    
}

function add_comment() {
    if($("#message").val().trim() != "") {
        $("#send-error-message").hide();
        $("#message").prop("disabled", true);
        $("#add-comment").addClass("disabled");
        $("#add-comment").html('<i class="fa fa-spinner fa-spin"></i> Sending');

        var comment_date = new Date();
        $.ajax({
            url: 'timekeeping/add-comment',
            type: 'POST',
            data: {
                commenter_id: $("#message").attr('sender-id'),
                form_type_id: $("#form-main-id").val(),
                form_id: $("#form-id").val(),
                comment_date_time: comment_date,
                comment: $("#message").val()
            },
            dataType: 'json',
            success: function(cb) {
                if(cb.success == 1) {
                    comment($("#message").attr('sender-id'), $("#message").attr('sender-name'), comment_date, $("#message").val()); // append to the comment trail

                    $("#send-error-message").hide();
                    $("#message").prop("disabled", false);
                    $("#add-comment").removeClass("disabled");
                    $("#add-comment").html('Send');
                    $("#message").val("");
                } else {
                    $("#message").prop("disabled", false);
                    $("#add-comment").removeClass("disabled");
                    $("#add-comment").html('Send');

                    $("#send-error-message").html("Failed to send the comment. Try again.");
                    $("#send-error-message").show();
                }
            },
            error: function(xhr, status, error) {
                console.log("Error: " + xhr.responseText);
                $("#message").prop("disabled", false);
                $("#add-comment").removeClass("disabled");
                $("#add-comment").html('Send');

                $("#send-error-message").html("Failed to send the comment. Try again.");
                $("#send-error-message").show();
            }
        });                            
    }
};