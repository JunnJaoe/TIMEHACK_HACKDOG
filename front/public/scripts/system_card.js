$(document).ready(function() {
    $('[data-toggle="tooltip"]').tooltip(); 

    $('.post-module').hover(function() {
        $(this).find('.description').stop().animate({
            height: "toggle",
            opacity: "toggle"
        }, 300);
    });

    $("#module_eims").on("click", function() {
        window.location.href = "/eims";
    });

    $("#admin_module_eims").on("click", function(e) {
        e.stopPropagation();
        window.location.href = "/changerole/admin?goToPage=eims";
    });
});