// sub.js (fruits1 페이지에서 팝업 버튼 클릭 시)
$(function () {
    $("#openPopupBtn").on("click", function () {
        var arg = {
            popupId: "fruits1Popup", // 고유 id로!
            url: "./sub/supPopUp/pop.html",
            method: "GET",
            title: "과일 팝업",
            options: {
                width: 500,
                height: 400,
                modal: true,
                dialogClass: 'fruits-popup'
            },
            data: {
                // 넘길 데이터가 있으면 여기에
            }
        };
        parent.openCommonDialog(arg); // 부모창 함수 호출 parent가 붙고
    });
});