// // sub_common.js
// function openCommonDialog(arg) {
//     // 이미 생성된 dialog가 있으면 먼저 제거
//     if ($("#" + arg.popupId).length) {
//         $("#" + arg.popupId).remove();
//     }

//     // 팝업용 div를 동적으로 생성
//     var $dialogDiv = $("<div>", { id: arg.popupId }).appendTo("body");

//     // ajax로 html 컨텐츠 로드
//     $.ajax({
//         url: arg.url,
//         type: arg.method || "GET",
//         data: arg.data || {},
//         success: function (html) {
//             $dialogDiv.html(html);

//             // dialog 열기
//             $dialogDiv.dialog({
//                 autoOpen: true,
//                 title: arg.title,
//                 width: arg.options.width || 600,
//                 height: arg.options.height || 'auto',
//                 modal: arg.options.modal !== undefined ? arg.options.modal : true,
//                 dialogClass: arg.options.dialogClass || '',
//                 resizable: false,
//                 closeOnEscape: false,
//                 open: function () {
//                     // 필요시 높이 조정 등 추가
//                 },
//                 close: function () {
//                     $dialogDiv.dialog("destroy").remove(); // 닫을 때 dom 제거
//                 }
//             });
//         },
//         error: function () {
//             $dialogDiv.html("<p>팝업을 불러오지 못했습니다.</p>");
//         }
//     });
// }
