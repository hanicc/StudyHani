$(function(){
    var $targetInput = $('.email_domain'),
        $selectEmail = $('.select_domain'),
        $count = $('.count'),
        //$unitPrice = $('.unitprice').text(), //기본
        //$unitPrice = parseInt($('.unitprice').attr('data-unitprice')), //방법1
        $unit = $('.unitprice').text(),
        $unitPrice = parseInt($unit.replace(',','')),
        $currentNumber = parseInt($count.text()), //지금 숫자1은 문자열이기 때문에 parseInt(값) 값을 숫자(정수)로 변환 해야한다 
        $total = $('.total');

    //count
    $('span a').on('click', function(e){
        e.preventDefault();
        if($(this).hasClass('plus')){
            if($currentNumber < 10) {
                $currentNumber += 1; //1씩 더해진다.
            }
        } else {
            if($currentNumber > 0) {
                $currentNumber -= 1; //1씩 빼진다.
            }
            
        }
        console.log($currentNumber);
        $count.text($currentNumber); //$('.count')에 있는 숫자를 text() 넣는다.

        var semiTotal = $unitPrice * $currentNumber;
        var total = Number(semiTotal).toLocaleString('en');

            //$total.text(semiTotal);
            $total.text(total); // toLocaleString('en') 천단위 자바스크립트를 이용한
    });

    //셀렉박스 
    $selectEmail.on('change', function(){
        var domain = $(this).val();
        console.log(domain);
        $targetInput.val(domain);
    });

    

});