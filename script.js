// 深色模式切换
(function () {
  const toggle = document.getElementById("themeToggle");
  if (!toggle) return;

  // 读取已保存的主题偏好
  const saved = localStorage.getItem("mind-theme");
  if (saved === "dark") {
    document.body.classList.add("dark");
    toggle.textContent = "☀️";
  }

  toggle.addEventListener("click", function () {
    const isDark = document.body.classList.toggle("dark");
    toggle.textContent = isDark ? "☀️" : "🌙";
    localStorage.setItem("mind-theme", isDark ? "dark" : "light");
  });
})();
