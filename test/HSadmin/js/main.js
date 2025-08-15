// --- 전역 상태 / 인덱스 ---
let menuData = [];
const menuIndex = { categories:{}, items:{}, pages:{} };
let currentState = { catId:null, itemId:null, pageId:null };
let lastLoaded = { url:null, label:null };
let menuLoaded = false;
const pendingNavigations = [];

/************************************************************
 * 메뉴 JSON 로드
 ************************************************************/
$.getJSON('./json/menu.json').done(data => {
    menuData = data;
    buildMenuIndex(menuData);
    renderHeaderMenu(menuData);
    menuLoaded = true;

    // 대기 중 네비게이션 처리
    while(pendingNavigations.length){
        const args = pendingNavigations.shift();
        gotoPageUrl(...args);
    }

    showMainPage();
}).fail(err => {
    console.error('menu.json load failed', err);
    $('.hd ul').html('<li class="error">메뉴 로드 실패</li>');
});

/************************************************************
 * 인덱스 생성
 ************************************************************/
function buildMenuIndex(data){
    data.forEach(cat => {
        if (cat.catId) menuIndex.categories[cat.catId] = cat;
        if (Array.isArray(cat.items)){
            cat.items.forEach(item => {
                if (item.itemId) menuIndex.items[item.itemId] = { catId: cat.catId, item };
                if (Array.isArray(item.children)){
                    item.children.forEach(page => {
                        if (page.pageId) menuIndex.pages[page.pageId] = {
                            catId: cat.catId,
                            itemId: item.itemId,
                            page
                        };
                    });
                }
            });
        }
    });
}

/************************************************************
 * 헤더 메뉴 렌더링
 ************************************************************/
function renderHeaderMenu(data){
    const html = data
        .filter(cat => cat.catId !== 'CAT_MAIN' && cat.hidden !== true)
        .map(cat => {
            if (cat.external){
                return `
                <li class="exIcon">
                    <a href="${cat.url}" target="_blank" rel="noopener" data-cat-id="${cat.catId}" title="새창">
                    ${cat.category}
                    </a>
                </li>`;
            }
            return `
                <li>
                    <a href="#" data-cat-id="${cat.catId}">
                        ${cat.category}
                    </a>
                </li>`;
        }).join('');

    $('.hd ul').html(html);
}

/************************************************************
 * 사이드 메뉴 렌더링 (catId 기준)
 ************************************************************/
function renderSideMenuByCatId(catId){
    const cat = menuIndex.categories[catId];
    const $sideMenuContainer = ensureSideMenu();
    if (!cat || !Array.isArray(cat.items)){
        $sideMenuContainer.empty();
        return;
    }

    const html = `
        <div class="sideMenu-toggle-wrap">
            <button type="button" class="sideMenu-toggle" aria-label="사이드메뉴 접기/펼치기">
                <i class="icon_arrow_1"></i>
            </button>
        </div>
        <ul class="category" data-expanded="all">
            ${cat.items.map(item => {
                if (item.hidden) return '';
                const childrenHtml = (item.children || [])
                .filter(ch => ch.hidden !== true)
                .map(ch => `
                    <li>
                        <a href="${ch.external ? ch.url : '#'}"
                            ${ch.external ? 'target="_blank" rel="noopener"' : ''}
                            data-item-id="${item.itemId}"
                            data-page-id="${ch.pageId}">
                            ${ch.label}
                        </a>
                    </li>
                `).join('');

                return `
                <li>
                    <p class="sideBt">
                        <span class="icon"></span>
                        <button type="button" data-item-id="${item.itemId}" aria-expanded="true">
                            ${item.title}
                        </button>
                    </p>
                    <ul>${childrenHtml}</ul>
                </li>
                `;
            }).join('')}
        </ul>
    `;
    $sideMenuContainer.html(html);
    
    // "all"이면 사이드메뉴에서 모든 아코디언 메뉴 펼쳐짐 상태
    if ($('.sideMenu .category').data('expanded') === 'all'){
        $('.sideMenu .category').children('li').addClass('active').find('.sideBt button').attr('aria-expanded', 'true');
    }
}

