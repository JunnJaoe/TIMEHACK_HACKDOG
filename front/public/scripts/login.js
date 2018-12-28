$(document).ready(function() {
    $("#login-failed").css("visibility", "hidden");
    
    $("#login-form").bootstrapValidator({
        message: 'This value is not valid!',
        fields: {
            username: {
                validators: {
                    notEmpty: {
                        message: 'Username is required!'
                    }
                }
            },
            password: {
                validators: {
                    notEmpty: {
                        message: 'Password is required!'
                    }
                }
            },            
        }
    }).on('success.field.bv', function(e, data) {
        var $parent = data.element.parents('.form-group');
        $parent.removeClass('has-success');
        $parent.find('.form-control-feedback[data-bv-icon-for="' + data.field + '"]').hide();
    }).on('success.form.bv', function(e) {
        $("#login-button").hide();
        $("#login-loading").show();
        $("#login-failed").css("visibility", "hidden");
        
        var username = $("#username").val();
        var password = $("#password").val();

        if(username != "" && password != "") {
            $.ajax({
                url: 'login',
                type: 'POST',
                data: {
                    username: username,
                    password: password
                },
                dataType: 'json',
                success: function(cb) {
                    $("#login-button").show();
                    $("#login-loading").hide();
                    $("#login-failed").css("visibility", "hidden");
                    if(cb.status == 1) {
                        window.location.href = "/";
                    } else {
                        $("#login-failed").css("visibility", "visible");
                        $("#login-failed").show();
                        $("#password").val("");
                    }
                },
                error: function(xhr, status, error) {
                    console.log("Error: " + xhr.responseText);
                }
            });
        } else {
            $("#login-button").show();
            $("#login-loading").hide();
            $("#login-failed").css("visibility", "hidden");
        }
    });

    $("#login-button").on("click", function() {
        $("#login-form").bootstrapValidator('validate');
    });
});