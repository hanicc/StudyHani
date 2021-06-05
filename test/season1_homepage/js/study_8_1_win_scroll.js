$(function(){
    
    var pogressWarp = $('.progress-bar'),
        pogressBar = pogressWarp.find('.bar'),
        pogressText = pogressWarp.find('.rate'),
        pogressRate = pogressText.attr('data-rate'),
        
        executed = false;

    //윈도우 스크롤이 생기면 할일
    $(window).scroll(function(){
        var threshold = $('.sec2').offset().top - 300;
        //console.log(threshold);

        if(!executed) { // if(executed == false) 라는 뜻
            if($(window).scrollTop() >= threshold){
                
                /* 첫번째 방법 근데 이게 더...좋은거 같은데.. */
                pogressBar.animate({width:pogressRate + '%'}, 1500);
                // setInterval(textAnimation, 1000/10);
                // console.log(executed);
                // executed = true;

                /* 두번째 방법 */
                $({rate:0}).animate({rate:pogressRate},{
                    duration: 2500,
                    progress: function(){
                        var now = this.rate;
                        pogressText.text(Math.ceil(now)+'%')
                    }
                });
                executed = true;
            }// scrollTop if
        }// executed if
    });

    /* 첫번째 setinterval을 이용한 게이지 바 */
    // function textAnimation(){
    //     var currentWidth = pogressBar.width() / pogressWarp.width() *100;
    //     pogressText.text(Math.ceil(currentWidth) + '%'); //Math.ceil 소수점 없애고 반올림
    // }
    



    /* 두번째 animate 이용한 게이지 바*/
    /*
    //(animation옵션을 풀때)
    pogressBar.animate({width: '60%'}, {
        duration: 2500,
        easing: 'easeInOutQuint',
        complete: function(){...}
    });
    */
    
    
    //이게 두번째 방법
    /*
    $({rate:0}).animate({rate:pogressRate},{
        duration: 2500,
        progress: function(){
            var now = this.rate;
            pogressText.text(Math.ceil(now)+'%')
        }
    });
    */
});