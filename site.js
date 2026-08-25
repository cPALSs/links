(() => {
  const DATA_URL = "/data/ig-links.json";

  const CLIP_BADGE_SVG = `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6.5 5.5 17.5 12 6.5 18.5V5.5Z"/></svg>`;

  const GRID_TAB_SVG = `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><title>Posts</title><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>`;

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

  function profileImage(account) {
    return account.profileImage || "";
  }

  function username(account) {
    return account.username || String(account.handle || "").replace(/^@/, "");
  }

  function formatCount(value) {
    if (value == null || value === "") return "0";
    return Number(value).toLocaleString("en-US");
  }

  function profileInitial(account) {
    const label = account.displayName || account.label || username(account);
    return String(label).trim().charAt(0).toUpperCase() || "?";
  }

  async function loadData() {
    const res = await fetch(DATA_URL);
    if (!res.ok) throw new Error(`Failed to load ${DATA_URL}`);
    return res.json();
  }

  function renderStats(stats) {
    if (!stats) return "";
    return `
      <ul class="profile-stats" aria-label="Profile statistics">
        <li><span class="profile-stat-count">${formatCount(stats.posts)}</span> posts</li>
        <li><span class="profile-stat-count">${formatCount(stats.followers)}</span> followers</li>
        <li><span class="profile-stat-count">${formatCount(stats.following)}</span> following</li>
      </ul>`;
  }

  function renderEvergreen(items) {
    if (!items?.length) return "";
    return `
      <div class="profile-links">
        ${items
          .map(
            (item) =>
              `<a class="profile-link-btn" href="${escapeHtml(item.url)}" rel="noopener noreferrer"><span class="profile-link-icon" aria-hidden="true">🔗</span>${escapeHtml(item.label)}</a>`
          )
          .join("")}
      </div>`;
  }

  function renderGrid(posts) {
    if (!posts.length) {
      return `<div class="ig-grid"><p class="grid-empty">Posts with extra links will show up here.</p></div>`;
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
          <img src="${escapeHtml(thumb)}" alt="" loading="lazy" width="319" height="425" />
          <span class="ig-tile-badge">${CLIP_BADGE_SVG}</span>
        </a>`;
      })
      .join("");

    return `<div class="ig-grid">${tiles}</div>`;
  }

  function renderAvatar(account) {
    const src = profileImage(account);
    if (src) {
      return `<img class="profile-avatar" src="${escapeHtml(src)}" alt="" width="150" height="150" />`;
    }
    return `<div class="profile-avatar profile-avatar--initial" aria-hidden="true">${escapeHtml(profileInitial(account))}</div>`;
  }

  function renderAccountPage(data, accountId) {
    const account = data.accounts?.[accountId];
    if (!account) throw new Error(`Unknown account: ${accountId}`);

    const posts = (data.posts || [])
      .filter((p) => p.account === accountId && p.destinationUrl)
      .sort((a, b) => String(b.publishedAt).localeCompare(String(a.publishedAt)));

    const user = username(account);
    const displayName = account.displayName || account.label || user;

    document.title = `${user} (@${user}) • Instagram links`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.content = `Find the Instagram post you saw on @${user} and open its link.`;
    }

    const main = document.getElementById("main");
    main.innerHTML = `
      <section class="profile">
        <div class="profile-header">
          <a class="profile-avatar-link" href="${escapeHtml(account.profileUrl)}" rel="noopener noreferrer">
            ${renderAvatar(account)}
          </a>
          <div class="profile-summary">
            <h1 class="profile-username profile-username--desktop">${escapeHtml(user)}</h1>
            ${renderStats(account.stats)}
          </div>
        </div>
        <div class="profile-body">
          <h1 class="profile-username profile-username--mobile">${escapeHtml(user)}</h1>
          <p class="profile-display-name">${escapeHtml(displayName)}</p>
          ${account.category ? `<p class="profile-category">${escapeHtml(account.category)}</p>` : ""}
          ${account.bio ? `<p class="profile-bio">${escapeHtml(account.bio)}</p>` : ""}
          <p class="profile-hint">Tap the post you saw on Instagram to open its link.</p>
          ${renderEvergreen(account.evergreen)}
        </div>
      </section>
      <section class="grid-section" aria-label="Instagram posts with links">
        <div class="grid-tabs">
          <div class="grid-tab grid-tab--active" aria-current="page">${GRID_TAB_SVG}</div>
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
      <section class="hub-page">
        <h1>Instagram link hub</h1>
        <p class="muted">Pick an account. The grid matches Instagram — tap the post you recognize for its link.</p>
        <div class="hub-list">
          ${accounts
            .map(([id, acct]) => {
              const src = profileImage(acct);
              const avatar = src
                ? `<img class="hub-account-avatar" src="${escapeHtml(src)}" alt="" width="48" height="48" />`
                : `<div class="hub-account-avatar">${escapeHtml(profileInitial(acct))}</div>`;
              return `<a class="hub-account" href="/${escapeHtml(id)}/">
                  ${avatar}
                  <div class="hub-account-meta">
                    <strong>${escapeHtml(username(acct))}</strong>
                    <span>${escapeHtml(acct.handle)}</span>
                  </div>
                </a>`;
            })
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
