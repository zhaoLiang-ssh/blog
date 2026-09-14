(function () {
  var Store = window.XinyuStore;
  var UI = window.XinyuUI;
  var esc = Store.esc;
  var LS_KEY = "xinyu-actions";
  var LS_MOOD = "xinyu-mood";
  var items = Store.capArray(Store.getJSON(LS_KEY, []) || []);

  var listEl = document.getElementById("action-list");
  var barEl = document.getElementById("prog-bar");
  var progText = document.getElementById("prog-text");

  function save() {
    items = Store.capArray(items);
    if (Store.setJSON(LS_KEY, items)) render();
  }

  function render() {
    if (!items.length) {
      listEl.innerHTML = '<div class="action-empty">还没有行动计划。从最小的一步开始吧。</div>';
      barEl.style.width = "0%";
      progText.textContent = "0 / 0";
      return;
    }
    var done = items.filter(function (i) { return i.done; }).length;
    listEl.innerHTML = items.map(function (it, idx) {
      return '<div class="action-item' + (it.done ? " done" : "") + '">' +
        '<input type="checkbox" ' + (it.done ? "checked" : "") + ' data-idx="' + idx + '">' +
        '<span class="a-text">' + esc(it.text) + '</span>' +
        '<button class="a-del" data-idx="' + idx + '" aria-label="删除">✕</button></div>';
    }).join("");
    var pct = Math.round(done / items.length * 100);
    barEl.style.width = pct + "%";
    progText.textContent = done + " / " + items.length + " 已完成";
    listEl.querySelectorAll('input[type=checkbox]').forEach(function (c) {
      c.addEventListener("change", function () {
        items[parseInt(c.getAttribute("data-idx"))].done = c.checked;
        save();
      });
    });
    listEl.querySelectorAll(".a-del").forEach(function (b) {
      b.addEventListener("click", function () {
        items.splice(parseInt(b.getAttribute("data-idx")), 1);
        save();
      });
    });
  }

  document.getElementById("btn-add").addEventListener("click", function () {
    var inp = document.getElementById("new-action");
    var t = inp.value.trim();
    if (!t) return;
    items.push({ text: t, done: false });
    inp.value = "";
    save();
  });
  document.getElementById("new-action").addEventListener("keydown", function (e) {
    if (e.key === "Enter") document.getElementById("btn-add").click();
  });

  document.getElementById("btn-clear-done").addEventListener("click", function () {
    items = items.filter(function (i) { return !i.done; });
    save();
  });

  document.getElementById("btn-day-done").addEventListener("click", function () {
    items.forEach(function (i) { i.done = true; });
    save();
  });

  var moodHist = Store.capArray(Store.getJSON(LS_MOOD, []) || []);
  document.getElementById("btn-mood-save").addEventListener("click", function () {
    var t = document.getElementById("mood-note").value.trim();
    if (!t) { UI.alert("先写一句感受再保存吧。"); return; }
    moodHist.unshift({ time: new Date().toLocaleString("zh-CN"), text: t });
    moodHist = Store.capArray(moodHist);
    if (!Store.setJSON(LS_MOOD, moodHist)) return;
    document.getElementById("mood-note").value = "";
    renderMood();
  });
  function renderMood() {
    var el = document.getElementById("mood-history");
    if (!moodHist.length) { el.innerHTML = ""; return; }
    el.innerHTML = moodHist.map(function (m) {
      return '<div class="history-item"><div class="h-time">' + esc(m.time) + '</div>' +
        '<div class="h-thought">' + esc(m.text) + '</div></div>';
    }).join("");
  }

  var sessionCb = document.getElementById("storage-session");
  if (sessionCb) {
    sessionCb.checked = Store.getMode() === "session";
    sessionCb.addEventListener("change", function () {
      Store.setMode(sessionCb.checked ? "session" : "local");
      UI.alert(sessionCb.checked
        ? "已切换为会话模式：关闭标签页后记录不会保留。"
        : "已切换为长期本机保存。");
    });
  }

  document.getElementById("btn-clear-all-action").addEventListener("click", function () {
    UI.confirm("确定清空本机全部行动清单与心情记录吗？此操作不可撤销。").then(function (ok) {
      if (!ok) return;
      items = [];
      moodHist = [];
      Store.remove(LS_KEY);
      Store.remove(LS_MOOD);
      render();
      renderMood();
    });
  });

  document.getElementById("btn-export-action").addEventListener("click", function () {
    var data = { actions: items, mood: moodHist };
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "xinyu-action-" + new Date().toISOString().slice(0, 10) + ".json";
    a.click();
    URL.revokeObjectURL(a.href);
    UI.alert("导出完成。请勿把文件上传到不可信的云盘或公开网盘。");
  });

  var importInput = document.getElementById("btn-import-action");
  if (importInput) {
    importInput.addEventListener("change", function () {
      var file = importInput.files && importInput.files[0];
      importInput.value = "";
      if (!file) return;
      Store.readFileAsJSON(file).then(function (data) {
        if (!data || (!Array.isArray(data.actions) && !Array.isArray(data.mood) && !Array.isArray(data))) {
          UI.alert("无法识别该 JSON。请使用本站导出的行动空间文件。");
          return;
        }
        return UI.confirm("导入将与现有数据合并。继续？").then(function (ok) {
          if (!ok) return;
          if (Array.isArray(data.actions)) items = Store.capArray(data.actions.concat(items));
          else if (Array.isArray(data)) items = Store.capArray(data.concat(items));
          if (Array.isArray(data.mood)) moodHist = Store.capArray(data.mood.concat(moodHist));
          Store.setJSON(LS_KEY, items);
          Store.setJSON(LS_MOOD, moodHist);
          render();
          renderMood();
          UI.alert("导入完成。");
        });
      }).catch(function () {
        UI.alert("读取文件失败，请确认是 UTF-8 的 JSON。");
      });
    });
  }

  renderMood();
  render();
})();
