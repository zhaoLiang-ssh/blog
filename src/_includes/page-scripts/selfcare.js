(function () {
  var Store = window.XinyuStore;
  var UI = window.XinyuUI;
  var esc = Store.esc;
  var LS_KEY = "xinyu-selfcomp";

  var clearBtn = document.getElementById("btn-clear-selfcare");
  if (clearBtn) {
    clearBtn.addEventListener("click", function () {
      UI.confirm("确定清除本机保存的自我关怀语句吗？").then(function (ok) {
        if (!ok) return;
        Store.remove(LS_KEY);
        var box = document.getElementById("sc-result");
        if (box) { box.classList.add("hidden"); box.innerHTML = ""; }
      });
    });
  }

  document.getElementById("btn-sc-save").addEventListener("click", function () {
    var friend = document.getElementById("sc-friend").value.trim();
    var self = document.getElementById("sc-self").value.trim();
    if (!self && !friend) {
      UI.alert("至少写下一句给朋友或给自己的话，练习才算完成哦。");
      return;
    }
    Store.setJSON(LS_KEY, {
      time: new Date().toLocaleString("zh-CN"),
      self: self || friend
    });
    var box = document.getElementById("sc-result");
    box.classList.remove("hidden");
    box.innerHTML = '<div class="result-block"><h3>你把这句善意，留给了自己</h3>' +
      '<p class="result-quote">「' +
      esc(self || friend) + '」</p>' +
      '<p class="result-hint">说给自己听，不需要立刻相信。一遍一遍，它会慢慢变成你心里真实的声音。</p></div>';

    ["sc-harsh", "sc-friend", "sc-self"].forEach(function (id) {
      document.getElementById(id).value = "";
    });
  });
})();
