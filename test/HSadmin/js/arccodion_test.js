$(function() {
    let $headerMenu = $('.header ul');
    let $sideMenuContainer = $('.sideMenu');
    let $breadcrumbContainer = $('.breadcrumb');
    let $subCont = $('.sub_cont');
    let $mainCont = $('.main_cont');

    let menuData = [];
    let currentCategory, currentTitle, currentChildLabel;

    // 중복클릭시 html파일 load중복이슈 : 컨텐츠 영역에 마지막으로 로드한 url을 저장할 변수
    let lastLoaded = { url: null, label: null };

    // 외부링크 여부 판별 함수
    const isExternal = (item) => item.external || (item.url && !item.items);

    // 메뉴 데이터 로딩
    $.getJSON('./json/menu.json', function(data) {
        menuData = data;
        // setCurrentStateByMenu(menuData[0], 0, 0);
        renderHeaderMenu(menuData);
        showMainPage(); // 최초 메인화면
        // renderSideMenu(menuData[0]);
        // renderBreadcrumb();

        // 첫 화면 html 불러오기
        // const firstUrl = menuData[0].items[0].children[0].url;
        // if (firstUrl) $('.cont .inner').load(firstUrl); //빽업
        // if (firstUrl) $('#subCont').attr('src', firstUrl); // iframe에 html을 로드
    });

    //헤더 메뉴 클릭 이벤트
    $headerMenu.on('click', 'li a', function(e) {
        if ($(this).attr('target') === '_blank') return; // 외부링크는 a에 target="_blank"가 있으므로 기본 동작
        e.preventDefault();

        $headerMenu.find('li').removeClass('active');
        $(this).parent('li').addClass('active');

        // 1.기준점 먼저 저장
        const $mainCont = $('.main_cont');
        const $newContent = $mainCont.closest('.new_content');
        const $newContainer = $newContent.closest('.new_container');

        // 2.메인 영역 삭제
        $('.main_cont').remove();

        // 3.서브 영역 없으면 동적 생성
        if ($('.sideMenu').length === 0) {
            // 1.sideMenu가 없으면 new_container에 가장 먼저 추가
            const $sideMenu = $('<aside class="sideMenu"></aside>');
            if ($newContainer.find('.sideMenu').length === 0) {
                $newContainer.prepend($sideMenu);
            }
            // 2.breadcrumb가 없으면 new_content의 맨 위에 추가
            const $breadcrumb = $('<div class="breadcrumb"></div>');
            if ($newContent.find('.breadcrumb').length === 0) {
                $newContent.prepend($breadcrumb);
            }
            // 3.sub_cont가 없으면 new_content에 추가
            const $subCont = $(`
                <aside class="sub_cont">
                    <div class="inner">
                        <iframe id="subCont" src="" style="width:100%;height:100%;border:0"></iframe>
                    </div>
                </aside>
            `);
            if ($newContent.find('.sub_cont').length === 0) {
                $newContent.append($subCont); //main_cont가 없으니 new_content에 append
            }
        }
        
        $breadcrumbContainer = $('.breadcrumb');
        $sideMenuContainer = $('.sideMenu');
        $subCont = $('.sub_cont');

        const category = $(this).data('category');
        currentCategory = category;
        
        // 해당 카테고리의 데이터 찾기
        const categoryData = menuData.find(item => item.category === category);
        // console.log("헤더클릭", categoryData);
        if (!categoryData) return; // data-category가 없는 외부 링크 클릭시 리턴

        renderSideMenu(categoryData);

        const $firstItem = $sideMenuContainer.find('.category > li').first(); 
        $firstItem.find('ul > li').removeClass('active'); // 혹시 모를 중복 제거
        $firstItem.find('ul > li').first().addClass('active'); // 사이드메뉴에서 첫번째 항복 선택(click이 아니고 class로 구분했음)

        if (categoryData.items?.length) {
            const [firstItem] = categoryData.items;
            const [firstChild] = firstItem.children || [];
            if (firstChild) {
                if (!firstChild.external) {
                    loadContent(firstChild.url, firstChild.label); // 로드 성공 시 갱신
                } else {
                    // 외부링크면 새창
                    window.open(firstChild.url, '_blank');
                }

                // 상태 및 브레드크럼 갱신
                currentTitle = firstItem.title;
                currentChildLabel = firstChild.label;
                renderBreadcrumb();
            }
        } else if (categoryData.url) {
            // 외부링크 카테고리라면
            window.open(categoryData.url, '_blank');
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
        // 현재 클릭된 1차 메뉴 li에도 active 추가 (아코디언 상태 유지)
        // $(this).closest('li').parent().closest('li').addClass('active');
        

        const itemIdx = Number($(this).data('item-idx'));
        const childIdx = Number($(this).data('child-idx'));
        const categoryData = menuData.find(item => item.category === currentCategory);
        const itemData = categoryData?.items[itemIdx];
        const childData = itemData?.children[childIdx];
    
        if (childData && !childData.external) {
            loadContent(childData.url, childData.label); // 로드 성공 시 갱신
        }

        // 브레드크럼 등 필요한 정보도 여기서 갱신
        currentTitle = itemData.title;
        currentChildLabel = childData.label;
        renderBreadcrumb();
    });

    function showMainPage() {
        $('.sideMenu, .breadcrumb, .sub_cont').remove();
        // .main_cont가 없으면 새로 만듦
        if ($('.main_cont').length === 0) {
            $('body').append('<div class="main_cont"><div class="inner"></div></div>');
        }
        $mainCont = $('.main_cont');
        $mainCont.show();
        
        // 메인페이지 html 불러오기
        // const mainMenu = menuData.find(item => item.category === 'main');
        // if (mainMenu && mainMenu.url) {
        //     $mainCont.find('.inner').load(mainMenu.url);
        // } else {
        //     $mainCont.find('.inner').load('../main/main.html');
        // }
        // 항상 main.html 불러오기
        $mainCont.find('.inner').load('./main/main.html');
    }

    //헤더 메뉴 렌더링
    function renderHeaderMenu(menuData) {
        // $headerMenu.html(menuData.map(item =>
        //     isExternal(item)
        //         ? `<li><a href="${item.url}" target="_blank" rel="noopener" title="새창으로 이동">${item.category}</a></li>` //외부링크
        //         : `<li><a href="#" data-category="${item.category}">${item.category}</a></li>` //하위 메뉴가 있을땐 data-category속성 추가
        // ).join(''));
        $headerMenu.html(menuData
            .filter(item => item.category !== 'main') // "main" 제외
            .map(item =>
                isExternal(item)
                    ? `<li><a href="${item.url}" target="_blank" rel="noopener" title="새창으로 이동">${item.category}</a></li>`
                    : `<li><a href="#" data-category="${item.category}">${item.category}</a></li>`
            ).join(''));
    }

    // 사이드 메뉴 렌더링
    function renderSideMenu(categoryData) {
        // console.log("사이드", categoryData)
        if (categoryData.category === 'main') {
            $sideMenuContainer.html(''); // 메인 카테고리면 아예 사이드메뉴 비움
            return;
        }
        const html = `
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
