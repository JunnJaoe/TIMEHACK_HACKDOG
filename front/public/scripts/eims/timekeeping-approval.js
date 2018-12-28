$(document).ready(function() {
    initialize_components();
    modals();

    sessionStorage.setItem('approval-active-form-id', sessionStorage.getItem('approval-active-form-id') ? sessionStorage.getItem('approval-active-form-id') : 1);
    select_tab(sessionStorage.getItem('approval-active-form-name') ? sessionStorage.getItem('approval-active-form-name') : 'Official Business');

    $(".tab-form").on("click", function() {
        var form_id = $(this).attr("form");
        var selected_tab = $(this).attr("tab-name");

        sessionStorage.setItem('approval-active-form-id', form_id);
        select_tab(selected_tab);
    });    
});

function initialize_components() {
    $('#table-ob').DataTable();
    $('#table-ot').DataTable();
    $('#table-loa').DataTable();
        
    var start = sessionStorage.getItem('approval-active-filter-start-date') ? moment(sessionStorage.getItem('approval-active-filter-start-date')) : moment().startOf('month');
    var end = sessionStorage.getItem('approval-active-filter-end-date') ? moment(sessionStorage.getItem('approval-active-filter-end-date')) : moment().endOf('month');

    function cb(start, end) {
        $('#filter-list span').html('<b>Filter List by:</b> ' + start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
        sessionStorage.setItem('approval-active-filter-start-date', start);
        sessionStorage.setItem('approval-active-filter-end-date', end);
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

function select_tab(tab_name) {
    sessionStorage.setItem('approval-active-form-name', tab_name);
    
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
        url: path + '/../filter-approval-list',
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
        switch(sessionStorage.getItem('approval-active-form-id')) {
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
                    url: 'add-comment',
                    type: 'POST',
                    data: {
                        commenter_id: $("#message").attr('sender-id'),
                        form_type_id: sessionStorage.getItem('approval-active-form-id'),
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

    $(".approve-form").on("click", function() {
        var row = $(this).closest("td").closest("tr");
        var row_id = row.attr("id");

        $("#approve-form").val(sessionStorage.getItem('approval-active-form-id'));
        $("#approve-id").val(row_id);
        $("#approve-modal").modal();
    });

    $(".disapprove-form").on("click", function() {
        var row = $(this).closest("td").closest("tr");
        var row_id = row.attr("id");

        $("#disapprove-form").val(sessionStorage.getItem('approval-active-form-id'));
        $("#disapprove-id").val(row_id);
        $("#disapprove-modal").modal();
    });
}