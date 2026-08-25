/** Strip /index.html from canonical paths. */
(function () {
  var pathname = location.pathname;
  var search = location.search;
  var hash = location.hash;
  if (/\/index\.html$/i.test(pathname)) {
    location.replace(pathname.replace(/\/index\.html$/i, "/") + search + hash);
  }
})();
