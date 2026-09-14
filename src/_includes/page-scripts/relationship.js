(function () {
  var Store = window.XinyuStore;
  var UI = window.XinyuUI;
  var esc = Store.esc;
  var LS_KEY = "xinyu-nvc";
  document.getElementById("btn-nv-compose").addEventListener("click", function () {
    function v(id) { return document.getElementById(id).value.trim(); }
    var obs = v("nv-obs"), feel = v("nv-feel"), need = v("nv-need"), req = v("nv-req");
    if (!obs && !feel && !req) {
      UI.alert("至少写下观察或请求，才能生成完整表达哦。");
      return;
    }
    var sentence = "当你" + (obs || "……") + "，我感到" + (feel || "……") +
      (need ? "，因为我需要" + need : "") + (req ? "。你能否" + req + "？" : "。");
    Store.setJSON(LS_KEY, { time: new Date().toLocaleString("zh-CN"), sentence: sentence });

    var box = document.getElementById("nv-result");
    box.style.display = "block";
    box.classList.remove("hidden");
    box.innerHTML = '<div class="result-block"><h3>你的完整表达</h3>' +
      '<p class="result-quote">「' + esc(sentence) + '」</p>' +
      '<p class="result-hint">开口前，可以先在心里对自己说一遍，感受一下。</p></div>';

    ["nv-orig","nv-obs","nv-feel","nv-need","nv-req"].forEach(function (id) {
      document.getElementById(id).value = "";
    });
  });
})();
