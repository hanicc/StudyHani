$(function () {
    // ------------------------------------------------------------------
    // (1) 기존 used 클래스 처리 (blur 시)
    $('.userInput').find('input').on('blur', function() {
        const $this = $(this);
        if ($this.val().trim()) {
            $this.addClass('used');
        } else {
            $this.removeClass('used');
        }
    });

    // (2) 입력 중 required 해제
    $('#loginId, #loginPw').on('input', function() {
        const $this = $(this);
        if ($this.val().trim()) {
            $this.closest('.userInput').removeClass('required');
        }
    });

    // ------------------------------------------------------------------
    // (3) 아이디 저장 관련 유틸
    const ID_KEY = 'savedLoginId';

    function storageAvailable() {
        try {
            const testKey = '__storage_test__';
            localStorage.setItem(testKey, testKey);
            localStorage.removeItem(testKey);
            return true;
        } catch(e) {
            return false;
        }
    }
    const canUseStorage = storageAvailable();

    // 쿠키 (localStorage 안될 때 fallback)
    function setCookie(name, value, days){
        const d = new Date();
        d.setTime(d.getTime() + (days*24*60*60*1000));
        document.cookie = name + '=' + encodeURIComponent(value) + ';expires=' + d.toUTCString() + ';path=/';
    }
    function getCookie(name){
        const prefix = name + '=';
        for (const pair of document.cookie.split(';')) {
            const trimmed = pair.trim();
            if (trimmed.startsWith(prefix)) {
                return decodeURIComponent(trimmed.slice(prefix.length));
            }
        }
        return null;
    }
    function deleteCookie(name){
        document.cookie = name + '=; Max-Age=-1; path=/';
    }

    function saveId(id){
        if (!id) return;
        if (canUseStorage) {
            localStorage.setItem(ID_KEY, id);
        } else {
            setCookie(ID_KEY, id, 30);
        }
    }
    function removeSavedId(){
        if (canUseStorage) {
            localStorage.removeItem(ID_KEY);
        } else {
            deleteCookie(ID_KEY);
        }
    }
    function loadSavedId(){
        if (canUseStorage) {
            return localStorage.getItem(ID_KEY) || '';
        } else {
            return getCookie(ID_KEY) || '';
        }
    }

    const $idInput   = $('#loginId');
    const $pwInput   = $('#loginPw');
    const $remember  = $('#rememberIdCheck'); // 체크박스 id

    // 페이지 로드 시 저장된 아이디 반영
    const saved = loadSavedId();
    if (saved) {
        $idInput.val(saved).addClass('used');
        $remember.prop('checked', true);
    }

    // 체크박스 변경 시
    $remember.on('change', function() {
        if (this.checked) {
            const v = $idInput.val().trim();
            if (v) saveId(v);
        } else {
            removeSavedId();
        }
    });

    // 아이디 입력 중 갱신 (체크 상태일 때)
    $idInput.on('input', function() {
        if ($remember.is(':checked')) {
            const v = $idInput.val().trim();
            if (v) {
                saveId(v);
            } else {
                // 비워지면 제거 (원치 않으면 이 줄 삭제)
                removeSavedId();
            }
        }
    });

    // ------------------------------------------------------------------
    // (4) 폼 제출 시 검증 + (검증 성공 시) 아이디 저장 최종 반영
    $('#loginForm').on('submit', function(e) {
        const $id = $idInput;
        const $pw = $pwInput;

        let firstInvalid = null;

        // 아이디 검사
        if (!$id.val().trim()) {
            $id.closest('.userInput').addClass('required');
            if (!firstInvalid) firstInvalid = $id;
        } else {
            $id.closest('.userInput').removeClass('required');
        }

        // 비밀번호 검사
        if (!$pw.val().trim()) {
            $pw.closest('.userInput').addClass('required');
            if (!firstInvalid) firstInvalid = $pw;
        } else {
            $pw.closest('.userInput').removeClass('required');
        }

        // 하나라도 비어 있으면 제출 중단 + 포커스
        if (firstInvalid) {
            e.preventDefault();
            firstInvalid.focus();
            return; // 여기서 종료 (아이디 저장 로직 실행 안 함)
        }

        // ---- 여기부터 검증 '통과' 시에만 실행되는 기억(저장) 로직 ----
        if ($remember.is(':checked')) {
            const v = $id.val().trim();
            if (v) {
                saveId(v);
            } else {
                // 통과했는데 값이 빈 경우는 거의 없지만 방어코드
                removeSavedId();
            }
        } else {
            removeSavedId();
        }
        // ---- 저장 로직 끝 ----
    });
});
