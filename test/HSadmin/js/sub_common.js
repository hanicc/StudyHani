
// 탭 모듈 함수 정의
function TabModule($container) {
    var $tabs = $container.find('.tab');
    var $contents = $container.find('.tab-content');
    
    $tabs.on('click', function() {
        var tab_id = $(this).data('tab');
        $tabs.removeClass('active');
        $(this).addClass('active');
        $contents.removeClass('active');
        $container.find('#' + tab_id).addClass('active');
    });
}

// 모든 .tab-module에 대해 초기화
$(function() {
    $('.tab-module').each(function() {
        TabModule($(this));
    });
});
