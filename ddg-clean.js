// DuckDuckGo's own JS re-adds "ia=web" via history.replaceState after load,
// which declarativeNetRequest can't intercept. Strip it at the source.
(() => {
  const clean = (url) => {
    if (url == null) return url;
    try {
      const u = new URL(url, location.href);
      if (u.searchParams.get('ia') === 'web') {
        u.searchParams.delete('ia');
        return u.href;
      }
    } catch (e) {}
    return url;
  };
  for (const m of ['replaceState', 'pushState']) {
    const orig = history[m];
    history[m] = function (state, title, url) {
      return orig.call(this, state, title, clean(url));
    };
  }
})();
