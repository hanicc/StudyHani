/************************************************************
 * 전역 상태
 ************************************************************/
let menuData = [];
const menuIndex = { categories:{}, items:{}, pages:{} };
let currentState = { catId:null, itemId:null, pageId:null, urlExtra:null };
let lastLoaded = { url:null, label:null };
let menuLoaded = false;
const pendingNavigations = [];

//URL 쿼리 정책 설정
const URL_PARAM_POLICY = {
    clearWhenNoExtra: true, // 메뉴 클릭(=extra 없음) 시 주소창 쿼리 제거
    usePushState: false // true면 pushState, false면 replaceState
};

/************************************************************
 * 메뉴 JSON 로드 & 초기 진입
 ************************************************************/
$.getJSON('./json/menu.json').done(data => {
    menuData = data;
    buildMenuIndex(menuData);
    renderHeaderMenu(menuData);
    menuLoaded = true;

    // 대기 호출 flush (extra 없는 호출은 그냥 로컬 네비게이션)
    while (pendingNavigations.length){
        gotoPageUrl(...pendingNavigations.shift());
    }

    // 표준 쿼리 파싱 (있으면 복원)
    const initial = parseStandardQuery();
    if (initial){
        gotoPageUrl(initial.catId, initial.itemId, initial.pageId, initial.extra || '');
    } else {
        showMainPage();
    }
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
        if (!Array.isArray(cat.items)) return;
        cat.items.forEach(item => {
            if (item.itemId) menuIndex.items[item.itemId] = { catId: cat.catId, item };
            if (!Array.isArray(item.children)) return;
            item.children.forEach(page => {
                if (page.pageId){
                    menuIndex.pages[page.pageId] = {
                        catId: cat.catId,
                        itemId: item.itemId,
                        page
                    };
                }
            });
        });
    });
}

/************************************************************
 * 헤더 메뉴 렌더
 ************************************************************/
function renderHeaderMenu(data){
    const html = data
        .filter(cat => cat.catId !== 'CAT_MAIN' && cat.hidden !== true)
        .map(cat => cat.external
            ? `<li class="exIcon">
                 <a href="${cat.url}" target="_blank" rel="noopener" data-cat-id="${cat.catId}" title="새창">${cat.category}</a>
               </li>`
            : `<li>
                 <a href="#" data-cat-id="${cat.catId}">${cat.category}</a>
               </li>`
        ).join('');
    $('.hd ul').html(html);
}

/************************************************************
 * 사이드 메뉴 렌더 (카테고리 기준)
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

    // 모든 아코디언 펼침
    const $cat = $('.sideMenu .category');
    if ($cat.data('expanded') === 'all'){
        $cat.children('li')
            .addClass('active')
            .find('.sideBt button')
            .attr('aria-expanded', 'true');
    }
}

/************************************************************
 * 사이드 메뉴 렌더
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

    // 모든 아코디언 펼침
    const $cat = $('.sideMenu .category');
    if ($cat.data('expanded') === 'all'){
        $cat.children('li')
            .addClass('active')
            .find('.sideBt button')
            .attr('aria-expanded', 'true');
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
        $(`.hd ul a[data-cat-id="${currentState.catId}"]`).parent().addClass('active');
    }

    // 사이드 아이템
    if (currentState.itemId){
        $(`.sideMenu .category > li .sideBt button[data-item-id="${currentState.itemId}"]`)
            .closest('li').addClass('active');
    }

    // 사이드 페이지
    $('.sideMenu .category > li > ul > li').removeClass('active');
    if (currentState.pageId){
        $(`.sideMenu a[data-page-id="${currentState.pageId}"]`).parent().addClass('active');
    }
}

/************************************************************
 * 콘텐츠 로딩 (iframe) 최종 URL만 비교
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
    return itemObj.children.find(p => !p.hidden && !p.external)
        || itemObj.children.find(p => !p.hidden)
        || null;
}

/************************************************************
 * 페이지 오픈 (external vs iframe)
 ************************************************************/ 
function openPageObject(pageObj){
    const baseUrl = pageObj.url;
    if (pageObj.external){
        window.open(baseUrl, '_blank', 'noopener');
    } else {
        loadContent(baseUrl, pageObj.label);
    }
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
    
    currentState = { catId:null, itemId:null, pageId:null, urlExtra:null };
    lastLoaded = { url:null, label:null };
    $('.hd ul li').removeClass('active');

    // 메인 화면일 때는 주소창을 index.html 기본 상태
    history.replaceState(null, '', window.location.pathname);
}

