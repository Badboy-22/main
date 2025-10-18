document.addEventListener("DOMContentLoaded", () => {
  // --- 공통 변수 ---
  const tabLinks = document.querySelectorAll(".sleep-tab-link");
  const tabContents = document.querySelectorAll(".sleep-tab-content");
  let dayLogs = {}; // 낮 기록

  const recommendationText = document.getElementById("recommendation-text");
  const aiFeedback = document.getElementById("ai-feedback");

  /* =================================================================
   2. 추천 로직 핵심 함수
   ================================================================= */
  function updateRecommendation() {
    if (!recommendationText || !aiFeedback) return;

    let recommendedMinutes = 450; // 기본 추천: 7시간 30분
    let reasons = [];
    let feedback = ""; // 피드백 문구를 저장할 변수

    // 1. 데이터 수집
    const dayConditions = Object.values(dayLogs).map((log) => log.condition);
    const preSleepTags = [];
    document
      .querySelectorAll("#pre-sleep .tag-button.selected")
      .forEach((tag) => preSleepTags.push(tag.textContent.trim()));

    // 2. 필요 수면 시간 계산
    const negativeDayConditions = [
      "나쁨",
      "매우 나쁨",
      "피곤함",
      "졸림",
      "스트레스",
    ];
    if (
      dayConditions.filter((c) => negativeDayConditions.includes(c)).length >= 2
    ) {
      neededMinutes = 540;
      reasons.push("낮 동안 피곤하셨군요.");
    }
    if (preSleepTags.includes("커피 ☕️") || preSleepTags.includes("야식 🍕")) {
      neededMinutes = Math.max(neededMinutes, 540);
      reasons.push("숙면을 방해하는 활동");
    }

    // 3. AI 피드백 생성 (규칙 기반 확장)
    // 우선순위 1: 수면에 부정적인 활동에 대한 조언
    if (preSleepTags.includes("커피 ☕️") || preSleepTags.includes("야식 🍕")) {
      feedback =
        "💡 팁: 늦은 밤의 카페인이나 음식 섭취는 숙면을 방해할 수 있어요. 잠들기 3시간 전에는 피해주세요.";
    } else if (
      preSleepTags.includes("핸드폰 📱") ||
      preSleepTags.includes("TV 📺") ||
      preSleepTags.includes("게임 🎮")
    ) {
      feedback =
        "💡 팁: 전자기기의 블루라이트는 수면 호르몬을 방해해요. 잠들기 1시간 전에는 사용을 줄여보는 건 어떨까요?";
    }
    // 우선순위 2: 컨디션과 연관된 활동에 대한 조언
    else if (
      preSleepTags.includes("업무/공부 ✍️") &&
      dayConditions.includes("스트레스")
    ) {
      feedback =
        "💡 팁: 오늘 학업 스트레스가 많으셨군요. 잠들기 전 명상으로 긴장을 풀어보는 것을 추천해요.";
    } else if (preSleepTags.includes("낮잠 😴")) {
      feedback =
        "💡 팁: 늦은 낮잠은 밤 수면을 방해할 수 있어요. 낮잠은 오후 3시 이전에 20분 내외로 자는 것이 가장 좋습니다.";
    }
    // 우선순위 3: 낮 컨디션에 대한 조언
    else if (dayConditions.includes("졸림")) {
      feedback =
        "💡 팁: 낮에 졸음이 잦았다면, 다음 날 가벼운 산책으로 햇볕을 쬐는 것이 도움이 될 수 있어요. ☀️";
    }
    // 우선순위 4: 긍정적인 활동에 대한 칭찬 (부정적 피드백이 없을 경우)
    else if (
      preSleepTags.includes("운동 🏋️‍♀️") ||
      preSleepTags.includes("스트레칭 🧘") ||
      preSleepTags.includes("산책 🚶‍♂️")
    ) {
      feedback =
        "👍 좋은 습관이에요! 잠들기 전 가벼운 신체 활동은 숙면에 큰 도움이 됩니다.";
    } else if (
      preSleepTags.includes("독서 📚") ||
      preSleepTags.includes("일기 📝")
    ) {
      feedback =
        "👍 차분한 활동으로 하루를 마무리하는 것은 숙면을 위한 좋은 준비입니다.";
    } else if (preSleepTags.includes("샤워 🚿")) {
      feedback =
        "👍 따뜻한 샤워는 몸의 긴장을 풀고 잠이 드는 데 도움을 줍니다.";
    }

    // 4. 최종 추천 텍스트 생성 및 화면 업데이트
    const hours = Math.floor(recommendedMinutes / 60);
    const minutes = recommendedMinutes % 60;
    const sleepCycles = neededMinutes / 90;

    let reasonText = "오늘의 컨디션을 분석한 결과, ";
    if (reasons.length > 0) {
      reasonText =
        [...new Set(reasons)].join(", ") + "으로 지친 몸의 회복을 위해 ";
    }

    recommendationText.innerHTML = `${reasonText}<strong>${hours}시간 ${minutes}분 (수면주기 ${sleepCycles}회)</strong>의 수면을 추천해요.`;
    aiFeedback.textContent = feedback;
  }

  // --- 자동 저장/불러오기 기능 ---
  function getTodayDateString() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function loadPreSleepLogs() {
    const savedTags = JSON.parse(localStorage.getItem("todayPreSleepTags"));
    if (savedTags && savedTags.date === getTodayDateString()) {
      document.querySelectorAll("#pre-sleep .tag-button").forEach((button) => {
        if (savedTags.tags.includes(button.textContent.trim())) {
          button.classList.add("selected");
        }
      });
    }
  }
  function savePreSleepLogs() {
    const selectedTags = [];
    document
      .querySelectorAll("#pre-sleep .tag-button.selected")
      .forEach((tag) => {
        selectedTags.push(tag.textContent.trim());
      });
    const dataToSave = { date: getTodayDateString(), tags: selectedTags };
    localStorage.setItem("todayPreSleepTags", JSON.stringify(dataToSave));
  }

  function loadDayLogs() {
    const savedData = JSON.parse(localStorage.getItem("todayDayLogs"));
    const today = getTodayDateString();
    if (savedData && savedData.date === today) {
      dayLogs = savedData.logs;
    } else {
      dayLogs = [];
    }
    renderMoodMap();
    updateRecommendation();
  }

  function saveDayLogs() {
    const today = getTodayDateString();
    const dataToSave = { date: today, logs: dayLogs };
    localStorage.setItem("todayDayLogs", JSON.stringify(dataToSave));
  }

  // --- 탭 전환 기능 ---
  tabLinks.forEach((link) => {
    link.addEventListener("click", () => {
      const targetTab = link.dataset.tab;
      tabLinks.forEach((l) => l.classList.remove("active"));
      tabContents.forEach((c) => c.classList.remove("active"));
      link.classList.add("active");
      document.getElementById(targetTab).classList.add("active");
    });
  });

  // --- '잠들기 전에는...' 탭의 태그 선택 기능 ---
  document.querySelectorAll("#pre-sleep .tag-selector").forEach((container) => {
    const limit = parseInt(container.dataset.limit);
    if (!limit) return;
    container.querySelectorAll(".tag-button").forEach((button) => {
      button.addEventListener("click", () => {
        const selectedCount = container.querySelectorAll(
          ".tag-button.selected"
        ).length;
        const isSelected = button.classList.contains("selected");
        if (selectedCount < limit || isSelected) {
          button.classList.toggle("selected");
          savePreSleepLogs();
          updateRecommendation();
        } else {
          alert(`최대 ${limit}개까지만 선택할 수 있습니다.`);
        }
      });
    });
  });

  // --- '오늘 하루는...' 탭의 컨디션 맵 기능 ---
  const grid = document.querySelector(".mood-map-grid");
  const modal = document.getElementById("activity-log-modal");

  if (grid && modal) {
    const timePeriods = ["오전", "오후", "저녁"];
    const conditions = ["매우 좋음", "좋음", "보통", "나쁨", "매우 나쁨"];

    conditions.forEach((condition) => {
      timePeriods.forEach((time) => {
        const cell = document.createElement("button");
        cell.className = "map-cell";
        cell.dataset.time = time;
        cell.dataset.condition = condition;
        grid.appendChild(cell);
      });
    });

    const closeModalBtn = modal.querySelector(".modal-close-btn");
    const saveBtn = document.getElementById("save-activity-log-btn");

    grid.addEventListener("click", (event) => {
      const cell = event.target.closest(".map-cell");
      if (cell) {
        const { time, condition } = cell.dataset;
        modal.dataset.time = time;
        modal.dataset.condition = condition;
        modal.querySelector(
          "#modal-title"
        ).textContent = `${time}, '${condition}' 상태일 때`;
        modal
          .querySelectorAll(".tag-button")
          .forEach((btn) => btn.classList.remove("selected"));
        modal.classList.add("show");
      }
    });

    closeModalBtn.addEventListener("click", () =>
      modal.classList.remove("show")
    );

    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.classList.remove("show");
    });

    modal
      .querySelector("#log-activity-selector")
      .addEventListener("click", (event) => {
        if (event.target.classList.contains("tag-button")) {
          modal
            .querySelectorAll(".tag-button")
            .forEach((btn) => btn.classList.remove("selected"));
          event.target.classList.add("selected");
        }
      });

    // 4. 모달에서 '기록하기' 버튼 클릭 (수정된 로직)
    saveBtn.addEventListener("click", () => {
      const { time, condition } = modal.dataset;
      const activity = modal.querySelector(
        "#log-activity-selector .selected"
      )?.textContent;
      if (!activity) {
        alert("활동을 선택해주세요.");
        return;
      }

      // 새로 추가될 로그 객체
      const newLog = { time, condition, activity };

      // 'dayLogs' 배열 안에 정확히 똑같은 로그가 이미 있는지 확인
      const isDuplicate = dayLogs.some(
        (log) =>
          log.time === newLog.time &&
          log.condition === newLog.condition &&
          log.activity === newLog.activity
      );

      // 중복되지 않았을 때만 배열에 추가
      if (!isDuplicate) {
        dayLogs.push(newLog);
        renderMoodMap();
        saveDayLogs();
      } else {
        alert("이미 동일한 활동이 기록되어 있습니다.");
      }

      updateRecommendation();
      modal.classList.remove("show");
    });
  }

  // 5. 맵 상태를 UI에 렌더링하는 함수 (기존과 동일)
  function renderMoodMap() {
    document.querySelectorAll(".map-cell").forEach((cell) => {
      cell.innerHTML = "";
    });

    dayLogs.forEach((log) => {
      const cell = document.querySelector(
        `.map-cell[data-time="${log.time}"][data-condition="${log.condition}"]`
      );
      if (cell) {
        const chip = document.createElement("div");
        chip.className = "log-chip";
        chip.classList.add(`chip-${log.condition.replace(" ", "")}`);
        chip.textContent = log.activity;
        cell.appendChild(chip);
      }
    });
  }

  // --- 최종 '수면 시작하기' 버튼 기능 ---
  const startSleepBtn = document.getElementById("start-sleep-btn");
  startSleepBtn.addEventListener("click", () => {
    const preSleepTags = [];
    document
      .querySelectorAll("#pre-sleep .tag-button.selected")
      .forEach((tag) => {
        preSleepTags.push(tag.textContent.trim());
      });

    const sleepSession = {
      startTime: new Date().toISOString(),
      dayLogs: dayLogs,
      preSleep: preSleepTags,
    };

    localStorage.setItem("currentSleepSession", JSON.stringify(sleepSession));
    localStorage.removeItem("todayDayLogs");
    localStorage.removeItem("todayPreSleepTags");
    window.location.href = "sleeping.html";
  });

  // 페이지 초기 실행
  loadDayLogs();
  loadPreSleepLogs();
});
