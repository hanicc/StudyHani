$(function(){
    var wind = $(window),
        header = $('.page-haeder'),
        headerClone = header.contents().clone(), //.page-haeder 안의 내용만 클론하겠다는 .contents() 즉 .inner clearfix 여기부터 담는다
        headerCloneContainer = $('<div class="page-header-clone"></div>'),//클론에 담을 새 태크그를 만들공간
        threshold = header.offset().top + header.outerHeight(); //문지방 역활

        //console.log(headerCloneContainer);

        headerCloneContainer.append(headerClone);
        headerCloneContainer.appendTo('body');

        console.log(headerCloneContainer);

        //윈도우에 스크롤이 생기면 할일
        wind.on('scroll', function(){ //$throttle 스크롤 과부하 방지하는 플로그인 사용할때
            if($(this).scrollTop() >= threshold){
                headerCloneContainer.addClass('visible');
            }else{
                headerCloneContainer.removeClass('visible');
            }
        })
});