# links.cpalss.com — cPALSs Instagram link hub

Stable bio URL for [@cpalss.uplifting](https://www.instagram.com/cpalss.uplifting/). Instagram’s website field is **`https://links.cpalss.com`**. Evergreen destinations (cpalss.com + youth.cpalss.com) sit **below the name** on this hub. Featured post tiles go in the grid when a live post has an off-platform URL.

| Item | Value |
|------|-------|
| Bio URL | https://links.cpalss.com |
| Repo | [cPALSs/links](https://github.com/cPALSs/links) |
| Edit here | `Operations/Sites/links` |
| Manifest | [`data/ig-links.json`](data/ig-links.json) |

`/cpalss/` redirects here (legacy bio path). `/lunarnewyeartet/` redirects to [links.eglny.com](https://links.eglny.com/) — edit festival rows in [`../eglny-links`](../eglny-links).

## Source of truth

[`data/ig-links.json`](data/ig-links.json) — account `links[]` under the display name + `posts[]` (only rows with `destinationUrl`).

Instagram’s website field stays **`https://links.cpalss.com`**. Extra destinations belong **below the name on this hub**, not as a rotating bio URL. Instagram’s native “and 2 more” sheet can mirror those same extra links.

Each account row uses **`profileImage`** (local JPEG under `assets/profiles/`) copied from the channel profile photo.

```bash
chmod +x scripts/fetch-ig-profile.sh scripts/fetch-ig-thumb.sh
./scripts/fetch-ig-profile.sh cpalss.uplifting cpalss
```

Set `profileImage` in JSON to `/assets/profiles/{basename}.jpg`. Keep `links[]` in sync with Instagram’s extra bio links (label + URL).

Each post row uses **`igThumb`** — a **local** JPEG under `assets/thumbs/` copied from the Instagram post (not YouTube). Instagram CDN URLs expire; always fetch and commit the image.

```bash
chmod +x scripts/fetch-ig-thumb.sh
./scripts/fetch-ig-thumb.sh https://www.instagram.com/p/SHORTCODE/ cpalss/filename.jpg
# then set igThumb in JSON to /assets/thumbs/cpalss/filename.jpg
```

**Cross-post** from `@lunarnewyeartet`: same `destinationUrl`; separate row here with the cPALSs `igPermalink` / `igThumb` / `account: "cpalss"`. Festival tiles live on [links.eglny.com](https://links.eglny.com/).

## Update workflow

```
Post goes live on @cpalss.uplifting
  → Caption / first comment / on-image has an off-platform URL?
    → YES:
        1. Fetch thumb → assets/thumbs/cpalss/{slug}.jpg
        2. Add row to data/ig-links.json (publishedAt DESC)
        3. git commit + push (when Bao says deploy)
        4. Confirm tile on https://links.cpalss.com/
```

Sort posts by `publishedAt` descending (handles reels posting out of order).

## Local preview

```bash
cd Operations/Sites/links
python3 -m http.server 8765
# http://localhost:8765/
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

## Festival account

Use [links.eglny.com](https://links.eglny.com/) / [`eglny-links`](../eglny-links). `/lunarnewyeartet/` on this host only redirects.

## Out of scope (v1)

- Auto-sync from Instagram API
- Hosting on cpalss.com Google Sites
- Linktree / Later SaaS
