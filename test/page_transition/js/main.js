$(function() {

    var $context = $('body'),
        $navItem = $('#main-nav-menu li'),
        $navItemMenu = $navItem.find('a'),
        $navUnderline = $('#nav-underline'),
        $activeItem = $('#main-nav-menu li.active'),
        animating = false;

        //기준 위치에서의 거리 position().left, position().top
        $navUnderline.css({
            left: $activeItem.position().left, //position()들어간 이유는 부모 .main-nav-menu relative가 잡힘 // .left + % 이건 퍼센트
            width:$activeItem.outerWidth(),
        });
        $navItem.mouseover(function(){
            $navUnderline.css({
                left: $(this).position().left, 
                width:$(this).outerWidth(),
            });
        }).mouseout(function(){
            $navUnderline.css({
                left: $activeItem.position().left, 
                width:$activeItem.outerWidth(),
            });
        });

        //링크 가로채기
        $navItemMenu.click(function(e){
            e.preventDefault();
            var newURL = $(this).attr('href');
            pageChange(newURL);

            //선택된 메뉴 활성화
            $navItem.removeClass('active');
            $(this).parent().addClass('active');

            $activeItem = $('#main-nav-menu li.active'); //다시 잡아줘야 한다

            $navUnderline.css({
                left: $activeItem.position().left, 
                width:$activeItem.outerWidth(),
            });
        });
        function pageChange(newURL){
            $('body').addClass('animation');

            var container = $('<div id="loadingContainer"></div>') //빈 컨테이너를 만들고 빈 div안에다가
            container.load(newURL, function(){ //newURL 새로운 url을 load(넣었다)
                console.log(container);
                $('#hero-image').html(container.find('#hero-image > *'));
                $('#main-content').html(container.find('#main-content').contents());

                var pageID = container.find('[id^="page"]').attr('id'); //속성 id가 page로 시작하는 값을 가져와서 id를 바꿔라
                $('[id^="page"]').attr('id', pageID); //id값을 pageID 이걸로 지정
            });

            setTimeout(function(){
                $('body').removeClass('animation');
            },1000);
        }


});