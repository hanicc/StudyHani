$(function() {

    var $context = $('body'),
        $navItem = $('#main-nav-menu li'),
        $navItemMenu = $navItem.find('a'),
        $navUnderline = $('#nav-underline'),
        $activeItem = $('#main-nav-menu li.active'),
        animating = false;

        //기준 위치에서의 거리 position().left, position().top
        //애초에 너비값을 js로 잡아줬다.
        $navUnderline.css({
            left: $activeItem.position().left, //position()들어간 이유는 부모 .main-nav-menu relative가 잡힘 // .left + % 이건 퍼센트 //언더라인의 위치
            width:$activeItem.outerWidth(), //언더라인의 '#main-nav-menu li.active 된거의 너비
        });

        //마우스 호버가 됐을때 
        $navItem.mouseover(function(){
            //언더라인 css 변경 애초의 너비값 그대로
            $navUnderline.css({
                left: $(this).position().left, 
                width:$(this).outerWidth(),
            });
        }).mouseout(function(){
            $navUnderline.css({
                left:$activeItem.position().left, 
                width:$activeItem.outerWidth(),
            });
        });

        //링크 가로채기
        $navItemMenu.click(function(e){
            e.preventDefault();
            var newURL = $(this).attr('href');
            pageChange(newURL, false); // url히스토리 버튼을 클릭한게 아니니깐 false

            //선택된 메뉴 활성화 방법A
            // $navItem.removeClass('active');
            // $(this).parent().addClass('active');

            // $activeItem = $('#main-nav-menu li.active'); //다시 잡아줘야 한다

            // $navUnderline.css({
            //     left: $activeItem.position().left, 
            //     width:$activeItem.outerWidth(),
            // });
        });
        function pageChange(newURL, usehistorybtn){

            //선택된 메뉴 활성화 방법B 
            $activeItem = $('#main-nav-menu a[href="'+newURL+'"]').parent();
            $navUnderline.css({
                left: $activeItem.position().left, 
                width:$activeItem.outerWidth(),
            });

            $('body').addClass('animation');

            var container = $('<div id="loadingContainer"></div>') //빈 컨테이너를 만들고 빈 div안에다가
            container.load(newURL, function(){ //newURL 새로운 url을 load(넣었다)
                console.log(container);
                $('#hero-image').html(container.find('#hero-image > *')); //1이거와 
                $('#main-content').html(container.find('#main-content').contents()); //1이거는 결과는 같음 : var container 의 모든 태크를 가져와

                var pageID = container.find('[id^="page"]').attr('id'); //속성 id가 page로 시작하는 값을 가져와서 id를 바꿔라
                $('[id^="page"]').attr('id', pageID); //id값을 pageID 이걸로 지정

                
                if(usehistorybtn == false) {
                    //url히스토리
                    //window.history.pushState(data빈값,' 브라우저 타이틀 <title></title>', 주소url)
                    window.history.pushState(null,'',newURL); //이렇게만 해면 되긴 하는데..뒤로가기 버튼 클릭시 바뀌진 않는다.
                }
                


                setTimeout(function(){
                    $('body').removeClass('animation');
                },1000);
            });
        }

        //url히스토리 뒤로가기
        $(window).on('popstate', function(){
            /*
                http://127.0.0.1:5500/test/page_transition/index.html 에서..

                location.pathname; = sss /test/page_transition/index.html
                location.pathname.split('/') = sss (4) ['', 'test', 'page_transition', 'index.html'] //배열로됨
            */
            var page = location.pathname.split('/').pop(); //pathname 은 /join.html 만 가져온다. //split('/').pop()은 배열의 마지막 것만 선택
            console.log("sss", page);
            pageChange(page, true); //url히스토리 버튼을 클릭한거니깐 true
        });


});