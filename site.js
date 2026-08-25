(() => {
  const DATA_URL = "/data/ig-links.json";

  const LINK_BADGE_SVG = `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9.726 3.714a1.8 1.8 0 0 1 2.544 0l3.816 3.816a1.8 1.8 0 0 1 0 2.544l-8.64 8.64A4.5 4.5 0 0 1 3.6 17.1V13.5a1.8 1.8 0 0 1 .527-1.273l5.599-5.513ZM5.4 13.5v3.6a2.7 2.7 0 0 0 2.7 2.7h3.6l.9-.9H8.1a1.8 1.8 0 0 1-1.8-1.8v-3.6l-.9.9Zm12.15-9.45 1.05 1.05a1.8 1.8 0 0 1 0 2.544l-1.89 1.89 1.273 1.273 1.89-1.89a3.6 3.6 0 0 0 0-5.088l-1.05-1.05a3.6 3.6 0 0 0-5.088 0l-1.89 1.89 1.273 1.273 1.89-1.89a1.8 1.8 0 0 1 2.544 0Z"/></svg>`;

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

  function postThumb(post) {
    return post.igThumb || post.thumb || "";
  }

  function profileInitial(label) {
    const trimmed = String(label || "?").trim();
    return trimmed.charAt(0).toUpperCase();
  }

  async function loadData() {
    const res = await fetch(DATA_URL);
    if (!res.ok) throw new Error(`Failed to load ${DATA_URL}`);
    return res.json();
  }

  function renderEvergreen(items) {
    if (!items?.length) return "";
    return `
      <div class="profile-links">
        ${items
          .map(
            (item) =>
              `<a class="profile-link-btn" href="${escapeHtml(item.url)}" rel="noopener noreferrer">${escapeHtml(item.label)}</a>`
          )
          .join("")}
      </div>`;
  }

  function renderGrid(posts) {
    if (!posts.length) {
      return `<div class="ig-grid"><p class="grid-empty">Posts with extra links will show up here as a grid — same look as the Instagram profile.</p></div>`;
    }

    const tiles = posts
      .map((post) => {
        const dest = post.destinationUrl;
        const thumb = postThumb(post);
        const label = [post.title, post.subtitle].filter(Boolean).join(" — ");
        return `
        <a
          class="ig-tile"
          href="${escapeHtml(dest)}"
          rel="noopener noreferrer"
          aria-label="${escapeHtml(label || "Open link from Instagram post")}"
          title="${escapeHtml(label)}"
        >
          <img src="${escapeHtml(thumb)}" alt="" loading="lazy" width="320" height="320" />
          <span class="ig-tile-badge">${LINK_BADGE_SVG}</span>
        </a>`;
      })
      .join("");

    return `<div class="ig-grid">${tiles}</div>`;
  }

  function renderAccountPage(data, accountId) {
    const account = data.accounts?.[accountId];
    if (!account) throw new Error(`Unknown account: ${accountId}`);

    const posts = (data.posts || [])
      .filter((p) => p.account === accountId && p.destinationUrl)
      .sort((a, b) => String(b.publishedAt).localeCompare(String(a.publishedAt)));

    const avatarThumb = posts.length ? postThumb(posts[0]) : "";

    document.title = `${account.label} (@${account.handle.replace(/^@/, "")})`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.content = `Find the Instagram post you saw on ${account.handle} and open its link.`;
    }

    const avatarMarkup = avatarThumb
      ? `<img class="profile-avatar" src="${escapeHtml(avatarThumb)}" alt="" width="77" height="77" />`
      : `<div class="profile-avatar profile-avatar--initial" aria-hidden="true">${escapeHtml(profileInitial(account.label))}</div>`;

    const main = document.getElementById("main");
    main.innerHTML = `
      <header class="site-header">
        <a class="wordmark" href="/">cPALSs Links</a>
      </header>
      <section class="profile">
        <div class="profile-top">
          ${avatarMarkup}
          <div class="profile-meta">
            <h1 class="profile-name">${escapeHtml(account.label)}</h1>
            <a class="profile-handle" href="${escapeHtml(account.profileUrl)}" rel="noopener noreferrer">${escapeHtml(account.handle)}</a>
          </div>
        </div>
        <p class="profile-bio">Tap the post you saw on Instagram to open its link.</p>
        ${renderEvergreen(account.evergreen)}
      </section>
      <section class="grid-section" aria-label="Instagram posts with links">
        <div class="grid-tabs">
          <div class="grid-tab">Posts</div>
        </div>
        ${renderGrid(posts)}
      </section>
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
      <section class="hub-page">
        <h1>Instagram link hub</h1>
        <p class="muted">Pick an account. The grid matches Instagram — tap the post you recognize for its link.</p>
        <div class="hub-list">
          ${accounts
            .map(
              ([id, acct]) =>
                `<a class="hub-account" href="/${escapeHtml(id)}/">
                  <div class="hub-account-avatar">${escapeHtml(profileInitial(acct.label))}</div>
                  <div class="hub-account-meta">
                    <strong>${escapeHtml(acct.label)}</strong>
                    <span>${escapeHtml(acct.handle)}</span>
                  </div>
                </a>`
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
