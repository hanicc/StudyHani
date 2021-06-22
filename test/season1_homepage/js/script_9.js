$(function(){
    //상단 메뉴 고정
    var $header = $('header');
    var $services = $('.services');
    var $counters = $('.counters');
    var $counterData = $counters.find('h3');

    var serviceExecuted = false;// 이 조건을 만들고
    var counterExecuted = false;

    $(window).scroll(function(){
        var $currentSct = $(this).scrollTop();
        var $offset = 300;

        if($currentSct > 0) {
            $header.addClass('sticky');
        } else {
            $header.removeClass('sticky');
        }

        //service-item 나타나기
        var serviceTreshold = $services.offset().top - $offset;

        if(!serviceExecuted) { //serviceExecuted false가 아니라면 if문을 실행
            if($currentSct > serviceTreshold) {
                $services.addClass('active');
                serviceExecuted= true; //실행하고 나서 serviceExecuted true
            }
        }

        //숫자 애니메이션
        var $countersTreshold = $counters.offset().top - $offset;

        if(!counterExecuted) { 
            if($currentSct > $countersTreshold) {
                $counterData.each(function(){
                    var $current = $(this);// 각각의 h3
                    var $target = $current.attr('data-rate');
                    //animate, progress, rate
                    $({rate: 0}).animate({rate: $target},{
                        duration: 2500,
                        progress:function(){
                            var now = this.rate;
                            $current.text(Math.ceil(now))
                        }
                    });
                });
                counterExecuted = true;
            }
        }
        
    }); //scroll event



    //overlay
    var currentUrl = $('iframe').attr('src');

    $('.video .icon').on('click', function(e){
        e.preventDefault();
        $('#overlay').addClass('visible');

        var newStr = '?autoplay=1&mute=1';
        var newUrl = currentUrl.concat(newStr);

        $('iframe').attr('src', newUrl);

    });
    $('.video .close').on('click', function(e){
        e.preventDefault();
        $('#overlay').removeClass('visible');

        $('iframe').attr('src',currentUrl);
        
        
    });

    
    

});