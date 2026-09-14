(function () {
  var Store = window.XinyuStore;
  var UI = window.XinyuUI;
  var esc = Store.esc;
  var LS_KEY = "xinyu-meaning";
  document.getElementById("btn-mn-save").addEventListener("click", function () {
    function v(id) { return document.getElementById(id).value.trim(); }
    var act = v("mn-act"), forw = v("mn-for"), cre = v("mn-create"), exp = v("mn-exp");
    if (!act && !forw && !cre && !exp) {
      UI.alert("至少写下一点，练习才算开始哦。");
      return;
    }
    Store.setJSON(LS_KEY, {
      time: new Date().toLocaleString("zh-CN"),
      act: act || forw || cre || exp
    });

    var box = document.getElementById("mn-result");
    box.style.display = "block";
    box.classList.remove("hidden");
    var line = act || forw || cre || exp;
    box.innerHTML = '<div class="result-block"><h3>你为今天留下了一个方向</h3>' +
      '<p class="result-quote">「' + esc(line) + '」</p>' +
      '<p class="result-hint">不必立即相信它有意义。先去做一点，意义有时是走着走着，自己显出来的。</p></div>';

    ["mn-for","mn-create","mn-exp","mn-act"].forEach(function (id) {
      document.getElementById(id).value = "";
    });
  });
})();