/************************************************************
 * 레이아웃 요소
 ************************************************************/
function ensureLayoutElements(){
    if ($('.sideMenu').length === 0){
        $('.new_container').prepend('<aside class="sideMenu"></aside>');
    }
    if ($('.breadcrumb').length === 0){
        $('.new_content').prepend('<div class="breadcrumb"></div>');
    }
    if ($('.sub_cont').length === 0){
        $('.new_content').append(`
            <aside class="sub_cont">
                <div class="inner">
                    <iframe id="subCont" src="" style="width:100%;height:100%;border:0"></iframe>
                </div>
            </aside>
        `);
    }
    return {
        sideMenu: $('.sideMenu'),
        breadcrumb: $('.breadcrumb'),
        subCont: $('#subCont')
    };
}

function ensureSideMenu(){
    ensureLayoutElements();
    return $('.sideMenu');
}

/************************************************************
 * breadcrumb 갱신
 ************************************************************/
function updateBreadcrumb(){
    const bcCat = menuIndex.categories[currentState.catId];
    const bcItem = menuIndex.items[currentState.itemId]?.item;
    const bcPage = menuIndex.pages[currentState.pageId]?.page;
    const html = `
        <ul>
            ${bcCat ? `<li><strong>${bcCat.category}</strong></li>` : ''}
            ${bcItem ? `<li>${bcItem.title}</li>` : ''}
            ${bcPage ? `<li>${bcPage.label}</li>` : ''}
        </ul>
    `;
    $('.breadcrumb').html(html);
}

/************************************************************
 * 활성화 표시
 ************************************************************/
function applyActiveStates(){
    // 헤더
    $('.hd ul li').removeClass('active');
    if (currentState.catId){
        $('.hd ul a[data-cat-id="' + currentState.catId + '"]').parent().addClass('active');
    }

    // 사이드 - item
    // $('.sideMenu .category > li').removeClass('active');
    $('.sideMenu .category > li .sideBt button').each(function(){
        const itemId = $(this).data('item-id');
        if (itemId === currentState.itemId){
            $(this).closest('li').addClass('active');
        }
    });
    
    // 사이드 - page
    $('.sideMenu .category > li > ul > li').removeClass('active');
    if (currentState.pageId){
        $('.sideMenu a[data-page-id="' + currentState.pageId + '"]').parent().addClass('active');
    }
}

/************************************************************
 * 콘텐츠 로딩 (iframe)
 ************************************************************/
function loadContent(url, label){
    if (lastLoaded.url === url) return;
    $('#subCont').attr('src', url);
    lastLoaded = { url, label };
}

/************************************************************
 * 표시 가능한 페이지 선택
 * - external 제외한 첫 페이지 우선
 ************************************************************/
function findFirstDisplayablePage(itemObj){
    if (!itemObj || !Array.isArray(itemObj.children)) return null;
    const normal = itemObj.children.find(p => !p.hidden && !p.external);
    if (normal) return normal;
    return itemObj.children.find(p => !p.hidden) || null;
}

/************************************************************
 * 페이지 오픈 (external vs iframe)
 ************************************************************/
function openPageObject(pageObj){
    if (pageObj.external){
        // 특정버튼 으로 접근했을때 새창으로 띄워질 메뉴에 해당
        window.open(pageObj.url, '_blank', 'noopener');
        return;
    }
    loadContent(pageObj.url, pageObj.label);
}

/************************************************************
 * 메인 페이지 (초기 화면)
 ************************************************************/
function showMainPage(){
    $('.sideMenu, .breadcrumb, .sub_cont').remove();
    if ($('.main_cont').length === 0){
        $('.new_content').append('<aside class="main_cont"><div class="inner"></div></aside>');
    }
    $('.main_cont').show().find('.inner').load('./main/main.html');
    currentState = { catId:null, itemId:null, pageId:null };
    lastLoaded = { url:null, label:null };
    $('.hd ul li').removeClass('active');
}

