$(function(){
    var target = $('.target'),
        targetContent = target.find('.content'),
        targetOST = target.offset().top;
        //console.log(targetOST);

    $(window).scroll(function(){
        var currentSCT = $(this).scrollTop();

        if(currentSCT >= targetOST - 400 ) {
            target.addClass('active');

            /* 400보다 넘어갔을때 좀더 많이 스크롤 하면 */
            if (currentSCT >= targetOST - 100) {
                target.removeClass('active');

                target.css({ //얘는 스크립트로 css 처리해야 한다.
                    paddingTop: '300px',
                    paddingBottom:0
                });
            } 
        } else {
            target.removeClass('active');

            target.css({ //얘는 스크립트로 css 처리해야 한다.
                paddingTop: 0,
                paddingBottom:'300px'
            });
        }
    });
});