document.addEventListener("DOMContentLoaded", () => {
  const sessionDataString = localStorage.getItem("currentSleepSession");
  if (!sessionDataString) {
    window.location.href = "sleep.html";
    return;
  }

  const sessionData = JSON.parse(sessionDataString);
  const timerDisplay = document.getElementById("timer-display");
  const wakeUpBtn = document.getElementById("wake-up-btn");
  const manualLogBtn = document.getElementById("manual-log-btn"); // 수동 기록 버튼 선택 (추가)
  const sleepMessage = document.getElementById("sleep-message");

  sleepMessage.textContent = "수면 시간을 측정하고 있습니다...";

  // 카운트업 타이머 시작
  let elapsedSeconds = 3600 * 5;
  const timerInterval = setInterval(() => {
    elapsedSeconds++;
    const hours = Math.floor(elapsedSeconds / 3600);
    const minutes = Math.floor((elapsedSeconds % 3600) / 60);
    const seconds = elapsedSeconds % 60;

    timerDisplay.textContent = `${String(hours).padStart(2, "0")}:${String(
      minutes
    ).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }, 1000);

  // '일어났어요!' 또는 '수동 기록' 버튼 클릭 시 실행될 공통 함수 (수정)
  // function proceedToWakeUp() {
  //   clearInterval(timerInterval); // 타이머 중지
  //   sessionData.endTime = new Date().toISOString();
  //   localStorage.setItem("currentSleepSession", JSON.stringify(sessionData));
  //   window.location.href = "wake-up.html";
  // }

  // 두 버튼에 동일한 함수를 연결 (수정)
  // '일어났어요!' 버튼 클릭 이벤트
  wakeUpBtn.addEventListener("click", () => {
    clearInterval(timerInterval); // 타이머 중지
    sessionData.endTime = new Date().toISOString();
    localStorage.setItem("currentSleepSession", JSON.stringify(sessionData));
    window.location.href = "wake-up.html"; // 일반 모드로 이동
  });

  // '수동 기록' 버튼 클릭 이벤트
  manualLogBtn.addEventListener("click", () => {
    clearInterval(timerInterval); // 타이머 중지
    // sessionData에 endTime을 기록할 필요 없음 (사용자가 직접 입력할 것이므로)
    localStorage.setItem("currentSleepSession", JSON.stringify(sessionData));
    window.location.href = "wake-up.html?mode=manual"; // 수동 모드로 이동
  });
});
