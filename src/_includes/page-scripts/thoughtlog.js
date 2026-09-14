(function () {
  var Store = window.XinyuStore;
  var UI = window.XinyuUI;
  var LS_KEY = "xinyu-thoughtlog";
  var history = Store.capArray(Store.getJSON(LS_KEY, []) || []);

  var distortions = [
    { name: "非黑即白", desc: "非好即坏，没有中间地带。例：\"要么完美，要么彻底失败。\"" },
    { name: "过度概括", desc: "一次不好的经历，就推断成永远如此。例：\"这次不行，我以后都不行。\"" },
    { name: "心理过滤", desc: "只盯着消极的一面，忽略积极的部分。" },
    { name: "否定正面", desc: "把好事归因于运气或偶然，而不是自己的能力。" },
    { name: "妄下结论", desc: "没有证据就下判断（读心：认为别人在想自己；算命：断言坏事会发生）。" },
    { name: "放大或缩小", desc: "把困难灾难化，把自己的优点或努力缩小。" },
    { name: "情绪化推理", desc: "因为\"我感觉很糟\"，就认定\"事情真的很糟\"。" },
    { name: "应该句式", desc: "用\"我应该/我必须\"苛责自己，产生压力和愧疚。" },
    { name: "贴标签", desc: "用一个标签概括自己：\"我是个没用的人\"。" },
    { name: "个人化", desc: "把不属于自己的责任揽到自己身上：\"都是我的错\"。" }
  ];

  var dl = document.getElementById("distort-list");
  distortions.forEach(function (d, i) {
    var el = document.createElement("label");
    el.className = "distort";
    el.innerHTML =
      '<input type="checkbox" data-idx="' + i + '">' +
      '<div><div class="d-name">' + d.name + '</div><div class="d-desc">' + d.desc + '</div></div>';
    el.addEventListener("click", function () {
      el.classList.toggle("checked", el.querySelector("input").checked);
    });
    dl.appendChild(el);
  });

  function bindSlider(sliderId, valId) {
    var s = document.getElementById(sliderId);
    var v = document.getElementById(valId);
    s.addEventListener("input", function () { v.textContent = s.value; });
  }
  bindSlider("f-score", "f-score-val");
  bindSlider("f-score2", "f-score2-val");

  var fields = ["f-situation", "f-thought", "f-feel-name", "f-rethink"];
  var sliders = ["f-score", "f-score2"];
  (function loadDraft() {
    var d = Store.getJSON("xinyu-draft", {}) || {};
    fields.forEach(function (id) {
      var el = document.getElementById(id);
      if (el && d[id] !== undefined) el.value = d[id];
    });
    sliders.forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      if (d[id] !== undefined) el.value = d[id];
      var valEl = document.getElementById(id + "-val");
      if (valEl) valEl.textContent = el.value;
    });
  })();
  function saveDraft() {
    var d = {};
    fields.forEach(function (id) { d[id] = document.getElementById(id).value; });
    sliders.forEach(function (id) { d[id] = document.getElementById(id).value; });
    Store.setJSON("xinyu-draft", d);
  }
  fields.forEach(function (id) {
    document.getElementById(id).addEventListener("input", saveDraft);
  });
  sliders.forEach(function (id) {
    document.getElementById(id).addEventListener("input", saveDraft);
  });

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

  var resultBox = document.getElementById("result");
  var esc = Store.esc;
  document.getElementById("btn-save").addEventListener("click", function () {
    var situation = document.getElementById("f-situation").value.trim();
    var thought = document.getElementById("f-thought").value.trim();
    var feelName = document.getElementById("f-feel-name").value.trim();
    var score1 = document.getElementById("f-score").value;
    var score2 = document.getElementById("f-score2").value;
    var rethink = document.getElementById("f-rethink").value.trim();

    var checked = [];
    dl.querySelectorAll("input:checked").forEach(function (c) {
      checked.push(distortions[parseInt(c.getAttribute("data-idx"))].name);
    });

    if (!thought && !situation) {
      UI.alert("至少填写一下情境或自动想法，才能保存哦。");
      return;
    }

    var rec = {
      time: new Date().toLocaleString("zh-CN"),
      situation: situation,
      thought: thought,
      feelName: feelName,
      checked: checked,
      rethink: rethink,
      score1: parseInt(score1),
      score2: parseInt(score2)
    };
    history.unshift(rec);
    history = Store.capArray(history);
    if (!Store.setJSON(LS_KEY, history)) return;

    var delta = rec.score1 - rec.score2;
    var deltaText = delta > 0 ? ("下降了 " + delta + " 分") : (delta === 0 ? "没有变化" : "上升了 " + Math.abs(delta) + " 分");
    resultBox.classList.remove("hidden");
    resultBox.innerHTML =
      '<div class="result-block">' +
        '<h3>已完成一次记录</h3>' +
        '<div class="row"><span class="k">情境：</span>' + esc(rec.situation) + '</div>' +
        '<div class="row"><span class="k">自动想法：</span>' + esc(rec.thought) + '</div>' +
        (rec.checked.length ? '<div class="row"><span class="k">可能存在的扭曲：</span>' + esc(rec.checked.join("、")) + '</div>' : '') +
        '<div class="row"><span class="k">更平衡的看法：</span>' + esc(rec.rethink) + '</div>' +
        '<div class="score-compare">' +
          '<div>重评前<br><span class="big">' + rec.score1 + '</span></div>' +
          '<div>重评后<br><span class="big">' + rec.score2 + '</span></div>' +
          '<div class="score-delta-wrap">情绪强度<span class="delta">' + deltaText + '</span></div>' +
        '</div>' +
        '<p class="result-hint sm">写下来本身，就是在把情绪交还给理智。为自己做了这一步，很棒。</p>' +
      '</div>';
    renderHistory();
    UI.alert("已保存！可以在下方看到你的记录。");
  });

  document.getElementById("btn-reset").addEventListener("click", function () {
    UI.confirm("确定清空当前表单吗？（历史记录不会删除）").then(function (ok) {
      if (!ok) return;
      fields.forEach(function (id) { document.getElementById(id).value = ""; });
      document.getElementById("f-score").value = 5;
      document.getElementById("f-score2").value = 5;
      document.getElementById("f-score-val").textContent = 5;
      document.getElementById("f-score2-val").textContent = 5;
      dl.querySelectorAll("input:checked").forEach(function (c) { c.checked = false; });
      dl.querySelectorAll(".distort.checked").forEach(function (el) { el.classList.remove("checked"); });
      resultBox.classList.add("hidden");
      saveDraft();
    });
  });

  document.getElementById("btn-clear-all").addEventListener("click", function () {
    UI.confirm("确定清空本机全部想法记录与草稿吗？此操作不可撤销。").then(function (ok) {
      if (!ok) return;
      history = [];
      Store.remove(LS_KEY);
      Store.remove("xinyu-draft");
      resultBox.classList.add("hidden");
      renderHistory();
    });
  });

  document.getElementById("btn-export").addEventListener("click", function () {
    var blob = new Blob([JSON.stringify(history, null, 2)], { type: "application/json" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "xinyu-thoughtlog-" + new Date().toISOString().slice(0, 10) + ".json";
    a.click();
    URL.revokeObjectURL(a.href);
    UI.alert("导出完成。请勿把文件上传到不可信的云盘或公开网盘。");
  });

  var importInput = document.getElementById("btn-import");
  if (importInput) {
    importInput.addEventListener("change", function () {
      var file = importInput.files && importInput.files[0];
      importInput.value = "";
      if (!file) return;
      Store.readFileAsJSON(file).then(function (data) {
        var list = Array.isArray(data) ? data : (data && Array.isArray(data.history) ? data.history : null);
        if (!list) {
          UI.alert("无法识别该 JSON。请使用本站导出的想法记录文件。");
          return;
        }
        return UI.confirm("导入将与现有记录合并（最多保留 " + Store.MAX_ITEMS + " 条）。继续？").then(function (ok) {
          if (!ok) return;
          history = Store.capArray(list.concat(history));
          if (!Store.setJSON(LS_KEY, history)) return;
          renderHistory();
          UI.alert("已导入 " + list.length + " 条记录。");
        });
      }).catch(function () {
        UI.alert("读取文件失败，请确认是 UTF-8 的 JSON。");
      });
    });
  }

  function renderHistory() {
    var h = document.getElementById("history");
    if (!history.length) {
      h.innerHTML = '<div class="empty-hint">还没有记录。等你准备好写第一条时，这里会出现它。</div>';
      return;
    }
    h.innerHTML = history.map(function (r) {
      return '<div class="history-item">' +
        '<div class="h-time">' + esc(r.time) + ' &nbsp; 情绪 ' + r.score1 + ' → ' + r.score2 + '</div>' +
        '<div class="h-thought">💭 ' + esc(r.thought) + '</div>' +
        (r.rethink ? '<div class="h-rethink">✓ ' + esc(r.rethink) + '</div>' : '') +
        '</div>';
    }).join("");
  }
  renderHistory();
})();
