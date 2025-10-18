document.addEventListener("DOMContentLoaded", () => {
  // DOM 요소 가져오기
  const viewNickname = document.getElementById("view-nickname");
  const viewBirthdate = document.getElementById("view-birthdate");
  const viewGender = document.getElementById("view-gender");

  const editNickname = document.getElementById("edit-nickname");
  const editBirthdate = document.getElementById("edit-birthdate");
  const editGender = document.getElementById("edit-gender");

  const editBtn = document.getElementById("edit-profile-btn");
  const saveBtn = document.getElementById("save-profile-btn");
  const cancelBtn = document.getElementById("cancel-edit-btn");

  const viewModeElements = document.querySelectorAll(".view-mode");
  const editModeElements = document.querySelectorAll(".edit-mode");

  // 1. 페이지 로드 시 localStorage에서 프로필 정보 불러오기
  function loadProfileData() {
    const nickname = localStorage.getItem("nickname") || "사용자";
    const birthdate = localStorage.getItem("birthdate") || "2000-01-01";
    const gender = localStorage.getItem("gender") || "선택 안 함";

    viewNickname.textContent = nickname;
    viewBirthdate.textContent = birthdate;
    viewGender.textContent = gender;
  }

  // 2. '수정 모드'로 전환하는 함수
  function switchToEditMode() {
    // 현재 정보를 input 필드에 채워넣기
    editNickname.value = viewNickname.textContent;
    editBirthdate.value = viewBirthdate.textContent;
    editGender.value = viewGender.textContent;

    // 조회 모드 요소 숨기기, 수정 모드 요소 보이기
    viewModeElements.forEach((el) => el.classList.add("hidden"));
    editModeElements.forEach((el) => el.classList.remove("hidden"));

    // 버튼 상태 변경
    editBtn.classList.add("hidden");
    saveBtn.classList.remove("hidden");
    cancelBtn.classList.remove("hidden");
  }

  // 3. '조회 모드'로 전환하는 함수
  function switchToViewMode() {
    // 조회 모드 요소 보이기, 수정 모드 요소 숨기기
    viewModeElements.forEach((el) => el.classList.remove("hidden"));
    editModeElements.forEach((el) => el.classList.add("hidden"));

    // 버튼 상태 변경
    editBtn.classList.remove("hidden");
    saveBtn.classList.add("hidden");
    cancelBtn.classList.add("hidden");
  }

  // 4. '저장' 버튼 클릭 시 데이터 저장
  document
    .getElementById("profile-form")
    .addEventListener("submit", (event) => {
      event.preventDefault(); // form의 기본 제출 동작(새로고침) 방지

      // input 필드의 값들을 localStorage에 저장
      localStorage.setItem("nickname", editNickname.value);
      localStorage.setItem("birthdate", editBirthdate.value);
      localStorage.setItem("gender", editGender.value);

      // 화면에 최신 정보 다시 로드
      loadProfileData();
      // 조회 모드로 전환
      switchToViewMode();
    });

  // 5. 버튼 이벤트 리스너 등록
  editBtn.addEventListener("click", switchToEditMode);
  cancelBtn.addEventListener("click", switchToViewMode);

  // 초기 데이터 로드
  loadProfileData();
});
