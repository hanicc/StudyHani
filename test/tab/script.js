var tabLink = $('.tab-menu li'),
    subLink = $('.sub-menu li'),
    currentUrl = location.href,  //현재의 주소를 가져오는법
    tabContent = $('#tab-content > div');
    
tabLink.add(subLink).click(function(e){
    e.preventDefault();
    var targerIdx = $(this).index(); 
    //console.log(targerIdx);

    activateTab(targerIdx); //탭 기능을 만들었다
});

subLink.each(function(i){
    var compareUrl = $(this).find('a').attr('href');
    var active = currentUrl.indexOf(compareUrl);
    var blank = currentUrl.indexOf('#');
    //console.log(active); // href 링크가 없으면 -1 없음이 뜸 #링크가 잡히면 숫자가 뜸
    if(active > -1) {
        activateTab(i);
    }
    if(blank == -1) {
        activateTab(0);
    }
});

function activateTab(idx) { //idx 매개변수를 개수를 가져와서
    tabContent.hide();
    tabLink.find('a').removeClass('active');
    tabLink.eq(idx).find('a').addClass('active');
    tabContent.eq(idx).show();
}


// var tabLink = $('.tab-menu li'),
//     subLink = $('.sub-menu li'),
//     currentUrl = location.href,
//     tabContent = $('#tab-content > div');

// tabLink.add(subLink).click(function(e){
//     e.preventDefault();
//     var targetIdx = $(this).index();
    
//     activateTab(targetIdx);
// });

// subLink.each(function(i){
//     var compareUrl = $(this).find('a').attr('href');
//     var active = currentUrl.indexOf(compareUrl);
//     var blank = currentUrl.indexOf('#');
//     console.log(active);
//     if(active > -1){
//         activateTab(i);
//     }
//     if(blank == -1){
//         activateTab(0);
//     }
// });


// function activateTab(idx){
//     tabContent.hide();
//     tabLink.find('a').removeClass('active');
//     tabLink.eq(idx).find('a').addClass('active');
//     tabContent.eq(idx).show();
// }