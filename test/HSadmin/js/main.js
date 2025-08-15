// --- 전역 상태 / 인덱스 ---
let menuData = [];
const menuIndex = { categories:{}, items:{}, pages:{} };

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
 * (MOD) 전역 상태 currentState에 urlExtra 추가
 ************************************************************/
let currentState = { catId:null, itemId:null, pageId:null, urlExtra:null };

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

    const initialRoute = parseConcatQuery();

    // 대기 중 네비게이션 처리
    while(pendingNavigations.length){
        const args = pendingNavigations.shift();
        gotoPageUrl(...args);
    }

    if (!currentState.catId){
        if (initialRoute){
            gotoPageUrl(initialRoute.catId, initialRoute.itemId, initialRoute.pageId, initialRoute.extra, { noUrlUpdate:true });
        } else {
            showMainPage();
        }
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
    const normal = itemObj.children.find(p => !p.hidden && !p.external);
    if (normal) return normal;
    return itemObj.children.find(p => !p.hidden) || null;
}

/************************************************************
 * 페이지 오픈 (external vs iframe)
 ************************************************************/ 
 function openPageObject(pageObj, urlExtra){
    const baseUrl = pageObj.url;
    const finalUrl = appendExtraToUrl(baseUrl, urlExtra);

    if (pageObj.external){
        // 특정버튼 으로 접근했을때 새창으로 띄워질 메뉴에 해당
        window.open(finalUrl, '_blank', 'noopener');
        return;
    }
    loadContent(finalUrl, pageObj.label);
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

    // 메인 화면일 때는 주소창을 index.html 기본 상태로 만들고 싶다면 아래 활성화:
    history.replaceState(null, '', window.location.pathname);
}

/************************************************************
 * (NEW) Concat Query 헬퍼
 * 포맷: ?catId+itemId+pageId(+extra)
 ************************************************************/
function buildConcatQuery(catId, itemId, pageId, extra){
    if (!catId || !itemId || !pageId) return '';
    const segs = [catId, itemId, pageId];
    if (extra !== undefined && extra !== null && extra !== ''){
        segs.push(String(extra));
    }
    return '?' + segs.map(s => encodeURIComponent(s)).join('?');
}

function parseConcatQuery(){
    const qs = window.location.search;
    if (!qs || qs.length < 2) return null;
    // 앞의 '?' 제거 후 split('+')
    const parts = qs.substring(1).split('+').map(p => decodeURIComponent(p));
    if (parts.length < 3) return null;
    const [catId, itemId, pageId, extra] = parts;
    if (!catId || !itemId || !pageId) return null;
    return { catId, itemId, pageId, extra: extra !== undefined ? extra : null };
}

/************************************************************
 * 공개 내비게이션 함수
 ************************************************************/
window.gotoPageUrl = function(catId, itemId, pageId, urlExtra, options){
    const opts = options || {};

    if (!menuLoaded){
        pendingNavigations.push([catId, itemId, pageId, urlExtra, opts]);
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
        // 카테고리가 바뀌면 기존 extra는 일반적으로 의미가 없다고 판단 → 초기화
        currentState.urlExtra = null;
    }

    currentState.catId = catId;
    if (itemId) currentState.itemId = itemId;
    if (pageId) currentState.pageId = pageId;

    // urlExtra 전달이 명시되었을 때만 덮어씀 (undefined면 유지)
    if (urlExtra !== undefined){
        currentState.urlExtra = urlExtra;
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

    // page 객체
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
        openPageObject(pageObj); // iframe src는 extra 안 붙임 (요구사항 반영)
    }

    updateBreadcrumb();
    applyActiveStates();

    // 주소창 쿼리 업데이트 (메인화면 제외)
    if (!opts.noUrlUpdate && currentState.catId && currentState.itemId && currentState.pageId){
        const q = buildConcatQuery(
            currentState.catId,
            currentState.itemId,
            currentState.pageId,
            currentState.urlExtra
        );
        // history.replaceState 사용: 뒤로가기 스택을 늘리고 싶다면 pushState로 바꿀 것
        history.replaceState(
            { catId: currentState.catId, itemId: currentState.itemId, pageId: currentState.pageId, extra: currentState.urlExtra },
            '',
            window.location.pathname + q
        );
    }
};

/************************************************************
 * (NEW) popstate 처리 (뒤/앞 이동 지원) - 선택 기능
 * 필요 없으면 제거 가능
 ************************************************************/
window.addEventListener('popstate', () => {
    const parsed = parseConcatQuery();
    if (parsed){
        gotoPageUrl(parsed.catId, parsed.itemId, parsed.pageId, parsed.extra, { noUrlUpdate:true });
    } else {
        // 쿼리 없으면 메인으로
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