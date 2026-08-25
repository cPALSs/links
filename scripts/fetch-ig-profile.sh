#!/usr/bin/env bash
# Save a channel profile photo into assets/profiles/.
# Usage: ./scripts/fetch-ig-profile.sh <username> [output-basename]
# Example: ./scripts/fetch-ig-profile.sh lunarnewyeartet
#          ./scripts/fetch-ig-profile.sh cpalss.uplifting cpalss

set -euo pipefail

username="${1:?username required}"
basename="${2:-$username}"

root="$(cd "$(dirname "$0")/.." && pwd)"
out_dir="$root/assets/profiles"
mkdir -p "$out_dir"
out="$out_dir/${basename}.jpg"

page_url="https://www.instagram.com/${username}/"
html="$(curl -fsSL -A "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36" "$page_url")"

pic_url="$(python3 - <<'PY' "$html" "$username"
import html, re, sys
text, username = sys.argv[1], sys.argv[2]
patterns = [
    rf'"username":"{re.escape(username)}".*?"profile_pic_url_hd":"([^"]+)"',
    rf'"username":"{re.escape(username)}".*?"profile_pic_url":"([^"]+)"',
    r'"profile_pic_url_hd":"([^"]+)"',
    r'"profile_pic_url":"([^"]+)"',
]
for pat in patterns:
    m = re.search(pat, text, re.S)
    if m:
        print(html.unescape(m.group(1).replace("\\u0026", "&")))
        break
PY
)"

if [[ -z "${pic_url:-}" ]]; then
  echo "Could not find profile_pic_url on $page_url" >&2
  echo "Use Chrome while logged in, copy the profile image URL, and curl it into $out" >&2
  exit 1
fi

echo "Fetching profile image for @$username"
curl -fsSL "$pic_url" -o "$out"
echo "Wrote $out ($(wc -c < "$out") bytes)"
