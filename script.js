// 主题管理：三态模式（auto/light/dark，auto=跟随系统）+ 安抚色调（sage/sand/lake/pine）
(function () {
  var STORAGE_KEY = "mind-theme";
  var THEME_NAMES = { sage: "鼠尾草", sand: "暖棕沙", lake: "湖泊蓝", pine: "松林" };
  var THEME_COLORS = {
    sage: ["#5e8c7e", "#1a1f1c"],
    sand: ["#b08a5a", "#211b14"],
    lake: ["#5a86a8", "#141c26"],
    pine: ["#5f8a73", "#141d18"]
  };

  var toggle = document.getElementById("themeToggle");
  if (!toggle) return;

  var root = document.documentElement;
  var mq = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;

  var state = { mode: "auto", theme: "sage" };
  try {
    var saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    if (saved.mode === "light" || saved.mode === "dark" || saved.mode === "auto") state.mode = saved.mode;
    if (saved.theme && THEME_NAMES[saved.theme]) state.theme = saved.theme;
  } catch (e) {}

  function effectiveDark() {
    if (!mq) return state.mode === "dark";
    if (state.mode === "dark") return true;
    if (state.mode === "light") return false;
    return mq.matches;
  }

  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
  }

  function apply() {
    root.setAttribute("data-mode", effectiveDark() ? "dark" : "light");
    root.setAttribute("data-theme", state.theme);
    toggle.textContent = effectiveDark() ? "☀️" : "🌙";
    // theme-color meta sync
    var metas = document.querySelectorAll('meta[name="theme-color"]');
    var color = effectiveDark() ? "#1a1f1c" : (THEME_COLORS[state.theme] ? THEME_COLORS[state.theme][0] : "#5e8c7e");
    for (var mi = 0; mi < metas.length; mi++) metas[mi].setAttribute("content", color);
    syncUI();
  }

  // --- 构建面板：用包裹容器承载按钮 + 面板 ---
  var wrap = document.createElement("span");
  wrap.className = "theme-btn";
  toggle.parentNode.insertBefore(wrap, toggle);
  wrap.appendChild(toggle);
  var panel = document.createElement("div");
  panel.className = "theme-panel";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-modal", "true");
  panel.setAttribute("aria-label", "主题设置");
  panel.id = "themePanel";
  panel.hidden = true;

  var modeSec = document.createElement("div");
  var h5 = document.createElement("h5");
  h5.textContent = "外观模式";
  modeSec.appendChild(h5);
  var seg = document.createElement("div");
  seg.className = "tp-seg";
  ["auto", "light", "dark"].forEach(function (m) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "tp-mode";
    b.dataset.mode = m;
    b.textContent = m === "auto" ? "跟随系统" : m === "light" ? "浅色" : "深色";
    b.addEventListener("click", function () {
      state.mode = m;
      save();
      apply();
    });
    seg.appendChild(b);
  });
  modeSec.appendChild(seg);

  var themeSec = document.createElement("div");
  var h5b = document.createElement("h5");
  h5b.textContent = "安抚色调";
  themeSec.appendChild(h5b);
  var grid = document.createElement("div");
  grid.className = "tp-themes";
  Object.keys(THEME_NAMES).forEach(function (t) {
    var el = document.createElement("button");
    el.type = "button";
    el.className = "tp-theme";
    el.dataset.theme = t;
    var sw = document.createElement("span");
    sw.className = "tp-swatch";
    sw.style.background = "linear-gradient(135deg," + THEME_COLORS[t][0] + " 50%," + THEME_COLORS[t][1] + " 50%)";
    var nm = document.createElement("span");
    nm.className = "tp-name";
    nm.textContent = THEME_NAMES[t];
    el.appendChild(sw);
    el.appendChild(nm);
    el.addEventListener("click", function () {
      state.theme = t;
      save();
      apply();
    });
    grid.appendChild(el);
  });
  themeSec.appendChild(grid);

  panel.appendChild(modeSec);
  panel.appendChild(themeSec);
  wrap.appendChild(panel);

  toggle.setAttribute("aria-label", "主题设置");
  toggle.setAttribute("aria-haspopup", "dialog");
  toggle.setAttribute("aria-controls", "themePanel");
  toggle.setAttribute("aria-expanded", "false");

  function syncUI() {
    var modes = panel.querySelectorAll(".tp-mode");
    for (var i = 0; i < modes.length; i++) {
      modes[i].classList.toggle("active", modes[i].dataset.mode === state.mode);
    }
    var ths = panel.querySelectorAll(".tp-theme");
    for (var j = 0; j < ths.length; j++) {
      ths[j].classList.toggle("active", ths[j].dataset.theme === state.theme);
    }
  }

  var lastFocus = null;
  function openPanel(open) {
    panel.classList.toggle("open", open);
    panel.hidden = !open;
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) {
      lastFocus = document.activeElement;
      var firstBtn = panel.querySelector("button");
      if (firstBtn) firstBtn.focus();
    } else if (lastFocus) {
      try { lastFocus.focus(); } catch (e) {}
      lastFocus = null;
    }
  }

  toggle.addEventListener("click", function (e) {
    e.stopPropagation();
    openPanel(!panel.classList.contains("open"));
  });
  document.addEventListener("click", function (e) {
    if (e.target !== toggle && !panel.contains(e.target) && !wrap.contains(e.target)) openPanel(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && panel.classList.contains("open")) {
      openPanel(false);
      toggle.focus();
    }
  });

  // 跟随系统：监听系统明暗变化，仅 auto 模式自动跟随
  if (mq) {
    var onMqChange = function () { if (state.mode === "auto") apply(); };
    if (mq.addEventListener) mq.addEventListener("change", onMqChange);
    else if (mq.addListener) mq.addListener(onMqChange);
  }

  apply();
})();

// 移动端导航汉堡菜单
(function () {
  var btn = document.getElementById("navToggle");
  var links = document.getElementById("navLinks") || document.querySelector(".nav-links");
  if (!btn || !links) return;
  if (!links.id) links.id = "navLinks";
  btn.addEventListener("click", function () {
    var open = !links.classList.contains("open");
    links.classList.toggle("open", open);
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    btn.setAttribute("aria-label", open ? "关闭菜单" : "打开菜单");
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && links.classList.contains("open")) {
      links.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
      btn.setAttribute("aria-label", "打开菜单");
      btn.focus();
    }
  });
})();

// 可选：仅在存在 sw.js 时注册 Service Worker
(function () {
  if (!("serviceWorker" in navigator)) return;
  var swUrl = "sw.js";
  // 探测是否存在 sw.js，避免 404 噪音
  fetch(swUrl, { method: "HEAD", cache: "no-store" }).then(function (r) {
    if (r.ok) navigator.serviceWorker.register(swUrl).catch(function () {});
  }).catch(function () {});
})();
