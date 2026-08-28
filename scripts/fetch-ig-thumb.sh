#!/usr/bin/env bash
# Fetch Instagram post thumbnail into assets/thumbs/{account}/.
# Usage: ./scripts/fetch-ig-thumb.sh <ig-permalink-or-shortcode> <output-filename.jpg>
# Example: ./scripts/fetch-ig-thumb.sh https://www.instagram.com/p/Dcd9oNePtjB/ 02-community-not-just-tradition.jpg

set -euo pipefail

permalink="${1:?permalink required}"
filename="${2:?output filename required}"

# Use # as the sed delimiter — | conflicts with (p|reel). mkdir the account subdir.
shortcode="$(echo "$permalink" | sed -E 's#.*/(p|reel)/([^/?#]+).*#\2#')"
if [[ -z "$shortcode" || "$shortcode" == "$permalink" ]]; then
  echo "Could not parse shortcode from: $permalink" >&2
  exit 1
fi

root="$(cd "$(dirname "$0")/.." && pwd)"
out="$root/assets/thumbs/$filename"
mkdir -p "$(dirname "$out")"

url="https://www.instagram.com/p/${shortcode}/media/?size=l"

echo "Fetching $url"
curl -fsSL -A "Mozilla/5.0" -L "$url" -o "$out"
echo "Wrote $out ($(wc -c < "$out") bytes)"
