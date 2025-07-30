$(function() {
    let $headerMenu = $('.header ul');
    let $sideMenuContainer = $('.sideMenu');
    let $breadcrumbContainer = $('.breadcrumb');
    let $subCont = $('.sub_cont');
    let $mainCont = $('.main_cont');

    let mainData = []; // main.json
    let subData = [];  // menu.json
    let currentCategory, currentTitle, currentChildLabel;

    // 중복클릭시 html파일 load중복이슈 : 컨텐츠 영역에 마지막으로 로드한 url을 저장할 변수
    let lastLoaded = { url: null, label: null };

    // 외부링크 여부 판별 함수
    // const isExternal = (item) => item.external || (item.url && !item.items);
    const isExternal = (item) => item.external; // external로만 체크 true면 외부링크

    // main.json, sub.json 동시 로드
    $.when(
        $.getJSON('./json/main.json'),
        $.getJSON('./json/menu.json')
    ).done(function(mainRes, subRes) {
        mainData = mainRes[0];
        subData = subRes[0];

        renderHeaderMenu();
        showMainPage();
    });

    //헤더 메뉴 클릭 이벤트
    $headerMenu.on('click', 'li a', function(e) {
        // 외부링크면 기본 동작(새창)만 하고 함수 종료
        if ($(this).attr('target') === '_blank') {
            e.stopPropagation(); // 이벤트 버블링 방지
            return;
        }
        e.preventDefault();

        $headerMenu.find('li').removeClass('active');
        $(this).parent('li').addClass('active');

        // 2.메인 영역 삭제
        $('.main_cont').remove();

        // 3.서브 영역 없으면 동적 생성
        if ($('.sideMenu').length === 0) {
            const $sideMenu = $('<aside class="sideMenu"></aside>');
            $('.new_container').prepend($sideMenu);

            const $breadcrumb = $('<div class="breadcrumb"></div>');
            $('.new_content').prepend($breadcrumb);

            const $subCont = $(`
                <aside class="sub_cont">
                    <div class="inner">
                        <iframe id="subCont" src="" style="width:100%;height:100%;border:0"></iframe>
                    </div>
                </aside>
            `);
            $('.new_content').append($subCont);
        }

        $breadcrumbContainer = $('.breadcrumb');
        $sideMenuContainer = $('.sideMenu');
        $subCont = $('.sub_cont');

        const category = $(this).data('category');
        currentCategory = category;
        
        // menu.json에서 해당 카테고리 데이터 찾기
        const categoryData = subData.find(item => item.category === category);
        
        // 만약 categoryData가 없으면(즉, 외부링크였거나 잘못된 값) 추가 동작 없이 return
        if (!categoryData) {
            $sideMenuContainer.empty();
            $breadcrumbContainer.empty();
            $subCont.empty();
            return;
        }

        renderSideMenu(categoryData);

        const $firstItem = $sideMenuContainer.find('.category > li').first(); 
        $firstItem.find('ul > li').removeClass('active'); // 혹시 모를 중복 제거
        $firstItem.find('ul > li').first().addClass('active'); // 사이드메뉴에서 첫번째 항복 선택(click이 아니고 class로 구분했음)

        if (categoryData.items?.length) {
            const [firstItem] = categoryData.items;
            const [firstChild] = firstItem.children || [];
            if (firstChild) {
                if (!firstChild.external) {
                    loadContent(firstChild.url, firstChild.label);
                } else {
                    window.open(firstChild.url, '_blank');
                }
                currentTitle = firstItem.title;
                currentChildLabel = firstChild.label;
                renderBreadcrumb();
            }
        }
    });

    // 문서 어디든 추가 (이벤트 위임)
    $(document).on('click', '.sideMenu-toggle', function(){
        const $sideMenu = $('.sideMenu');
        const $newContent = $('.new_content');
        const isClosed = $sideMenu.hasClass('closed');
        if (!isClosed) {
            $sideMenu.addClass('closed');
            $newContent.addClass('expanded');
            // 버튼 방향 바꾸기(예: < → >)
            // $(this).html('&gt;');
        } else {
            $sideMenu.removeClass('closed');
            $newContent.removeClass('expanded');
            // $(this).html('&lt;');
        }
    });

    // 메인으로 돌아가기 (예: 로고 클릭 등에서 호출)
    $(document).on('click', '.goMain', function(e){
        e.preventDefault();
        showMainPage();
    });

    // 사이드 메뉴 아코디언
    // $sideMenuContainer.on('click', 'ul>li .sideBt', function(){
    $(document).on('click', 'ul>li .sideBt', function(){
        $(this).closest('li').toggleClass('active');
    });

    // 사이드 메뉴 children 클릭
    // $sideMenuContainer.on('click', 'ul>li ul>li a', function(e) {
    $(document).on('click', '.sideMenu ul>li ul>li a', function(e) {
        if ($(this).attr('target') === '_blank') return;
        e.preventDefault();

        $('.sideMenu ul > li > ul > li').removeClass('active');
        $(this).parent('li').addClass('active');

        const itemIdx = Number($(this).data('item-idx'));
        const childIdx = Number($(this).data('child-idx'));
        const categoryData = subData.find(item => item.category === currentCategory);
        const itemData = categoryData?.items[itemIdx];
        const childData = itemData?.children[childIdx];

        if (childData && !childData.external) {
            loadContent(childData.url, childData.label);
        }

        currentTitle = itemData.title;
        currentChildLabel = childData.label;
        renderBreadcrumb();
    });

    function showMainPage() {
        $('.sideMenu, .breadcrumb, .sub_cont').remove();
        let $mainCont = $('.new_content .main_cont');
        if ($mainCont.length === 0) {
            $mainCont = $('<aside class="main_cont"><div class="inner"></div></aside>');
            $('.new_content').append($mainCont);
        }
        // main.json에서 main url 찾아서 로드
        const mainMenu = mainData.find(item => item.category === 'main');
        const mainUrl = mainMenu && mainMenu.url ? mainMenu.url : './main/main.html';
        $mainCont.find('.inner').load(mainUrl);
    }

    //헤더 메뉴 렌더링
    function renderHeaderMenu() {
        // main.json에 "main"만 있을 경우, 서브 메뉴는 sub.json에서 가져옴
        // main 제외 나머지 카테고리만 헤더에 표시
        $headerMenu.html(subData.map(item =>
            isExternal(item)
                    ? `<li><a href="${item.url}" target="_blank" rel="noopener" title="새창으로 이동">${item.category}</a></li>`
                    : `<li><a href="#" data-category="${item.category}">${item.category}</a></li>`
            ).join(''));
    }

    // 사이드 메뉴 렌더링
    function renderSideMenu(categoryData) {
        // categoryData가 없거나, items가 없으면 비워주고 return
        if (!categoryData || !Array.isArray(categoryData.items)) {
            $sideMenuContainer.empty();
            return;
        }
        const html = `
            <div class="sideMenu-toggle-wrap">
                <button type="button" class="sideMenu-toggle" aria-label="사이드메뉴 접기/펼치기"><i clas="icon">O</i></button>
            </div>
            <ul class="category" data-expanded="all">
                ${categoryData.items.map((item, itemIdx) => `
                    <li>
                        <p class="sideBt"><button type="button">${item.title}</button></p>
                        <ul>
                            ${item.children.map((child, childIdx) =>
                                child.external
                                    ? `<li><a href="${child.url}" target="_blank" rel="noopener" title="새창으로 이동" data-item-idx="${itemIdx}" data-child-idx="${childIdx}">${child.label}</a></li>`
                                    : `<li><a href="#" data-item-idx="${itemIdx}" data-child-idx="${childIdx}">${child.label}</a></li>`
                            ).join('')}
                        </ul>
                    </li>
                `).join('')}
            </ul>
        `;
        $sideMenuContainer.html(html);
        $sideMenuContainer.find('.category > li').addClass('active');
    }

    // 상태값 갱신
    // function setCurrentStateByMenu(menu, itemIdx, childIdx) {
    //     currentCategory = menu.category;
    //     currentTitle = menu.items[itemIdx]?.title || '';
    //     currentChildLabel = menu.items[itemIdx]?.children[childIdx]?.label || '';
    // }

    // 브레드크럼 렌더링
    function renderBreadcrumb() {
        $breadcrumbContainer.html(`
            <ul>
                <li><strong>${currentCategory}</strong></li>
                ${currentTitle ? `<li>${currentTitle}</li>` : ''}
                ${currentChildLabel ? `<li>${currentChildLabel}</li>` : ''}
            </ul>
        `);
    }

    /**
     * 컨텐츠 로드 함수 (label+url 기준)
     * @param {string} url - 불러올 컨텐츠의 URL
     * @param {string} label - 메뉴의 고유 label(혹은 id)
    */
    function loadContent(url, label) {
        // url과 label이 모두 같으면 로드하지 않음
        if (lastLoaded.url === url && lastLoaded.label === label) return;
        
        // $('.cont .inner').load(url, function() {
        //     lastLoaded = { url, label }; // 로드 성공 시에만 갱신
        // });
        $('#subCont').attr('src', url); // iframe에 html을 로드
        lastLoaded = { url, label };
    }
});


