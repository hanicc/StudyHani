$(function(){
    //a.attr(a)// a를 가져오는것
    //a.attr(a, b)a를 b로 바꾸는것
    $('input').on('click', function(){
        $(this).attr('placeholder', '');

        $(this).parent().find('label').addClass('label-top');
    });
});