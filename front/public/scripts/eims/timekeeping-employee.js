$(document).ready(function() {
    initialize_components();
    form_validators();
    modals();

    //make the first form as default select-type values
    filter_select_type(sessionStorage.getItem('active-form-id') ? sessionStorage.getItem('active-form-id') : 1);    // hard-coded
    select_tab(sessionStorage.getItem('active-form-name') ? sessionStorage.getItem('active-form-name') : 'Official Business');  // hard-coded

    $("#select-form").change(function() {
        var form_id = $('option:selected', this).attr("form");

        filter_select_type(form_id);
        select_tab($(this).val());
    });

    $(".tab-form").on("click", function() {
        var form_id = $(this).attr("form");
        var selected_tab = $(this).attr("tab-name");

        filter_select_type(form_id);
        select_tab(selected_tab);
    });

    $("#select-type").change(function() {
        var type_id = $('option:selected', this).attr("form");

        $(".form-type").val(type_id);

        $("#loa-credits").hide();
        if($(this).val() == "Vacation" || $(this).val() == "Sick" || $(this).val() == "Birthday") { // hard-coded
            $("#loa-credits").show();
            show_leave_credits(type_id, $("#loa-original-credits"), $("#loa-remaining-credits"), $("#loa-total"));
            $("#submit-loa-form").bootstrapValidator('enableFieldValidators', 'loa-total', true, 'callback');
            $("#submit-loa-form").bootstrapValidator('revalidateField', 'loa-total');
        } else {
            $("#submit-loa-form").bootstrapValidator('enableFieldValidators', 'loa-total', false, 'callback');
        }
    });

    $("#edit-loa-select-type").change(function() {
        $("#edit-loa-credits").hide();
        var selected = $("#edit-loa-select-type option:selected").text();
        if(selected == "Vacation" || selected == "Sick" || selected == "Birthday") { // hard-coded
            $("#edit-loa-credits").show();
            show_leave_credits($(this).val(), $("#edit-loa-original-credits"), $("#edit-loa-remaining-credits"), $("#edit-loa-total"));
            $("#submit-edit-loa-form").bootstrapValidator('enableFieldValidators', 'edit-loa-total', true, 'callback');
            $("#submit-edit-loa-form").bootstrapValidator('revalidateField', 'edit-loa-total');
        } else {
            $("#submit-edit-loa-form").bootstrapValidator('enableFieldValidators', 'edit-loa-total', false, 'callback');
        }        
    });

    $("#loa-total").on("keyup", function(e) {
        compute_remaining_credits($("#loa-original-credits").val(), $("#loa-remaining-credits"), $("#loa-total"));
        $("#submit-loa-form").bootstrapValidator('revalidateField', 'loa-total');
    });

    $("#edit-loa-total").on("keyup", function(e) {
        compute_remaining_credits($("#edit-loa-original-credits").val(), $("#edit-loa-remaining-credits"), $("#edit-loa-total"));
        var computed_credit = $("#edit-loa-remaining-credits").val();
        var original_total = $("#edit-loa-total").attr('original-total');

        var final_credit = parseFloat(computed_credit) + parseFloat(original_total);
        $("#edit-loa-remaining-credits").val(final_credit);
        $("#submit-edit-loa-form").bootstrapValidator('revalidateField', 'edit-loa-total');
    });
});

/* functions */