// sub_common.js
window.openCommonDialog = function(arg) {
    // 이미 생성된 dialog가 있으면 먼저 제거
    if ($("#" + arg.popupId).length) {
        $("#" + arg.popupId).remove();
    }

    // 팝업용 div를 동적으로 생성
    var $dialogDiv = $("<div>", { id: arg.popupId }).appendTo("body");

    // ajax로 html 컨텐츠 로드
    $.ajax({
        url: arg.url,
        type: arg.method || "GET",
        data: arg.data || {},
        success: function (html) {
            $dialogDiv.html(html);

            // dialog 열기
            $dialogDiv.dialog({
                autoOpen: true,
                title: arg.title,
                width: arg.options.width || 600,
                height: arg.options.height || 'auto',
                modal: arg.options.modal !== undefined ? arg.options.modal : true,
                dialogClass: arg.options.dialogClass || '',
                resizable: true,
                closeOnEscape: false,
                open: function () {
                   // dim 클릭시 닫히게!
                   $('.ui-widget-overlay').off('click.dimClose').on('click.dimClose', function () {
                        $dialogDiv.dialog("close");
                    });
                },
                close: function () {
                    $dialogDiv.dialog("destroy").remove(); // 닫을 때 dom 제거
                }
            });
        },
        error: function () {
            $dialogDiv.html("<p>팝업을 불러오지 못했습니다.</p>");
        }
    });
}
