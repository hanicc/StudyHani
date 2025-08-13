$(function() {
    let $headerMenu = $('.hd ul');
    let $sideMenuContainer = $('.sideMenu');
    let $pageConWrap = $('.new_content');
    let $breadcrumbContainer = $('.breadcrumb');

    let menuData = [];
    let currentCategory, currentTitle, currentChildLabel;
    let lastLoaded = { url: null, label: null };

    const isHidden = (item) => item.hidden === true;
    const isExternal = (item) => item.external === true;

    $.getJSON('./json/menu.json', function(data) {
        menuData = data;
        renderHeaderMenu(menuData);
        showMainPage();
    });

    function renderHeaderMenu(menuData) {
        $headerMenu.html(
            menuData
                .filter(item => item.category !== 'main' && !isHidden(item))
                .map(item => `
                    <li${isExternal(item) ? ' class="exIcon"' : ''}>
                        <a href="${isExternal(item) ? item.url : '#'}"
                           ${isExternal(item) ? 'target="_blank" rel="noopener" title="새창으로 이동"' : `data-category="${item.category}"`}>
                           ${item.category}
                        </a>
                    </li>
                `).join('')
        );
    }

    $headerMenu.on('click', 'li a', function(e) {
        if ($(this).attr('target') === '_blank') return; // 외부 링크는 기본동작
        e.preventDefault();

        $headerMenu.find('li').removeClass('active');
        $(this).parent().addClass('active');

        $('.main_cont').remove();

        // 동적으로 필요한 요소가 없으면 생성
        if ($('.sideMenu').length === 0) {
            $('.new_container').prepend('<aside class="sideMenu"></aside>');
            $sideMenuContainer = $('.sideMenu'); // 갱신
        }
        if ($('.breadcrumb').length === 0) {
            $('.new_content').prepend('<div class="breadcrumb"></div>');
            $breadcrumbContainer = $('.breadcrumb'); // 갱신
        }
        if ($('.sub_cont').length === 0) {
            $('.new_content').append(`
                <aside class="sub_cont">
                    <div class="inner">
                        <iframe id="subCont" src="" style="width:100%;height:100%;border:0"></iframe>
                    </div>
                </aside>
            `);
        }

        currentCategory = $(this).data('category');
        const categoryData = menuData.find(item => item.category === currentCategory);
        if (!categoryData) return;

        renderSideMenu(categoryData);

        const firstChild = categoryData.items?.[0]?.children?.find(c => !isHidden(c));
        if (firstChild) {
            openLink(firstChild, categoryData.items[0].title);
        }
    });

    function renderSideMenu(categoryData) {
        if (categoryData.category === 'main') {
            $sideMenuContainer.empty();
            return;
        }
        const html = `
            <div class="sideMenu-toggle-wrap">
                <button type="button" class="sideMenu-toggle" aria-label="사이드메뉴 접기/펼치기"><i class="icon_arrow_1"></i></button>
            </div>
            <ul class="category" data-expanded="all">
                ${categoryData.items.map((item, itemIdx) => {
                    const childrenHtml = item.children
                        .map((child, origIdx) => {
                            if (isHidden(child)) return ''; // hidden은 DOM 생성 안 함 (인덱스는 유지)
                            // "첫번째 보이는 child" 판정도 원본 인덱스 기준으로
                            const isFirstVisible = itemIdx === 0 && item.children.slice(0, origIdx).every(isHidden);
                            return `
                                <li${isFirstVisible ? ' class="active"' : ''}>
                                    <a href="${isExternal(child) ? child.url : '#'}"
                                    ${isExternal(child) ? 'target="_blank" rel="noopener" title="새창으로 이동"' : ''}
                                    data-item-idx="${itemIdx}" data-child-idx="${origIdx}">
                                    ${child.label}
                                    </a>
                                </li>
                            `;
                        })
                        .filter(Boolean) // '' 제거
                        .join('');

                    return `
                        <li${itemIdx === 0 ? ' class="active"' : ''}>
                            <p class="sideBt"><span class="icon"></span><button type="button">${item.title}</button></p>
                            <ul>${childrenHtml}</ul>
                        </li>
                    `;
                }).join('')}
            </ul>
        `;
        $sideMenuContainer.html(html);
        $sideMenuContainer.find('.category > li').addClass('active');
    }

    $(document).on('click', '.sideMenu ul>li ul>li a', function(e) {
        if ($(this).attr('target') === '_blank') return;
        e.preventDefault();

        $('.sideMenu ul > li > ul > li').removeClass('active');
        $(this).parent().addClass('active');

        const itemIdx = $(this).data('item-idx');
        const childIdx = $(this).data('child-idx');
        const categoryData = menuData.find(item => item.category === currentCategory);
        const itemData = categoryData?.items[itemIdx];
        const childData = itemData?.children[childIdx];

        if (childData) {
            openLink(childData, itemData.title);
        }
    });

    function openLink(linkData, title) {
        currentTitle = title;
        currentChildLabel = linkData.label;
        renderBreadcrumb();

        if (isExternal(linkData)) {
            window.open(linkData.url, '_blank');
        } else {
            loadContent(linkData.url, linkData.label);
        }
    }

    function renderBreadcrumb() {
        $breadcrumbContainer.html(`
            <ul>
                <li><strong>${currentCategory}</strong></li>
                ${currentTitle ? `<li>${currentTitle}</li>` : ''}
                ${currentChildLabel ? `<li>${currentChildLabel}</li>` : ''}
            </ul>
        `);
    }

    function loadContent(url, label) {
        if (lastLoaded.url === url && lastLoaded.label === label) return;
        $('#subCont').attr('src', url);
        lastLoaded = { url, label };
    }

    function showMainPage() {
        $('.sideMenu, .breadcrumb, .sub_cont').remove();
        if ($('.main_cont').length === 0) {
            $('.new_content').append('<aside class="main_cont"><div class="inner"></div></aside>');
        }
        $('.main_cont').show().find('.inner').load('./main/main.html');
        $headerMenu.find('li').removeClass('active');
    }

    $(document).on('click', 'ul>li .sideBt', function(){
        $(this).closest('li').toggleClass('active');
    });

    $(document).on('click', '.sideMenu-toggle', function () {
        $sideMenuContainer.toggleClass('closed');
        $pageConWrap.toggleClass('expanded');
    });

    $(document).on('click', '.goMain', function(e){
        e.preventDefault();
        showMainPage();
    });
});
