(function () {
  var input = document.getElementById("toolSearch");
  var grid = document.getElementById("toolGrid") || document.getElementById("tools");
  var toolsBlock = document.getElementById("tools");
  if (!input || !grid) return;

  var CRISIS_WORDS = [
    "自杀", "自伤", "不想活", "结束生命", "了结", "跳楼", "割腕",
    "轻生", "寻死", "活不下去", "去死", "伤害自己", "crisis", "suicide", "kill myself"
  ];

  var crisis = document.createElement("div");
  crisis.className = "search-crisis";
  crisis.id = "searchCrisis";
  crisis.setAttribute("role", "alert");
  crisis.innerHTML =
    '<strong>如果你正感到非常危险或不想活下去</strong>' +
    '<p>请先求助，不必一个人扛着。立即拨打 <a href="tel:12356"><strong>12356</strong></a> / <a href="tel:12355"><strong>12355</strong></a> / <a href="tel:120"><strong>120</strong></a>，' +
    '或查看 <a href="emergency.html">情绪急救</a> 与 <a href="resources.html">求助资源</a>。</p>';
  grid.parentNode.insertBefore(crisis, grid);

  var empty = document.createElement("div");
  empty.className = "search-empty";
  empty.id = "searchEmpty";
  empty.textContent = "没有匹配的工具，试试其他关键词，或浏览下方全部工具。";
  grid.parentNode.insertBefore(empty, grid.nextSibling);

  function isCrisisQuery(q) {
    if (!q) return false;
    for (var i = 0; i < CRISIS_WORDS.length; i++) {
      if (q.indexOf(CRISIS_WORDS[i]) !== -1) return true;
    }
    return false;
  }

  function filterTools() {
    var q = (input.value || "").trim().toLowerCase();
    var crisisHit = isCrisisQuery(q);
    crisis.classList.toggle("show", crisisHit);

    var cards = grid.querySelectorAll(".tool-card");
    var shown = 0;
    for (var i = 0; i < cards.length; i++) {
      var href = (cards[i].getAttribute("href") || "").toLowerCase();
      var t = cards[i].textContent.toLowerCase();
      var ok = !q || t.indexOf(q) !== -1;
      if (crisisHit && (href.indexOf("emergency") !== -1 || href.indexOf("resources") !== -1)) {
        ok = true;
      }
      cards[i].style.display = ok ? "" : "none";
      if (ok) shown++;
    }
    empty.classList.toggle("show", shown === 0 && !crisisHit);
  }
  input.addEventListener("input", filterTools);

  function scrollToTools(e) {
    if (!toolsBlock) return;
    if (e) e.preventDefault();
    toolsBlock.scrollIntoView({ behavior: "smooth", block: "start" });
    toolsBlock.classList.add("tools-flash");
    window.setTimeout(function () {
      toolsBlock.classList.remove("tools-flash");
    }, 1200);
    if (history && history.replaceState) {
      history.replaceState(null, "", "#tools");
    }
  }

  var growth = document.getElementById("quickGrowth");
  if (growth) growth.addEventListener("click", scrollToTools);

  if (location.hash === "#tools") {
    window.setTimeout(function () { scrollToTools(); }, 0);
  }
})();
