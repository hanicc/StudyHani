$(function () {
    var $container = $('.gallery'),
        $loadMoreBtn = $('.load-more'),
        $addItemCount = 8,
        $added = 0, //리스트 항목 모두 로드했을때, 더보기 버튼 사라지게 할 용도로 만든것
        $allData = [];

    /*
        $.getJSON('./data/content.json', function(){
            initGallery();
        });
        function initGallery(){...}
    */
    $.getJSON('./data/content.json', initGallery); //제이슨을 불러왔고 할일은 : initGallery
    

    function initGallery(data){ //initGallery에 제이슨 리스트형식 data로 다 불러와라
        $allData = data; //빈 배열에 제이슨을 담아라
        //console.log($allData);
        addItem();//열자 마자 아이템 추가

        $loadMoreBtn.on("click", function(){
            addItem();
        });
    }//initGallery

    function addItem() {
        var slicedData;
        var elements = [];
        //A.slice(0, 2) A배열에서 0번째 2번째 전까지의 값을 가져온다. 
        slicedData = $allData.slice($added, $added + $addItemCount); //이렇게만 하면 0~8번만 반복 (0, 8)
        console.log(slicedData);
        /*
            $('li').each(function(idx){..}); 제이쿼리: li가 각각 할 일들
            .each('제이슨 배열 하나하나', function(idx, item)); 제이슨: 배열의 값마다 할일
        */
        $.each(slicedData, function(idx, item){
            var itemHTML = '<li class="gallery-item">' +
                '<a href="#">' +
                    '<figure>' +
                        // '<img src="' + item.images.thumb + '" alt="' + item.title + '">' +
                        '<p>' + item.images.thumb + '</p>'+
                        '<figcaption>' +
                            item.title +
                        '</figcaption>' +
                    '</figure>' +
                '</a>' +
            '</li>';

            elements.push($(itemHTML).get(0));
            /*
                eq(0)와 get(0)의 차이는
                    eq(0).play(); X
                    eq(0).css(); O
                get은 반대
            */
        });
        //console.log(elements)
        $container.append(elements);

        //$added 값 업데이트가 되어야 한다. 8, 16, 32....
        /*
            var i=2; i=i+2; 가 2씩 증가 즉 이걸 줄이면 i+=2
            여기서 i는 $added, 2(증가되는 수)는 slicedData.length;
        */
        $added += slicedData.length;

        if($added < $allData.length){
            $loadMoreBtn.show();
        }else{
            $loadMoreBtn.hide();
        }
        
    }//addItem
    

});//ready function
