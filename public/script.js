// 本机存储与转义工具（互动页共用）；支持 local / session
window.XinyuStore = (function () {
  var MAX_ITEMS = 50;
  var MODE_KEY = "xinyu-storage-mode";
  var mode = "local";
  try {
    var m = localStorage.getItem(MODE_KEY);
    if (m === "session") mode = "session";
  } catch (e) {}

  function backend() {
    return mode === "session" ? sessionStorage : localStorage;
  }

  function getMode() { return mode; }

  function setMode(next) {
    mode = next === "session" ? "session" : "local";
    try { localStorage.setItem(MODE_KEY, mode); } catch (e) {}
  }

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = (s === undefined || s === null) ? "" : String(s);
    return d.innerHTML;
  }

  function getJSON(key, fallback) {
    try {
      var raw = backend().getItem(key);
      if (raw == null) return fallback;
      return JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  }

  function setJSON(key, value) {
    try {
      backend().setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      var msg = "本机存储已满或不可用。请导出后清空部分记录，或检查是否处于隐私/无痕模式。";
      if (window.XinyuUI && window.XinyuUI.alert) window.XinyuUI.alert(msg);
      else try { alert(msg); } catch (e2) {}
      return false;
    }
  }

  function remove(key) {
    try { backend().removeItem(key); } catch (e) {}
    try { localStorage.removeItem(key); } catch (e) {}
    try { sessionStorage.removeItem(key); } catch (e) {}
  }

  function capArray(arr, max) {
    max = max || MAX_ITEMS;
    if (!Array.isArray(arr)) return [];
    if (arr.length <= max) return arr;
    return arr.slice(0, max);
  }

  function readFileAsJSON(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () {
        try { resolve(JSON.parse(String(reader.result || "null"))); }
        catch (err) { reject(err); }
      };
      reader.onerror = function () { reject(reader.error); };
      reader.readAsText(file);
    });
  }

  return {
    esc: esc,
    getJSON: getJSON,
    setJSON: setJSON,
    remove: remove,
    capArray: capArray,
    MAX_ITEMS: MAX_ITEMS,
    getMode: getMode,
    setMode: setMode,
    readFileAsJSON: readFileAsJSON
  };
})();

// 温和弹层，替代 alert / confirm
window.XinyuUI = (function () {
  var root, titleEl, bodyEl, okBtn, cancelBtn, lastFocus, resolver;

  function ensure() {
    if (root) return;
    root = document.createElement("div");
    root.className = "xinyu-dialog";
    root.hidden = true;
    root.innerHTML =
      '<div class="xinyu-dialog-backdrop" data-action="cancel"></div>' +
      '<div class="xinyu-dialog-panel" role="dialog" aria-modal="true" aria-labelledby="xinyuDialogTitle">' +
        '<h3 id="xinyuDialogTitle" class="xinyu-dialog-title"></h3>' +
        '<p class="xinyu-dialog-body"></p>' +
        '<div class="xinyu-dialog-actions">' +
          '<button type="button" class="btn ghost" data-action="cancel">取消</button>' +
          '<button type="button" class="btn" data-action="ok">好的</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(root);
    titleEl = root.querySelector(".xinyu-dialog-title");
    bodyEl = root.querySelector(".xinyu-dialog-body");
    okBtn = root.querySelector('[data-action="ok"]');
    cancelBtn = root.querySelector('[data-action="cancel"].btn');
    root.addEventListener("click", function (e) {
      var act = e.target && e.target.getAttribute("data-action");
      if (act === "ok") close(true);
      if (act === "cancel") close(false);
    });
    document.addEventListener("keydown", function (e) {
      if (root.hidden) return;
      if (e.key === "Escape") {
        e.preventDefault();
        close(false);
      }
    });
  }

  function close(result) {
    if (!root || root.hidden) return;
    root.hidden = true;
    if (lastFocus) try { lastFocus.focus(); } catch (e) {}
    var r = resolver;
    resolver = null;
    if (r) r(result);
  }

  function open(opts) {
    ensure();
    return new Promise(function (resolve) {
      resolver = resolve;
      lastFocus = document.activeElement;
      titleEl.textContent = opts.title || "提示";
      bodyEl.textContent = opts.message || "";
      cancelBtn.hidden = !opts.showCancel;
      okBtn.textContent = opts.okText || "好的";
      cancelBtn.textContent = opts.cancelText || "取消";
      root.hidden = false;
      okBtn.focus();
    });
  }

  function alert(message, title) {
    return open({ title: title || "提示", message: message, showCancel: false, okText: "知道了" });
  }

  function confirm(message, title) {
    return open({ title: title || "请确认", message: message, showCancel: true, okText: "确定", cancelText: "取消" });
  }

  return { alert: alert, confirm: confirm };
})();

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
    var metas = document.querySelectorAll('meta[name="theme-color"]');
    var pair = THEME_COLORS[state.theme] || THEME_COLORS.sage;
    var color = effectiveDark() ? pair[1] : pair[0];
    for (var mi = 0; mi < metas.length; mi++) metas[mi].setAttribute("content", color);
    syncUI();
  }

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

  function focusables() {
    return panel.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
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
    if (!panel.classList.contains("open")) return;
    if (e.key === "Escape") {
      openPanel(false);
      toggle.focus();
      return;
    }
    if (e.key !== "Tab") return;
    var list = focusables();
    if (!list.length) return;
    var first = list[0];
    var last = list[list.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

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

  function closeMenu() {
    links.classList.remove("open");
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-label", "打开菜单");
  }

  btn.addEventListener("click", function () {
    var open = !links.classList.contains("open");
    links.classList.toggle("open", open);
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    btn.setAttribute("aria-label", open ? "关闭菜单" : "打开菜单");
  });
  links.addEventListener("click", function (e) {
    if (e.target && e.target.tagName === "A") closeMenu();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && links.classList.contains("open")) {
      closeMenu();
      btn.focus();
    }
  });
})();

// 可选：仅在存在 sw.js 时注册 Service Worker
(function () {
  if (!("serviceWorker" in navigator)) return;
  var swUrl = "sw.js";
  fetch(swUrl, { method: "HEAD", cache: "no-store" }).then(function (r) {
    if (r.ok) navigator.serviceWorker.register(swUrl).catch(function () {});
  }).catch(function () {});
})();
