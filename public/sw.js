/* 心屿 · Service Worker —— 导航 network-first；静态资源 cache-first；发版请递增 CACHE */
var CACHE = "xinyu-v2";
var PRECACHE = [
  "./",
  "./index.html",
  "./emergency.html",
  "./resources.html",
  "./style.css",
  "./script.js",
  "./manifest.webmanifest",
  "./favicon.svg"
];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      return c.addAll(PRECACHE);
    }).then(function () {
      return self.skipWaiting();
    }).catch(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;
  var url = new URL(req.url);
  if (url.pathname.indexOf("sw.js") !== -1) return;

  // 危机相关页：始终 network-first，缩短过期热线风险
  var path = url.pathname;
  var crisisPage = /\/(resources|emergency)(\.html)?$/.test(path) || /\/(resources|emergency)\.html$/.test(path);

  if (req.mode === "navigate" || crisisPage) {
    e.respondWith(
      fetch(req).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copy); });
        return res;
      }).catch(function () {
        return caches.match(req).then(function (m) {
          return m || caches.match("./index.html") || caches.match("./emergency.html");
        });
      })
    );
  } else {
    e.respondWith(
      caches.match(req).then(function (m) {
        return m || fetch(req).then(function (res) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); });
          return res;
        });
      })
    );
  }
});
