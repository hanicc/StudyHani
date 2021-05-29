$(function(){
    var $menu = $('#top_menu ul li'),
        $contents = $('#contents > div');
        
        $menu.on('click', function(e){
            e.preventDefault();
            
            /*
            $menu.removeClass('on');
            $(this).addClass('on');
            이게 직접 스크롤 내리는 이슈때문에 여기에서는 필요가 없다 클릭에서하는 이벤트면 필요한데
            */
            
            var idx = $(this).index();
            var section = $contents.eq(idx);
            var sectionDistance = section.offset().top;

            //scrollTop은 스크롤양을 확인, sectionDistance는 스크롤의 위치를 가져오고
            $('html,body').stop().animate({scrollTop:sectionDistance});
            console.log(sectionDistance);
        });
        

        /*
        윈도우 스크롤이 생기면
            $contents 마다 할일이 필요한데
                각각의 높이 sectionDistance 보다
                스크롤양이 많은지 적은지를

                만약에 많다라는 조건이 참이면
                    각 요소마다 순번 변수명 idx 저장
                    그 순번에 해당하는 메뉴에만 클래스명 on 추가
        */
        $(window).scroll(function(){
            $contents.each(function(){
                if($(this).offset().top <= $(window).scrollTop()) {
                    var idx = $(this).index();
                    $menu.removeClass('on');
                    $menu.eq(idx).addClass('on');
                }
            });
        });
});