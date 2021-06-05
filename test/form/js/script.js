$(function(){
    var $targetInput = $('.email_domain'),
        $selectEmail = $('.select_domain'),
        $count = $('.count'),
        $unitPrice = $('.unitprice').text(),
        $currentNumber = $count.text(),
        $total = $('.total');

    //셀렉박스 
    $selectEmail.on('change', function(){
        var domain = $(this).val();
        console.log(domain);
        $targetInput.val(domain);
    });

    //count

});