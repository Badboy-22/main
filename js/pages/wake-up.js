document.addEventListener('DOMContentLoaded', () => {
    const sessionDataString = localStorage.getItem('currentSleepSession');
    if (!sessionDataString) {
        window.location.href = 'index.html';
        return;
    }
    const sessionData = JSON.parse(sessionDataString);

    // DOM 요소 가져오기
    const autoDisplay = document.getElementById('auto-duration-display');
    const manualDisplay = document.getElementById('manual-input-display');
    const totalSleepTimeEl = document.getElementById('total-sleep-time');
    const startTimeInput = document.getElementById('start-time-input');
    const endTimeInput = document.getElementById('end-time-input');
    const saveRecordBtn = document.getElementById('save-record-btn');

    // URL 파라미터 확인
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');

    // '수동 입력 모드'일 경우
    if (mode === 'manual') {
        document.getElementById('wakeup-title').textContent = '수면 시간 기록하기';
        autoDisplay.classList.add('hidden');
        manualDisplay.classList.remove('hidden');

        // 입력 필드에 기본값 설정 (일어난 시간: 지금, 잠든 시간: 8시간 전)
        const now = new Date();
        const eightHoursAgo = new Date(now.getTime() - 8 * 60 * 60 * 1000);
        // toISOString() 후 YYYY-MM-DDTHH:mm 형식에 맞게 자르기
        endTimeInput.value = now.toISOString().slice(0, 16);
        startTimeInput.value = eightHoursAgo.toISOString().slice(0, 16);

    } else { // '자동 계산 모드'일 경우
        const startTime = new Date(sessionData.startTime);
        const endTime = new Date(sessionData.endTime);

        const diffMs = endTime - startTime;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        totalSleepTimeEl.textContent = `${diffHours}시간 ${diffMinutes}분`;
        sessionData.totalSleepMinutes = diffHours * 60 + diffMinutes;
    }

    // 태그 선택 기능 (모드와 상관없이 공통)
    document.querySelectorAll('.tag-button').forEach(button => {
        button.addEventListener('click', () => button.classList.toggle('selected'));
    });

    // '기록 저장하기' 버튼 클릭 이벤트 (모드에 따라 다르게 처리)
    saveRecordBtn.addEventListener('click', () => {
        if (mode === 'manual') {
            // 수동 모드일 경우, 입력된 시간으로 startTime, endTime, totalSleepMinutes 업데이트
            const manualStartTime = new Date(startTimeInput.value);
            const manualEndTime = new Date(endTimeInput.value);

            if (manualEndTime <= manualStartTime) {
                alert('일어난 시간은 잠든 시간보다 나중이어야 합니다.');
                return;
            }

            const diffMs = manualEndTime - manualStartTime;
            sessionData.startTime = manualStartTime.toISOString();
            sessionData.endTime = manualEndTime.toISOString();
            sessionData.totalSleepMinutes = Math.floor(diffMs / (1000 * 60));
        }

        // --- 이하 공통 저장 로직 ---
        const wakeUpTags = [];
        document.querySelectorAll('.tag-button.selected').forEach(tag => {
            wakeUpTags.push(tag.textContent.trim());
        });
        sessionData.wakeUpTags = wakeUpTags;

        const sleepHistory = JSON.parse(localStorage.getItem('sleepHistory')) || [];
        sleepHistory.push(sessionData);
        localStorage.setItem('sleepHistory', JSON.stringify(sleepHistory));

        localStorage.removeItem('currentSleepSession');

        alert('수면 기록이 저장되었습니다!');
        window.location.href = 'analysis.html';
    });
});