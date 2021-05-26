$(function(){
    var tabAnchor = $('.tabs-nav li a'),
        tabPanel = $('.tabs-panel')
        

    //링크를 클릭하면 할일
    tabAnchor.on('click', function(e){
        e.preventDefault();

        tabAnchor.removeClass('active');//tabAnchor얘한테 클릭했을때 일단 active클래스를 다 빼라
        $(this).addClass('active');//클릭한 녀석만 엑티브

        tabPanel.hide();

        var target = $(this).attr('href'); //클릭한 놈의 href값을 가져와서 target에 저장
        $(target).show();
        console.log(target);
    });


});