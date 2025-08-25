var speed = 500;
var header = 0;
$(window).scroll(function(){
    if($(document).scrollTop() > 0) {
	
		if(header == 0) {
			
           header = 1;
			$('#header').stop().animate({backgroundColor:'rgba(0,0,0,0.5)'}, speed);
			$('#header-inner h1 img').stop().animate({width:'80%'}, speed);
			$('#header-inner-nav').stop().animate({marginTop:'11px'}, speed);
			
        }
		
    } else {
        
		if(header == 1) {
			
           header = 0;
			$('#header').stop().animate({backgroundColor:'transparent'}, speed);
			$('#header-inner h1 img').stop().animate({width:'100%'}, speed);
			$('#header-inner-nav').stop().animate({marginTop:'18px'}, speed);
        }  
    }
});


$(window).load(function () {

	    

$('*[data-button]').click(function() {
    $('html, body').animate({
        scrollTop: $('*[data-section="'+$(this).attr('data-button')+'"]').offset().top
    }, speed,function(){$(".overlay-close").click();});
});



function resize(){
	
    $('.tab').height(window.innerHeight);

	$('.tab-headline').each(function(index, element) {
	
	$(this).css('margin-left',-$(this).width()/2);
	$(this).css('margin-top',-$(this).height()/2);	
	
	});	
	
	}


$( window ).resize(function() {
resize();
});



resize();

});