/************************************************************
 * 표준 쿼리 파싱 (?catId=..&itemId=..&pageId=..)
 ************************************************************/
function parseStandardQuery(){
    if (!location.search || location.search.length < 2) return null;
    const usp = new URLSearchParams(location.search);
    const catId  = usp.get('catId');
    const itemId = usp.get('itemId');
    const pageId = usp.get('pageId');
    if (!catId || !itemId || !pageId) return null;
    // extra는 규칙상: (1) key가 extra 인 경우 또는 (2) 기타 잔여 파라미터(첫 3개 제외) 전체를 raw로 묶을 수도 있음
    // 여기서는 extra= 값만 읽어본다.
    const extra = usp.get('extra'); // 플래그 형태(&test_test) 는 key만 있고 값 없음 → get('test_test') 가 "" 반환
    return { catId, itemId, pageId, extra };
}

/************************************************************
 * extraStr: 사용자가 4번째 인자로 준 "원본 문자열"
 ************************************************************/
function buildStandardQuery(catId, itemId, pageId, extraStr){
    const usp = new URLSearchParams();
    usp.set('catId', catId);
    usp.set('itemId', itemId);
    usp.set('pageId', pageId);

    let tail = '';
    if (extraStr && typeof extraStr === 'string'){
        const trimmed = extraStr.trim();
        if (trimmed){
            if (trimmed.startsWith('&')){
                // 사용자가 &key 또는 &key=value 형태 직접 제어
                // 그대로 뒤에 붙이되, 앞에 또 & 붙이지 않음
                tail = trimmed;
            } else if (trimmed.includes('=') && !trimmed.startsWith('?')){
                // key=value 패턴으로 간주: & 붙여 추가
                tail = '&' + trimmed;
            } else if (trimmed.startsWith('?')){
                // ?key=value 형태 주었다면 ? 제거 후 &로
                tail = '&' + trimmed.substring(1);
            } else {
                // 일반 문자열 → extra=값
                usp.set('extra', trimmed);
            }
        }
    }
    return '?' + usp.toString() + tail;
}














/************************************************************
 * (NEW) URL Helper: 쿼리/해시 병합
 ************************************************************/
function serializeQuery(obj){
    if (!obj) return '';
    const parts = [];
    Object.keys(obj).forEach(k => {
        const v = obj[k];
        if (v === undefined || v === null) return;
        if (Array.isArray(v)){
            v.forEach(item => {
                if (item !== undefined && item !== null){
                    parts.push(encodeURIComponent(k) + '=' + encodeURIComponent(item));
                }
            });
        } else {
            parts.push(encodeURIComponent(k) + '=' + encodeURIComponent(v));
        }
    });
    return parts.join('&');
}

/**
 * baseUrl: 원본 URL (이미 ? 또는 # 포함 가능)
 * extra: string | { query?:Object, hash?:string }
 */
function appendExtraToUrl(baseUrl, extra){
    if (!extra) return baseUrl;

    let url = baseUrl;
    let baseQuery = '';
    let baseHash = '';

    // 기존 hash 추출
    const hashIndex = url.indexOf('#');
    if (hashIndex >= 0){
        baseHash = url.substring(hashIndex + 1);
        url = url.substring(0, hashIndex);
    }
    // 기존 query 추출
    const queryIndex = url.indexOf('?');
    if (queryIndex >= 0){
        baseQuery = url.substring(queryIndex + 1);
        url = url.substring(0, queryIndex);
    }

    let extraQuery = '';
    let extraHash = '';

    if (typeof extra === 'string'){
        // 문자열 형태: '?a=1#h' , '#h' , '?a=1'
        // 공백 제거
        const trimmed = extra.trim();
        // 해시 먼저 분리
        const hashPos = trimmed.indexOf('#');
        let queryPart = trimmed;
        if (hashPos >= 0){
            extraHash = trimmed.substring(hashPos + 1);
            queryPart = trimmed.substring(0, hashPos);
        }
        if (queryPart.startsWith('?')){
            extraQuery = queryPart.substring(1);
        } else if (queryPart.length && !queryPart.startsWith('?')){
            // 사용자가 '?' 안 붙인 문자열을 그냥 주었다면 쿼리로 간주
            extraQuery = queryPart;
        }
    } else if (typeof extra === 'object'){
        if (extra.query){
            extraQuery = serializeQuery(extra.query);
        }
        if (extra.hash){
            extraHash = extra.hash.toString();
        }
    }

    // 쿼리 병합
    const finalQueryParts = [];
    if (baseQuery) finalQueryParts.push(baseQuery);
    if (extraQuery) finalQueryParts.push(extraQuery);
    const mergedQuery = finalQueryParts.join('&');

    // 해시 결정: extraHash가 있으면 그것을 우선, 없으면 baseHash
    const mergedHash = extraHash || baseHash;

    let finalUrl = url;
    if (mergedQuery) finalUrl += '?' + mergedQuery;
    if (mergedHash) finalUrl += '#' + mergedHash;

    return finalUrl;
}





























