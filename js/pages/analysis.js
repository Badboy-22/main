document.addEventListener("DOMContentLoaded", () => {
  // DOM 요소 가져오기
  const calendarGrid = document.getElementById("calendar-grid");
  const currentMonthYear = document.getElementById("current-month-year");
  const prevMonthBtn = document.getElementById("prev-month-btn");
  const nextMonthBtn = document.getElementById("next-month-btn");
  const modal = document.getElementById("record-detail-modal");

  // modal이 없는 페이지에서 오류가 나지 않도록 확인
  if (!calendarGrid || !modal) return;

  const closeModalBtn = modal.querySelector(".modal-close-btn");

  // 1. localStorage에서 전체 수면 기록 불러오기
  const sleepHistory = JSON.parse(localStorage.getItem("sleepHistory")) || [];

  // 2. 빠른 조회를 위해 데이터를 날짜별로 정리 (예: {'2025-10-9': record})
  const historyMap = {};
  sleepHistory.forEach((record) => {
    const date = new Date(record.startTime);
    const key = `${date.getFullYear()}-${date.getMonth() + 1
      }-${date.getDate()}`;
    historyMap[key] = record;
  });

  let currentDate = new Date();

  // 3. 달력을 화면에 그리는 함수 (핵심 로직)
  function renderCalendar(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    currentMonthYear.textContent = `${year}년 ${month + 1}월`;
    calendarGrid.innerHTML = "";

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const lastDateOfMonth = new Date(year, month + 1, 0).getDate();

    // 첫 날짜 이전의 빈 칸 생성
    for (let i = 0; i < firstDayOfMonth; i++) {
      calendarGrid.appendChild(document.createElement("div"));
    }

    // 1일부터 마지막 날까지 날짜 셀 생성
    for (let i = 1; i <= lastDateOfMonth; i++) {
      const dayCell = document.createElement("div");
      dayCell.className = "day";
      const key = `${year}-${month + 1}-${i}`;

      // 해당 날짜에 수면 기록이 있는지 확인
      if (historyMap[key]) {
        const record = historyMap[key];
        dayCell.classList.add("has-record");

        // 기상 후 컨디션에 따라 배경색 결정
        if (
          record.wakeUpTags.some(
            (tag) => tag.includes("개운함") || tag.includes("상쾌함")
          )
        ) {
          dayCell.classList.add("good-sleep");
        } else if (
          record.wakeUpTags.some(
            (tag) => tag.includes("피곤함") || tag.includes("눈을 뜨기 힘듦")
          )
        ) {
          dayCell.classList.add("bad-sleep");
        }

        // 총 수면 시간 계산 및 표시
        const hours = Math.floor(record.totalSleepMinutes / 60);
        const minutes = record.totalSleepMinutes % 60;
        dayCell.innerHTML = `<span class="date-number">${i}</span> <span class="sleep-time">${hours}시간 ${minutes}분</span>`;
      } else {
        dayCell.innerHTML = `<span class="date-number">${i}</span>`;
      }

      // 오늘 날짜 표시
      const today = new Date();
      if (
        year === today.getFullYear() &&
        month === today.getMonth() &&
        i === today.getDate()
      ) {
        dayCell.classList.add("today");
      }

      calendarGrid.appendChild(dayCell);
    }
    updateSummary(year, month); // 월별 요약 업데이트
  }

  // 월별 통계 업데이트 함수
  function updateSummary(year, month) {
    // DOM 요소 가져오기
    const avgSleepEl = document.getElementById("avg-sleep-time");
    const sleepConditionEl = document.getElementById("sleep-condition-summary");
    const dayConditionEl = document.getElementById("day-condition-summary");

    // 해당 월의 기록만 필터링
    const monthRecords = sleepHistory.filter((record) => {
      const recordDate = new Date(record.startTime);
      return (
        recordDate.getFullYear() === year && recordDate.getMonth() === month
      );
    });

    // 기록이 없으면 초기화하고 종료
    if (monthRecords.length === 0) {
      avgSleepEl.textContent = "--시간 --분";
      sleepConditionEl.textContent = "--";
      dayConditionEl.textContent = "--";
      return;
    }

    // 1. 평균 수면 시간 계산 (기존과 동일)
    const totalMinutes = monthRecords.reduce(
      (sum, record) => sum + record.totalSleepMinutes,
      0
    );
    const avgMinutes = Math.floor(totalMinutes / monthRecords.length);
    avgSleepEl.textContent = `${Math.floor(avgMinutes / 60)}시간 ${avgMinutes % 60}분`;

    // 2. 컨디션 태그 분류 기준 정의
    const goodConditions = [
      "매우 좋음",
      "좋음",
      "활기참",
      "상쾌함",
      "개운함 ✨",
    ];
    const normalConditions = ["보통"];
    const badConditions = [
      "나쁨",
      "매우 나쁨",
      "피곤함",
      "졸림",
      "스트레스",
      "눈을 뜨기 힘듦 😪",
      "몸이 찌뿌둥함 😫",
    ];

    // 3. '잠의 컨디션' 집계
    const sleepConditionCounter = { good: 0, normal: 0, bad: 0 };
    monthRecords
      .flatMap((r) => r.wakeUpTags)
      .forEach((tag) => {
        if (goodConditions.some((c) => tag.includes(c)))
          sleepConditionCounter.good++;
        else if (normalConditions.some((c) => tag.includes(c)))
          sleepConditionCounter.normal++;
        else if (badConditions.some((c) => tag.includes(c)))
          sleepConditionCounter.bad++;
      });

    // 4. '낮 활동 컨디션' 집계
    const dayConditionCounter = { good: 0, normal: 0, bad: 0 };
    monthRecords
      .flatMap((r) => Object.values(r.dayLogs))
      .forEach((log) => {
        const condition = log.condition;
        if (goodConditions.includes(condition)) dayConditionCounter.good++;
        else if (normalConditions.includes(condition))
          dayConditionCounter.normal++;
        else if (badConditions.includes(condition)) dayConditionCounter.bad++;
      });

    // 5. 가장 많이 나온 컨디션을 결과로 판정하는 함수
    const getOverallCondition = (counter) => {
      const maxCount = Math.max(counter.good, counter.normal, counter.bad);
      if (maxCount === 0) return "기록 없음";
      if (counter.good === maxCount) return "좋음 😊";
      if (counter.bad === maxCount) return "나쁨 😟";
      return "보통 😐";
    };

    // 6. 화면에 결과 표시
    sleepConditionEl.textContent = getOverallCondition(sleepConditionCounter);
    dayConditionEl.textContent = getOverallCondition(dayConditionCounter);
  }

  // 5. 상세보기 모달을 채우고 보여주는 함수
  function showDetailModal(dateKey) {
    const record = historyMap[dateKey];
    if (!record) return;

    const date = new Date(record.startTime);
    modal.querySelector("#modal-record-date").textContent = `${date.getMonth() + 1
      }월 ${date.getDate()}일 수면 기록`;
    const hours = Math.floor(record.totalSleepMinutes / 60);
    const minutes = record.totalSleepMinutes % 60;
    modal.querySelector(
      "#modal-total-sleep-time"
    ).textContent = `${hours}시간 ${minutes}분`;

    let detailsHtml = "<h4>🌞 낮 컨디션</h4><ul>";

    if (record.dayLogs && record.dayLogs.length > 0) {
      // 정렬 순서를 정의하는 객체
      const timeOrder = { 오전: 1, 오후: 2, 저녁: 3 };

      // timeOrder 객체를 기준으로 dayLogs 배열을 정렬합니다.
      record.dayLogs.sort((a, b) => {
        return timeOrder[a.time] - timeOrder[b.time];
      });
    }

    for (const log of record.dayLogs) {
      detailsHtml += `<li>[${log.time}] ${log.activity} 중 <strong>${log.condition}</strong></li>`;
    }

    if (Object.keys(record.dayLogs).length === 0)
      detailsHtml += "<li>기록 없음</li>";

    detailsHtml += "</ul><h4>🌙 잠들기 전</h4><ul>";
    if (record.preSleep.length > 0)
      record.preSleep.forEach((tag) => (detailsHtml += `<li>${tag}</li>`));
    else detailsHtml += "<li>기록 없음</li>";

    detailsHtml += "</ul><h4>✨ 기상 후</h4><ul>";
    if (record.wakeUpTags.length > 0)
      record.wakeUpTags.forEach((tag) => (detailsHtml += `<li>${tag}</li>`));
    else detailsHtml += "<li>기록 없음</li>";
    detailsHtml += "</ul>";

    modal.querySelector("#modal-record-details").innerHTML = detailsHtml;
    modal.classList.add("show");
  }

  // 6. 이벤트 리스너 등록
  calendarGrid.addEventListener("click", (event) => {
    const dayCell = event.target.closest(".day.has-record");
    if (dayCell) {
      const date = dayCell.querySelector(".date-number").textContent;
      const [year, month] = currentMonthYear.textContent
        .replace(/년|월/g, "")
        .split(" ");
      const key = `${year}-${month}-${date}`;
      showDetailModal(key);
    }
  });

  closeModalBtn.addEventListener("click", () => modal.classList.remove("show"));
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.remove("show");
  });
  prevMonthBtn.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar(currentDate);
  });
  nextMonthBtn.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar(currentDate);
  });

  // 초기 렌더링
  renderCalendar(currentDate);
});
