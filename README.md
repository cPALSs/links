# links.cpalss.com — Instagram link hub

Stable bio URLs for cPALSs and festival Instagram accounts. When a post says “link in bio” for an **off-platform** destination (YouTube, apply URL, etc.), add a row to the manifest and push — the hub shows featured cards without rotating the bio link itself.

| Account path | Bio URL | IG handle |
|--------------|---------|-----------|
| `/lunarnewyeartet/` | https://links.cpalss.com/lunarnewyeartet | [@lunarnewyeartet](https://www.instagram.com/lunarnewyeartet/) |
| `/cpalss/` | https://links.cpalss.com/cpalss | [@cpalss.uplifting](https://www.instagram.com/cpalss.uplifting/) |

## Source of truth

[`data/ig-links.json`](data/ig-links.json) — accounts (evergreen buttons) + `posts[]` (only rows with `destinationUrl`).

## Update workflow

```
Post goes live on IG
  → Caption mentions off-platform link? (link in bio, full interview, apply URL, etc.)
    → NO: do nothing to links hub
    → YES:
        1. Add row to ig-links.json (per account that posted)
        2. git commit + push cPALSs/links
        3. Confirm card on links.cpalss.com/{account}
```

**Cross-post:** same `destinationUrl` / `thumb`; separate row per account with that account’s `igPermalink`.

Sort posts by `publishedAt` descending (handles reels posting out of order).

## Local preview

```bash
cd Operations/Sites/links
python3 -m http.server 8765
# http://localhost:8765/lunarnewyeartet/
```

## GitHub repo

| Item | Value |
|------|-------|
| Repo | [cPALSs/links](https://github.com/cPALSs/links) |
| Branch | `main` |
| Deploy | GitHub Pages on push (`.github/workflows/deploy-pages.yml`) |

```bash
cd Operations/Sites/links
git add -A && git commit -m "…" && git push origin main
```

## DNS (cpalss.com zone)

| Type | Name | Value |
|------|------|--------|
| CNAME | `links` | `cpalss.github.io` |

Then in the repo **Settings → Pages → Custom domain**: `links.cpalss.com` → enforce HTTPS.

Same pattern as [youth.cpalss.com](https://youth.cpalss.com) — see [youth/README.md](../youth/README.md).

## Optional short URL

`eglny.com/ig/` → 301 to `https://links.cpalss.com/lunarnewyeartet` (verbal CTA on festival posts).

## Out of scope (v1)

- Auto-sync from Instagram API
- Hosting on cpalss.com Google Sites
- Linktree / Later SaaS
