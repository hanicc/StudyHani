$(function () {
    $('.userInput').find('input').blur(function() {
        var $this = $(this);
        if($this.val()) {
            $this.addClass('used');
        } else {
            $this.removeClass('used');
        }
    });
})