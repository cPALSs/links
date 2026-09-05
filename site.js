(() => {
  const DATA_URL = "/data/ig-links.json";

  const CLIP_BADGE_SVG = `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6.5 5.5 17.5 12 6.5 18.5V5.5Z"/></svg>`;
  const EXTERNAL_LINK = 'target="_blank" rel="noopener noreferrer"';

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

  function formatPostDate(value) {
    if (!value) return "";
    const parts = String(value).slice(0, 10).split("-");
    if (parts.length !== 3) return "";
    const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  function formatDestinationLabel(url) {
    const host = formatLinkHost(url);
    return host ? `→ ${host.split("/")[0]}` : "";
  }

  function formatLinkHost(url) {
    if (!url) return "";
    try {
      const parsed = new URL(url);
      const host = parsed.hostname.replace(/^www\./i, "");
      const path = parsed.pathname.replace(/\/+$/, "");
      if (path && path !== "/") return `${host}${path}`;
      return host;
    } catch {
      return "";
    }
  }

  function profileImage(account) {
    return account.profileImage || "";
  }

  function username(account) {
    return account.username || String(account.handle || "").replace(/^@/, "");
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

  function renderGrid(posts) {
    if (!posts.length) {
      return `<div class="ig-grid"><p class="grid-empty">Posts with extra links will show up here.</p></div>`;
    }

    const tiles = posts
      .map((post) => {
        const dest = post.destinationUrl;
        const thumb = postThumb(post);
        const label = [post.title, post.subtitle].filter(Boolean).join(" — ");
        const dateLabel = formatPostDate(post.publishedAt);
        const destLabel = formatDestinationLabel(dest);
        return `
        <a
          class="ig-tile"
          href="${escapeHtml(dest)}"
          ${EXTERNAL_LINK}
          aria-label="${escapeHtml(label || "Open link from Instagram post")}"
          title="${escapeHtml(label)}"
        >
          <img src="${escapeHtml(thumb)}" alt="" loading="lazy" width="319" height="425" />
          ${dateLabel ? `<span class="ig-tile-date">${escapeHtml(dateLabel)}</span>` : ""}
          ${destLabel ? `<span class="ig-tile-destination">${escapeHtml(destLabel)}</span>` : ""}
          <span class="ig-tile-badge">${CLIP_BADGE_SVG}</span>
        </a>`;
      })
      .join("");

    return `<div class="ig-grid">${tiles}</div>`;
  }

  function renderLinks(items) {
    if (!items?.length) return "";
    return `
      <ul class="profile-links">
        ${items
          .map((item) => {
            const host = item.host || formatLinkHost(item.url);
            return `<li>
              <a class="profile-link" href="${escapeHtml(item.url)}" ${EXTERNAL_LINK}>
                <span class="profile-link-label">${escapeHtml(item.label)}</span>
                ${host ? `<span class="profile-link-host">${escapeHtml(host)}</span>` : ""}
              </a>
            </li>`;
          })
          .join("")}
      </ul>`;
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
    const handle = account.handle || `@${user}`;

    document.title = `${displayName} (${handle})`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.content = `Find the Instagram post you saw on ${handle} and open its link.`;
    }

    const main = document.getElementById("main");
    main.innerHTML = `
      <section class="profile">
        <div class="profile-header">
          <a class="profile-avatar-link" href="${escapeHtml(account.profileUrl)}" ${EXTERNAL_LINK}>
            ${renderAvatar(account)}
          </a>
          <div class="profile-summary">
            <a class="profile-handle" href="${escapeHtml(account.profileUrl)}" ${EXTERNAL_LINK}>${escapeHtml(handle)}</a>
            <p class="profile-display-name">${escapeHtml(displayName)}</p>
            ${renderLinks(account.links)}
          </div>
        </div>
      </section>
      <section class="grid-section" aria-label="Instagram posts with links">
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
