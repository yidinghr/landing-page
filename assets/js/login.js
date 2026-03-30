(function () {
  const TEMP_ADMIN_ACCOUNT = "YiDing Admin";
  const TEMP_ADMIN_PASSWORD = "YDI0006";
  const LOGIN_REDIRECT_PATH = "home/home.html";

  const loginForm = document.getElementById("loginForm");
  const accountInput = document.getElementById("account");
  const passwordInput = document.getElementById("password");
  const registerButton = document.getElementById("registerButton");
  const loginMessage = document.getElementById("loginMessage");

  if (!loginForm || !accountInput || !passwordInput || !registerButton || !loginMessage) {
    return;
  }

  resetLoginState();

  window.addEventListener("pageshow", function () {
    resetLoginState();
  });

  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const account = accountInput.value.trim();
    const password = passwordInput.value;

    if (account === TEMP_ADMIN_ACCOUNT && password === TEMP_ADMIN_PASSWORD) {
      setMessage("登入成功，正在進入首頁...", false);
      sessionStorage.setItem("yd_temp_auth", "admin");
      window.location.href = LOGIN_REDIRECT_PATH;
      return;
    }

    setMessage("帳號或密碼錯誤。", true);
    passwordInput.value = "";
    passwordInput.focus();
  });

  registerButton.addEventListener("click", function () {
    setMessage("註冊功能尚未開放。", true);
  });

  function resetLoginState() {
    accountInput.value = "";
    passwordInput.value = "";
    setMessage("", false);
    sessionStorage.removeItem("yd_temp_auth");
  }

  function setMessage(message, isError) {
    loginMessage.textContent = message;
    loginMessage.style.color = isError ? "#ffb54d" : "#fff3a0";
  }
})();
