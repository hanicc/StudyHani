$(function(){

    $("ul.gdl-accordion li").each(function() {
        $(this).children(".accordion-content").css('height', function() {
            return $(this).height();
        });
    
        if ($(this).index() >= 0) { //같다면은 빼면 한개는 노출
            $(this).children(".accordion-content").css('display', 'none');
        } else {
            $(this).find(".accordion-head-image").addClass('active');
        }
    
        $(this).children(".accordion-head").bind("click", function() {
            $(this).children().addClass(function() {
                if ($(this).hasClass("active")) return "";
                return "active";
            });

            $(this).siblings(".accordion-content").slideToggle();
            $(this).parent().siblings("li").children(".accordion-content").slideUp();
            $(this).parent().siblings("li").find(".active").removeClass("active");
        });
    });
});