/************************************************************
 * 네비게이션 & 파라미터 전달 click이벤트
 ************************************************************/
window.gotoPageUrl = function(catId, itemId, pageId, extra){
    // menu 로딩 전 대기
    if (!menuLoaded){
        pendingNavigations.push([catId, itemId, pageId, extra]);
        return;
    }

    // pageId만 있을 때 역추적
    if (pageId && !itemId){
        const ref = menuIndex.pages[pageId];
        if (ref){
            itemId = ref.itemId;
            catId = ref.catId;
        }
    }

    const cat = menuIndex.categories[catId];
    if (!cat){
        console.warn('Invalid catId:', catId);
        return;
    }

    const catChanged = currentState.catId !== catId;

    // 메인 제거
    if ($('.main_cont').length){
        $('.main_cont').remove();
    }
    ensureLayoutElements();

    if (catChanged){
        renderSideMenuByCatId(catId);
        currentState.itemId = null;
        currentState.pageId = null;
        currentState.urlExtra = null;
    }

    currentState.catId = catId;
    if (itemId) currentState.itemId = itemId;
    if (pageId) currentState.pageId = pageId;

    if (arguments.length >= 4) {
        currentState.urlExtra = extra;
    } else {
        currentState.urlExtra = null;
    }

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

    // page 객체 결정
    let pageObj = null;
    if (currentState.pageId){
        pageObj = menuIndex.pages[currentState.pageId]?.page;
    } else if (cat.url && !cat.items){
        pageObj = { url: cat.url, label: cat.category, external: !!cat.external };
    }

    if (pageObj){
        // iframe 내부 URL에는 extra 안 붙임
        openPageObject(pageObj);
    }

    updateBreadcrumb();
    applyActiveStates();

    // 주소창 처리
    const shouldAttach = (typeof currentState.urlExtra === 'string') && currentState.urlExtra.trim().length > 0;

    if (shouldAttach){
        // 주소창 파라미터 부착
        const qs = buildStandardQuery(
            currentState.catId,
            currentState.itemId,
            currentState.pageId,
            currentState.urlExtra
        );
        const newUrl = location.pathname + qs;
        const stateData = {
            catId: currentState.catId,
            itemId: currentState.itemId,
            pageId: currentState.pageId,
            extra: currentState.urlExtra
        };
        if (URL_PARAM_POLICY.usePushState){
            history.pushState(stateData, '', newUrl);
        } else {
            history.replaceState(stateData, '', newUrl);
        }
    } else if (URL_PARAM_POLICY.clearWhenNoExtra && location.search){
        history.replaceState(null, '', location.pathname); // 쿼리 제거 (메뉴 클릭 / extra 미전달 흐름)
    }
};

/************************************************************
 * (NEW) popstate 처리 (뒤/앞 이동 지원) - 선택 기능
 * 필요 없으면 제거 가능
 ************************************************************/
window.addEventListener('popstate', () => {
    const parsed = parseStandardQuery();
    if (parsed){
        gotoPageUrl(parsed.catId, parsed.itemId, parsed.pageId, parsed.extra || '');
    } else if (URL_PARAM_POLICY.clearWhenNoExtra){
        showMainPage();
    }
});

/************************************************************
 * 이벤트 바인딩
 ************************************************************/

// 헤더 카테고리 클릭
$(document).on('click', '.hd ul li a', function(e){
    if ($(this).attr('target') === '_blank') return;
    e.preventDefault();
    gotoPageUrl($(this).data('cat-id'), null, null);
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
    const $li = $(this).closest('li').toggleClass('active');
    $(this).attr('aria-expanded', $li.hasClass('active'));
});

// 사이드 전체 토글 버튼
$(document).on('click', '.sideMenu-toggle', function(){
    $('.sideMenu').toggleClass('closed');
    $('.new_content').toggleClass('side-collapsed');
});

// 메인 페이지로 돌아가기
$(document).on('click', '.goMain', function(e){
    e.preventDefault();
    showMainPage();
});












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