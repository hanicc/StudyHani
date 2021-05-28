$(function(){
    var tabAnchor = $('.tabs-nav li'),
        tabPanel = $('.tabs-panel')
        

    //링크를 클릭하면 할일
    tabAnchor.on('click', function(e){
        e.preventDefault();

        tabAnchor.find('a').removeClass('active');//tabAnchor얘한테 클릭했을때 일단 active클래스를 다 빼라
        $(this).find('a').addClass('active');//클릭한 녀석만 엑티브

        tabPanel.hide();

        var $targetIdx = $(this).index(); //index애를 부른 이유는 eq와 찰떡
        console.log($targetIdx); //li이의 순번이 찍힌다 0,1,2....
        
        tabPanel.eq($targetIdx).show();
    });

    //.trigger 강제로 실행시키다. : 지금 만든 함수는 클릭이 되야만 실행되는 이벤트인데 열자마자 강제로 클릭이 된 상태
    tabAnchor.eq(0).trigger('click');


});