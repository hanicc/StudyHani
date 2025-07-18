$(function() {
    let $headerMenu = $('.header ul');
    let $menuContainer = $('.sideMenu');
    let $breadcrumbContainer = $('.breadcrumb');
    let menuData = [];

    let currentCategory = null;
    let currentTitle = null;
    let currentChildLabel = null;

    $.getJSON('../json/menu.json', function(data) {
        menuData = data;
        // 최초: 첫 카테고리, 첫 item, 첫 children
        setCurrentStateByMenu(menuData[0], 0, 0);
        renderHeaderMenu(menuData);
        renderSideMenu(menuData[0]);
        renderBreadcrumb();

        // 최초 진입 시 첫 화면 html도 불러오기
        let firstUrl = menuData[0].items[0].children[0].url;
        if (firstUrl) {
            $('.cont .inner').load(firstUrl);
        }
    });

    //상단 메뉴 click 이벤트
    $headerMenu.on('click', 'li a', function(e) {
        console.log("click")
        if ($(this).attr('target') === '_blank') return;
        e.preventDefault();
        
        const category = $(this).data('category');
        currentCategory = category;

        // 해당 카테고리의 데이터 찾기
        const categoryData = menuData.find(cat => cat.category === category);
        if (!categoryData) return;

        renderSideMenu(categoryData);

        // 첫 번째 아이템 > 첫 번째 children의 url 찾기
        if (categoryData.items && categoryData.items.length > 0) {
            const firstItem = categoryData.items[0];
            if (firstItem.children && firstItem.children.length > 0) {
                const firstChild = firstItem.children[0];
                if (!firstChild.external) {
                    $('.cont .inner').load(firstChild.url);
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
    
    //사이드 메뉴 click 이벤트
    $menuContainer.on('click', 'ul>li .sideBt', function(){
        let $li = $(this).parent();
        $li.toggleClass('active');
    });

    // 사이드 메뉴 children 클릭
    $menuContainer.on('click', 'ul>li ul>li a', function(e) {
        //외부링크는 a에 target="_blank"가 있으므로 기본 동작 허용
        if ($(this).attr('target') === '_blank') return;
        e.preventDefault();

        // 대분류 li를 정확히 찾음
        let $sideLi = $(this).parents('li').has('.sideBt');
        let title = $sideLi.find('.sideBt button').text();
        let label = $(this).text();

        currentTitle = title;
        currentChildLabel = label;

        renderBreadcrumb();

        // "url" 값 얻기
        // 1. 현재 카테고리, 2. title, 3. label로 찾아야 함
        let categoryData = menuData.find(cat => cat.category === currentCategory);
        if (!categoryData) return;
        let itemData = categoryData.items.find(item => item.title === currentTitle);
        if (!itemData) return;
        let childData = itemData.children.find(child => child.label === currentChildLabel);
        if (!childData) return;

        // 내부링크만 처리
        if (!childData.external) {
            // .cont .inner에 html 불러오기
            $('.cont .inner').load(childData.url);
        }
    });

    //헤더 메뉴 렌더링
    function renderHeaderMenu(menuData) {
        let html = '';
        $.each(menuData, function(idx, item) {
            if (item.url && !item.items) {
                //외부링크 메뉴였을때..
                html += `<li><a href="${item.url}" target="_blank" rel="noopener" title="새창으로 이동">${item.category}</a></li>`;
            } else {
                //내부url 불러올때..
                html += `<li><a href="#" data-category="${item.category}">${item.category}</a></li>`;
            }
        });
        $headerMenu.html(html);
    }

    //사이드 메뉴 렌더링 
    function renderSideMenu(categoryData) {
        let html = '<ul data-expanded="all">'; //all값이 들어가면 하위메뉴 전체 펼쳐진 상태
        $.each(categoryData.items, function(idx, item) {
            html += '<li>';
            html += '<p class="sideBt"><button type="button">' + item.title + '</button></p>';
            html += '<ul>';
            $.each(item.children, function(cidx, child) {
                if (child.external) { //json external값이 true면 외부링크
                    html += `<li><a href="${child.url}" target="_blank" rel="noopener" title="새창으로 이동">${child.label}</a></li>`;
                } else {
                    html += `<li><a href="#">${child.label}</a></li>`;
                }
            });
            html += '</ul></li>';
        });
        html += '</ul>';
        $menuContainer.html(html);
    
        //최초 상태 data-expanded="all" 이면 모두 열기
        let mode = $menuContainer.find('ul').data('expanded');
        if (mode === "all") {
            $menuContainer.find('ul>li').addClass('active');
        } else {
            $menuContainer.find('ul>li').removeClass('active').first().addClass('active');
        }
    }

    // 상태값 갱신 함수
    function setCurrentStateByMenu(menu, itemIdx, childIdx) {
        currentCategory = menu.category;
        currentTitle = menu.items[itemIdx]?.title || '';
        currentChildLabel = menu.items[itemIdx]?.children[childIdx]?.label || '';

        // console.log("current");
    }
    //브레드커럼 navi 렌더링
    function renderBreadcrumb() {
        let html = '<ul>';
        html += `<li><strong>${currentCategory}</strong></li>`;
        if (currentTitle) html += `<li>${currentTitle}</li>`;
        if (currentChildLabel) html += `<li>${currentChildLabel}</li>`;
        html += '</ul>';
        $breadcrumbContainer.html(html);
    }
});