/************************************************************
 * 공개 내비게이션 함수
 ************************************************************/
window.gotoPageUrl = function(catId, itemId, pageId){
    if (!menuLoaded){
        pendingNavigations.push([catId, itemId, pageId]);
        return;
    }

    // pageId만 전달된 경우 역추적
    if (pageId && !itemId){
        const ref = menuIndex.pages[pageId];
        if (ref){
            itemId = ref.itemId;
            catId = ref.catId;
        }
    }

    const cat = menuIndex.categories[catId];
    if (!cat){
        console.log('존재하지 않는 catId', catId);
        return;
    }

    const catChanged = currentState.catId !== catId;

    // 메인 → 서브 전환
    if ($('.main_cont').length){
        $('.main_cont').remove();
    }
    ensureLayoutElements();

    if (catChanged){
        renderSideMenuByCatId(catId);
        currentState.itemId = null;
        currentState.pageId = null;
    }

    currentState.catId = catId;

    if (itemId) currentState.itemId = itemId;
    if (pageId) currentState.pageId = pageId;

    // item 자동 선택
    if (!currentState.itemId && Array.isArray(cat.items)){
        const firstItem = cat.items.find(i => !i.hidden);
        if (firstItem){
            currentState.itemId = firstItem.itemId;
        }
    }

    // page 자동 선택
    if (currentState.itemId && !currentState.pageId){
        const itemObj = menuIndex.items[currentState.itemId]?.item;
        const firstPage = findFirstDisplayablePage(itemObj);
        if (firstPage){
            currentState.pageId = firstPage.pageId;
        }
    }

    applyActiveStates();

    // pageObj 결정
    let pageObj = null;
    if (currentState.pageId){
        pageObj = menuIndex.pages[currentState.pageId]?.page;
    } else if (cat.url && !cat.items){
        pageObj = {
            url: cat.url,
            label: cat.category,
            external: !!cat.external
        };
    }

    if (pageObj){
        openPageObject(pageObj);
    }

    updateBreadcrumb();
    applyActiveStates();
};

/************************************************************
 * 이벤트 바인딩
 ************************************************************/

// 헤더 카테고리 클릭
$(document).on('click', '.hd ul li a', function(e){
    if ($(this).attr('target') === '_blank') return;
    e.preventDefault();
    const catId = $(this).data('cat-id');
    gotoPageUrl(catId, null, null);
});

// 사이드 메뉴 page 클릭
$(document).on('click', '.sideMenu a[data-page-id]', function(e){
    if ($(this).attr('target') === '_blank') return;
    e.preventDefault();
    const pageId = $(this).data('page-id');
    const itemId = $(this).data('item-id');
    const catId = currentState.catId || menuIndex.items[itemId]?.catId;
    gotoPageUrl(catId, itemId, pageId);
});

// 사이드 메뉴 item 아코디언 토글
$(document).on('click', '.sideMenu .sideBt button', function(){
    const $li = $(this).closest('li');
    $li.toggleClass('active');
    const expanded = $li.hasClass('active');
    $(this).attr('aria-expanded', expanded);
});

// 사이드 전체 토글 버튼
$(document).on('click', '.sideMenu-toggle', function(){
    const $side = $('.sideMenu');
    const $contentWrap = $('.new_content');
    $side.toggleClass('closed');
    $contentWrap.toggleClass('side-collapsed');
});

// 메인 페이지로 돌아가기
$(document).on('click', '.goMain', function(e){
    e.preventDefault();
    showMainPage();
});

/************************************************************
 * 추가 확장 포인트 (필요 시):
 *  - History pushState
 *  - 딥링크 (?cat=&item=&page=)
 *  - fetch 기반 로딩 (iframe 제거)
 ************************************************************/



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
                resizable: false,
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