(() => {
  const DATA_URL = "/data/ig-links.json";

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function accountIdFromPath() {
    const parts = location.pathname.replace(/\/+$/, "").split("/").filter(Boolean);
    if (parts.length === 1 && parts[0] !== "index.html") return parts[0];
    return null;
  }

  async function loadData() {
    const res = await fetch(DATA_URL);
    if (!res.ok) throw new Error(`Failed to load ${DATA_URL}`);
    return res.json();
  }

  function renderEvergreen(items) {
    if (!items?.length) return "";
    return `
      <section aria-labelledby="evergreen-title">
        <h2 class="section-title" id="evergreen-title">Quick links</h2>
        <div class="evergreen-list">
          ${items
            .map(
              (item) =>
                `<a class="btn" href="${escapeHtml(item.url)}" rel="noopener noreferrer">${escapeHtml(item.label)}</a>`
            )
            .join("")}
        </div>
      </section>`;
  }

  function renderPosts(posts) {
    if (!posts.length) {
      return `<p class="muted">No extra links from recent posts right now. Check back after the next “link in bio” post.</p>`;
    }
    const cards = posts
      .map((post) => {
        const dest = post.destinationUrl;
        const ig = post.igPermalink;
        return `
        <article class="post-card">
          <a class="post-card-thumb-wrap" href="${escapeHtml(dest)}" rel="noopener noreferrer">
            <img class="post-card-thumb" src="${escapeHtml(post.thumb || "")}" alt="" loading="lazy" width="480" height="270" />
          </a>
          <div class="post-card-body">
            <h3 class="post-card-title">${escapeHtml(post.title)}</h3>
            ${post.subtitle ? `<p class="post-card-sub">${escapeHtml(post.subtitle)}</p>` : ""}
            <div class="post-card-links">
              <a href="${escapeHtml(dest)}" rel="noopener noreferrer">Open link</a>
              ${ig ? `<a href="${escapeHtml(ig)}" rel="noopener noreferrer">View on Instagram</a>` : ""}
            </div>
          </div>
        </article>`;
      })
      .join("");
    return `
      <section aria-labelledby="posts-title">
        <h2 class="section-title" id="posts-title">From Instagram</h2>
        <div class="post-grid">${cards}</div>
      </section>`;
  }

  function renderAccountPage(data, accountId) {
    const account = data.accounts?.[accountId];
    if (!account) throw new Error(`Unknown account: ${accountId}`);

    const posts = (data.posts || [])
      .filter((p) => p.account === accountId && p.destinationUrl)
      .sort((a, b) => String(b.publishedAt).localeCompare(String(a.publishedAt)));

    document.title = `${account.label} — links`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.content = `Links from ${account.handle} — festival updates and featured destinations.`;
    }

    const main = document.getElementById("main");
    main.innerHTML = `
      <header class="site-header">
        <a class="wordmark" href="/">cPALSs Links</a>
      </header>
      <section class="hero">
        <h1>${escapeHtml(account.label)}</h1>
        <p class="hero-handle"><a href="${escapeHtml(account.profileUrl)}" rel="noopener noreferrer">${escapeHtml(account.handle)}</a></p>
        <p class="hero-lead">Tap a featured post for the full link, or use the shortcuts below.</p>
      </section>
      ${renderPosts(posts)}
      ${renderEvergreen(account.evergreen)}
    `;
  }

  function renderHubPage(data) {
    document.title = "cPALSs Links";
    const accounts = Object.entries(data.accounts || {});
    const main = document.getElementById("main");
    main.innerHTML = `
      <header class="site-header">
        <a class="wordmark" href="/">cPALSs Links</a>
      </header>
      <section class="hero">
        <h1>Instagram link hub</h1>
        <p class="hero-lead">Stable bio links for cPALSs and festival accounts. Featured posts with extra destinations appear on each page.</p>
        <div class="hub-list">
          ${accounts
            .map(
              ([id, acct]) =>
                `<a class="btn btn-primary" href="/${escapeHtml(id)}/">${escapeHtml(acct.label)} <span class="muted">(${escapeHtml(acct.handle)})</span></a>`
            )
            .join("")}
        </div>
      </section>
    `;
  }

  async function init() {
    const main = document.getElementById("main");
    try {
      const data = await loadData();
      const accountId = accountIdFromPath();
      if (accountId) {
        renderAccountPage(data, accountId);
      } else {
        renderHubPage(data);
      }
    } catch (err) {
      main.innerHTML = `<p class="error-panel">${escapeHtml(err.message)}</p>`;
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
