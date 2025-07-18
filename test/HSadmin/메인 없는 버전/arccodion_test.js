$(function() {
    let $headerMenu = $('.header ul');
    let $sideMenuContainer = $('.sideMenu');
    let $breadcrumbContainer = $('.breadcrumb');

    let menuData = [];
    let currentCategory, currentTitle, currentChildLabel;
    let lastLoaded = { url: null, label: null };

    // 외부링크 여부 판별
    const isExternal = (item) => item.external || (item.url && !item.items);

    // 메뉴 데이터 로딩
    $.getJSON('../json/menu.json', function(data) {
        menuData = data;
        setCurrentStateByMenu(menuData[0], 0, 0);
        renderHeaderMenu(menuData);
        renderSideMenu(menuData[0]);
        renderBreadcrumb();

        // 첫 화면 컨텐츠 로드
        const firstUrl = menuData[0].items[0].children[0].url;
        if (firstUrl) $('#subCont').attr('src', firstUrl);
    });

    // 헤더 메뉴 클릭
    $headerMenu.on('click', 'li a', function(e) {
        if ($(this).attr('target') === '_blank') return; // 외부링크는 기본 동작
        e.preventDefault();

        $headerMenu.find('li').removeClass('active');
        $(this).parent('li').addClass('active');

        const category = $(this).data('category');
        const categoryData = menuData.find(item => item.category === category);
        if (!categoryData) return;

        setCurrentStateByMenu(categoryData, 0, 0);
        renderSideMenu(categoryData);

        const $firstItem = $sideMenuContainer.find('.category > li').first(); 
        $firstItem.find('ul > li').removeClass('active');
        $firstItem.find('ul > li').first().addClass('active');

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
        } else if (categoryData.url) {
            window.open(categoryData.url, '_blank');
        }
    });

    // 사이드 메뉴 아코디언
    $(document).on('click', 'ul>li .sideBt', function(){
        $(this).closest('li').toggleClass('active');
    });

    // 사이드 메뉴 children 클릭
    $(document).on('click', '.sideMenu ul>li ul>li a', function(e) {
        if ($(this).attr('target') === '_blank') return;
        e.preventDefault();

        $('.sideMenu ul > li > ul > li').removeClass('active');
        $(this).parent('li').addClass('active');

        const itemIdx = Number($(this).data('item-idx'));
        const childIdx = Number($(this).data('child-idx'));
        const categoryData = menuData.find(item => item.category === currentCategory);
        const itemData = categoryData?.items[itemIdx];
        const childData = itemData?.children[childIdx];

        if (childData && !childData.external) {
            loadContent(childData.url, childData.label);
        }

        currentTitle = itemData.title;
        currentChildLabel = childData.label;
        renderBreadcrumb();
    });

    // 헤더 메뉴 렌더링
    function renderHeaderMenu(menuData) {
        $headerMenu.html(menuData
            .filter(item => item.category !== 'main')
            .map(item =>
                isExternal(item)
                    ? `<li${item.category === currentCategory ? ' class="active"' : ''}><a href="${item.url}" target="_blank" rel="noopener" title="새창으로 이동">${item.category}</a></li>`
                    : `<li${item.category === currentCategory ? ' class="active"' : ''}><a href="#" data-category="${item.category}">${item.category}</a></li>`
            ).join(''));
    }

    // 사이드 메뉴 렌더링
    function renderSideMenu(categoryData) {
        if (categoryData.category === 'main') {
            $sideMenuContainer.html('');
            return;
        }
        const html = `
            <ul class="category" data-expanded="all">
                ${categoryData.items.map((item, itemIdx) => `
                    <li${itemIdx === 0 ? ' class="active"' : ''}>
                        <p class="sideBt"><button type="button">${item.title}</button></p>
                        <ul>
                            ${item.children.map((child, childIdx) =>
                                `<li${itemIdx === 0 && childIdx === 0 ? ' class="active"' : ''}>` +
                                (
                                    child.external
                                    ? `<a href="${child.url}" target="_blank" rel="noopener" title="새창으로 이동" data-item-idx="${itemIdx}" data-child-idx="${childIdx}">${child.label}</a>`
                                    : `<a href="#" data-item-idx="${itemIdx}" data-child-idx="${childIdx}">${child.label}</a>`
                                ) +
                                `</li>`
                            ).join('')}
                        </ul>
                    </li>
                `).join('')}
            </ul>
        `;
        $sideMenuContainer.html(html);

        let mode = $sideMenuContainer.find('ul').data('expanded');
        if (mode === "all") {
            $sideMenuContainer.find('.category > li').addClass('active'); 
        } else {
            $sideMenuContainer.find('>li').removeClass('active').first().addClass('active');
        }
    }

    // 상태값 갱신
    function setCurrentStateByMenu(menu, itemIdx, childIdx) {
        currentCategory = menu.category;
        currentTitle = menu.items?.[itemIdx]?.title || '';
        currentChildLabel = menu.items?.[itemIdx]?.children?.[childIdx]?.label || '';
    }

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

    // 컨텐츠 로드
    function loadContent(url, label) {
        if (lastLoaded.url === url && lastLoaded.label === label) return;
        $('#subCont').attr('src', url);
        lastLoaded = { url, label };
    }
});