function initialize_components() {
    $("#loa-credits").hide();
    $("#edit-loa-credits").hide();
    $('#table-ob').DataTable();
    $('#table-ot').DataTable();
    $('#table-loa').DataTable();
    
    $('#ob-date-time').daterangepicker({
        timePicker: true,
        timePickerIncrement: 1,
        locale: {
            format: 'MM/DD/YYYY h:mm A'
        },
        format: 'MM/DD/YYYY h:mm A'
    }, function(start, end, label) {
        /* add this auto-compute feature on the future */
        // var diff_ms = moment(end).diff(moment(start));
        // var diff = moment.duration(diff_ms);
        // var diff_hrs = diff.asHours();

        // var days = 0;
        // days += Math.floor(diff_hrs / 24);
        // var hours = (diff_hrs % 24) - 1;    // deduction of 1 hour break
        // days += hours / 8;
        // alert(days);    // check if computation is correct
    });
    $('#edit-ob-date-time').daterangepicker({
        timePicker: true,
        timePickerIncrement: 1,
        locale: {
            format: 'MM/DD/YYYY h:mm A'
        },
        format: 'MM/DD/YYYY h:mm A'
    });
    $('#ot-date-time').daterangepicker({
        timePicker: true,
        timePickerIncrement: 1,
        locale: {
            format: 'MM/DD/YYYY h:mm A'
        },
        format: 'MM/DD/YYYY h:mm A'
    });
    $('#edit-ot-date-time').daterangepicker({
        timePicker: true,
        timePickerIncrement: 1,
        locale: {
            format: 'MM/DD/YYYY h:mm A'
        },
        format: 'MM/DD/YYYY h:mm A'
    });
    $('#loa-date-time').daterangepicker({
        timePicker: true,
        timePickerIncrement: 1,
        locale: {
            format: 'MM/DD/YYYY h:mm A'
        },
        format: 'MM/DD/YYYY h:mm A'
    });
    $('#edit-loa-date-time').daterangepicker({
        timePicker: true,
        timePickerIncrement: 1,
        locale: {
            format: 'MM/DD/YYYY h:mm A'
        },
        format: 'MM/DD/YYYY h:mm A'
    });
    
    var start = sessionStorage.getItem('active-filter-start-date') ? moment(sessionStorage.getItem('active-filter-start-date')) : moment().startOf('month');
    var end = sessionStorage.getItem('active-filter-end-date') ? moment(sessionStorage.getItem('active-filter-end-date')) : moment().endOf('month');

    function cb(start, end) {
        $('#filter-list span').html('<b>Filter List by:</b> ' + start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
        sessionStorage.setItem('active-filter-start-date', start);
        sessionStorage.setItem('active-filter-end-date', end);
    }

    $('#filter-list').daterangepicker({
        startDate: start,
        endDate: end,
        ranges: {
           'Today': [moment(), moment()],
           'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
           'Last 7 Days': [moment().subtract(6, 'days'), moment()],
           'Last 30 Days': [moment().subtract(29, 'days'), moment()],
           'This Month': [moment().startOf('month'), moment().endOf('month')],
           'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
        }
    }, cb);

    cb(start, end);

    $('#filter-list').on('apply.daterangepicker', function(ev, picker) {
        filter_list(picker.startDate, picker.endDate);
    });
}

function filter_select_type(form_id) {
    sessionStorage.setItem('active-form-id', form_id);

    var form_name = $("#select-form").children('option[form^=' + form_id + ']').val();
    $("#title-form").html(form_name);

    $("#select-type").children('option').hide();
    $("#select-type").children('option[class^=' + form_id + ']').show();
    $("#select-type option").each(function() {
        if($(this).css('display') != 'none') {
            $("#loa-credits").show();
            show_leave_credits($(this).attr("form"), $("#loa-original-credits"), $("#loa-remaining-credits"), $("#loa-total"));
            $(this).prop("selected", true);
            $(".form-type").val($(this).attr("form"));
            return false;
        }
    });

    $("#select-form").children('option[form^=' + form_id + ']').prop("selected", true);
}

function show_leave_credits(type_id, field_original, field_remain, field_total) {
    var credits = 0;
    for(var i = 0; i < leave_credits.length; i++) {
        if(leave_credits[i]['leave_id'] == type_id) {
            credits = leave_credits[i]['balance'];
            break;
        }
    }
    field_original.val(credits);
    compute_remaining_credits(credits, field_remain, field_total);
}

function compute_remaining_credits(credits, field_remain, field_total) {
    var concur_leave = field_total.val() != '' ? field_total.val() : 0;
    var remaining_leave = parseFloat(credits) - parseFloat(concur_leave);
    // if(remaining_leave >= 0) {
        field_remain.val(remaining_leave);
    // } else {
    //     field_remain.val("N/A!");        
    // }
}

(function($) {
    $.fn.bootstrapValidator.validators.isPositive = {
        validate: function(validator, $field, options) {
            var value = $field.val();
            if(value <= 0) {
                return false;
            }
            return true;
        }
    };
}(window.jQuery));

function form_validators() {
    /* Form Validators */

    $("#submit-ob-form").bootstrapValidator({
        message: 'This value is not valid!',
        fields: {
            'ob-date-time': {
                validators: {
                    notEmpty: {
                        message: 'Date and Time is required!'
                    }
                }
            },
            'ob-total': {
                validators: {
                    notEmpty: {
                        message: 'Total is required!'
                    },
                    numeric: {
                        message: 'Total must be numeric.'
                    },
                    isPositive: {
                        message: 'Total must be greater than 0.'
                    },
                }
            },            
            'ob-location': {
                validators: {
                    notEmpty: {
                        message: 'Location is required!'
                    }
                }
            },
            'ob-details': {
                validators: {
                    notEmpty: {
                        message: 'Details is required!'
                    }
                }
            },
            'ob-objective': {
                validators: {
                    notEmpty: {
                        message: 'Objective is required!'
                    }
                }
            },
        }
    }).on('success.field.bv', function(e, data) {
        var $parent = data.element.parents('.form-group');
        $parent.removeClass('has-success');
        $parent.find('.form-control-feedback[data-bv-icon-for="' + data.field + '"]').hide();
    });

    $("#submit-edit-ob-form").bootstrapValidator({
        message: 'This value is not valid!',
        fields: {
            'edit-ob-date-time': {
                validators: {
                    notEmpty: {
                        message: 'Date and Time is required!'
                    }
                }
            },
            'edit-ob-total': {
                validators: {
                    notEmpty: {
                        message: 'Total is required!'
                    },
                    numeric: {
                        message: 'Total must be numeric.'
                    },
                    isPositive: {
                        message: 'Total must be greater than 0.'
                    }
                }
            },            
            'edit-ob-location': {
                validators: {
                    notEmpty: {
                        message: 'Location is required!'
                    }
                }
            },
            'edit-ob-details': {
                validators: {
                    notEmpty: {
                        message: 'Details is required!'
                    }
                }
            },
            'edit-ob-objective': {
                validators: {
                    notEmpty: {
                        message: 'Objective is required!'
                    }
                }
            },
        }
    }).on('success.field.bv', function(e, data) {
        var $parent = data.element.parents('.form-group');
        $parent.removeClass('has-success');
        $parent.find('.form-control-feedback[data-bv-icon-for="' + data.field + '"]').hide();
    });

    $("#submit-ot-form").bootstrapValidator({
        message: 'This value is not valid!',
        fields: {
            'ot-date-time': {
                validators: {
                    notEmpty: {
                        message: 'Date and Time is required!'
                    }
                }
            },
            'ot-total': {
                validators: {
                    notEmpty: {
                        message: 'Total is required!'
                    },
                    numeric: {
                        message: 'Total must be numeric.'
                    },
                    isPositive: {
                        message: 'Total must be greater than 0.'
                    }
                }
            },
            'ot-details': {
                validators: {
                    notEmpty: {
                        message: 'Details is required!'
                    }
                }
            },
            'ot-accomplishment': {
                validators: {
                    notEmpty: {
                        message: 'Accomplishment is required!'
                    }
                }
            },
        }
    }).on('success.field.bv', function(e, data) {
        var $parent = data.element.parents('.form-group');
        $parent.removeClass('has-success');
        $parent.find('.form-control-feedback[data-bv-icon-for="' + data.field + '"]').hide();
    });

    $("#submit-edit-ot-form").bootstrapValidator({
        message: 'This value is not valid!',
        fields: {
            'edit-ot-date-time': {
                validators: {
                    notEmpty: {
                        message: 'Date and Time is required!'
                    }
                }
            },
            'edit-ot-total': {
                validators: {
                    notEmpty: {
                        message: 'Total is required!'
                    },
                    numeric: {
                        message: 'Total must be numeric.'
                    },
                    isPositive: {
                        message: 'Total must be greater than 0.'
                    }
                }
            },
            'edit-ot-details': {
                validators: {
                    notEmpty: {
                        message: 'Details is required!'
                    }
                }
            },
            'edit-ot-accomplishment': {
                validators: {
                    notEmpty: {
                        message: 'Accomplishment is required!'
                    }
                }
            },
        }
    }).on('success.field.bv', function(e, data) {
        var $parent = data.element.parents('.form-group');
        $parent.removeClass('has-success');
        $parent.find('.form-control-feedback[data-bv-icon-for="' + data.field + '"]').hide();
    });

    $("#submit-loa-form").bootstrapValidator({
        message: 'This value is not valid!',
        fields: {
            'loa-date-time': {
                validators: {
                    notEmpty: {
                        message: 'Date and Time is required!'
                    }
                }
            },
            'loa-total': {
                validators: {
                    notEmpty: {
                        message: 'Total is required!'
                    },
                    numeric: {
                        message: 'Total must be numeric.'
                    },
                    isPositive: {
                        message: 'Total must be greater than 0.'
                    },
                    callback: {
                        callback: function(value, validator, $field) {
                            if(parseFloat($("#loa-remaining-credits").val()) < 0) {
                                return {
                                    valid: false,
                                    message: 'You don\'t have enough leave credits balance to file this!'
                                };
                            }
                            return true;
                        }
                    }
                }
            },            
            'loa-details': {
                validators: {
                    notEmpty: {
                        message: 'Details is required!'
                    }
                }
            },
        }
    }).on('success.field.bv', function(e, data) {
        var $parent = data.element.parents('.form-group');
        $parent.removeClass('has-success');
        $parent.find('.form-control-feedback[data-bv-icon-for="' + data.field + '"]').hide();
    });

    $("#submit-edit-loa-form").bootstrapValidator({
        message: 'This value is not valid!',
        fields: {
            'edit-loa-date-time': {
                validators: {
                    notEmpty: {
                        message: 'Date and Time is required!'
                    }
                }
            },
            'edit-loa-total': {
                validators: {
                    notEmpty: {
                        message: 'Total is required!'
                    },
                    numeric: {
                        message: 'Total must be numeric.'
                    },
                    isPositive: {
                        message: 'Total must be greater than 0.'
                    },
                    callback: {
                        callback: function(value, validator, $field) {
                            if(parseFloat($("#edit-loa-remaining-credits").val()) < 0) {
                                return {
                                    valid: false,
                                    message: 'You don\'t have enough leave credits balance to file this!'
                                };
                            }
                            return true;
                        }
                    }
                }
            },
            'edit-loa-details': {
                validators: {
                    notEmpty: {
                        message: 'Details is required!'
                    }
                }
            },
        }
    }).on('success.field.bv', function(e, data) {
        var $parent = data.element.parents('.form-group');
        $parent.removeClass('has-success');
        $parent.find('.form-control-feedback[data-bv-icon-for="' + data.field + '"]').hide();
    });    

    $("#submit-cancel-form").bootstrapValidator({
        message: 'This value is not valid!',
        fields: {
            'cancel-reason': {
                validators: {
                    notEmpty: {
                        message: 'Reason for Cancellation is required!'
                    }
                }
            },
        }
    }).on('success.field.bv', function(e, data) {
        var $parent = data.element.parents('.form-group');
        $parent.removeClass('has-success');
        $parent.find('.form-control-feedback[data-bv-icon-for="' + data.field + '"]').hide();
    });    
}

function select_tab(tab_name) {
    sessionStorage.setItem('active-form-name', tab_name);
    
    //change tab head
    $(".tab-form").each(function() {
        $(this).removeClass('active');
        if(tab_name == $(this).attr("tab-name")) {
            $(this).addClass('active');                
        }
    });

    //change form content
    $(".form-content").each(function() {
        $(this).hide();
        if(tab_name == $(this).attr("form-name")) {
            $(this).show();
        }
    });

    //change tab content
    $(".tab-pane").each(function() {
        $(this).removeClass('active');
        if(tab_name == $(this).attr("tab-name")) {
            $(this).addClass('active');                
        }
    });
}

function filter_list(start_date, end_date) {
    var path = window.location.pathname;
    path = path.replace(/\/$/, '');

    $.ajax({
        url: path + '/filter-list',
        type: 'POST',
        data: {
            date1: start_date.format('MMMM D, YYYY'),
            date2: end_date.format('MMMM D, YYYY')
        },
        dataType: 'json',
        success: function(cb) {
            window.location.href = path;
        },
        error: function(xhr, status, error) {
            console.log("Error: " + xhr.responseText);
        }
    });
}

function modals() {
    $(".form-comments").on("click", function() {
        var btn = $(this);
        var form_id = btn.attr('form-id');
        var comments = null;
        switch(sessionStorage.getItem('active-form-id')) {
            case '2': { comments = comments_ot; break; }
            case '3': { comments = comments_loa; break; }
            case '1':
            default: { comments = comments_ob; break; }
        }
        $('.modal-comments').html('');
        for(var i = 0; i < comments.length; i++) {
            if(comments[i].form_id == form_id) {
                comment(comments[i].commenter_id, comments[i].commenter, comments[i].date, comments[i].content);                
            }
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
                        form_type_id: sessionStorage.getItem('active-form-id'),
                        form_id: form_id,
                        comment_date_time: comment_date,
                        comment: $("#message").val()
                    },
                    dataType: 'json',
                    success: function(cb) {
                        if(cb.success == 1) {
                            var push_comment = {
                                form_id: form_id,
                                id: cb.insertId,
                                commenter_id: $("#message").attr('sender-id'),
                                commenter: $("#message").attr('sender-name'),
                                content: $("#message").val(),
                                date: comment_date,
                            };
                            comments.push(push_comment);    // push comment to comments array so that even the modal will close, it will stay on the modal content
                            var comments_count = btn.text().split(" ")[0];
                            if(isNaN(comments_count)) { // the comment is first
                                btn.text("1 Comment");
                            } else {    // reflect plus one on the button
                                btn.text((parseInt(comments_count) + 1) + " Comments");
                            }
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

        $("#add-comment").on("click", add_comment);
        $("#message").on("keyup", function(e) {
            var code = e.keyCode || e.which;
            if(code == 13) {
                add_comment();
            }
        });

        $("#comments-modal").modal();
    });

    $(".edit-form").on("click", function() {
        switch(sessionStorage.getItem('active-form-name')) {
            case 'Overtime': {
                var row = $(this).closest("td").closest("tr");
                var row_id = row.attr("id");
                var form_type = row.find(".td-ot-fot-type").attr('id');
                var start_date = row.find(".td-ot-start-date").text();
                var end_date = row.find(".td-ot-end-date").text();
                var total_hours = row.find(".td-ot-total-hours").text();
                var fot_details = row.find(".td-ot-fot-details").text();
                var accomplishment = row.find(".td-ot-accomplishment").text();
                
                $("#edit-ot-id").val(row_id);
                $("#edit-ot-select-type option[form^=" + form_type + "]").prop('selected', true);
                $("#edit-ot-date-time").val(moment(new Date(start_date)).format('MM/DD/YYYY h:mm A') + " - " + moment(new Date(end_date)).format('MM/DD/YYYY h:mm A'));
                $("#edit-ot-total").val(total_hours);
                $("#edit-ot-details").val(fot_details);
                $("#edit-ot-accomplishment").val(accomplishment);
                $("#edit-ot-modal").modal();
                break;
            }
            case 'Leave of Absence': {
                var row = $(this).closest("td").closest("tr");
                var row_id = row.attr("id");
                var form_type = row.find(".td-loa-floa-type").attr('id');
                var start_date = row.find(".td-loa-start-date").text();
                var end_date = row.find(".td-loa-end-date").text();
                var total_days = row.find(".td-loa-total-days").text();
                var floa_details = row.find(".td-loa-floa-details").text();
                
                $("#edit-loa-id").val(row_id);
                $("#edit-loa-select-type option[form^=" + form_type + "]").prop('selected', true);
                $("#edit-loa-date-time").val(moment(new Date(start_date)).format('MM/DD/YYYY h:mm A') + " - " + moment(new Date(end_date)).format('MM/DD/YYYY h:mm A'));
                $("#edit-loa-total").val(total_days);
                $("#edit-loa-total").attr('original-total', total_days);
                $("#edit-loa-details").val(floa_details);
                $("#edit-loa-select-type").trigger("change");
                $("#edit-loa-total").trigger("keyup");
                $("#edit-loa-modal").modal();
                break;
            }
            case 'Official Business':
            default: {
                var row = $(this).closest("td").closest("tr");
                var row_id = row.attr("id");
                var form_type = row.find(".td-ob-fob-type").attr('id');
                var start_date = row.find(".td-ob-start-date").text();
                var end_date = row.find(".td-ob-end-date").text();
                var total_days = row.find(".td-ob-total-days").text();
                var location = row.find(".td-ob-location").text();
                var fob_details = row.find(".td-ob-fob-details").text();
                var objective = row.find(".td-ob-objective").text();
                var result = row.find(".td-ob-result").text();
                
                $("#edit-ob-id").val(row_id);
                $("#edit-ob-select-type option[form^=" + form_type + "]").prop('selected', true);
                $("#edit-ob-date-time").val(moment(new Date(start_date)).format('MM/DD/YYYY h:mm A') + " - " + moment(new Date(end_date)).format('MM/DD/YYYY h:mm A'));
                $("#edit-ob-total").val(total_days);
                $("#edit-ob-location").val(location);
                $("#edit-ob-details").val(fob_details);
                $("#edit-ob-objective").val(objective);
                $("#edit-ob-result").val(result);
                $("#edit-ob-modal").modal();
                break;
            }
        }
    });

    $(".cancel-form").on("click", function() {
        var row = $(this).closest("td").closest("tr");
        var row_id = row.attr("id");

        $("#cancel-form").val(sessionStorage.getItem('active-form-id'));
        $("#cancel-id").val(row_id);
        $("#cancel-reason").val("");
        $("#cancel-modal").modal();
    });

    $(".delete-form").on("click", function() {
        var row = $(this).closest("td").closest("tr");
        var row_id = row.attr("id");

        $("#delete-form").val(sessionStorage.getItem('active-form-id'));
        $("#delete-id").val(row_id);
        $("#delete-modal").modal();
    });
}