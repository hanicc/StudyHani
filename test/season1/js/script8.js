$(function(){
    
    var pogressWarp = $('.progress-bar'),
        pogressBar = pogressWarp.find('.bar'),
        pogressText = pogressWarp.find('.rate'),
        pogressRate = pogressText.attr('data-rate');

    //bar animation 2.5s width바뀌는 애니메이트
    pogressBar.animate({width:pogressRate + '%'}, 2500);

    /* 첫번째 setinterval을 이용한 게이지 바 */
    /*
    setInterval(textAnimation, 1000/10);
    
    function textAnimation(){
        var currentWidth = pogressBar.width() / pogressWarp.width() *100;
        pogressText.text(Math.ceil(currentWidth) + '%');
    }
    */



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
    $({rate:0}).animate({rate:pogressRate},{
        duration: 2500,
        progress: function(){
            var now = this.rate;
            pogressText.text(Math.ceil(now)+'%') //Math.ceil 소수점 없애고 반올림
        }
    });
    
});