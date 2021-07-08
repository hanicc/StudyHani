$(function(){

    var menu = $('#gnb > li'); //그냥 li이라 하면 #gnb 안에 있는 li가 다 걸린다.
    var wrap =$('#gnbWrap');
    var menuHeight = wrap.outerHeight();
    //console.log(menuHeight);
    var subMenu = menu.find('.sGnbArea ul li');
    var pageUrl = location.href;
    console.log(pageUrl); //현재 페이지
    var activeMenu ; //값이 변할수 있기 때문에 아무것도 안썻다.
    
    menu.mouseover(function(){
        menu.removeClass('on');
        $(this).addClass('on');
        var tatalHeight = menuHeight + $(this).find('.sGnbArea').height();
        //console.log(tatalHeight);
        wrap.stop().animate({height:tatalHeight});
    })
    .mouseout(function(){
        menu.removeClass('on');
        wrap.stop().animate({height:menuHeight});
        onActive(); //마지막 단계: 얘가 없으면 마우스오버 했을때 다시 리셋된다. 마우스를 나가도 고정(trigger)되있게 하려면 여기에 추가
    });

    subMenu.mouseover(function(){
        subMenu.removeClass('on');
        $(this).addClass('on');
    })
    .mouseout(function(){
        subMenu.removeClass('on');
        onActive(); //마지막 단계: 얘가 없으면 마우스오버 했을때 다시 리셋된다. 마우스를 나가도 고정(trigger)되있게 하려면 여기에 추가
    });


    subMenu.each(function(){ //얘가 각각 하나가 할일
        var currentMenu = $(this);
        var subUrl = currentMenu.find('a').attr('href'); //a태그에 href값을 subUrl에 저장
        var active = pageUrl.indexOf(subUrl); //현재 링크에서 href값이 저장된 변수 subUrl를 찾는다.
        console.log(active); // 찾아서 있으면 값이 나오고 없으면 -1이 나온다.
        var blankLink = pageUrl.indexOf('#'); //샾이 있다는 뜻은 빈링크이다.

        if(active > -1 && blankLink == -1){
            activeMenu = currentMenu;
        }
        console.log("---------------------");
        console.log(activeMenu);
    });

    onActive();

    function onActive(){
        if(activeMenu) {
            activeMenu.trigger('mouseover');
        }
    }

});