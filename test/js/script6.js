$(function(){
    var $button = $('.gallery a'),
        $target = $('#lightbox-overlay'),
        $targetImg = $target.find('img');

        /*
        클릭된 그 요소의 data-lightbox 속성값을 변수명 newImg에 담아라
        $targetImg에 그 변수를 담으려고 그리고 visivle 클래스가 추가
        #lightbox-overlay img요소의 src 속송의 값을 newImg 변경
        */
        $button.on('click', function(e){
            e.preventDefault();
            var newImg = $(this).find('img').attr('data-lightbox');
                console.log(newImg);

                $target.addClass('visible');
                $targetImg.attr('src', newImg); //attr ('src', 를 바꿀 내용)
        });
        $target.on('click', function(){
            $(this).removeClass('visible');
        })
});