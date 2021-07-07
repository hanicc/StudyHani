$(function () {
    var $container = $('.gallery');
    var itemHTML = 
                '<li class="gallery-item">' +
                    '<button>' +
                        '<figure>' +
                            '<figcaption>'+ item.term +'</figcaption>' +
                        '</figure>' +
                    '</button>' +
                '</li>';

    $.getJSON('./js/sample.json', function(data){

        $.each(data, function(index, item){
            

            
        });
        $container.append(itemHTML);

    }); 


    
    

});//ready function
