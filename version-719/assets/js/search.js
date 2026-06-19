(function () {
  var input = document.getElementById("search-input");
  var form = document.getElementById("search-page-form");
  var results = document.getElementById("search-results");
  var status = document.getElementById("search-status");
  var items = window.MOVIE_SEARCH_INDEX || [];

  function params() {
    return new URLSearchParams(window.location.search);
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"]/g, function (character) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;"
      }[character];
    });
  }

  function card(item) {
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");

    return [
      "<article class=\"movie-card\">",
      "<a href=\"" + escapeHtml(item.url) + "\" class=\"movie-link\">",
      "<div class=\"poster-wrap\">",
      "<img src=\"" + escapeHtml(item.cover) + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">",
      "<span class=\"card-badge\">" + escapeHtml(item.category) + "</span>",
      "<span class=\"year-badge\">" + escapeHtml(item.year) + "</span>",
      "<span class=\"poster-play\">▶</span>",
      "</div>",
      "<div class=\"card-body\">",
      "<h3>" + escapeHtml(item.title) + "</h3>",
      "<p>" + escapeHtml(item.oneLine || item.summary || "") + "</p>",
      "<div class=\"tag-row\">" + tags + "</div>",
      "</div>",
      "</a>",
      "</article>"
    ].join("");
  }

  function render(keyword) {
    var text = keyword.trim().toLowerCase();

    if (!text) {
      results.innerHTML = "";
      status.textContent = "输入关键词开始搜索";
      return;
    }

    var matched = items.filter(function (item) {
      var haystack = [
        item.title,
        item.region,
        item.type,
        item.year,
        item.genre,
        item.category,
        item.oneLine,
        item.summary,
        (item.tags || []).join(" ")
      ].join(" ").toLowerCase();

      return haystack.indexOf(text) !== -1;
    });

    status.textContent = matched.length ? "找到 " + matched.length + " 个相关结果" : "未找到相关结果";
    results.innerHTML = matched.map(card).join("");
  }

  if (!input || !form || !results || !status) {
    return;
  }

  var initial = params().get("q") || "";
  input.value = initial;
  render(initial);

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var keyword = input.value.trim();
    var url = keyword ? "search.html?q=" + encodeURIComponent(keyword) : "search.html";
    window.history.replaceState(null, "", url);
    render(keyword);
  });
})();
