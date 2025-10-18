// js/main.js
document.addEventListener("DOMContentLoaded", () => {
  // --- 현재 페이지에 맞는 네비게이션 버튼 활성화 ---
  const navButtons = document.querySelectorAll(".nav-button");
  const currentPage = window.location.pathname;

  navButtons.forEach((button) => {
    const buttonPage = button.getAttribute("href");
    if (
      currentPage.endsWith(buttonPage) ||
      (currentPage.endsWith("/") && buttonPage === "index.html")
    ) {
      button.classList.add("active");
    } else {
      button.classList.remove("active");
    }
  });

  // --- 홈 페이지: 오늘의 수면 목표 추천 로직 ---
  const goalTextEl = document.getElementById("daily-goal-text");
  if (goalTextEl) {
    // 이 ID가 있는 페이지(index.html)에서만 실행
    const sleepHistory = JSON.parse(localStorage.getItem("sleepHistory")) || [];

    if (sleepHistory.length > 0) {
      const lastNight = sleepHistory[sleepHistory.length - 1];
      const wasTired = lastNight.wakeUpTags.some(
        (tag) =>
          tag.includes("피곤함") ||
          tag.includes("졸림") ||
          tag.includes("눈을 뜨기 힘듦")
      );

      if (wasTired) {
        goalTextEl.innerHTML =
          "어제 피곤하셨군요. 오늘은 <strong>8시간 이상</strong> 충분한 수면을 목표로 해보세요! 😴";
      } else {
        goalTextEl.innerHTML =
          "좋은 컨디션을 유지하고 계세요. 어제처럼 <strong>7시간 30분</strong> 수면을 추천해요! 👍";
      }
    } else {
      goalTextEl.textContent = "첫 수면을 기록하고 맞춤 추천을 받아보세요!";
    }
  }
});
