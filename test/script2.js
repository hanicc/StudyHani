$(function(){
    var wind = $(window),
        mainHeader = $('#main-header'),
        defaultLogo = 'img/logo.svg',
        smallLogo = 'img/logo-shrink.svg';

        wind.on('scroll', function(){ //$throttle 스크롤 과부하 방지하는 플로그인 사용할때
            if($(this).scrollTop() > 100){
                if(!mainHeader.hasClass('shrink')) {
                    mainHeader.addClass('shrink');
                    switchImages(smallLogo); //이 기능을 작동하려면 매개변수를 넣어주자
                }
            }else{
                if(mainHeader.hasClass('shrink')){
                    mainHeader.removeClass('shrink');
                    switchImages(defaultLogo);
                }
            }
        });

        //로고가 작아지고 사라졌다 생기는 기능을 만든다
        function switchImages(newPath) { //스몰로고든 큰 로고튼 newPath에 장착한 여석이 나오게 해줘야 한다
            var loGo = $('#logo');
            loGo.fadeOut(300, function(){ //초 다음에 할일을 적는다
                loGo.attr('src', newPath);
                loGo.fadeIn(300);
            });
        }




});